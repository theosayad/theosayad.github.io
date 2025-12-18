import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Beaker, Calendar } from 'lucide-react';
import { navigate } from '../utils/navigation';

type LabWeeklyIndexItem = {
  slug: string;
  title: string;
  url: string;
  selectedAt?: string;
  publishedAt?: string;
  source?: string;
  hn?: { id: number; score?: number; comments?: number };
};

type LabWeeklyIndex = {
  updatedAt?: string;
  items: LabWeeklyIndexItem[];
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return undefined;
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const getHostname = (rawUrl: string) => {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
};

const LabPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<LabWeeklyIndex | null>(null);
  const homeHref = useMemo(() => `${import.meta.env.BASE_URL}#home`, []);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const url = `${import.meta.env.BASE_URL}lab/weekly/index.json`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Failed to load lab index: HTTP ${res.status}`);
      const json = (await res.json()) as LabWeeklyIndex;
      if (!json?.items || !Array.isArray(json.items)) throw new Error('Invalid lab index payload');
      setData(json);
      setStatus('ready');
    } catch (error) {
      console.warn('[lab] load failed', error);
      setData(null);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(() => data?.items?.slice(0, 12) ?? [], [data]);
  const featured = items[0];
  const rest = items.slice(1);
  const archiveUpdated = useMemo(() => formatDate(data?.updatedAt), [data?.updatedAt]);
  const entryCount = data?.items?.length ?? 0;

  return (
    <div className="pt-28 pb-16 md:pb-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-72">
        <div className="absolute left-1/2 -translate-x-1/2 w-[720px] md:w-[1100px] h-[320px] bg-brand-400/10 dark:bg-brand-400/10 rounded-full blur-[110px] md:blur-[140px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-px bg-gradient-to-br from-brand-400/35 via-white/30 to-transparent dark:from-brand-700/20 dark:via-stone-950/30">
          <div className="relative overflow-hidden rounded-3xl border border-stone-200/70 dark:border-stone-800/60 bg-white/65 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
            <div className="pointer-events-none absolute -inset-px">
              <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-brand-500/10 blur-2xl" />
              <div className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-brand-500/10 blur-2xl" />
            </div>

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl border border-brand-200/60 dark:border-stone-800/60 bg-brand-500/10">
                    <Beaker className="text-brand-700 dark:text-brand-300" size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                      Experimental corner
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                      Lab
                    </h1>
                    <p className="mt-2 text-stone-600 dark:text-stone-400 text-sm md:text-base max-w-2xl leading-relaxed">
                      Currently: a permanent archive of the weekly “Article of the Week”.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15">
                    Weekly archive
                  </span>
                  <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                    {entryCount} entr{entryCount === 1 ? 'y' : 'ies'}
                  </span>
                  {archiveUpdated ? (
                    <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                      Updated {archiveUpdated}
                    </span>
                  ) : null}
                </div>
              </div>

              <a
                href={homeHref}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/#home');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
              >
                Back home <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 items-stretch">
          <div className="rounded-3xl p-px bg-gradient-to-br from-brand-400/35 via-white/30 to-transparent dark:from-brand-700/20 dark:via-stone-950/30">
            <div className="h-full rounded-3xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    Archive
                  </div>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl text-stone-900 dark:text-stone-50 tracking-tight">
                    Weekly picks (permanent)
                  </h2>
                  <p className="mt-2 text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                    Each week’s pick is saved here so the links and takeaways don’t disappear.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={load}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={status === 'loading'}
                  aria-label="Refresh archive"
                >
                  <Calendar size={16} /> Refresh
                </button>
              </div>

              <div className="mt-7 space-y-4">
                {status === 'error' ? (
                  <div className="text-stone-600 dark:text-stone-400">
                    Couldn’t load the archive yet. It will appear after the next weekly update runs.
                  </div>
                ) : null}

                {status === 'loading' && !items.length ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-16 rounded-2xl bg-stone-200/60 dark:bg-stone-800/35" />
                    <div className="h-16 rounded-2xl bg-stone-200/50 dark:bg-stone-800/30" />
                    <div className="h-16 rounded-2xl bg-stone-200/40 dark:bg-stone-800/25" />
                  </div>
                ) : null}

                {featured ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/lab/weekly/${featured.slug}`)}
                    className="w-full text-left rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-gradient-to-br from-white/70 via-white/55 to-brand-100/40 dark:from-stone-950/25 dark:via-stone-950/15 dark:to-brand-950/20 backdrop-blur-sm p-5 md:p-6 hover:bg-white/75 dark:hover:bg-stone-950/25 transition-colors active:scale-[0.99] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                          <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15">
                            Latest
                          </span>
                          {featured.selectedAt ? (
                            <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                              Week of {formatDate(featured.selectedAt)}
                            </span>
                          ) : null}
                          <span className="px-3 py-1.5 rounded-full border border-brand-200/60 dark:border-stone-800/60 bg-brand-500/10 text-brand-700 dark:text-brand-300">
                            {getHostname(featured.url) ?? featured.source ?? 'Weekly pick'}
                          </span>
                          {featured.hn?.score != null ? (
                            <span className="hidden sm:inline">
                              {featured.hn.score} pts{featured.hn.comments != null ? ` · ${featured.hn.comments} c` : ''}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-3 font-display text-xl md:text-2xl text-stone-900 dark:text-stone-50 tracking-tight leading-snug">
                          {featured.title}
                        </div>
                        <div className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                          Open this week’s archive entry.
                        </div>
                      </div>
                      <ArrowUpRight className="shrink-0 text-stone-400 dark:text-stone-500" size={18} />
                    </div>
                  </button>
                ) : null}

                {rest.map((item) => {
                  const published = formatDate(item.publishedAt);
                  const picked = formatDate(item.selectedAt);
                  const host = getHostname(item.url) ?? item.source ?? 'Weekly pick';
                  const meta = [
                    published ? `Published ${published}` : null,
                    item.hn?.score != null ? `${item.hn.score} pts` : null,
                    item.hn?.comments != null ? `${item.hn.comments} c` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => navigate(`/lab/weekly/${item.slug}`)}
                      className="w-full text-left rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-4 md:p-5 hover:bg-white/75 dark:hover:bg-stone-950/25 transition-colors active:scale-[0.99] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                            {picked ? `Week of ${picked} · ` : ''}
                            {host}
                            {meta ? <span className="ml-2 normal-case tracking-normal">· {meta}</span> : null}
                          </div>
                          <div className="mt-2 font-display text-lg md:text-xl text-stone-900 dark:text-stone-50 tracking-tight">
                            {item.title}
                          </div>
                        </div>
                        <ArrowUpRight className="shrink-0 text-stone-400 dark:text-stone-500" size={18} />
                      </div>
                    </button>
                  );
                })}

                {status === 'ready' && !items.length ? (
                  <div className="text-stone-600 dark:text-stone-400">
                    No entries yet. The next scheduled update will create the first archive item.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPage;
