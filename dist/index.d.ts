import type { RateLimitOptions } from './types.js';
export declare const slidingWindow: (options: RateLimitOptions) => (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
export declare const fixedWindow: (options: RateLimitOptions) => (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => Promise<void>;
export { createMiddleware } from './middleware.js';
export { MemoryStore } from './stores/memory.js';
export { byIP, byHeader } from './keygens.js';
export type { Store, KeyGen, LimiterFn, LimiterResult, RateLimitOptions } from './types.js';
//# sourceMappingURL=index.d.ts.map