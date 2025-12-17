import React, { useMemo, useState } from 'react';
import { MarketQuote, useMarketQuotes } from './useMarketQuotes';
import { Pause, Play, Square } from 'lucide-react';

type Direction = 'up' | 'down' | 'flat';

type TapeItem = {
  symbol: string;
  price: string;
  change: string;
  direction: Direction;
};

const WATCHLIST = [
  'SPY',
  'QQQ',
  'DIA',
  'AAPL',
  'MSFT',
  'NVDA',
  'AMZN',
  'GOOGL',
  'META',
  'TSLA',
  'JPM',
  'V',
] as const;

const getDirectionClassName = (direction: Direction) => {
  if (direction === 'up') return 'text-emerald-700 dark:text-emerald-400';
  if (direction === 'down') return 'text-rose-700 dark:text-rose-400';
  return 'text-stone-500 dark:text-stone-400';
};

const getDirectionGlyph = (direction: Direction) => {
  if (direction === 'up') return '▲';
  if (direction === 'down') return '▼';
  return '•';
};

const formatPrice = (value: number) => {
  const fractionDigits = value >= 1000 ? 1 : 2;
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
};

const formatChangePercent = (value: number) => {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  const abs = Math.abs(value);
  return `${sign}${abs.toFixed(1)}%`;
};

const toTapeItems = (quotes: MarketQuote[]): TapeItem[] => {
  return quotes.map((q) => {
    const direction: Direction = q.change > 0 ? 'up' : q.change < 0 ? 'down' : 'flat';
    return {
      symbol: q.symbol,
      price: formatPrice(q.price),
      change: formatChangePercent(q.changePercent),
      direction,
    };
  });
};

const TapeRow: React.FC<{ items: TapeItem[] }> = ({ items }) => {
  return (
    <div className="market-tape__group flex items-center gap-8 shrink-0 px-6">
      {items.map((item) => (
        <div key={item.symbol} className="flex items-baseline gap-2 whitespace-nowrap tabular-nums">
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-600 dark:text-stone-300">
            {item.symbol}
          </span>
          <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{item.price}</span>
          <span className={`text-xs font-semibold ${getDirectionClassName(item.direction)}`}>
            <span className="mr-1 opacity-80">{getDirectionGlyph(item.direction)}</span>
            {item.change}
          </span>
        </div>
      ))}
    </div>
  );
};

const MarketTape: React.FC = () => {
  const { status, quotes, endpoint, lastError } = useMarketQuotes([...WATCHLIST], 30_000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackKey, setTrackKey] = useState(0);

  const statusText = !endpoint
    ? 'not configured'
    : status === 'ready'
      ? 'live'
      : status === 'error'
        ? 'offline'
        : 'connecting';

  const items = useMemo(() => {
    if (quotes.length) return toTapeItems(quotes);
    return WATCHLIST.map((symbol) => ({ symbol, price: '—', change: '—', direction: 'flat' as const }));
  }, [quotes]);

  return (
    <div
      className={`market-tape fixed bottom-0 inset-x-0 z-30 border-t border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/35 backdrop-blur-xl ${
        isPlaying ? 'market-tape--playing' : ''
      }`}
      aria-label="Markets ticker"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pl-4 sm:pl-6 pr-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
          <span className="hidden sm:inline">Markets</span>
          <span className="inline sm:hidden">Markets</span>
          <span
            className="text-stone-400/70 dark:text-stone-500/70"
            title={status === 'error' && lastError ? lastError : undefined}
          >
            · {statusText}
          </span>
          <div className="ml-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPlaying((v) => !v)}
              className="inline-flex items-center justify-center rounded-md border border-stone-200/70 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/25 px-2 py-1 text-stone-600 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-950/35 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400/60"
              aria-label={isPlaying ? 'Pause scrolling' : 'Play scrolling'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setTrackKey((k) => k + 1);
              }}
              className="inline-flex items-center justify-center rounded-md border border-stone-200/70 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/25 px-2 py-1 text-stone-600 dark:text-stone-300 hover:bg-white/80 dark:hover:bg-stone-950/35 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400/60"
              aria-label="Stop and reset scrolling"
              title="Stop"
            >
              <Square size={14} />
            </button>
          </div>
        </div>

        <div className="market-tape__mask flex-1 overflow-hidden py-2">
          <div key={trackKey} className="market-tape__track flex w-max items-center">
            <TapeRow items={items} />
            <TapeRow items={items} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTape;
