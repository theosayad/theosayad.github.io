import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Calendar, Search } from 'lucide-react';
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

type LabDailyEntrySearchPayload = {
  slug: string;
  summary?: string;
  keyPoints?: string[];
  rewrite?: { body?: string } | null;
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

const LabArchivePage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<LabDailyIndex | null>(null);
  const [dateQuery, setDateQuery] = useState('');
  const [topicQuery, setTopicQuery] = useState('');
  const [searchInBriefs, setSearchInBriefs] = useState(false);
  const [topicSearchStatus, setTopicSearchStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const contentIndexRef = useRef<Map<string, string>>(new Map());
  const labHref = useMemo(() => `${import.meta.env.BASE_URL}lab`, []);

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
      console.warn('[lab-archive] load failed', error);
      setData(null);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const filteredItems = useMemo(() => {
    const normalizedTopic = topicQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (dateQuery) {
        const slug = item.slug ?? toDateSlug(item.selectedAt);
        if (slug !== dateQuery) return false;
      }
      if (normalizedTopic) {
        const host = getHostname(item.url) ?? item.source ?? '';
        const baseHaystack = `${item.title ?? ''} ${host}`.toLowerCase();
        if (baseHaystack.includes(normalizedTopic)) return true;
        if (!searchInBriefs) return false;
        const contentHaystack = contentIndexRef.current.get(item.slug) ?? '';
        if (!contentHaystack.includes(normalizedTopic)) return false;
      }
      return true;
    });
  }, [items, dateQuery, topicQuery, searchInBriefs]);
  const featured = filteredItems[0];
  const rest = filteredItems.slice(1);
  const archiveUpdated = useMemo(() => formatDate(data?.updatedAt), [data?.updatedAt]);
  const entryCount = data?.items?.length ?? 0;

  const openDatePicker = useCallback(() => {
    const el = dateInputRef.current;
    if (!el) return;
    // Chrome supports showPicker(); Safari/iOS typically opens on focus automatically.
    // @ts-expect-error - showPicker is not yet in TS lib.dom for all versions.
    if (typeof el.showPicker === 'function') el.showPicker();
  }, []);

  useEffect(() => {
    const query = topicQuery.trim().toLowerCase();
    if (!searchInBriefs) {
      setTopicSearchStatus('idle');
      return;
    }
    if (!query || !items.length) {
      setTopicSearchStatus('idle');
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      setTopicSearchStatus('loading');
      try {
        const candidates = items.slice(0, 60);
        const toFetch = candidates.filter((item) => !contentIndexRef.current.has(item.slug)).slice(0, 20);
        await Promise.all(
          toFetch.map(async (item) => {
            const url = `${import.meta.env.BASE_URL}lab/daily/${item.slug}.json`;
            const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
            if (!res.ok) return;
            const json = (await res.json()) as LabDailyEntrySearchPayload;
            const parts = [
              json.summary ?? '',
              Array.isArray(json.keyPoints) ? json.keyPoints.join(' ') : '',
              json.rewrite?.body ?? '',
            ];
            contentIndexRef.current.set(item.slug, parts.join(' ').toLowerCase());
          }),
        );
      } catch {
        // ignore (network abort or fetch errors)
      } finally {
        if (!cancelled) setTopicSearchStatus('ready');
      }
    };

    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [items, topicQuery, searchInBriefs]);

  return (
    <div className="pt-28 pb-16 md:pb-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-72">
        <div className="absolute left-1/2 -translate-x-1/2 w-[720px] md:w-[1100px] h-[320px] bg-brand-400/10 dark:bg-brand-400/10 rounded-full blur-[110px] md:blur-[140px]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex items-start gap-4 min-w-0">
              <div className="p-3 rounded-2xl border border-brand-200/60 dark:border-stone-800/60 bg-white/40 dark:bg-stone-950/10 backdrop-blur-sm">
                <Calendar className="text-brand-700 dark:text-brand-300" size={22} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  Lab archive
                </div>
                <h1 className="mt-2 text-4xl md:text-5xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                  Business Reads Archive
                </h1>
                <p className="mt-3 text-stone-600 dark:text-stone-400 text-sm md:text-base max-w-2xl leading-relaxed">
                  Every day’s business read, kept with the AI brief.
                </p>
              </div>
            </div>

            <a
              href={labHref}
              onClick={(e) => {
                e.preventDefault();
                navigate('/lab');
              }}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/30 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/45 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
            >
              Back to Lab <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
            <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15">
              Archive
            </span>
            {archiveUpdated ? (
              <span className="px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/35 dark:bg-stone-950/10">
                Updated {archiveUpdated}
              </span>
            ) : null}
          </div>

          <div className="mt-10 h-px bg-stone-200/70 dark:bg-stone-800/60" />
        </header>

        <div className="mt-10 grid grid-cols-1 gap-6 items-stretch">
          <div className="rounded-3xl p-px bg-gradient-to-br from-brand-400/35 via-white/30 to-transparent dark:from-brand-700/20 dark:via-stone-950/30">
            <div className="h-full rounded-3xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                    Archive
                  </div>
                  <h2 className="mt-2 font-display text-2xl md:text-3xl text-stone-900 dark:text-stone-50 tracking-tight">
                    News archive
                  </h2>
                  <p className="mt-2 text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl">
                    Tap any entry to read the AI brief and link out.
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

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  Filters
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 shadow-sm shadow-stone-900/5">
                    <Calendar size={16} className="text-stone-400" />
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={dateQuery}
                      onChange={(event) => setDateQuery(event.target.value)}
                      onClick={openDatePicker}
                      onFocus={openDatePicker}
                      className="bg-transparent outline-none"
                      aria-label="Filter by date"
                    />
                  </div>

	                  <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 px-4 py-2 text-sm text-stone-700 dark:text-stone-200 shadow-sm shadow-stone-900/5">
	                    <Search size={16} className="text-stone-400" />
	                    <input
	                      type="search"
	                      inputMode="search"
	                      value={topicQuery}
	                      onChange={(event) => setTopicQuery(event.target.value)}
	                      placeholder="Search topics…"
	                      className="bg-transparent outline-none placeholder:text-stone-400/80 w-44 sm:w-56"
	                      aria-label="Search by topic"
	                    />
	                  </div>

	                  <button
	                    type="button"
	                    onClick={() => {
	                      setSearchInBriefs((v) => !v);
	                      setTopicSearchStatus('idle');
	                      contentIndexRef.current = new Map();
	                    }}
	                    className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 ${
	                      searchInBriefs
	                        ? 'border-brand-200/70 dark:border-stone-800/60 bg-brand-500/10 text-brand-800 dark:text-brand-200 hover:bg-brand-500/15'
	                        : 'border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 text-stone-700 dark:text-stone-200 hover:bg-white/75 dark:hover:bg-stone-950/25'
	                    }`}
	                    aria-pressed={searchInBriefs}
	                  >
	                    Search inside AI briefs
	                  </button>

	                  {dateQuery || topicQuery.trim() ? (
	                    <button
	                      type="button"
	                      onClick={() => {
	                        setDateQuery('');
	                        setTopicQuery('');
	                        setTopicSearchStatus('idle');
	                        contentIndexRef.current = new Map();
	                      }}
	                      className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/75 dark:hover:bg-stone-950/25 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
	                    >
	                      Clear
	                    </button>
	                  ) : null}

	                  {topicQuery.trim() && searchInBriefs ? (
	                    <span className="hidden sm:inline-flex items-center rounded-full border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 px-3 py-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-stone-500 dark:text-stone-400">
	                      {topicSearchStatus === 'loading' ? 'Searching…' : 'Searching content'}
	                    </span>
	                  ) : null}
                </div>
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
                      <ArrowUpRight className="shrink-0 text-stone-400 dark:text-stone-500" size={18} />
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
                      className="w-full text-left rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/55 dark:bg-stone-950/15 backdrop-blur-sm p-4 md:p-5 hover:bg-white/75 dark:hover:bg-stone-950/25 transition-colors active:scale-[0.99] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
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
                        <ArrowUpRight className="shrink-0 text-stone-400 dark:text-stone-500" size={18} />
                      </div>
                    </button>
                  );
                })}

                {status === 'ready' && !filteredItems.length ? (
                  <div className="text-stone-600 dark:text-stone-400">
                    No entries match your filters. Try a different date or topic.
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

export default LabArchivePage;
