import type { Request, Response, NextFunction } from 'express';
import type { LimiterFn, RateLimitOptions } from './types.js';
export declare const createMiddleware: (limiterFn: LimiterFn, options: RateLimitOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=middleware.d.ts.map