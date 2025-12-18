import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_FILE = path.resolve(process.cwd(), 'public', 'article-of-day.json');
const ONE_DAY_SECONDS = 24 * 60 * 60;

const FINANCE_KEYWORDS = [
  'market',
  'markets',
  'stock',
  'stocks',
  'equity',
  'bond',
  'bonds',
  'treasury',
  'yield',
  'rates',
  'inflation',
  'fed',
  'central bank',
  'earnings',
  'ipo',
  'sec',
  'macro',
  'bank',
  'banking',
  'credit',
  'debt',
  'liquidity',
  'recession',
  'tariff',
  'currency',
  'forex',
  'fx',
  'venture',
  'vc',
  'private equity',
  'crypto',
  'bitcoin',
  'ethereum',
];

const DOMAIN_BOOST = new Map([
  ['ft.com', 20],
  ['bloomberg.com', 20],
  ['reuters.com', 18],
  ['wsj.com', 18],
  ['economist.com', 16],
  ['federalreserve.gov', 16],
  ['sec.gov', 16],
  ['imf.org', 12],
  ['worldbank.org', 12],
  ['bis.org', 12],
]);

const normalize = (value) => String(value ?? '').toLowerCase();

const getHostname = (rawUrl) => {
  try {
    const { hostname } = new URL(rawUrl);
    return hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return undefined;
  }
};

const keywordMatchScore = (title, hostname) => {
  const haystack = `${normalize(title)} ${normalize(hostname)}`;
  let hits = 0;
  for (const keyword of FINANCE_KEYWORDS) {
    if (haystack.includes(keyword)) hits += 1;
  }
  return hits;
};

const domainBoost = (hostname) => {
  if (!hostname) return 0;
  for (const [domain, boost] of DOMAIN_BOOST.entries()) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) return boost;
  }
  return 0;
};

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

const scoreCandidate = ({ title, url, points, comments }) => {
  const hostname = getHostname(url);
  const keywordHits = keywordMatchScore(title, hostname);
  const base = Number(points ?? 0) + 2 * Number(comments ?? 0);
  const score = base + keywordHits * 8 + domainBoost(hostname);
  return { hostname, keywordHits, score };
};

const readPrevious = async () => {
  try {
    const raw = await fs.readFile(OUT_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeOutput = async (payload) => {
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.writeFile(OUT_FILE, json, 'utf8');
};

const findViaAlgolia = async ({ minTime }) => {
  const keywordQueries = [
    'markets',
    'stock',
    'bonds',
    'rates',
    'inflation',
    'macro',
    'banking',
    'treasury',
    'earnings',
    'SEC',
    'IPO',
    'venture capital',
    'private equity',
    'currency',
    'forex',
    'crypto',
  ];

  const results = [];
  const concurrency = 6;
  for (let i = 0; i < keywordQueries.length; i += concurrency) {
    const slice = keywordQueries.slice(i, i + concurrency);
    const chunk = await Promise.all(
      slice.map((q) => {
        const url = new URL('https://hn.algolia.com/api/v1/search');
        url.searchParams.set('tags', 'story');
        url.searchParams.set('hitsPerPage', '50');
        url.searchParams.set('query', q);
        url.searchParams.set('numericFilters', `created_at_i>${minTime}`);
        return fetchJson(url.toString()).catch(() => null);
      })
    );
    for (const payload of chunk) {
      const hits = payload?.hits;
      if (Array.isArray(hits)) results.push(...hits);
    }
  }

  const seen = new Set();
  const candidates = results
    .map((hit) => {
      const id = Number(hit?.objectID);
      const title = String(hit?.title ?? '').trim();
      const url = String(hit?.url ?? '').trim();
      const points = Number(hit?.points ?? 0);
      const comments = Number(hit?.num_comments ?? 0);
      const createdAt = Number(hit?.created_at_i ?? 0);
      if (!Number.isFinite(id) || !title || !url || !Number.isFinite(createdAt)) return null;
      if (seen.has(id)) return null;
      seen.add(id);
      const scored = scoreCandidate({ title, url, points, comments });
      return {
        id,
        title,
        url,
        points,
        comments,
        createdAt,
        ...scored,
      };
    })
    .filter(Boolean)
    .filter((c) => c.keywordHits > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0] ?? null;
};

const main = async () => {
  const previous = await readPrevious();

  try {
    const now = Math.floor(Date.now() / 1000);
    const minTime = now - ONE_DAY_SECONDS;

    const algoliaPick = await findViaAlgolia({ minTime });
    if (algoliaPick) {
      await writeOutput({
        title: algoliaPick.title,
        url: algoliaPick.url,
        source: algoliaPick.hostname ?? 'Hacker News',
        selectedAt: new Date().toISOString(),
        publishedAt: new Date(algoliaPick.createdAt * 1000).toISOString(),
        hn: {
          id: algoliaPick.id,
          score: algoliaPick.points,
          comments: algoliaPick.comments,
        },
      rationale: 'Auto-picked via HN search across finance keywords.',
      });
      console.log('[article-of-day] selected (algolia):', algoliaPick.title);
      return;
    }

    const ids = await fetchJson('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topIds = Array.isArray(ids) ? ids.slice(0, 200) : [];

    const concurrency = 25;
    const fetched = [];
    for (let i = 0; i < topIds.length; i += concurrency) {
      const slice = topIds.slice(i, i + concurrency);
      const chunk = await Promise.all(
        slice.map((id) => fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).catch(() => null))
      );
      fetched.push(...chunk.filter(Boolean));
    }

    const candidates = fetched
      .filter((item) => item && item.type === 'story' && item.url && !item.dead && !item.deleted && item.time >= minTime)
      .map((item) => {
        const hostname = getHostname(item.url);
        const keywordHits = keywordMatchScore(item.title, hostname);
        const base = Number(item.score ?? 0) + 2 * Number(item.descendants ?? 0);
        const score = base + keywordHits * 8 + domainBoost(hostname);
        return {
          item,
          score,
          hostname,
          keywordHits,
        };
      })
      .filter((c) => c.keywordHits > 0);

    const best = candidates.sort((a, b) => b.score - a.score)[0];

    if (!best) {
      const anyWithUrl = fetched.find(
        (item) => item && item.type === 'story' && item.url && !item.dead && !item.deleted
      );
      if (anyWithUrl) {
        const hostname = getHostname(anyWithUrl.url);
        await writeOutput({
          title: anyWithUrl.title,
          url: anyWithUrl.url,
          source: hostname ?? 'Hacker News',
          selectedAt: new Date().toISOString(),
          publishedAt: new Date(anyWithUrl.time * 1000).toISOString(),
          hn: {
            id: anyWithUrl.id,
            score: Number(anyWithUrl.score ?? 0),
            comments: Number(anyWithUrl.descendants ?? 0),
          },
          rationale: 'No finance match found today; showing the top story with a link instead.',
        });
        console.log('[article-of-day] selected (fallback topstory):', anyWithUrl.title);
        return;
      }
      if (previous) {
        console.warn('[article-of-day] no candidates found; keeping previous selection');
        return;
      }
      await writeOutput({
        title: 'Top finance read of the day (auto-picked)',
        url: 'https://news.ycombinator.com/',
        source: 'Hacker News',
        selectedAt: new Date().toISOString(),
        rationale:
          'No finance-related story was found in the current selection window. This will update automatically on the next run.',
      });
      return;
    }

    const publishedAt = new Date(best.item.time * 1000).toISOString();
    const selectedAt = new Date().toISOString();

    await writeOutput({
      title: best.item.title,
      url: best.item.url,
      source: best.hostname ?? 'Hacker News',
      selectedAt,
      publishedAt,
      hn: {
        id: best.item.id,
        score: Number(best.item.score ?? 0),
        comments: Number(best.item.descendants ?? 0),
      },
      rationale: 'Auto-picked from top Hacker News stories today using a finance keyword filter.',
    });

    console.log('[article-of-day] selected (topstories):', best.item.title);
  } catch (error) {
    console.error('[article-of-day] update failed:', error);
    if (previous) {
      console.warn('[article-of-day] keeping previous selection');
      return;
    }
    await writeOutput({
      title: 'Top finance read of the day (auto-picked)',
      url: 'https://news.ycombinator.com/',
      source: 'Hacker News',
      selectedAt: new Date().toISOString(),
      rationale:
        'Automatic selection failed on this run. This will try again on the next scheduled update.',
    });
  }
};

await main();
