import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fixedWindow } from '../src/limiters/fixedWindow.ts';

describe('fixedWindow', () => {
  it('allows requests within the limit', () => {
    const now = Date.now();
    const result = fixedWindow([], now, 5, 60000);
    assert.equal(result.allowed, true);
    assert.equal(result.remaining, 4);
  });

  it('rejects when limit is exceeded within bucket', () => {
    const now = Date.now();
    const bucketStart = Math.floor(now / 60000) * 60000;
    const timestamps = Array.from({ length: 5 }, (_, i) => bucketStart + i * 100);
    const result = fixedWindow(timestamps, now, 5, 60000);
    assert.equal(result.allowed, false);
    assert.equal(result.remaining, 0);
  });

  it('resets count at bucket boundary', () => {
    const windowMs = 60000;
    const now = Date.now();
    const bucketStart = Math.floor(now / windowMs) * windowMs;
    const previousBucket = Array.from({ length: 5 }, (_, i) => bucketStart - 5000 + i * 100);
    const result = fixedWindow(previousBucket, now, 5, windowMs);
    assert.equal(result.allowed, true);
    assert.equal(result.timestamps.length, 1);
  });

  it('demonstrates boundary burst exploit', () => {
    // The exploit: a client sends max requests at the end of bucket 0,
    // then max requests at the start of bucket 1.
    // Fixed window sees each burst as a fresh bucket — all accepted.
    // Total: 2x max requests in milliseconds, zero rejections.
    const windowMs = 60000;
    const bucketBoundary = Math.ceil(Date.now() / windowMs) * windowMs;

    // Burst 1: 3 requests just before the boundary (bucket 0).
    const burst1: number[] = [];
    for (let i = 3; i >= 1; i--) {
      const t = bucketBoundary - i * 10;
      const result = fixedWindow([...burst1], t, 3, windowMs);
      assert.equal(result.allowed, true, `burst1 request at boundary-${i*10}ms should be allowed`);
      burst1.push(t);
    }

    // Burst 2: 3 requests just after the boundary (bucket 1).
    // Store is fresh for this bucket — prior burst invisible.
    const burst2: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const t = bucketBoundary + i * 10;
      const result = fixedWindow([...burst2], t, 3, windowMs);
      assert.equal(result.allowed, true, `burst2 request at boundary+${i*10}ms should be allowed`);
      burst2.push(t);
    }

    // 6 requests accepted across the boundary — the exploit demonstrated.
    assert.equal(burst1.length + burst2.length, 6);
  });

  it('returns correct resetAt as seconds delta', () => {
    const now = Date.now();
    const result = fixedWindow([], now, 5, 60000);
    assert.ok(result.resetAt > 0, 'resetAt must be positive');
    assert.ok(result.resetAt <= 60, 'resetAt must be within window duration');
  });
});
