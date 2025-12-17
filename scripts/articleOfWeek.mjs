import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_FILE = path.resolve(process.cwd(), 'public', 'article-of-week.json');
const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

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

const main = async () => {
  const previous = await readPrevious();

  try {
    const now = Math.floor(Date.now() / 1000);
    const minTime = now - ONE_WEEK_SECONDS;

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
      if (previous) {
        console.warn('[article-of-week] no candidates found; keeping previous selection');
        return;
      }
      await writeOutput({
        title: 'Top finance read of the week (auto-picked)',
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
      rationale: `Auto-picked from top Hacker News stories this week using a finance keyword filter (${best.keywordHits} keyword hit${
        best.keywordHits === 1 ? '' : 's'
      }).`,
    });

    console.log('[article-of-week] selected:', best.item.title);
  } catch (error) {
    console.error('[article-of-week] update failed:', error);
    if (previous) {
      console.warn('[article-of-week] keeping previous selection');
      return;
    }
    await writeOutput({
      title: 'Top finance read of the week (auto-picked)',
      url: 'https://news.ycombinator.com/',
      source: 'Hacker News',
      selectedAt: new Date().toISOString(),
      rationale:
        'Automatic selection failed on this run. This will try again on the next scheduled update.',
    });
  }
};

await main();

