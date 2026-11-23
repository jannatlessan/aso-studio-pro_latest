// Shared by the Keyword Research page and the WebMCP find_keywords tool.
// Calls our own /api/keywords proxy (public search-box suggestions; no volume or difficulty data).

export interface Item { kw: string; rank: number; srcs: string[] }
export interface Result { seed: string; source: string; okSources: string[]; groups: Record<string, Item[]> }

export const REAL_SOURCES = [
  { id: 'google', label: 'Google', tag: 'G' },
  { id: 'youtube', label: 'YouTube', tag: 'Y' },
  { id: 'bing', label: 'Bing', tag: 'B' },
  { id: 'duckduckgo', label: 'DuckDuckGo', tag: 'D' },
];
export const GROUP_ORDER = ['base', 'questions', 'prepositions', 'modifiers', 'alphabet'];

export interface SearchOptions { q: string; source: string; gl: string; hl: string; deep: boolean }

export async function runKeywordSearch({ q, source, gl, hl, deep }: SearchOptions): Promise<Result> {
  const fetchOne = async (src: string) => {
    const params = new URLSearchParams({ q, src, gl, hl, deep: deep ? '1' : '0' });
    const res = await fetch(`/api/keywords?${params.toString()}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'The search failed. Try again in a moment.');
    return { src, groups: (data.groups || {}) as Record<string, string[]> };
  };
  const wanted = source === 'all' ? REAL_SOURCES.map((s) => s.id) : [source];
  const settled = await Promise.allSettled(wanted.map(fetchOne));
  const ok = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
  if (ok.length === 0) {
    const first = settled.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
    throw first?.reason instanceof Error ? first.reason : new Error('The search failed. Try again in a moment.');
  }
  const groups: Record<string, Item[]> = {};
  for (const g of GROUP_ORDER) {
    const map = new Map<string, Item>();
    for (const r of ok) {
      (r.groups[g] || []).forEach((kw, i) => {
        const cur = map.get(kw);
        if (cur) { cur.srcs.push(r.src); cur.rank = Math.min(cur.rank, i + 1); }
        else map.set(kw, { kw, rank: i + 1, srcs: [r.src] });
      });
    }
    groups[g] = [...map.values()].sort((a, b) => b.srcs.length - a.srcs.length || a.rank - b.rank);
  }
  return { seed: q.toLowerCase(), source, okSources: ok.map((r) => r.src), groups };
}
