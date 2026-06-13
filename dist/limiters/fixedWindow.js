// Fixed window rate limiter.
//
// Divides time into hard buckets of windowMs duration.
// All requests within a bucket share a counter.
// Counter resets at the bucket boundary.
//
// Known failure mode — boundary burst exploit:
//   A client can send max requests at t=windowEnd
//   and max requests again at t=windowEnd+1ms.
//   Result: 2x max requests in a ~2ms window, all accepted.
//
// This is not a bug in this implementation — it is inherent
// to the fixed-window algorithm. See slidingWindow.ts for the fix.
export const fixedWindow = (timestamps, now, max, windowMs) => {
    const bucketStart = Math.floor(now / windowMs) * windowMs;
    const bucketEnd = bucketStart + windowMs;
    // Only count timestamps in the current bucket.
    const current = timestamps.filter(t => t >= bucketStart);
    current.push(now);
    const remaining = Math.max(0, max - current.length);
    const resetAt = Math.ceil((bucketEnd - now) / 1000);
    return {
        allowed: current.length <= max,
        timestamps: current,
        remaining,
        resetAt,
    };
};
//# sourceMappingURL=fixedWindow.js.map