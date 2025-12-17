const json = (body, init) =>
  new Response(JSON.stringify(body), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

const parseSymbols = (value) => {
  if (!value) return [];
  return value.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean).slice(0, 25);
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return json({}, { status: 204 });
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, { status: 405 });

    const url = new URL(request.url);
    if (!url.pathname.endsWith('/quotes') && url.pathname !== '/quotes') {
      return json({ error: 'Not found' }, { status: 404 });
    }

    const symbols = parseSymbols(url.searchParams.get('symbols'));
    if (!symbols.length) {
      return json({ error: 'Missing symbols', quotes: [] }, { status: 400 });
    }

    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const quotes = [];
    await Promise.all(
      symbols.map(async (symbol) => {
        const qUrl = new URL('https://finnhub.io/api/v1/quote');
        qUrl.searchParams.set('symbol', symbol);
        qUrl.searchParams.set('token', env.FINNHUB_API_KEY);

        const res = await fetch(qUrl.toString(), { headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const data = await res.json();
        const price = Number(data.c);
        const change = Number(data.d);
        const changePercent = Number(data.dp);
        if (!Number.isFinite(price) || price <= 0) return;
        quotes.push({ symbol, price, change, changePercent });
      })
    );

    const response = json({ quotes, updatedAt: new Date().toISOString() }, { headers: { 'cache-control': 'public, max-age=15' } });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};