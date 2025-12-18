import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import { navigate } from '../utils/navigation';

type LabDailyEntry = {
  slug: string;
  generatedAt?: string;
  article: {
    title: string;
    url: string;
    source?: string;
    selectedAt?: string;
    publishedAt?: string;
    hn?: { id: number; score?: number; comments?: number };
  };
  takeaways?: string[];
  summary?: string;
  keyPoints?: string[];
  rewrite?: {
    title?: string;
    body?: string;
    disclaimer?: string;
  };
  highlights?: Array<{ author?: string; points?: number; text: string }>;
  meta?: {
    extract?: { ok?: boolean; chars?: number };
    ai?: { enabled?: boolean; generated?: boolean; error?: string };
  };
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const LabDailyEntryPage: React.FC<{ slug: string }> = ({ slug }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<LabDailyEntry | null>(null);
  const readingHref = useMemo(() => `${import.meta.env.BASE_URL}#reading`, []);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const url = `${import.meta.env.BASE_URL}lab/daily/${slug}.json`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Failed to load entry: HTTP ${res.status}`);
      const json = (await res.json()) as LabDailyEntry;
      if (!json?.article?.title || !json?.article?.url) throw new Error('Invalid entry payload');
      setData(json);
      setStatus('ready');
    } catch (error) {
      console.warn('[lab] entry load failed', error);
      setData(null);
      setStatus('error');
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const published = useMemo(() => formatDate(data?.article?.publishedAt), [data?.article?.publishedAt]);
  const selected = useMemo(() => formatDate(data?.article?.selectedAt), [data?.article?.selectedAt]);

  return (
    <div className="pt-28 pb-16 md:pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/lab')}
            className="inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
          >
            <ArrowLeft size={16} /> Back to Lab
          </button>
          <a
            href={readingHref}
            onClick={(e) => {
              e.preventDefault();
              navigate('/#reading');
            }}
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-brand-700 dark:hover:text-brand-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 rounded-full px-3 py-2"
          >
            View live section <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="mt-8 rounded-3xl p-px bg-gradient-to-br from-brand-400/35 via-white/30 to-transparent dark:from-brand-700/20 dark:via-stone-950/30">
          <div className="rounded-3xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
            {status === 'error' ? (
              <div className="text-stone-600 dark:text-stone-400">
                Couldn’t load this archive entry. It may not exist yet.
              </div>
            ) : null}

            {status === 'loading' && !data ? (
              <div className="animate-pulse">
                <div className="h-8 w-4/5 rounded-lg bg-stone-200/70 dark:bg-stone-800/50" />
                <div className="mt-3 h-4 w-2/3 rounded-md bg-stone-200/50 dark:bg-stone-800/40" />
                <div className="mt-6 h-28 rounded-xl bg-stone-200/40 dark:bg-stone-800/30" />
              </div>
            ) : null}

            {data ? (
              <>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/25">
                    {data.article.source ?? 'Daily pick'}
                  </span>
                  {published ? (
                    <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                      Published {published}
                    </span>
                  ) : null}
                  {selected ? (
                    <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                      Picked {selected}
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-5 font-display text-2xl md:text-4xl text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                  {data.article.title}
                </h1>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={data.article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900/95 dark:bg-stone-50 px-5 py-2.5 text-sm font-semibold text-stone-50 dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                  >
                    Open article <ExternalLink size={16} />
                  </a>
                  {data.article.hn?.id ? (
                    <a
                      href={`https://news.ycombinator.com/item?id=${data.article.hn.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                    >
                      Discussion
                    </a>
                  ) : null}
                </div>

                {data.summary ? (
                  <div className="mt-8 rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-5 md:p-6">
                    <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                      Summary
                    </div>
                    <div className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                      {data.summary}
                    </div>
                  </div>
                ) : null}

                {!data.summary && !data.keyPoints?.length && !data.rewrite?.body ? (
                  <div className="mt-8 rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-5 md:p-6">
                    <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                      Archive note
                    </div>
                    <div className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed">
                      This entry doesn’t have a rewrite yet. That usually means the models integration isn’t configured,
                      or the source site blocked extraction.
                    </div>
                    <div className="mt-4 text-xs text-stone-500 dark:text-stone-500">
                      {data.meta?.extract
                        ? `Extract: ${data.meta.extract.ok ? 'ok' : 'failed'}${typeof data.meta.extract.chars === 'number' ? ` (${data.meta.extract.chars} chars)` : ''}`
                        : null}
                      {data.meta?.ai ? `${data.meta?.extract ? ' · ' : ''}AI: ${data.meta.ai.enabled ? 'enabled' : 'disabled'}` : null}
                      {data.meta?.ai?.error ? ` · ${data.meta.ai.error}` : null}
                    </div>
                  </div>
                ) : null}

                {data.keyPoints?.length ? (
                  <div className="mt-8">
                    <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                      Key points
                    </div>
                    <ul className="mt-4 space-y-2 text-stone-600 dark:text-stone-400 leading-relaxed">
                      {data.keyPoints.slice(0, 8).map((t, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {data.takeaways?.length ? (
                  <div className="mt-8">
                    <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                      Quick takeaways
                    </div>
                    <ul className="mt-4 space-y-2 text-stone-600 dark:text-stone-400 leading-relaxed">
                      {data.takeaways.slice(0, 5).map((t, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {data.rewrite?.body ? (
                  <div className="mt-10 rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-5 md:p-6">
                    <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                      Rewrite
                    </div>
                    {data.rewrite.title ? (
                      <div className="mt-2 font-display text-xl text-stone-900 dark:text-stone-50">{data.rewrite.title}</div>
                    ) : null}
                    <div className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                      {data.rewrite.body}
                    </div>
                    {data.rewrite.disclaimer ? (
                      <div className="mt-4 text-xs text-stone-500 dark:text-stone-500">{data.rewrite.disclaimer}</div>
                    ) : null}
                  </div>
                ) : null}

                {data.highlights?.length ? (
                  <div className="mt-10">
                    <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                      Discussion highlights
                    </div>
                    <div className="mt-4 space-y-3">
                      {data.highlights.slice(0, 6).map((h, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-4 md:p-5"
                        >
                          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-stone-500 dark:text-stone-400">
                            {h.author ? h.author : 'Anonymous'}
                            {typeof h.points === 'number' ? <span className="ml-2 normal-case tracking-normal">· {h.points} pts</span> : null}
                          </div>
                          <div className="mt-2 text-stone-600 dark:text-stone-400 leading-relaxed">{h.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDailyEntryPage;
