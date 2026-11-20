// Shared, framework-free helpers for the /apps pages. Used by the React pages (src/pages/Apps/*),
// the post-build pre-renderer (scripts/prerender-apps.mjs), the SEO file generator
// (scripts/generate-seo-files.mjs) and WebMCP (src/lib/webmcp.ts), so titles, descriptions,
// JSON-LD and search results are identical everywhere. Data: src/data/appCatalog.json.
// Plain ESM JavaScript on purpose: Node imports it without a TypeScript step.

export const BASE = 'https://shaaddev.studio';
export const ORG_ID = `${BASE}/#organization`;
export const ORG = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'ShaadDev Studio',
  url: BASE,
  logo: `${BASE}/og-image.jpg`
};

const osWord = (os) => (os === 'iOS' ? 'iPhone' : os);

export const appPath = (slug) => `/apps/${slug}`;
export const categoryPath = (slug) => `/apps/category/${slug}`;

/** "Android & iPhone" style label from the app's platforms. */
export function platformLabel(app) {
  return app.platforms.map((p) => osWord(p.os)).join(' & ');
}

export function appTitle(app) {
  return `${app.name} for ${platformLabel(app)} | ShaadDev Studio`;
}

export function appDescription(app) {
  return app.description;
}

export const HUB = {
  title: 'Mobile apps by ShaadDev Studio',
  metaTitle: 'Android and iPhone apps by ShaadDev Studio',
  description:
    'All live Android and iPhone apps by ShaadDev Studio: AI voice and text to speech, AI image prompts, collector scanners, volume and screen controls, notes, money, fitness and games.'
};

export function appJsonLd(app) {
  const url = BASE + appPath(app.slug);
  const node = {
    '@type': 'MobileApplication',
    '@id': `${url}#app`,
    name: app.name,
    url,
    description: app.description,
    applicationCategory: app.appCategory,
    operatingSystem: app.platforms.map((p) => p.os).join(', '),
    installUrl: app.platforms.map((p) => p.url),
    sameAs: app.platforms.map((p) => p.url),
    featureList: app.features,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: app.pricing },
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID }
  };
  if (app.privacyUrl) node.privacyPolicy = app.privacyUrl;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      node,
      ORG,
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: app.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Apps', item: BASE + '/apps' },
          { '@type': 'ListItem', position: 2, name: app.name, item: url }
        ]
      }
    ]
  };
}

export function appsForCategory(catalog, cat) {
  return catalog.apps.filter((a) => a.categories.includes(cat.slug));
}

export function categoryJsonLd(cat, catalog) {
  const url = BASE + categoryPath(cat.slug);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name: cat.title,
        url,
        description: cat.description,
        publisher: { '@id': ORG_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: appsForCategory(catalog, cat).map((a, i) => ({
            '@type': 'ListItem', position: i + 1, name: a.name, url: BASE + appPath(a.slug)
          }))
        }
      },
      ORG
    ]
  };
}

export function hubJsonLd(catalog) {
  const url = `${BASE}/apps`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name: HUB.title,
        url,
        description: HUB.description,
        publisher: { '@id': ORG_ID },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: catalog.apps.map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: a.name, url: BASE + appPath(a.slug) }))
        }
      },
      ORG
    ]
  };
}

// ---- Task matching (WebMCP find_app_for_task) -------------------------------------------------
const STOP = new Set(
  'a an and app apps application best for free good i in is it me my of on or the to what which with want need can phone mobile android iphone ios some any that this there do does how help'.split(' ')
);
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const stem = (w) => w.replace(/(ing|ers|er|es|s)$/, '');

/**
 * Keyword match of a plain-language task against the catalogue. Returns up to `limit` apps,
 * best first, each with the matched terms. Optional platform filter ("android" / "ios").
 */
export function findAppsForTask(catalog, task, { platform = '', limit = 3 } = {}) {
  const q = norm(task);
  if (!q) return [];
  const words = q.split(' ').filter((w) => w.length > 1 && !STOP.has(w)).map(stem);
  const plat = norm(platform || (/\b(iphone|ios|ipad)\b/.test(q) ? 'ios' : /\bandroid\b/.test(q) ? 'android' : ''));
  const scored = [];
  for (const app of catalog.apps) {
    if (plat && !app.platforms.some((p) => norm(p.os) === plat)) continue;
    let score = 0;
    const hits = new Set();
    for (const kw of app.keywords) {
      const k = norm(kw);
      if (k.includes(' ')) {
        if (q.includes(k)) { score += 6; hits.add(kw); continue; }
        const parts = k.split(' ').map(stem);
        const got = parts.filter((p) => words.includes(p)).length;
        if (got === parts.length) { score += 5; hits.add(kw); } // all words, other order
        else if (got > 0) score += got;
        continue;
      }
      if (words.includes(stem(k))) { score += 3; hits.add(kw); }
    }
    const hay = norm([app.name, app.oneLine, app.description, app.group, ...app.categories].join(' '))
      .split(' ').map(stem);
    for (const w of words) if (w.length > 2 && hay.includes(w)) score += 1;
    if (score >= 3) scored.push({ app, score, matched: [...hits] });
  }
  scored.sort((a, b) => b.score - a.score);
  const top = scored.length ? scored[0].score : 0;
  return scored.filter((r) => r.score >= top * 0.5).slice(0, limit);
}

/** Compact public summary of an app (WebMCP / JSON feed). */
export function appSummary(app) {
  return {
    slug: app.slug,
    name: app.name,
    description: app.oneLine,
    group: app.group,
    platforms: app.platforms.map((p) => ({ os: p.os, store: p.store, url: p.url })),
    pricing: app.pricing,
    page: BASE + appPath(app.slug)
  };
}
