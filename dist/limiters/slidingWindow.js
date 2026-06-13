// Sliding window rate limiter.
//
// Maintains a rolling window of windowMs duration anchored to now.
// Expired timestamps are pruned on every request — no scheduled resets.
//
// Eliminates the fixed-window boundary burst exploit:
//   The window always looks back windowMs from the current moment,
//   so a burst at t=59s still counts against requests at t=60s.
//
// Tradeoff:
//   Stores one timestamp per request rather than a single counter.
//   Memory usage scales with request volume within the window.
//   Acceptable for most production workloads; prefer Redis for
//   distributed deployments to avoid per-instance memory drift.
export const slidingWindow = (timestamps, now, max, windowMs) => {
    const windowStart = now - windowMs;
    // Prune expired timestamps, add current request.
    const current = timestamps.filter(t => t > windowStart);
    current.push(now);
    const remaining = Math.max(0, max - current.length);
    // Reset is when the oldest timestamp in the window expires.
    const oldestInWindow = current[0];
    const resetAt = Math.ceil((oldestInWindow + windowMs - now) / 1000);
    return {
        allowed: current.length <= max,
        timestamps: current,
        remaining,
        resetAt,
    };
};
//# sourceMappingURL=slidingWindow.js.map