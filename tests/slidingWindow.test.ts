import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { slidingWindow } from '../src/limiters/slidingWindow.js';

describe('slidingWindow', () => {
  it('allows requests within the limit', () => {
    const now = Date.now();
    const timestamps: number[] = [];
    let result = slidingWindow(timestamps, now, 3, 60000);
    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 2);
  });

  it('rejects when limit is exceeded', () => {
    const now = Date.now();
    // Simulate 3 prior requests in the window.
    const timestamps = [now - 3000, now - 2000, now - 1000];
    const result = slidingWindow(timestamps, now, 3, 60000);
    assert.equal(result.allowed, false);
    assert.equal(result.remaining, 0);
  });

  it('expires timestamps outside the window', () => {
    const now = Date.now();
    // 3 requests from 2 minutes ago — outside a 60s window.
    const old = [now - 120000, now - 110000, now - 90000];
    const result = slidingWindow(old, now, 3, 60000);
    // Old timestamps pruned, only current request counted.
    assert.equal(result.allowed, true);
    assert.equal(result.timestamps.length, 1);
  });

  it('tracks separate clients independently', () => {
    const now = Date.now();
    // Client A at limit.
    const clientA = [now - 3000, now - 2000, now - 1000];
    // Client B has clean slate.
    const clientB: number[] = [];

    const resultA = slidingWindow(clientA, now, 3, 60000);
    const resultB = slidingWindow(clientB, now, 3, 60000);

    assert.equal(resultA.allowed, false);
    assert.equal(resultB.allowed, true);
  });

  it('blocks boundary burst that fixed window would allow', () => {
    const now = Date.now();
    const windowMs = 60000;

    // 3 requests just before the window boundary.
    const preBurst = [now - 2000, now - 1000, now - 500];
    // Current request arrives — window still contains all 3.
    const result = slidingWindow(preBurst, now, 3, windowMs);

    assert.equal(result.allowed, false, 'sliding window must block burst at boundary');
  });

  it('returns correct resetAt as seconds delta', () => {
    const now = Date.now();
    // One request 30 seconds ago.
    const timestamps = [now - 30000];
    const result = slidingWindow(timestamps, now, 5, 60000);
    // Oldest timestamp expires in ~30s.
    assert.ok(result.resetAt > 0, 'resetAt must be positive');
    assert.ok(result.resetAt <= 30, 'resetAt must be ~30s or less');
  });
});
