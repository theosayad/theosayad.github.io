import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Newspaper, RefreshCw } from 'lucide-react';

type ArticleOfWeekData = {
  title: string;
  url: string;
  source?: string;
  selectedAt?: string;
  publishedAt?: string;
  hn?: {
    id: number;
    score?: number;
    comments?: number;
  };
  rationale?: string;
};

const getHostname = (rawUrl: string) => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const ArticleOfWeek: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<ArticleOfWeekData | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const url = `${import.meta.env.BASE_URL}article-of-week.json`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Failed to load article: HTTP ${res.status}`);
      const json = (await res.json()) as ArticleOfWeekData;
      if (!json?.title || !json?.url) throw new Error('Invalid article payload');
      setData(json);
      setStatus('ready');
    } catch (error) {
      console.warn('[article-of-week] load failed', error);
      setData(null);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hostname = useMemo(() => (data?.url ? getHostname(data.url) : undefined), [data?.url]);
  const label = data?.source ?? hostname ?? 'Weekly pick';
  const publishedLabel = useMemo(() => formatDate(data?.publishedAt), [data?.publishedAt]);
  const updatedLabel = useMemo(() => formatDate(data?.selectedAt), [data?.selectedAt]);
  const meta = [
    data?.hn?.score != null ? `${data.hn.score} points` : null,
    data?.hn?.comments != null ? `${data.hn.comments} comments` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <section id="reading" className="py-16 md:py-24 bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-200/60 dark:border-stone-800/60">
              <Newspaper className="text-brand-700 dark:text-brand-300" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                <span className="relative inline-block">
                  Article of the Week
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 120 8"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute left-0 top-full mt-1 h-2 w-full text-brand-700/60 dark:text-brand-300/60"
                  >
                    <path
                      d="M0 4 Q 30 0 60 4 T 120 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </span>
              </h2>
              <p className="text-stone-500 dark:text-stone-400 mt-3 text-sm md:text-base">
                Automatically selected every week (free)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={status === 'loading'}
            aria-label="Refresh article"
          >
            <RefreshCw size={16} className={status === 'loading' ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="lg:col-span-3">
            <div className="rounded-3xl p-px bg-gradient-to-br from-brand-400/35 via-white/30 to-transparent dark:from-brand-700/20 dark:via-stone-950/30">
              <div
                className="relative overflow-hidden rounded-3xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none"
              >
                <div className="pointer-events-none absolute -inset-px opacity-100">
                  <div className="absolute -top-24 -left-16 h-56 w-56 rounded-full bg-brand-500/10 blur-2xl" />
                  <div className="absolute -bottom-28 -right-10 h-64 w-64 rounded-full bg-brand-500/10 blur-2xl" />
                </div>

                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/25">
                      {label}
                    </span>
                    {publishedLabel ? (
                      <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                        Published {publishedLabel}
                      </span>
                    ) : null}
                    {meta ? <span className="sm:ml-1">{meta}</span> : null}
                  </div>

                  <div className="mt-6">
                    {status === 'error' ? (
                      <div className="text-stone-600 dark:text-stone-400">
                        Couldn’t load this week’s article. Try refresh, or check back later.
                      </div>
                    ) : null}

                    {status === 'loading' && !data ? (
                      <div className="animate-pulse">
                        <div className="h-8 md:h-10 w-4/5 rounded-lg bg-stone-200/70 dark:bg-stone-800/50" />
                        <div className="mt-3 h-4 w-3/5 rounded-md bg-stone-200/50 dark:bg-stone-800/40" />
                        <div className="mt-2 h-4 w-2/3 rounded-md bg-stone-200/40 dark:bg-stone-800/30" />
                        <div className="mt-7 flex gap-3">
                          <div className="h-10 w-32 rounded-full bg-stone-200/60 dark:bg-stone-800/40" />
                          <div className="h-10 w-32 rounded-full bg-stone-200/40 dark:bg-stone-800/30" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="mt-1 font-display text-2xl md:text-3xl text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                          {data?.title ?? '—'}
                        </h3>

                        <p className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed">
                          {data?.rationale ??
                            'A weekly, auto-picked finance read to keep the signal high and the noise low.'}
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                          <a
                            href={data?.url ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900/95 dark:bg-stone-50 px-5 py-2.5 text-sm font-semibold text-stone-50 dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 disabled:opacity-60"
                            aria-disabled={!data?.url}
                            onClick={(e) => {
                              if (!data?.url) e.preventDefault();
                            }}
                          >
                            Read it <ArrowUpRight size={16} />
                          </a>
                          {data?.hn?.id ? (
                            <a
                              href={`https://news.ycombinator.com/item?id=${data.hn.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                            >
                              Discussion
                            </a>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="h-full rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/15 backdrop-blur-sm p-6 md:p-7 shadow-sm shadow-stone-900/5 dark:shadow-none">
              <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                How it works
              </div>
              <ul className="mt-4 space-y-3 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                <li>Each week, a GitHub Action fetches top Hacker News stories.</li>
                <li>It filters for finance/markets keywords and recent posts.</li>
                <li>The winner is committed as `public/article-of-week.json`.</li>
              </ul>
              <div className="mt-5 text-xs text-stone-500 dark:text-stone-500">
                {updatedLabel ? `Last updated: ${updatedLabel}` : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticleOfWeek;
