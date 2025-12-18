import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ARTICLE_FILE = path.resolve(ROOT, 'public', 'article-of-week.json');
const OUT_DIR = path.resolve(ROOT, 'public', 'lab', 'weekly');
const INDEX_FILE = path.resolve(OUT_DIR, 'index.json');
const FORCE = process.env.FORCE_LAB_WEEKLY === '1' || process.env.FORCE === '1';

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

const fetchHtml = async (url) => {
  const res = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      // Some sites return bot blocks unless a UA is present.
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
};

const extractArticleText = (html) => {
  const cleaned = String(html ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/\s+/g, ' ');

  const paragraphs = [];
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = re.exec(cleaned))) {
    const text = stripHtml(match[1]);
    if (text && text.length >= 60) paragraphs.push(text);
  }

  // Fallback: some pages use <article> or generic content blocks.
  if (!paragraphs.length) {
    const articleMatch = /<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(cleaned);
    if (articleMatch?.[1]) {
      const text = stripHtml(articleMatch[1]);
      if (text) return text;
    }
    return stripHtml(cleaned);
  }

  // Prefer longer paragraphs, but keep ordering roughly intact.
  const scored = paragraphs
    .map((t, idx) => ({ idx, t, score: Math.min(600, t.length) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .sort((a, b) => a.idx - b.idx)
    .map((p) => p.t);

  return scored.join('\n\n');
};

const clampText = (text, maxChars) => {
  const t = String(text ?? '').trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars - 1)}…`;
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

const maybeGenerateRewrite = async ({ articleTitle, articleUrl, highlights, extractedText }) => {
  const endpoint = process.env.MODELS_ENDPOINT || process.env.GITHUB_MODELS_ENDPOINT;
  const model = process.env.MODELS_MODEL || process.env.GITHUB_MODELS_MODEL;
  const token =
    process.env.MODELS_TOKEN ||
    process.env.GITHUB_MODELS_TOKEN ||
    process.env.GITHUB_MODELS_API_KEY;
  if (!endpoint || !model || !token) return null;

  const endpointUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
  const org = (process.env.MODELS_ORG || '').trim();

  const prompt = [
    'You are rewriting a finance article for a personal site.',
    'Use the extracted article text as the primary source. Use the HN comment highlights as additional color.',
    'Do NOT quote the original article verbatim; write an original rewrite.',
    'Output valid JSON only.',
    '',
    `Title: ${articleTitle}`,
    `URL: ${articleUrl}`,
    '',
    'Extracted article text (may be partial):',
    clampText(extractedText, 9000),
    '',
    'Context: these are top Hacker News comment highlights (may be opinionated):',
    ...highlights.slice(0, 8).map((h, idx) => `${idx + 1}) (${h.points ?? '?'} pts) ${h.author ?? 'anon'}: ${h.text}`),
    '',
    'Return JSON with:',
    '{',
    '  "summary": "2-3 sentence summary",',
    '  "keyPoints": ["3-6 bullets, concise"],',
    '  "rewriteTitle": "short alternate title, max 10 words",',
    '  "rewriteBody": "2-5 paragraphs, 220-380 words total",',
    '  "disclaimer": "1 line: AI-assisted rewrite based on extracted text + discussion signals"',
    '}',
  ].join('\n');

  const safeModel = String(model).trim();
  const candidateModels = [safeModel];
  const stripped = safeModel.replace(/^openai\//i, '');
  if (stripped && stripped !== safeModel) candidateModels.push(stripped);

  const messages = [
    { role: 'system', content: 'You are a careful finance editor.' },
    { role: 'user', content: prompt },
  ];

  const tryBodies = (m) => [
    { model: m, messages, temperature: 0.35 },
    { model: m, messages },
    { model: m, messages, max_tokens: 900 },
    { model: m, messages, temperature: 0.35, max_tokens: 900 },
    { model: m, messages, max_completion_tokens: 900 },
    { model: m, messages, temperature: 0.35, max_completion_tokens: 900 },
    { model: m, messages, response_format: { type: 'json_object' }, max_tokens: 900 },
  ];

  const postOnce = async (body) => {
    let url = `${endpointUrl}/chat/completions`;
    if (org) {
      try {
        const origin = new URL(endpointUrl).origin;
        url = `${origin}/orgs/${encodeURIComponent(org)}/inference/chat/completions`;
      } catch {
        // keep default
      }
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      const snippet = text?.trim()?.slice(0, 1200) || '';
      throw new Error(`AI rewrite failed: HTTP ${res.status}${snippet ? ` · ${snippet}` : ''}`);
    }
    return JSON.parse(text);
  };

  let data;
  let lastError;
  for (const m of candidateModels) {
    for (const body of tryBodies(m)) {
      try {
        data = await postOnce(body);
        lastError = undefined;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
    if (data) break;
  }

  if (!data) throw new Error(lastError || 'AI rewrite failed');

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') return null;

  const parsed = JSON.parse(content.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary.trim() : undefined,
    keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map((v) => String(v)) : undefined,
    title: typeof parsed.rewriteTitle === 'string' ? parsed.rewriteTitle.trim() : undefined,
    body: typeof parsed.rewriteBody === 'string' ? parsed.rewriteBody.trim() : undefined,
    disclaimer: typeof parsed.disclaimer === 'string' ? parsed.disclaimer.trim() : undefined,
  };
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

  let existing = null;
  try {
    existing = await readJson(outFile);
  } catch {
    // ignore
  }

  const isSameStory = existing?.article?.hn?.id === storyId;
  const missingNewFields = isSameStory && (!existing?.summary || !Array.isArray(existing?.keyPoints) || !existing?.rewrite);

  if (isSameStory && !FORCE && !missingNewFields) {
    console.log('[lab-weekly] entry already exists for', slug);
    return;
  }

  const highlights = await getTopComments(storyId, 12);
  const takeaways = buildTakeaways(highlights);

  let extractedText = '';
  let extractMeta = { ok: false, chars: 0 };
  try {
    const html = await fetchHtml(String(article.url));
    extractedText = extractArticleText(html);
    extractMeta = { ok: Boolean(extractedText), chars: extractedText.length };
  } catch (error) {
    console.warn('[lab-weekly] article fetch/extract failed, continuing without it', error);
  }

  let rewrite = null;
  let aiError;
  try {
    rewrite = await maybeGenerateRewrite({
      articleTitle: String(article.title),
      articleUrl: String(article.url),
      highlights,
      extractedText,
    });
  } catch (error) {
    aiError = error instanceof Error ? error.message : typeof error === 'string' ? error : 'AI rewrite failed';
    console.warn('[lab-weekly] AI rewrite failed, continuing without it', { message: aiError });
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
    summary: rewrite?.summary,
    keyPoints: rewrite?.keyPoints,
    rewrite: rewrite
      ? {
          title: rewrite.title,
          body: rewrite.body,
          disclaimer: rewrite.disclaimer,
        }
      : null,
    highlights,
    meta: {
      extract: extractMeta,
      ai: {
        enabled: Boolean(
          (process.env.MODELS_ENDPOINT || process.env.GITHUB_MODELS_ENDPOINT) &&
            (process.env.MODELS_MODEL || process.env.GITHUB_MODELS_MODEL) &&
            (process.env.MODELS_TOKEN || process.env.GITHUB_MODELS_TOKEN || process.env.GITHUB_MODELS_API_KEY)
        ),
        generated: Boolean(rewrite?.body || rewrite?.summary || (Array.isArray(rewrite?.keyPoints) && rewrite.keyPoints.length)),
        error: aiError,
      },
    },
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
