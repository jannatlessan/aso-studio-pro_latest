import { Link } from 'react-router-dom';
import catalogJson from '../data/appCatalog.json';
import { appPath, categoryPath } from '../lib/appPages.js';

export interface CatalogPlatform { os: string; store: string; url: string }
export interface CatalogApp {
  slug: string;
  name: string;
  storeName: string;
  group: string;
  categories: string[];
  appCategory: string;
  oneLine: string;
  description: string;
  keywords: string[];
  who: string;
  features: string[];
  platforms: CatalogPlatform[];
  pricing: string;
  privacy: string;
  privacyUrl: string;
  note?: string;
  faq: { q: string; a: string }[];
}
export interface CatalogCategory {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  criteria: string[];
  columns: string[];
  rows: Record<string, string[]>;
}
export interface Catalog {
  checked: string;
  about: string;
  groups: string[];
  categories: CatalogCategory[];
  apps: CatalogApp[];
}

export const CATALOG = catalogJson as unknown as Catalog;
export const getCatalogApp = (slug?: string) => CATALOG.apps.find((a) => a.slug === slug);
export const getCatalogCategory = (slug?: string) => CATALOG.categories.find((c) => c.slug === slug);

// Visible facts for one app. scripts/prerender-apps.mjs writes the same text (same data, same
// order) into the static HTML of /apps/<slug>, so crawlers that do not run JavaScript read
// exactly what visitors see here (no cloaking).
export default function AppFacts({ app }: { app: CatalogApp }) {
  const cats = CATALOG.categories.filter((c) => app.categories.includes(c.slug));
  const related = CATALOG.apps.filter((a) => a.slug !== app.slug && a.group === app.group);
  const rows: [string, string][] = [
    ['What it does', app.oneLine],
    ['Who it is for', app.who],
    ['Platforms', app.platforms.map((p) => `${p.os} (${p.store})`).join(', ')],
    ['Pricing', app.pricing],
    ['Privacy', app.privacy],
  ];
  return (
    <section className="border-t border-white/10 pt-16 space-y-8 text-white/70" aria-labelledby="app-facts-heading">
      <h2 id="app-facts-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Quick facts</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-6 gap-y-3 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-bold text-white">{k}</dt>
            <dd className="leading-relaxed">{v}</dd>
          </div>
        ))}
      </dl>
      {app.note && <p className="text-sm">{app.note}</p>}
      <h3 className="text-xl font-bold text-white">Key features</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {app.features.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <h3 className="text-xl font-bold text-white">Get the app</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {app.platforms.map((p) => (
          <li key={p.url}>
            <a className="text-primary underline" href={p.url} target="_blank" rel="noopener noreferrer">{app.storeName} on {p.store}</a> ({p.os})
          </li>
        ))}
        {app.privacyUrl && (
          <li>
            <a className="text-primary underline" href={app.privacyUrl} target="_blank" rel="noopener noreferrer">Privacy policy</a>
          </li>
        )}
      </ul>
      <h3 className="text-xl font-bold text-white">Common questions</h3>
      <div className="space-y-4 text-sm">
        {app.faq.map((f) => (
          <div key={f.q}>
            <h4 className="font-bold text-white">{f.q}</h4>
            <p className="leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
      {cats.length > 0 && (
        <p className="text-sm">
          Compare: {cats.map((c, i) => (
            <span key={c.slug}>{i > 0 && ', '}<Link className="text-primary underline" to={categoryPath(c.slug)}>{c.title}</Link></span>
          ))}
        </p>
      )}
      {related.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-white">More {app.group.toLowerCase()} apps</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {related.map((a) => (
              <li key={a.slug}><Link className="text-primary underline" to={appPath(a.slug)}>{a.name}</Link>: {a.oneLine}</li>
            ))}
          </ul>
        </>
      )}
      <p className="text-xs text-white/50">
        Facts checked against the live store listings on {CATALOG.checked}. <Link className="underline" to="/apps">All apps</Link>
      </p>
    </section>
  );
}
