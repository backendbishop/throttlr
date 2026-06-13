import { slidingWindow as slidingWindowFn } from './limiters/slidingWindow.js';
import { fixedWindow as fixedWindowFn } from './limiters/fixedWindow.js';
import { createMiddleware } from './middleware.js';
// Public API — algorithm choice happens at import, not config.
// The import itself is the decision.
export const slidingWindow = (options) => createMiddleware(slidingWindowFn, options);
export const fixedWindow = (options) => createMiddleware(fixedWindowFn, options);
export { createMiddleware } from './middleware.js';
export { MemoryStore } from './stores/memory.js';
export { byIP, byHeader } from './keygens.js';
//# sourceMappingURL=index.js.map