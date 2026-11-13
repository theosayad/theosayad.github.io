import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Beaker, Calendar } from 'lucide-react';
import { navigate } from '../utils/navigation';

type LabDailyIndexItem = {
  slug: string;
  title: string;
  url: string;
  selectedAt?: string;
  publishedAt?: string;
  source?: string;
  hn?: { id: number; score?: number; comments?: number };
};

type LabDailyIndex = {
  updatedAt?: string;
  items: LabDailyIndexItem[];
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
  const [data, setData] = useState<LabDailyIndex | null>(null);
  const homeHref = useMemo(() => `${import.meta.env.BASE_URL}#home`, []);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const url = `${import.meta.env.BASE_URL}lab/daily/index.json`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Failed to load lab index: HTTP ${res.status}`);
      const json = (await res.json()) as LabDailyIndex;
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

  const items = useMemo(() => data?.items ?? [], [data]);
  const featured = items[0];
  const rest = items.slice(1, 3);
  const archiveUpdated = useMemo(() => formatDate(data?.updatedAt), [data?.updatedAt]);
  const entryCount = data?.items?.length ?? 0;

  return (
    <div className="pt-28 pb-16 md:pb-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-72">
        <div className="absolute left-1/2 -translate-x-1/2 w-[720px] md:w-[1100px] h-[320px] bg-brand-400/10 dark:bg-brand-400/10 rounded-full blur-[110px] md:blur-[140px]" />
        <div className="absolute right-10 top-12 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute left-16 top-20 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex items-start gap-4 min-w-0">
              <div className="p-3 rounded-2xl border border-brand-200/60 dark:border-stone-800/60 bg-white/40 dark:bg-stone-950/10 backdrop-blur-sm">
                <Beaker className="text-brand-700 dark:text-brand-300" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  Experimental corner
                </div>
                <h1 className="mt-2 text-4xl md:text-5xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                  Lab
                </h1>
                <p className="mt-3 text-stone-600 dark:text-stone-400 text-sm md:text-base max-w-2xl leading-relaxed">
                  A small room for prototypes, experiments, and permanent notes, including the daily top story and AI
                  brief archive.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/lab/daily"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/lab/daily');
                }}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-brand-200/70 dark:border-stone-800/60 bg-white/60 dark:bg-stone-900/30 px-4 py-2 text-sm font-semibold text-brand-800 dark:text-brand-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
              >
                Daily Brief
              </a>
              <a
                href={homeHref}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/#home');
                }}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
              >
                Back home <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
            <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15">
              Business archive
            </span>
            {archiveUpdated ? (
              <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                Updated {archiveUpdated}
              </span>
            ) : null}
            <span className="px-3 py-1.5 rounded-full border border-purple-300/60 dark:border-purple-700/60 bg-purple-500/10 text-purple-800 dark:text-purple-200">
              AI briefs
            </span>
          </div>

          <div className="mt-10 h-px bg-stone-200/70 dark:bg-stone-800/60" />
        </header>

        <div className="mt-10 grid grid-cols-1 gap-6 items-stretch">
          <div className="rounded-3xl p-px bg-gradient-to-br from-brand-400/35 via-white/30 to-transparent dark:from-brand-700/20 dark:via-stone-950/30">
            <div className="relative overflow-hidden h-full rounded-3xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />
              <div className="pointer-events-none absolute -top-16 -right-8 h-36 w-36 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    Archive
                  </div>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl text-stone-900 dark:text-stone-50 tracking-tight">
                    Business reads archive
                  </h2>
                  <p className="mt-2 text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                    Daily business reads, saved with the AI brief.
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
                    Couldn’t load the archive yet. It will appear after the next daily update runs.
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
                    onClick={() => navigate(`/lab/daily/${featured.slug}`)}
                    className="group w-full text-left rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-gradient-to-br from-white/70 via-white/55 to-brand-100/40 dark:from-stone-950/25 dark:via-stone-950/15 dark:to-brand-950/20 backdrop-blur-sm p-5 md:p-6 hover:bg-white/75 dark:hover:bg-stone-950/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                          <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15">
                            Latest
                          </span>
                          {featured.selectedAt ? (
                            <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                              Picked on {formatDate(featured.selectedAt)}
                            </span>
                          ) : null}
                          <span className="px-3 py-1.5 rounded-full border border-brand-200/60 dark:border-stone-800/60 bg-brand-500/10 text-brand-700 dark:text-brand-300">
                            {getHostname(featured.url) ?? featured.source ?? 'Daily pick'}
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
                          Open today’s archive entry.
                        </div>
                      </div>
                      <ArrowUpRight
                        className="shrink-0 text-stone-400 dark:text-stone-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        size={18}
                      />
                    </div>
                  </button>
                ) : null}

                {rest.map((item) => {
                  const published = formatDate(item.publishedAt);
                  const picked = formatDate(item.selectedAt);
                  const host = getHostname(item.url) ?? item.source ?? 'Daily pick';
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
                      onClick={() => navigate(`/lab/daily/${item.slug}`)}
                      className="group w-full text-left rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-4 md:p-5 hover:bg-white/75 dark:hover:bg-stone-950/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                            {picked ? `Picked on ${picked} · ` : ''}
                            {host}
                            {meta ? <span className="ml-2 normal-case tracking-normal">· {meta}</span> : null}
                          </div>
                          <div className="mt-2 font-display text-lg md:text-xl text-stone-900 dark:text-stone-50 tracking-tight">
                            {item.title}
                          </div>
                        </div>
                        <ArrowUpRight
                          className="shrink-0 text-stone-400 dark:text-stone-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          size={18}
                        />
                      </div>
                    </button>
                  );
                })}

                {status === 'ready' && !items.length ? (
                  <div className="text-stone-600 dark:text-stone-400">
                    No entries yet. The next scheduled update will create the first archive item.
                  </div>
                ) : null}

                {status === 'ready' && items.length > 3 ? (
                  <button
                    type="button"
                    onClick={() => navigate('/lab/archive')}
                    className="w-fit inline-flex items-center justify-center gap-2 rounded-full bg-stone-900/90 text-stone-50 dark:bg-stone-50 dark:text-stone-950 border border-stone-900/10 dark:border-stone-200/70 px-4 py-2 text-sm font-semibold shadow-sm shadow-stone-900/10 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                  >
                    View full archive <ArrowUpRight size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-300/40 to-transparent dark:via-brand-700/40" />
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-stone-400 dark:text-stone-500">
            Experiments
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent dark:via-emerald-700/40" />
        </div>


        <section className="mt-12" aria-labelledby="mass-atlas-title">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-emerald-700 dark:text-emerald-400">
                Website in progress
              </div>
              <h2
                id="mass-atlas-title"
                className="mt-2 font-display text-2xl md:text-3xl font-semibold text-stone-900 dark:text-stone-50 tracking-tight"
              >
                Mass Atlas — Lebanon
              </h2>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 italic">
                A calm index of mass timings by rite and parish.
              </p>
              <p className="mt-3 text-stone-600 dark:text-stone-400 leading-relaxed">
                Building a living index across Lebanon — Maronite, Melkite, Orthodox, Latin, and beyond — so schedules
                are easy to find and share.
              </p>
            </div>
            <a
              href="https://theosayad.com/mass/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400/60"
            >
              View experiment <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch">
            <div className="rounded-3xl p-px bg-gradient-to-br from-emerald-400/25 via-white/30 to-transparent dark:from-emerald-700/15 dark:via-stone-950/30">
              <div className="relative overflow-hidden h-full rounded-3xl border border-emerald-200/50 dark:border-emerald-800/50 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
                <div className="pointer-events-none absolute -inset-px">
                  <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl" />
                  <div className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
                </div>

                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    <span className="px-3 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200">
                      Early access
                    </span>
                    <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                      Community index
                    </span>
                    <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                      Multi-rite
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600 dark:text-stone-400">
                    <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                        Goal
                      </div>
                      <p className="mt-2 leading-relaxed">
                        A searchable atlas of mass timings by city, church, and rite.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                        In progress
                      </div>
                      <p className="mt-2 leading-relaxed">
                        Collecting schedules and normalizing formats.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                        Coverage
                      </div>
                      <p className="mt-2 leading-relaxed">
                        Maronite, Melkite, Orthodox, Latin, and more.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                        Intent
                      </div>
                      <p className="mt-2 leading-relaxed">
                        Local-first and easy to share.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-px bg-gradient-to-br from-brand-400/25 via-emerald-200/20 to-transparent dark:from-brand-700/20 dark:via-stone-950/30">
              <div className="relative overflow-hidden h-full rounded-3xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
                <div className="pointer-events-none absolute -inset-px">
                  <div className="absolute -top-20 -left-24 h-64 w-64 rounded-full bg-brand-500/10 blur-2xl" />
                  <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
                </div>

                <div className="relative">
                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    Focus areas
                  </div>
                  <h3 className="mt-3 font-display text-xl md:text-2xl text-stone-900 dark:text-stone-50 tracking-tight">
                    Signal over noise
                  </h3>
                  <p className="mt-3 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    The prototype keeps only what matters: when, where, which rite.
                  </p>
                  <ul className="mt-5 space-y-3 text-sm text-stone-600 dark:text-stone-400">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/80" />
                      <span>Location-first listings with clear parish names.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/80" />
                      <span>Rite filters that respect each community.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/80" />
                      <span>Shareable summaries for families and groups.</span>
                    </li>
                  </ul>
                  <div className="mt-6 rounded-2xl border border-emerald-200/40 dark:border-emerald-800/40 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                    Collecting schedules now. If you run a parish page, send the timetable.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LabPage;
