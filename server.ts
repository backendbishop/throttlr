import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { slidingWindow, fixedWindow } from './src/index.ts';

const app = express();
const PORT = process.env.PORT ?? 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, 'public')));

// Demo routes — each uses its own store instance so state is isolated.
// Limit: 5 requests per 10 seconds — short window makes the exploit
// visible in the demo without waiting a full minute.

app.use('/demo/fixed', fixedWindow({ max: 5, windowMs: 10000 }));
app.get('/demo/fixed', (_req, res) => {
  res.json({ algorithm: 'fixed-window', status: 'allowed' });
});

app.use('/demo/sliding', slidingWindow({ max: 5, windowMs: 10000 }));
app.get('/demo/sliding', (_req, res) => {
  res.json({ algorithm: 'sliding-window', status: 'allowed' });
});

// Health check for Render.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Throttlr demo running on http://localhost:${PORT}`);
});
