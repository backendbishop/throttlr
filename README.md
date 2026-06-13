# Throttlr

Rate limiting middleware for Express. Built to make algorithm tradeoffs visible, not just provide the code.

## The problem

Rate limiting protects services from abuse and overload. Most implementations reach for the simplest tool: a fixed window counter. It works until traffic is timed deliberately.

## Why fixed windows fail

A fixed window divides time into hard buckets. Every request in a bucket increments a shared counter. The counter resets when the bucket resets.

The failure mode is structural. Five requests at t=9.8s, five more at t=10.1s. Both bursts land in separate buckets. Both pass. Ten requests in 300ms, exactly 2x the intended limit, with zero rejections.

This is not a bug. It is a property of the algorithm.

## How sliding windows solve it

A sliding window anchors to the present. On every request, it looks back windowMs milliseconds from now and counts requests in that range. Expired timestamps are pruned. No scheduled resets.

A request at t=10.1s looks back to t=0.1s. The five requests at t=9.8s are still inside the window. Counter: 5. Limit: 5. New request: rejected.

The boundary ceases to exist. The window moves with traffic.

## Tradeoffs

Fixed window storage per client is O(1), a single counter. Sliding window is O(n), one timestamp per request in the window. Fixed window is exploitable at boundaries. Sliding window closes that gap. Fixed window resets hard at the boundary. Sliding window expires continuously.

Sliding windows consume more memory per client. For most workloads this is negligible. At high scale with many clients, timestamp storage and filtering work increases linearly with request volume within the window. This is the accepted cost of fairness.

The RateLimit-Reset header uses the IETF draft delta format (seconds until reset) rather than a Unix timestamp. Delta format is timezone-agnostic and simpler for clients to act on.

## Architecture

Throttlr separates concerns deliberately.

limiters/ contains pure functions: timestamps in, decision out.
stores/ defines an async get/set interface, memory now, Redis later.
keygens.ts maps requests to bucket keys.
headers.ts sets standard RateLimit-* headers.
middleware.ts wires store, keygen, limiter, and headers together.
index.ts is the public API.

### Limiter contract

The core type is: timestamps, now, max, windowMs in. LimiterResult out. Limiters are pure functions with no Express dependency, no store access, and no side effects. Algorithm correctness is testable with plain arrays.

### Store interface

The Store interface requires two async methods: get(key) returns a number array, set(key, values) persists it. Memory store ships in v1. A Redis store drops in without touching limiter or middleware code.

## Usage

Import the algorithm by name.

    import { slidingWindow, fixedWindow } from 'throttlr'

    app.use(slidingWindow({ max: 100, windowMs: 60000 }))

    app.get('/api/data', fixedWindow({ max: 10, windowMs: 10000 }), handler)

The import is the algorithm choice. slidingWindow and fixedWindow are separate named exports, not a config string, so the decision is visible at the call site.

Custom key generator example:

    import { byHeader } from 'throttlr'
    app.use(slidingWindow({ max: 1000, windowMs: 60000, keyGen: byHeader('x-api-key') }))

## Running the demo

    npm run dev

Open http://localhost:3000. Fire individual requests or trigger a boundary burst on each panel. The fixed window accepts all ten. The sliding window rejects the second half. The exploit is visible without reading documentation.

## Testing

    npm test

Tests cover sliding-window correctness, timestamp expiry, client isolation, boundary conditions, and the fixed-window burst exploit. The exploit test is the most important. It demonstrates exactly why this project exists.

## Future work

Redis store: the Store interface is designed for this. A Redis implementation using sorted sets would make Throttlr correct across distributed deployments.

Token bucket: smoother traffic shaping with burst allowance. A third algorithm alongside fixed and sliding window.

Distributed correctness: clock skew handling, atomic operations, multi-instance consistency.

byUser() key generator: deferred from v1 because it introduces an implicit dependency on authentication middleware. The KeyGen type supports it without breaking changes.

---

Throttlr is part of a broader portfolio exploring systems under stress, how software behaves at boundaries, under load, and when assumptions break.

Live demo: https://throttlr-rzvq.onrender.com
