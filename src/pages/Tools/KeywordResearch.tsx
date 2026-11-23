import React, { useMemo, useState } from 'react';
import { Copy, Check, ChevronLeft, Search, Download, Loader2 } from 'lucide-react';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';
import { runKeywordSearch, REAL_SOURCES, GROUP_ORDER, type Item, type Result } from '../../lib/keywordSearch';

const ALL_SOURCE = { id: 'all', label: 'All sources (merged)', tag: '' };
const SOURCES = [...REAL_SOURCES, ALL_SOURCE];
const COUNTRIES = [
  ['us', 'United States'], ['gb', 'United Kingdom'], ['ca', 'Canada'], ['au', 'Australia'], ['in', 'India'],
  ['pk', 'Pakistan'], ['ae', 'United Arab Emirates'], ['sa', 'Saudi Arabia'], ['de', 'Germany'], ['fr', 'France'],
  ['es', 'Spain'], ['it', 'Italy'], ['br', 'Brazil'], ['mx', 'Mexico'], ['tr', 'Turkey'], ['id', 'Indonesia'],
];
const LANGS = [
  ['en', 'English'], ['ar', 'Arabic'], ['de', 'German'], ['es', 'Spanish'], ['fr', 'French'],
  ['it', 'Italian'], ['pt', 'Portuguese'], ['tr', 'Turkish'], ['id', 'Indonesian'], ['hi', 'Hindi'], ['ur', 'Urdu'],
];
const GROUP_LABELS: Record<string, string> = {
  base: 'Direct suggestions',
  questions: 'Questions',
  prepositions: 'With prepositions',
  modifiers: 'With modifiers (free, online, best...)',
  alphabet: 'Alphabet expansion (A to Z)',
};

export default function KeywordResearch() {
  const [seed, setSeed] = useState('');
  const [source, setSource] = useState('google');
  const [gl, setGl] = useState('us');
  const [hl, setHl] = useState('en');
  const [deep, setDeep] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState('');

  const isToolUsed = !!result || seed !== '';
  const resetAll = () => {
    setSeed(''); setResult(null); setError(''); setFilter(''); setCopied('');
    setSource('google'); setGl('us'); setHl('en'); setDeep(true);
  };
  const { handleBackClick } = useToolNavigation({ toolName: 'Keyword Research', isToolUsed, onReset: resetAll });

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = seed.trim();
    if (q.length < 2) { setError('Type a keyword with at least 2 characters.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      setResult(await runKeywordSearch({ q, source, gl, hl, deep }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The search failed. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const visible = useMemo(() => {
    if (!result) return [] as { group: string; items: Item[] }[];
    const f = filter.trim().toLowerCase();
    return GROUP_ORDER.map((g) => ({
      group: g,
      items: (result.groups[g] || []).filter((x) => !f || x.kw.includes(f)),
    })).filter((g) => g.items.length > 0);
  }, [result, filter]);

  const shownCount = visible.reduce((n, g) => n + g.items.length, 0);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };
  const allText = () => visible.flatMap((g) => g.items.map((x) => x.kw)).join('\n');
  const downloadCsv = () => {
    const rows = ['keyword,group,rank_in_group,sources'];
    visible.forEach((g) => g.items.forEach((x) => rows.push(`"${x.kw.replace(/"/g, '""')}",${g.group},${x.rank},${x.srcs.join('|')}`)));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `keywords-${(result?.seed || 'export').replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const field = 'bg-[#F6F8F7] border border-black/10 rounded-2xl px-4 py-3 text-ink font-semibold outline-none focus:border-primary';

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20 flex flex-col">
      <SEO title="Free Keyword Research Tool, No Login | ShaadDev Studio" description="Free keyword research tool with no sign-up. Get hundreds of long-tail ideas from Google, YouTube, Bing and DuckDuckGo search suggestions. Export to CSV." url="https://shaaddev.studio/tools/keyword-research" keywords="keyword research tool, free keyword research tool, keyword suggestion tool, google autocomplete keywords, long tail keyword finder, youtube keyword research, keyword generator" />

      <nav className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(16,19,18,0.06)] px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-sm text-[#55605B] hover:text-primary transition-colors" title={isToolUsed ? '(Click to reset)' : undefined}>
            <ChevronLeft className="w-4 h-4" />
            {isToolUsed ? 'Keyword Research' : 'Back to Tools'}
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-primary bg-mint px-3 py-1.5 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            NEW TOOL
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-20 w-full space-y-12">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink">Keyword Research Tool</h1>
          <p className="text-lg text-[#55605B]">See what people really type into search boxes. Enter a topic and get hundreds of long-tail keyword ideas from Google, YouTube, Bing or DuckDuckGo.</p>
        </div>

        <form onSubmit={search} className="glass-panel p-6 sm:p-10 rounded-[2rem] border border-black/10 bg-white shadow-lg shadow-black/[0.03] space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="e.g. image compressor"
              maxLength={60}
              aria-label="Keyword"
              className={`${field} flex-1 text-lg`}
            />
            <button type="submit" disabled={loading} className="bg-primary text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:bg-primary-dark active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-60">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />} {loading ? 'Searching...' : 'Find keywords'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <label className="space-y-1 text-sm font-bold text-[#55605B]">Source
              <select value={source} onChange={(e) => setSource(e.target.value)} className={`${field} w-full`}>
                {SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-bold text-[#55605B]">Country
              <select value={gl} onChange={(e) => setGl(e.target.value)} className={`${field} w-full`}>
                {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-bold text-[#55605B]">Language
              <select value={hl} onChange={(e) => setHl(e.target.value)} className={`${field} w-full`}>
                {LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-ink pb-3">
              <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} className="w-5 h-5 accent-[#1f7a4d]" />
              Deep search (A to Z, questions)
            </label>
          </div>
          {error && <p role="alert" className="text-red-600 font-semibold">{error}</p>}
        </form>

        {result && (
          <section className="space-y-6" aria-live="polite">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <p className="text-[#55605B]"><strong className="text-ink">{shownCount}</strong> keywords{filter ? ' match your filter' : ''} for <strong className="text-ink">&ldquo;{result.seed}&rdquo;</strong> from {SOURCES.find((s) => s.id === result.source)?.label}{result.source === 'all' ? ` (${result.okSources.length} of ${REAL_SOURCES.length} sources responded)` : ''}.</p>
              <div className="flex flex-wrap gap-3">
                <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter results" aria-label="Filter results" className={`${field} py-2`} />
                <button onClick={() => copy(allText(), 'all')} disabled={shownCount === 0} className="border border-black/10 text-ink hover:bg-black/[0.04] px-5 py-2 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-50">
                  {copied === 'all' ? <Check size={18} /> : <Copy size={18} />} {copied === 'all' ? 'Copied' : 'Copy all'}
                </button>
                <button onClick={downloadCsv} disabled={shownCount === 0} className="bg-primary text-white px-5 py-2 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-dark disabled:opacity-50">
                  <Download size={18} /> CSV
                </button>
              </div>
            </div>

            {shownCount === 0 && <p className="text-[#55605B]">No suggestions found. Try a broader keyword, another source, or switch on deep search.</p>}

            {visible.map((g) => (
              <div key={g.group} className="space-y-3">
                <h2 className="text-lg font-bold text-ink">{GROUP_LABELS[g.group]} <span className="text-[#55605B] font-semibold">({g.items.length})</span></h2>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((x) => (
                    <li key={x.kw}>
                      <button onClick={() => copy(x.kw, x.kw)} title={`${result.source === 'all' ? `Found in ${x.srcs.map((s) => REAL_SOURCES.find((r) => r.id === s)?.label).join(', ')}. ` : ''}Rank ${x.rank} in this list. Click to copy.`} className="bg-[#F6F8F7] border border-black/10 hover:border-primary hover:bg-mint rounded-full px-4 py-1.5 text-sm text-ink transition-colors">
                        {copied === x.kw ? 'Copied' : x.kw}
                        {result.source === 'all' && copied !== x.kw && (
                          <span className="ml-2 text-[10px] font-black text-[#006622] tracking-wider">{x.srcs.map((s) => REAL_SOURCES.find((r) => r.id === s)?.tag).join('')}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-sm text-[#55605B]">Suggestions come in the order the search engine lists them, so earlier ones are usually more common. With All sources, keywords found in more engines come first (G Google, Y YouTube, B Bing, D DuckDuckGo). This tool does not show search volume or difficulty.</p>
          </section>
        )}

        <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-white border border-black/10 shadow-sm shadow-black/[0.02] space-y-6 text-sm sm:text-base text-[#55605B] leading-relaxed font-sans">
            <h2 className="text-xl sm:text-2xl font-semibold text-ink">Free keyword research from real search suggestions</h2>
            <p>When you start typing in a search box, the engine suggests what other people commonly search for. This tool reads those public suggestions for a topic and expands them in four ways: direct suggestions, question words such as how and what, prepositions such as for and without, and your keyword followed by each letter from A to Z. The result is a long list of long-tail keywords you can use for blog titles, tool pages, video titles and app store listings.</p>

            <h3 className="text-lg font-semibold text-ink mt-8 mb-4">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Enter a topic:</strong> a short phrase like &ldquo;pdf merger&rdquo;, not a full sentence.</li>
              <li><strong>Pick a source, country and language:</strong> Google for general search, YouTube for video ideas, Bing or DuckDuckGo for a second opinion.</li>
              <li><strong>Search and filter:</strong> narrow the list with the filter box, click any keyword to copy it, or export everything as CSV.</li>
            </ol>

            <h3 className="text-lg font-semibold text-ink mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-ink block mb-1">1. Does it show search volume?</strong>
                <p>No. Search suggestions do not include volume or difficulty. Use the list to find phrases people actually type, then check demand and competition separately, for example in Google Search Console once your page is live.</p>
              </div>
              <div>
                <strong className="text-ink block mb-1">2. Is my keyword stored?</strong>
                <p>No account is needed and nothing is saved. Your keyword is sent to our server only to fetch the suggestions from the chosen search engine, and the results are cached briefly.</p>
              </div>
              <div>
                <strong className="text-ink block mb-1">3. Why do some searches return few results?</strong>
                <p>Very specific or new topics have few suggestions. Try a broader keyword or another source.</p>
              </div>
            </div>
          </article>
          <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/keyword-research" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
