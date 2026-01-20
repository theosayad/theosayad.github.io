import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Newspaper, RefreshCw } from 'lucide-react';
import { navigate } from '../utils/navigation';

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

type LabDailyEntry = {
  slug: string;
  summary?: string;
  keyPoints?: string[];
  rewrite?: {
    title?: string;
    body?: string;
    disclaimer?: string;
  } | null;
  meta?: {
    ai?: {
      enabled?: boolean;
      generated?: boolean;
      error?: string;
      attemptedAt?: string;
      rateLimitedUntil?: string;
    };
  };
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

const toDateSlug = (iso?: string) => {
  const dt = iso ? new Date(iso) : new Date();
  if (Number.isNaN(dt.getTime())) return new Date().toISOString().slice(0, 10);
  return dt.toISOString().slice(0, 10);
};

const ArticleOfWeek: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<ArticleOfWeekData | null>(null);
  const [archiveStatus, setArchiveStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [archive, setArchive] = useState<LabDailyEntry | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setArchiveStatus('loading');
    try {
      const url = `${import.meta.env.BASE_URL}article-of-day.json`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Failed to load article: HTTP ${res.status}`);
      const json = (await res.json()) as ArticleOfWeekData;
      if (!json?.title || !json?.url) throw new Error('Invalid article payload');
      setData(json);
      setStatus('ready');

      try {
        const slug = toDateSlug(json.selectedAt);
        const archiveUrl = `${import.meta.env.BASE_URL}lab/daily/${slug}.json`;
        const archiveRes = await fetch(archiveUrl, { headers: { Accept: 'application/json' } });
        if (!archiveRes.ok) throw new Error(`Failed to load archive: HTTP ${archiveRes.status}`);
        const entry = (await archiveRes.json()) as LabDailyEntry;
        if (!entry?.slug) throw new Error('Invalid archive payload');
        setArchive(entry);
        setArchiveStatus('ready');
      } catch (error) {
        console.warn('[article-of-day] archive load failed', error);
        setArchive(null);
        setArchiveStatus('error');
      }
    } catch (error) {
      console.warn('[article-of-day] load failed', error);
      setData(null);
      setArchive(null);
      setStatus('error');
      setArchiveStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hostname = useMemo(() => (data?.url ? getHostname(data.url) : undefined), [data?.url]);
  const label = data?.source ?? hostname ?? 'Daily pick';
  const publishedLabel = useMemo(() => formatDate(data?.publishedAt), [data?.publishedAt]);
  const updatedLabel = useMemo(() => formatDate(data?.selectedAt), [data?.selectedAt]);

  const archiveSlug = useMemo(() => (data?.selectedAt ? toDateSlug(data.selectedAt) : undefined), [data?.selectedAt]);
  const aiBriefAvailable = Boolean(archive?.summary || (archive?.keyPoints && archive.keyPoints.length) || archive?.rewrite?.body);

  return (
    <section id="reading" className="pt-14 pb-16 md:pt-20 md:pb-24 bg-transparent transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-200/60 dark:border-stone-800/60">
              <Newspaper className="text-brand-700 dark:text-brand-300" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                <span className="relative inline-block">
                  Business News
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
                Top market story, distilled by AI.
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
                  </div>

                  <div className="mt-6">
                    {status === 'error' ? (
                      <div className="text-stone-600 dark:text-stone-400">
                        Couldn’t load today’s article. Try refresh, or check back later.
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
                          {data?.rationale ?? 'Auto-picked finance read to keep the signal high.'}
                        </p>

                        <div className="mt-6 rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-4 md:p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                              AI brief
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                              {archive?.meta?.ai?.generated ? (
                                <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                                  Generated
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {aiBriefAvailable ? (
                            <>
                              {archive?.keyPoints?.length ? (
                                <div className="mt-4">
                                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                                    Key points
                                  </div>
                                  <ul className="mt-2 space-y-1.5 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                                    {archive.keyPoints.slice(0, 3).map((t, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="mt-2 h-1 w-1 rounded-full bg-brand-500/60" />
                                        <span>{t}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}
                              {archive?.summary ? (
                                <div
                                  className={
                                    archive?.keyPoints?.length
                                      ? 'mt-4 pt-4 border-t border-stone-200/70 dark:border-stone-800/60'
                                      : 'mt-4'
                                  }
                                >
                                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                                    Summary
                                  </div>
                                  <p className="mt-2 text-stone-700 dark:text-stone-300 leading-relaxed">{archive.summary}</p>
                                </div>
                              ) : null}

                            </>
                          ) : archiveStatus === 'loading' ? (
                            <div className="mt-4 animate-pulse">
                              <div className="h-4 w-4/5 rounded-md bg-stone-200/50 dark:bg-stone-800/40" />
                              <div className="mt-2 h-4 w-3/5 rounded-md bg-stone-200/40 dark:bg-stone-800/30" />
                            </div>
                          ) : (
                            <div className="mt-4 text-sm text-stone-600 dark:text-stone-400">
                              AI brief pending.
                              {archive?.meta?.ai?.rateLimitedUntil ? (
                                <span className="block mt-1 text-xs text-stone-500 dark:text-stone-500">
                                  Rate limited until {formatDate(archive.meta.ai.rateLimitedUntil)}.
                                </span>
                              ) : null}
                            </div>
                          )}

                          {archiveSlug ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/lab/daily/${archiveSlug}`)}
                              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-950 px-4 py-2 text-sm font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                            >
                              Open custom brief <ArrowUpRight size={16} />
                            </button>
                          ) : null}
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                          <a
                            href={data?.url ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 disabled:opacity-60"
                            aria-disabled={!data?.url}
                            onClick={(e) => {
                              if (!data?.url) e.preventDefault();
                            }}
                          >
                            Original article <ArrowUpRight size={16} />
                          </a>
                          {data?.hn?.id ? (
                            <a
                              href={`https://news.ycombinator.com/item?id=${data.hn.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                            >
                              HN discussion
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    How it works
                  </div>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">Pick → summarize → archive.</p>
                </div>
                {updatedLabel ? (
                  <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/20 text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                    Updated {updatedLabel}
                  </span>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-stone-200/70 dark:border-stone-800/60 bg-white/65 dark:bg-stone-950/20 p-3 text-sm text-stone-700 dark:text-stone-300">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">1. Pick</div>
                  <div className="mt-1">Scan top HN stories daily for market/finance signals + trusted domains.</div>
                </div>
                <div className="rounded-xl border border-stone-200/70 dark:border-stone-800/60 bg-white/65 dark:bg-stone-950/20 p-3 text-sm text-stone-700 dark:text-stone-300">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">2. Extract</div>
                  <div className="mt-1">Fetch the article and pull main text with bot-friendly headers.</div>
                </div>
                <div className="rounded-xl border border-stone-200/70 dark:border-stone-800/60 bg-white/65 dark:bg-stone-950/20 p-3 text-sm text-stone-700 dark:text-stone-300">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">3. AI Brief</div>
                  <div className="mt-1">Summarize + rewrite with AI, blend in discussion highlights, publish to archive.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticleOfWeek;
