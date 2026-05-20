# Throttlr

Rate limiting middleware for Express. I built Throttlr while learning how APIs protect themselves from abuse.

The first version used a fixed window — a counter that resets on a schedule. The problem: a client can burst requests across a reset boundary and effectively double the limit. The sliding window fixes that by tracking individual timestamps instead of a count. Every check looks at the last N seconds from now, not from when the window started.

## Usage

```js
const rateLimiter = require('./rateLimiter');

// 5 requests per 60 seconds per IP
app.use(rateLimiter(5, 60000));
```

Limit and window are configurable:

```js
app.use(rateLimiter(10, 30000)); // 10 requests per 30 seconds
```

429 response:

```json
{
  "error": "Too many requests",
  "retryAfter": "42s"
}
```

Headers on every request:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
```

## Run locally

```bash
npm install
node index.js
```

```bash
curl http://localhost:3000/data
```

## Stack

Node.js · Express
