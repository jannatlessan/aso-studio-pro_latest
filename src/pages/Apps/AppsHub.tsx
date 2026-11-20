import { Link, Navigate, useParams } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav from '../../components/Nav';
import { CATALOG, getCatalogCategory } from '../../components/AppFacts';
import { HUB, appPath, categoryPath, hubJsonLd, categoryJsonLd, appsForCategory } from '../../lib/appPages.js';

// /apps and /apps/category/:category. scripts/prerender-apps.mjs writes the same content into
// static HTML for crawlers that do not run JavaScript.

const shell = 'min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20';
const mainCls = 'relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-32 pb-20 space-y-8 text-white/70';
const h2 = 'text-2xl font-bold tracking-tight text-white pt-6';
const link = 'text-primary underline';

export default function AppsHub() {
  return (
    <div className={shell}>
      <SEO title={`${HUB.metaTitle} | ShaadDev Studio`} description={HUB.description} url="https://shaaddev.studio/apps" schema={hubJsonLd(CATALOG)} />
      <Nav />
      <main className={mainCls}>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">{HUB.title}</h1>
        <p>{CATALOG.about}</p>
        <h2 className={h2}>Compare by use</h2>
        <ul className="list-disc pl-5 space-y-1">
          {CATALOG.categories.map((c) => (
            <li key={c.slug}><Link className={link} to={categoryPath(c.slug)}>{c.title}</Link>: {c.description}</li>
          ))}
        </ul>
        {CATALOG.groups.map((g) => {
          const apps = CATALOG.apps.filter((a) => a.group === g);
          if (!apps.length) return null;
          return (
            <section key={g}>
              <h2 className={h2}>{g}</h2>
              <ul className="list-disc pl-5 space-y-1 mt-3">
                {apps.map((a) => (
                  <li key={a.slug}>
                    <Link className={link} to={appPath(a.slug)}>{a.name}</Link> ({a.platforms.map((p) => p.os).join(', ')}): {a.oneLine}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <Footer />
    </div>
  );
}

export function AppCategory() {
  const { category } = useParams<{ category: string }>();
  const cat = getCatalogCategory(category);
  if (!cat) return <Navigate to="/apps" replace />;
  const apps = appsForCategory(CATALOG, cat);
  return (
    <div className={shell}>
      <SEO title={cat.metaTitle} description={cat.description} url={`https://shaaddev.studio${categoryPath(cat.slug)}`} schema={categoryJsonLd(cat, CATALOG)} />
      <Nav />
      <main className={mainCls}>
        <p className="text-xs"><Link className="underline" to="/apps">All apps</Link></p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">{cat.title}</h1>
        <p>{cat.intro}</p>
        <h2 className={h2}>How to choose</h2>
        <ul className="list-disc pl-5 space-y-1">
          {cat.criteria.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <h2 className={h2}>Our apps side by side</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr>
                <th className="border border-white/10 p-2 text-white">App</th>
                {cat.columns.map((c) => <th key={c} className="border border-white/10 p-2 text-white">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.slug}>
                  <td className="border border-white/10 p-2"><Link className={link} to={appPath(a.slug)}>{a.name}</Link></td>
                  {(cat.rows[a.slug] || []).map((v, i) => <td key={i} className="border border-white/10 p-2">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className={h2}>Details</h2>
        {apps.map((a) => (
          <section key={a.slug}>
            <h3 className="text-lg font-bold text-white mt-4"><Link className={link} to={appPath(a.slug)}>{a.name}</Link></h3>
            <p>{a.description}</p>
            <p>Pricing: {a.pricing}</p>
            <p>Get it: {a.platforms.map((p, i) => (
              <span key={p.url}>{i > 0 && ' · '}<a className={link} href={p.url} target="_blank" rel="noopener noreferrer">{p.store} ({p.os})</a></span>
            ))}</p>
          </section>
        ))}
        <p className="text-xs text-white/50">These are our own apps. Facts checked against the live store listings on {CATALOG.checked}.</p>
      </main>
      <Footer />
    </div>
  );
}
