# Market Tape (Live Quotes)

GitHub Pages can’t securely hold an API key in the browser. To keep the tape **live** without exposing secrets, deploy a tiny proxy and point the site to it.

## Option A: Cloudflare Worker (recommended)

1. Create a new Worker and paste `workers/market-tape-worker.ts`.
2. Add a secret named `FINNHUB_API_KEY` (Finnhub free tier works).
3. Deploy the Worker.
4. Set `VITE_MARKET_TAPE_URL` to your Worker endpoint, e.g. `https://your-worker.your-subdomain.workers.dev/quotes`.

The UI polls every ~30s and the Worker caches responses for 15s.

## Env var

- `VITE_MARKET_TAPE_URL` — the public URL that returns JSON like `{ quotes: [{ symbol, price, change, changePercent }] }`.

