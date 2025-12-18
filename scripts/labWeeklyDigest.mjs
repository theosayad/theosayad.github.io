import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ARTICLE_FILE = path.resolve(ROOT, 'public', 'article-of-week.json');
const OUT_DIR = path.resolve(ROOT, 'public', 'lab', 'weekly');
const INDEX_FILE = path.resolve(OUT_DIR, 'index.json');

const decodeHtmlEntities = (input) => {
  return String(input ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
};

const stripHtml = (input) => {
  const withoutTags = String(input ?? '').replace(/<[^>]*>/g, ' ');
  return decodeHtmlEntities(withoutTags).replace(/\s+/g, ' ').trim();
};

const toDateSlug = (iso) => {
  const dt = iso ? new Date(iso) : new Date();
  if (Number.isNaN(dt.getTime())) return new Date().toISOString().slice(0, 10);
  return dt.toISOString().slice(0, 10);
};

const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));

const writeJson = async (file, payload) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
};

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
};

const getTopComments = async (storyId, limit = 12) => {
  const url = new URL('https://hn.algolia.com/api/v1/search');
  url.searchParams.set('tags', `comment,story_${storyId}`);
  url.searchParams.set('hitsPerPage', String(Math.max(10, limit)));
  url.searchParams.set('numericFilters', 'points>2');
  const data = await fetchJson(url.toString());
  const hits = Array.isArray(data?.hits) ? data.hits : [];

  return hits
    .map((hit) => {
      const text = stripHtml(hit?.comment_text);
      if (!text) return null;
      return {
        author: hit?.author ? String(hit.author) : undefined,
        points: Number.isFinite(hit?.points) ? Number(hit.points) : undefined,
        text,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.points ?? 0) - Number(a.points ?? 0))
    .slice(0, limit);
};

const buildTakeaways = (highlights) => {
  const takeaways = [];
  for (const h of highlights.slice(0, 5)) {
    const t = String(h.text);
    takeaways.push(t.length > 180 ? `${t.slice(0, 177)}…` : t);
  }
  return takeaways.slice(0, 4);
};

const maybeGenerateRewrite = async ({ articleTitle, articleUrl, highlights }) => {
  const endpoint = process.env.GITHUB_MODELS_ENDPOINT;
  const model = process.env.GITHUB_MODELS_MODEL;
  const token = process.env.GITHUB_MODELS_TOKEN || process.env.GITHUB_MODELS_API_KEY;
  if (!endpoint || !model || !token) return null;

  const prompt = [
    'Rewrite the following “article of the week” in a boutique, concise, founder/operator tone.',
    'Output plain text only (no markdown).',
    '',
    `Title: ${articleTitle}`,
    `URL: ${articleUrl}`,
    '',
    'Context: these are top Hacker News comment highlights (may be opinionated):',
    ...highlights.slice(0, 8).map((h, idx) => `${idx + 1}) (${h.points ?? '?'} pts) ${h.author ?? 'anon'}: ${h.text}`),
    '',
    'Return:',
    '1) A short alternate title (max 10 words)',
    '2) A 2–4 paragraph rewrite (150–260 words total)',
    '3) A 1-line disclaimer that this is an AI-assisted rewrite based on discussion signals',
  ].join('\n');

  const url = endpoint.endsWith('/') ? `${endpoint}chat/completions` : `${endpoint}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'api-key': token,
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      messages: [
        { role: 'system', content: 'You are a careful finance editor.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`AI rewrite failed: HTTP ${res.status}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') return null;

  const lines = content.split('\n').map((l) => l.trimEnd());
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  const title = nonEmpty[0] ?? undefined;
  const disclaimer = nonEmpty[nonEmpty.length - 1] ?? undefined;
  const body = nonEmpty.slice(1, Math.max(1, nonEmpty.length - 1)).join('\n');

  return { title, body, disclaimer };
};

const main = async () => {
  const article = await readJson(ARTICLE_FILE);
  const storyId = article?.hn?.id;
  if (!Number.isFinite(storyId)) {
    console.warn('[lab-weekly] missing hn.id in public/article-of-week.json; skipping archive');
    return;
  }

  const slug = toDateSlug(article?.selectedAt);
  const outFile = path.resolve(OUT_DIR, `${slug}.json`);

  await fs.mkdir(OUT_DIR, { recursive: true });

  try {
    const existing = await readJson(outFile);
    if (existing?.article?.hn?.id === storyId) {
      console.log('[lab-weekly] entry already exists for', slug);
      return;
    }
  } catch {
    // ignore
  }

  const highlights = await getTopComments(storyId, 12);
  const takeaways = buildTakeaways(highlights);

  let rewrite = null;
  try {
    rewrite = await maybeGenerateRewrite({
      articleTitle: String(article.title),
      articleUrl: String(article.url),
      highlights,
    });
  } catch (error) {
    console.warn('[lab-weekly] AI rewrite failed, continuing without it', error);
  }

  const entry = {
    slug,
    generatedAt: new Date().toISOString(),
    article: {
      title: String(article.title),
      url: String(article.url),
      source: article.source,
      selectedAt: article.selectedAt,
      publishedAt: article.publishedAt,
      hn: article.hn,
    },
    takeaways,
    rewrite,
    highlights,
  };

  await writeJson(outFile, entry);

  let index = { updatedAt: null, items: [] };
  try {
    index = await readJson(INDEX_FILE);
  } catch {
    // ignore
  }

  const items = Array.isArray(index.items) ? index.items : [];
  const withoutSlug = items.filter((i) => i?.slug !== slug);
  const nextItems = [
    {
      slug,
      title: entry.article.title,
      url: entry.article.url,
      source: entry.article.source,
      selectedAt: entry.article.selectedAt,
      publishedAt: entry.article.publishedAt,
      hn: entry.article.hn,
    },
    ...withoutSlug,
  ].slice(0, 52);

  await writeJson(INDEX_FILE, { updatedAt: new Date().toISOString(), items: nextItems });

  console.log('[lab-weekly] archived', slug);
};

await main();

