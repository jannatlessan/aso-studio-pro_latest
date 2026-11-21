// Post-build: writes dist/apps/index.html, dist/apps/<slug>/index.html (one per live app) and
// dist/apps/category/<slug>/index.html with real HTML text, the same way prerender-tools.mjs does
// for /tools: the normal SPA shell with page-specific <head> tags and a static copy of the page's
// facts inside #root. React replaces that markup on load and renders the same facts visibly
// (src/components/AppFacts.tsx, src/pages/Apps/AppsHub.tsx), so visitors and crawlers that do not
// run JavaScript (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot...) get the same content.
// Data: src/data/appCatalog.json; titles/JSON-LD: src/lib/appPages.js (shared with React).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
import { makePreloader } from './route-preload.mjs';
const P = await import(pathToFileURL(join(root, 'src/lib/appPages.js')).href);
const catalog = JSON.parse(readFileSync(join(root, 'src/data/appCatalog.json'), 'utf8'));
if (!existsSync(join(dist, 'index.html'))) { console.error('prerender-apps: run vite build first'); process.exit(1); }
const shell = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

function head({ title, description, url, ld }) {
  let h = shell;
  const meta = (attr, key, val) => {
    const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*" ?/?>`);
    if (re.test(h)) h = h.replace(re, `<meta ${attr}="${key}" content="${esc(val)}" data-ssg="1" />`);
  };
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  meta('name', 'description', description);
  meta('property', 'og:title', title);
  meta('property', 'og:description', description);
  meta('property', 'og:url', url);
  meta('name', 'twitter:title', title);
  meta('name', 'twitter:description', description);
  const extra = `    <link rel="canonical" href="${esc(url)}" data-ssg="1" />\n` +
    `    <script type="application/ld+json" data-ssg="1">${jsonLd(ld)}</script>\n` +
    `    <style>.ssg{max-width:860px;margin:0 auto;padding:32px 20px;font-family:Inter,system-ui,sans-serif;color:#101312;line-height:1.6}.ssg a{color:#0E9D52}.ssg dt{font-weight:700;margin-top:10px}.ssg dd{margin:0 0 6px}.ssg h2{margin-top:28px}.ssg li{margin:4px 0}.ssg table{border-collapse:collapse}.ssg td,.ssg th{border:1px solid #ccc;padding:6px;text-align:left;vertical-align:top}</style>\n  </head>`;
  h = h.replace('</head>', extra);
  h = h.replace(/<noscript>[\s\S]*?<\/noscript>/, '');
  return h;
}

const nav = `<nav><a href="/">ShaadDev Studio</a> · <a href="/apps">Apps</a> · <a href="/tools">Free tools</a> · <a href="/hire">Hire a developer</a> · <a href="/about">About</a></nav>`;
const foot = `<footer><p><a href="/privacy">Privacy policy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a></p></footer>`;
const preload = makePreloader(dist);
const page = (html, body, src) => html
  .replace('</head>', `${src ? preload(src) : ''}</head>`)
  .replace('<div id="root"></div>', `<div id="root"><div class="ssg">${body}</div></div>`);
const out = (path, html) => {
  const dir = join(dist, path.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
};
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const a = (href, text, ext) => `<a href="${esc(href)}"${ext ? ' rel="noopener noreferrer"' : ''}>${esc(text)}</a>`;

let written = 0;

// One page per app (mirrors AppDetail hero + AppFacts).
for (const app of catalog.apps) {
  const url = P.BASE + P.appPath(app.slug);
  const cats = catalog.categories.filter((c) => app.categories.includes(c.slug));
  const related = catalog.apps.filter((o) => o.slug !== app.slug && o.group === app.group);
  const body = `${nav}
<main>
<p><a href="/apps">All apps</a></p>
<h1>${esc(app.name)}</h1>
<p><strong>${esc(app.oneLine)}</strong></p>
<p>${esc(app.description)}</p>
<h2>Quick facts</h2>
<dl>
<dt>What it does</dt><dd>${esc(app.oneLine)}</dd>
<dt>Who it is for</dt><dd>${esc(app.who)}</dd>
<dt>Platforms</dt><dd>${esc(app.platforms.map((p) => `${p.os} (${p.store})`).join(', '))}</dd>
<dt>Pricing</dt><dd>${esc(app.pricing)}</dd>
<dt>Privacy</dt><dd>${esc(app.privacy)}</dd>
</dl>
${app.note ? `<p>${esc(app.note)}</p>` : ''}
<h2>Key features</h2>
${ul(app.features.map(esc))}
<h2>Get the app</h2>
${ul([...app.platforms.map((p) => `${a(p.url, `${app.storeName} on ${p.store}`, true)} (${esc(p.os)})`), ...(app.privacyUrl ? [a(app.privacyUrl, 'Privacy policy', true)] : [])])}
<h2>Common questions</h2>
${app.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n')}
${cats.length ? `<p>Compare: ${cats.map((c) => a(P.categoryPath(c.slug), c.title)).join(', ')}</p>` : ''}
${related.length ? `<h2>More ${esc(app.group.toLowerCase())} apps</h2>${ul(related.map((o) => `${a(P.appPath(o.slug), o.name)}: ${esc(o.oneLine)}`))}` : ''}
<p>Facts checked against the live store listings on ${esc(catalog.checked)}. <a href="/apps">All apps</a> · Built by <a href="/hire">Rizwan Rasheed (hire)</a></p>
</main>
${foot}`;
  out(P.appPath(app.slug), page(head({ title: P.appTitle(app), description: P.appDescription(app), url, ld: P.appJsonLd(app) }), body, 'src/pages/Apps/AppDetail.tsx'));
  written++;
}

// Use-case hubs (mirrors AppCategory).
for (const cat of catalog.categories) {
  const url = P.BASE + P.categoryPath(cat.slug);
  const apps = P.appsForCategory(catalog, cat);
  const body = `${nav}
<main>
<p><a href="/apps">All apps</a></p>
<h1>${esc(cat.title)}</h1>
<p>${esc(cat.intro)}</p>
<h2>How to choose</h2>
${ul(cat.criteria.map(esc))}
<h2>Our apps side by side</h2>
<table><thead><tr><th>App</th>${cat.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>
${apps.map((o) => `<tr><td>${a(P.appPath(o.slug), o.name)}</td>${(cat.rows[o.slug] || []).map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('\n')}
</tbody></table>
<h2>Details</h2>
${apps.map((o) => `<h3>${a(P.appPath(o.slug), o.name)}</h3><p>${esc(o.description)}</p><p>Pricing: ${esc(o.pricing)}</p><p>Get it: ${o.platforms.map((p) => a(p.url, `${p.store} (${p.os})`, true)).join(' · ')}</p>`).join('\n')}
<p>Built by <a href="/hire">Rizwan Rasheed, freelance mobile and web app developer</a>.</p>
<p>These are our own apps. Facts checked against the live store listings on ${esc(catalog.checked)}.</p>
</main>
${foot}`;
  out(P.categoryPath(cat.slug), page(head({ title: cat.metaTitle, description: cat.description, url, ld: P.categoryJsonLd(cat, catalog) }), body, 'src/pages/Apps/AppsHub.tsx'));
  written++;
}

// /apps hub (mirrors AppsHub).
{
  const url = `${P.BASE}/apps`;
  const body = `${nav}
<main>
<h1>${esc(P.HUB.title)}</h1>
<p>${esc(catalog.about)}</p>
<h2>Compare by use</h2>
${ul(catalog.categories.map((c) => `${a(P.categoryPath(c.slug), c.title)}: ${esc(c.description)}`))}
${catalog.groups.map((g) => {
    const apps = catalog.apps.filter((o) => o.group === g);
    return apps.length ? `<h2>${esc(g)}</h2>${ul(apps.map((o) => `${a(P.appPath(o.slug), o.name)} (${esc(o.platforms.map((p) => p.os).join(', '))}): ${esc(o.oneLine)}`))}` : '';
  }).join('\n')}
</main>
${foot}`;
  out('/apps', page(head({ title: `${P.HUB.metaTitle} | ShaadDev Studio`, description: P.HUB.description, url, ld: P.hubJsonLd(catalog) }), body, 'src/pages/Apps/AppsHub.tsx'));
  written++;
}

// Sanity: every app must have a group, valid categories and at least one store link.
const bad = catalog.apps.filter((o) => !catalog.groups.includes(o.group) || !o.platforms.length ||
  o.categories.some((c) => !catalog.categories.find((k) => k.slug === c)));
if (bad.length) { console.error(`prerender-apps: invalid catalogue entries: ${bad.map((o) => o.slug).join(', ')}`); process.exit(1); }
console.log(`prerender-apps: wrote ${written} static pages`);
