import { slidingWindow as slidingWindowFn } from './limiters/slidingWindow.js';
import { fixedWindow as fixedWindowFn } from './limiters/fixedWindow.js';
import { createMiddleware } from './middleware.js';
import type { RateLimitOptions } from './types.js';

// Public API — algorithm choice happens at import, not config.
// The import itself is the decision.

export const slidingWindow = (options: RateLimitOptions) =>
  createMiddleware(slidingWindowFn, options);

export const fixedWindow = (options: RateLimitOptions) =>
  createMiddleware(fixedWindowFn, options);

export { createMiddleware } from './middleware.js';
export { MemoryStore } from './stores/memory.js';
export { byIP, byHeader } from './keygens.js';
export type { Store, KeyGen, LimiterFn, LimiterResult, RateLimitOptions } from './types.js';
