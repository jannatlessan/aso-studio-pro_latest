import type { VercelRequest, VercelResponse } from '@vercel/node';

// Keyword ideas from public search-box suggestions (autocomplete). It shows what people type, in the order the
// engine lists it. It does NOT return search volume, difficulty or competition, and the tool never claims it does.
// Free sources only, no API keys. Browsers cannot call these endpoints directly (no CORS), so this small proxy does.

type Source = 'google' | 'youtube' | 'bing' | 'duckduckgo';

const SOURCES: Source[] = ['google', 'youtube', 'bing', 'duckduckgo'];
const QUESTIONS = ['how', 'what', 'why', 'when', 'where', 'which', 'who', 'can', 'is', 'are', 'does'];
const PREPOSITIONS = ['for', 'with', 'without', 'near', 'to', 'vs', 'and', 'or'];
const MODIFIERS = ['free', 'online', 'best', 'cheap', 'app'];
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

const MAX_SEED = 60;
const TIMEOUT_MS = 4000;
const CONCURRENCY = 8;

// Light per-instance rate limit (20 requests a minute; "All sources" in the page makes 4 requests). Responses are also cached at the edge (see Cache-Control below).
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > 20;
}

function endpoint(source: Source, q: string, hl: string, gl: string): string {
  const e = encodeURIComponent(q);
  switch (source) {
    case 'google':
      return `https://suggestqueries.google.com/complete/search?client=firefox&q=${e}&hl=${hl}&gl=${gl}`;
    case 'youtube':
      return `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${e}&hl=${hl}&gl=${gl}`;
    case 'bing':
      return `https://api.bing.com/osjson.aspx?query=${e}&mkt=${hl}-${gl.toUpperCase()}`;
    case 'duckduckgo':
      return `https://duckduckgo.com/ac/?q=${e}&type=list`;
  }
}

async function suggest(source: Source, q: string, hl: string, gl: string): Promise<string[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(endpoint(source, q, hl, gl), {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShaadDevKeywordTool/1.0)', Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = JSON.parse(await res.text());
    const list = Array.isArray(data) ? data[1] : [];
    return Array.isArray(list) ? list.filter((s: unknown): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function pool<T>(items: (() => Promise<T>)[], size: number): Promise<T[]> {
  const out: T[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await items[i]();
      }
    })
  );
  return out;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });

  const seed = String(request.query.q || '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (seed.length < 2 || seed.length > MAX_SEED) {
    return response.status(400).json({ error: `Enter a keyword between 2 and ${MAX_SEED} characters.` });
  }
  const source = String(request.query.src || 'google') as Source;
  if (!SOURCES.includes(source)) return response.status(400).json({ error: 'Unknown source.' });
  const hl = /^[a-z]{2}$/.test(String(request.query.hl || 'en')) ? String(request.query.hl || 'en') : 'en';
  const gl = /^[a-z]{2}$/.test(String(request.query.gl || 'us')) ? String(request.query.gl || 'us') : 'us';
  const deep = String(request.query.deep || '1') !== '0';

  const ip = String(request.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
  if (limited(ip)) return response.status(429).json({ error: 'Too many searches. Wait a minute and try again.' });

  type Job = { group: string; q: string };
  const jobs: Job[] = [{ group: 'base', q: seed }];
  if (deep) {
    for (const w of QUESTIONS) jobs.push({ group: 'questions', q: `${w} ${seed}` });
    for (const w of PREPOSITIONS) jobs.push({ group: 'prepositions', q: `${seed} ${w}` });
    for (const w of MODIFIERS) jobs.push({ group: 'modifiers', q: `${w} ${seed}` });
    for (const l of ALPHABET) jobs.push({ group: 'alphabet', q: `${seed} ${l}` });
  }

  const results = await pool(
    jobs.map((j) => async () => ({ group: j.group, items: await suggest(source, j.q, hl, gl) })),
    CONCURRENCY
  );

  const groups: Record<string, string[]> = { base: [], questions: [], prepositions: [], modifiers: [], alphabet: [] };
  const seen = new Set<string>();
  for (const r of results) {
    for (const item of r.items) {
      const k = item.trim().toLowerCase();
      if (!k || k === seed || seen.has(k)) continue;
      seen.add(k);
      groups[r.group].push(k);
    }
  }

  response.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return response.status(200).json({ seed, source, hl, gl, total: seen.size, groups });
}
