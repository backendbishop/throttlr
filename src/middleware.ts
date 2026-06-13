import type { Request, Response, NextFunction } from 'express';
import type { LimiterFn, RateLimitOptions } from './types.js';
import { MemoryStore } from './stores/memory.js';
import { byIP } from './keygens.js';
import { setRateLimitHeaders } from './headers.js';

// Creates an Express middleware from a limiter function + options.
// This is the only layer that touches Express, the store, and headers.
// The limiter itself remains a pure function.
export const createMiddleware = (
  limiterFn: LimiterFn,
  options: RateLimitOptions
) => {
  const { max, windowMs } = options;
  const store = options.store ?? new MemoryStore();
  const keyGen = options.keyGen ?? byIP();

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = keyGen(req);
    const now = Date.now();

    const timestamps = await store.get(key);
    const result = limiterFn(timestamps, now, max, windowMs);

    await store.set(key, result.timestamps);
    setRateLimitHeaders(res, max, result);

    if (!result.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: result.resetAt,
      });
      return;
    }

    next();
  };
};
