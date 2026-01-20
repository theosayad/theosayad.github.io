import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Archive, Download, ExternalLink, Newspaper } from 'lucide-react';
import { navigate } from '../utils/navigation';

type ArticleOfDayData = {
  title: string;
  url: string;
  source?: string;
  selectedAt?: string;
  publishedAt?: string;
  rationale?: string;
  hn?: {
    id: number;
    score?: number;
    comments?: number;
  };
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

const getHostname = (rawUrl: string) => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
};

const DailyBriefPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [archiveStatus, setArchiveStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<ArticleOfDayData | null>(null);
  const [archive, setArchive] = useState<LabDailyEntry | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setArchiveStatus('loading');
    try {
      const url = `${import.meta.env.BASE_URL}article-of-day.json`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Failed to load article: HTTP ${res.status}`);
      const json = (await res.json()) as ArticleOfDayData;
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
        console.warn('[daily-brief] archive load failed', error);
        setArchive(null);
        setArchiveStatus('error');
      }
    } catch (error) {
      console.warn('[daily-brief] load failed', error);
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
  const selectedLabel = useMemo(() => formatDate(data?.selectedAt), [data?.selectedAt]);
  const publishedLabel = useMemo(() => formatDate(data?.publishedAt), [data?.publishedAt]);
  const archiveSlug = useMemo(() => (data?.selectedAt ? toDateSlug(data.selectedAt) : undefined), [data?.selectedAt]);
  const briefTitle = archive?.rewrite?.title ?? data?.title;
  const summary = archive?.summary ?? null;
  const keyPoints = archive?.keyPoints ?? [];
  const rewrite = archive?.rewrite?.body ?? null;
  const rewriteTitle = archive?.rewrite?.title ?? null;
  const rewriteDisclaimer = archive?.rewrite?.disclaimer ?? null;

  return (
    <div className="pt-28 pb-20 md:pb-28 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-72">
        <div className="absolute left-1/2 -translate-x-1/2 w-[720px] md:w-[1100px] h-[320px] bg-brand-400/10 dark:bg-brand-400/10 rounded-full blur-[110px] md:blur-[140px]" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl border border-brand-200/60 dark:border-stone-800/60 bg-white/40 dark:bg-stone-950/10 backdrop-blur-sm">
                <Newspaper className="text-brand-700 dark:text-brand-300" size={22} />
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  Daily AI brief
                </div>
                <h1 className="mt-2 text-3xl md:text-5xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                  Today’s Business Brief
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/lab/archive')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
              >
                News Archive <Archive size={16} />
              </button>
            </div>
          </div>
          <div className="mt-10 h-px bg-stone-200/70 dark:bg-stone-800/60" />
        </header>

        <div className="mt-10 rounded-3xl p-px bg-gradient-to-br from-brand-400/35 via-white/30 to-transparent dark:from-brand-700/20 dark:via-stone-950/30">
          <div className="relative overflow-hidden rounded-3xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
            <div className="pointer-events-none absolute -top-16 -right-8 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/25">
                  {data?.source ?? hostname ?? 'Daily pick'}
                </span>
                {publishedLabel ? (
                  <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                    Published {publishedLabel}
                  </span>
                ) : null}
                {selectedLabel ? null : null}
              </div>

              <div className="mt-6">
                {status === 'error' ? (
                  <div className="text-stone-600 dark:text-stone-400">
                    Couldn’t load today’s brief yet. Try again in a moment.
                  </div>
                ) : null}

                {status === 'loading' && !data ? (
                  <div className="animate-pulse">
                    <div className="h-8 md:h-10 w-4/5 rounded-lg bg-stone-200/70 dark:bg-stone-800/50" />
                    <div className="mt-3 h-4 w-2/3 rounded-md bg-stone-200/50 dark:bg-stone-800/40" />
                    <div className="mt-2 h-4 w-3/4 rounded-md bg-stone-200/40 dark:bg-stone-800/30" />
                  </div>
                ) : null}

                {data ? (
                  <>
                    <h2 className="text-2xl md:text-4xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                      {briefTitle}
                    </h2>
                    {data.rationale && data.rationale !== 'Auto-picked via HN search across finance keywords.' ? (
                      <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                        {data.rationale}
                      </p>
                    ) : null}

                    <div className="mt-8">
                      <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                        Key points
                      </div>
                      {keyPoints.length ? (
                        <ul className="mt-4 space-y-2 text-stone-600 dark:text-stone-400 leading-relaxed">
                          {keyPoints.slice(0, 3).map((point) => (
                            <li key={point} className="flex items-start gap-3">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
                          Key points will appear once the brief is ready.
                        </p>
                      )}
                    </div>

                    <div className="mt-8 rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-5 md:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                        <span>Summary</span>
                        <span className="px-3 py-1 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/30">
                          {archiveStatus === 'ready' ? 'Generated' : 'Preparing'}
                        </span>
                      </div>
                      {summary ? (
                        <div className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                          {summary}
                        </div>
                      ) : (
                        <div className="mt-4 text-stone-500 dark:text-stone-400 leading-relaxed">
                          Summary is preparing. Check back shortly.
                        </div>
                      )}
                    </div>

                    {rewrite ? (
                      <div className="mt-10 rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-5 md:p-6">
                        <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                          AI rewrite
                        </div>
                        {rewriteTitle ? (
                          <div className="mt-2 font-display text-xl text-stone-900 dark:text-stone-50">
                            {rewriteTitle}
                          </div>
                        ) : null}
                        <div className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                          {rewrite}
                        </div>
                        {rewriteDisclaimer ? (
                          <div className="mt-4 text-xs text-stone-500 dark:text-stone-500">
                            {rewriteDisclaimer}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                      {archiveSlug ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/lab/daily/${archiveSlug}`)}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900/95 dark:bg-stone-50 px-5 py-2.5 text-sm font-semibold text-stone-50 dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                        >
                          Open full entry <ArrowUpRight size={16} />
                        </button>
                      ) : null}
                      <a
                        href={data.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                      >
                        Open article <ExternalLink size={16} />
                      </a>
                      {data.hn?.id ? (
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
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  How it works
                </div>
                <div className="mt-2 font-display text-lg text-stone-900 dark:text-stone-50">
                  Pick → summarize → archive
                </div>
              </div>
              <span className="px-3 py-1 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/25 text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                Daily
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { step: '01', title: 'Pick', body: 'One top business story, selected each day.' },
                { step: '02', title: 'Summarize', body: 'AI produces a brief + key points.' },
                { step: '03', title: 'Archive', body: 'Saved so you can revisit later.' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-stone-200/60 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/20 p-4"
                >
                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    {item.step} · {item.title}
                  </div>
                  <div className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {item.body}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  <Download size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    Add to home screen
                  </div>
                  <div className="mt-2 font-display text-lg text-stone-900 dark:text-stone-50">
                    One-tap daily reading
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-stone-200/60 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/20 p-4">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  iPhone
                </div>
                <div className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Safari → Share → Add to Home Screen
                </div>
              </div>
              <div className="rounded-xl border border-stone-200/60 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/20 p-4">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  Android
                </div>
                <div className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Chrome menu → Install app
                </div>
              </div>
              <div className="rounded-xl border border-stone-200/60 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/20 p-4">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  Desktop
                </div>
                <div className="mt-2 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  Chrome menu → Create shortcut or Pin tab
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyBriefPage;
