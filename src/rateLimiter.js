// rateLimiter.js
// Sliding window — stores request timestamps per IP.
// Filters expired entries on each request. No scheduled resets.

const clients = new Map();

function rateLimiter(maxRequests = 5, windowMs = 60000) {
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip;
    const window = now - windowMs;

    const timestamps = (clients.get(ip) ?? []).filter(t => t > window);
    timestamps.push(now);
    clients.set(ip, timestamps);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - timestamps.length));

    if (timestamps.length > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: `${Math.ceil((timestamps[0] + windowMs - now) / 1000)}s`,
      });
    }

    next();
  };
}

module.exports = rateLimiter;