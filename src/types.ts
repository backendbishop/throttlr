import type { Request } from 'express';

// Core algorithm contract.
// Limiters are pure functions — no store, no Express, no side effects.
export type LimiterFn = (
  timestamps: number[],
  now: number,
  max: number,
  windowMs: number
) => LimiterResult;

export type LimiterResult = {
  allowed: boolean;
  timestamps: number[]; // pruned timestamp list to persist
  remaining: number;
  resetAt: number;      // seconds until window resets (IETF delta)
};

// Store interface — memory now, Redis later, no limiter changes required.
export interface Store {
  get(key: string): Promise<number[]>;
  set(key: string, values: number[]): Promise<void>;
}

// Key generator — maps a request to a rate-limit bucket string.
export type KeyGen = (req: Request) => string;

// Options passed to slidingWindow() or fixedWindow() middleware factories.
export type RateLimitOptions = {
  max: number;
  windowMs: number;
  keyGen?: KeyGen;   // defaults to byIP()
  store?: Store;     // defaults to MemoryStore
};
