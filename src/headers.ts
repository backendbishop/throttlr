import type { Response } from 'express';
import type { LimiterResult } from './types.js';

// Sets standard rate-limit response headers.
//
// Follows the IETF draft (draft-ietf-httpapi-ratelimit-headers):
//   RateLimit-Limit     — max requests allowed in the window
//   RateLimit-Remaining — requests left in the current window
//   RateLimit-Reset     — seconds until the window resets (delta, not epoch)
//
// Delta format chosen over Unix timestamp because:
//   - Timezone agnostic
//   - Simpler for clients to act on ("retry after N seconds")
//   - Aligned with modern ecosystem direction
//
// Reference: https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
export const setRateLimitHeaders = (
  res: Response,
  max: number,
  result: LimiterResult
): void => {
  res.setHeader('RateLimit-Limit', max);
  res.setHeader('RateLimit-Remaining', result.remaining);
  res.setHeader('RateLimit-Reset', result.resetAt);
};
