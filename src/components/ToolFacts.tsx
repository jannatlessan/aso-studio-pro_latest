import docs from '../data/toolDocs.json';

export interface ToolDoc {
  who: string;
  steps: string[];
  input: string;
  output: string;
  limits: string;
  privacy: string;
  faq: { q: string; a: string }[];
  pageHasFaqMicrodata?: boolean;
}

export const TOOL_DOCS = (docs as unknown as { tools: Record<string, ToolDoc> }).tools;

// Visible "quick facts" for a tool. The same text (from src/data/toolDocs.json) is
// pre-rendered into the static HTML of /tools/<slug> by scripts/prerender-tools.mjs,
// so crawlers that do not run JavaScript read exactly what visitors see here.
export default function ToolFacts({ currentPath }: { currentPath: string }) {
  const doc = TOOL_DOCS[currentPath];
  if (!doc) return null;
  const rows: [string, string][] = [
    ['Who it is for', doc.who],
    ['Input', doc.input],
    ['Output', doc.output],
    ['Limits', doc.limits],
    ['Privacy', doc.privacy],
  ];
  return (
    <section className="pt-10 border-t border-black/10 mt-16" aria-labelledby="tool-facts-heading">
      <h2 id="tool-facts-heading" className="text-xl font-black text-ink mb-6 uppercase tracking-wider">
        Quick facts
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-6 gap-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-bold text-ink">{k}</dt>
            <dd className="text-[#55605B] leading-relaxed">{v}</dd>
          </div>
        ))}
      </dl>
      <h3 className="text-lg font-bold text-ink mt-8 mb-3">How to use it</h3>
      <ol className="list-decimal pl-5 space-y-1 text-sm text-[#55605B]">
        {doc.steps.map((s) => <li key={s}>{s}</li>)}
      </ol>
      <h3 className="text-lg font-bold text-ink mt-8 mb-3">Common questions</h3>
      <div className="space-y-4 text-sm">
        {doc.faq.map((f) => (
          <div key={f.q}>
            <h4 className="font-bold text-ink">{f.q}</h4>
            <p className="text-[#55605B] leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
