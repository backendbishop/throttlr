import type { KeyGen } from './types.js';

// Returns the client IP address as the rate-limit key.
// Works with Express's req.ip, which respects the X-Forwarded-For
// header when the app is behind a trusted proxy (app.set('trust proxy', 1)).
export const byIP = (): KeyGen => (req) => {
  return req.ip ?? 'unknown';
};

// Returns the value of a named request header as the rate-limit key.
// Useful for API key-based limiting.
// Falls back to IP if the header is absent — prevents unauthenticated
// requests from bypassing limits entirely.
export const byHeader = (headerName: string): KeyGen => (req) => {
  const value = req.headers[headerName.toLowerCase()];
  return typeof value === 'string' ? value : (req.ip ?? 'unknown');
};

// byUser() — deferred to v2.
// Requires auth middleware to populate req.user before this runs.
// Raises questions outside Throttlr's core scope:
//   - What if req.user is absent?
//   - Should unauthenticated requests be blocked or IP-limited?
// Design the KeyGen type to support it without breaking changes:
//   const byUser = (): KeyGen => (req) => (req as any).user?.id ?? req.ip
