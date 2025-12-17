import { useEffect, useMemo, useState } from 'react';

export type MarketQuote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

type MarketQuotesState =
  | { status: 'idle' | 'loading'; quotes: MarketQuote[]; updatedAt?: number }
  | { status: 'ready'; quotes: MarketQuote[]; updatedAt: number }
  | { status: 'error'; quotes: MarketQuote[]; updatedAt?: number };

const parseQuotesResponse = (data: unknown): MarketQuote[] => {
  if (!data || typeof data !== 'object') return [];
  const raw = (data as any).quotes;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((q: any) => ({
      symbol: String(q?.symbol ?? '').trim(),
      price: Number(q?.price),
      change: Number(q?.change),
      changePercent: Number(q?.changePercent),
    }))
    .filter(
      (q) =>
        q.symbol.length > 0 &&
        Number.isFinite(q.price) &&
        Number.isFinite(q.change) &&
        Number.isFinite(q.changePercent)
    );
};

export const useMarketQuotes = (symbols: string[], pollMs = 30_000) => {
  const rawEndpoint = import.meta.env.VITE_MARKET_TAPE_URL as string | undefined;
  const endpoint =
    rawEndpoint && !/^https?:\/\//i.test(rawEndpoint) && !rawEndpoint.startsWith('/')
      ? `https://${rawEndpoint}`
      : rawEndpoint;

  const [state, setState] = useState<MarketQuotesState>({ status: 'idle', quotes: [] });

  const symbolsKey = useMemo(
    () => symbols.map((s) => s.trim().toUpperCase()).filter(Boolean).join(','),
    [symbols]
  );

  useEffect(() => {
    if (!endpoint || !symbolsKey) return;

    let aborted = false;
    const controller = new AbortController();

    const fetchOnce = async () => {
      setState((prev) => ({ status: 'loading', quotes: prev.quotes, updatedAt: prev.updatedAt }));
      try {
        const url = new URL(endpoint, window.location.origin);
        if (!url.pathname.endsWith('/quotes')) {
          url.pathname = `${url.pathname.replace(/\/$/, '')}/quotes`;
        }
        url.searchParams.set('symbols', symbolsKey);

        const res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) throw new Error(`Quote fetch failed: ${res.status}`);
        const data = await res.json();
        const quotes = parseQuotesResponse(data);
        if (!quotes.length) throw new Error('Quote fetch returned no quotes');

        if (!aborted) {
          setState({ status: 'ready', quotes, updatedAt: Date.now() });
        }
      } catch {
        if (!aborted) {
          setState((prev) => ({ status: 'error', quotes: prev.quotes, updatedAt: prev.updatedAt }));
        }
      }
    };

    void fetchOnce();
    const id = window.setInterval(fetchOnce, pollMs);

    return () => {
      aborted = true;
      controller.abort();
      window.clearInterval(id);
    };
  }, [endpoint, symbolsKey, pollMs]);

  return { endpoint, ...state };
};
