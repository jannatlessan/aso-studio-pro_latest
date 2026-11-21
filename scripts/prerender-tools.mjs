// Post-build: writes dist/tools/<slug>/index.html (one per live tool) and dist/tools/index.html
// with real HTML text, so crawlers that do not run JavaScript (GPTBot, OAI-SearchBot, ClaudeBot,
// PerplexityBot...) can read what each tool does. Each file is the normal SPA shell (same JS/CSS
// bundle) with page-specific <head> tags and a static copy of the tool's "Quick facts" inside
// #root. React's createRoot() replaces that markup on load and renders the same facts visibly
// (src/components/ToolFacts.tsx), so visitors and crawlers get the same content (no cloaking).
// Vercel serves these files before the SPA rewrite in vercel.json (filesystem first).
// Data: src/data/tools.json (name, path) + src/data/toolDocs.json (facts) + each tool's <SEO> tag.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { makePreloader } from './route-preload.mjs';
import { dirname, join } from 'node:path';

const BASE = 'https://shaaddev.studio';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const tools = JSON.parse(readFileSync(join(root, 'src/data/tools.json'), 'utf8'));
const docs = JSON.parse(readFileSync(join(root, 'src/data/toolDocs.json'), 'utf8'));
const shell = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

// Title/description exactly as the tool's own <SEO> component sets them (so Helmet agrees).
const seoByUrl = {};
const fileByUrl = {};
const toolDir = join(root, 'src/pages/Tools');
for (const f of readdirSync(toolDir).filter((n) => n.endsWith('.tsx'))) {
  const src = readFileSync(join(toolDir, f), 'utf8');
  const m = src.match(/<SEO[\s\S]*?\/>/);
  if (!m) continue;
  const attr = (k) => (m[0].match(new RegExp(`${k}="([^"]*)"`)) || [])[1];
  const url = attr('url');
  if (url) { seoByUrl[url] = { title: attr('title'), description: attr('description') }; fileByUrl[url] = `src/pages/Tools/${f}`; }
}

const preload = makePreloader(dist);
const preloadRoute = (src) => (src ? preload(src) : '');

const ORG = { '@type': 'Organization', '@id': `${BASE}/#organization`, name: docs.site.name, url: BASE, logo: docs.site.logo };

function head({ title, description, url, ld }) {
  let h = shell;
  const meta = (attr, key, val) => {
    const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*" ?/?>`);
    const tag = `<meta ${attr}="${key}" content="${esc(val)}" data-ssg="1" />`;
    h = re.test(h) ? h.replace(re, tag) : h;
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
    `    <style>.ssg{max-width:860px;margin:0 auto;padding:32px 20px;font-family:Inter,system-ui,sans-serif;color:#101312;line-height:1.6}.ssg a{color:#0E9D52}.ssg dt{font-weight:700;margin-top:10px}.ssg dd{margin:0 0 6px}.ssg h2{margin-top:28px}.ssg li{margin:4px 0}</style>\n  </head>`;
  h = h.replace('</head>', extra);
  h = h.replace(/<noscript>[\s\S]*?<\/noscript>/, '');
  return h;
}

const nav = `<nav><a href="/">ShaadDev Studio</a> · <a href="/tools">All tools</a> · <a href="/games">Games</a> · <a href="/hire">Hire a developer</a> · <a href="/about">About</a></nav>`;
const foot = `<footer><p>${esc(docs.site.analytics)}</p><p><a href="/privacy">Privacy policy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a></p></footer>`;
const withBody = (html, body) => html.replace('<div id="root"></div>', `<div id="root"><div class="ssg">${body}</div></div>`);

let written = 0;
const missing = [];
for (const t of tools) {
  const doc = docs.tools[t.path];
  if (!doc) { missing.push(t.path); continue; }
  const url = `${BASE}${t.path}`;
  const seo = seoByUrl[url] || {};
  const title = seo.title || `${t.name} | ShaadDev Studio`;
  const description = seo.description || t.description;
  const graph = [
    {
      '@type': 'WebApplication', '@id': `${url}#app`, name: title.split(' | ')[0], url, description,
      applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (modern web browser)',
      browserRequirements: 'Requires JavaScript', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@id': `${BASE}/#organization` }
    },
    ORG
  ];
  if (!doc.pageHasFaqMicrodata) {
    graph.push({
      '@type': 'FAQPage', '@id': `${url}#faq`,
      mainEntity: doc.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    });
  }
  const others = tools.filter((o) => o.path !== t.path).map((o) => `<li><a href="${o.path}">${esc(o.name)}</a></li>`).join('');
  const body = `${nav}
<main>
<h1>${esc(t.name)}</h1>
<p>${esc(description)}</p>
<p>Free, no account needed. The interactive tool loads on this page in your browser.</p>
<h2>Quick facts</h2>
<dl>
<dt>Who it is for</dt><dd>${esc(doc.who)}</dd>
<dt>Input</dt><dd>${esc(doc.input)}</dd>
<dt>Output</dt><dd>${esc(doc.output)}</dd>
<dt>Limits</dt><dd>${esc(doc.limits)}</dd>
<dt>Privacy</dt><dd>${esc(doc.privacy)}</dd>
</dl>
<h2>How to use it</h2>
<ol>${doc.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
<h2>Common questions</h2>
${doc.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n')}
<h2>Other free tools</h2>
<ul>${others}</ul>
</main>
${foot}`;
  const html = withBody(head({ title, description, url, ld: { '@context': 'https://schema.org', '@graph': graph } }), body)
    .replace('</head>', `${preloadRoute(fileByUrl[url])}</head>`);
  const outDir = join(dist, t.path.replace(/^\//, ''));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
  written++;
}

// /tools hub
{
  const url = `${BASE}/tools`;
  const seo = seoByUrl[url] || {};
  const title = seo.title || 'Free Online Tools | ShaadDev Studio';
  const description = seo.description || 'A collection of professional tools for developers, designers, and creators.';
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': `${url}#page`, name: title.split(' | ')[0], url, description, publisher: { '@id': `${BASE}/#organization` },
        mainEntity: { '@type': 'ItemList', itemListElement: tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${BASE}${t.path}` })) } },
      ORG
    ]
  };
  const cats = [...new Set(tools.map((t) => t.category))];
  const body = `${nav}
<main>
<h1>Free browser tools</h1>
<p>${esc(docs.site.summary)}</p>
${cats.map((c) => `<h2>${esc(c)}</h2><ul>${tools.filter((t) => t.category === c).map((t) => `<li><a href="${t.path}">${esc(t.name)}</a>: ${esc(t.description)}</li>`).join('')}</ul>`).join('\n')}
</main>
${foot}`;
  mkdirSync(join(dist, 'tools'), { recursive: true });
  writeFileSync(join(dist, 'tools', 'index.html'), withBody(head({ title, description, url, ld }), body).replace('</head>', `${preloadRoute('src/pages/Tools/ToolsList.tsx')}</head>`));
  written++;
}

if (missing.length) {
  console.error(`prerender-tools: no entry in src/data/toolDocs.json for: ${missing.join(', ')}`);
  process.exit(1);
}
if (!existsSync(join(dist, 'index.html'))) process.exit(1);
console.log(`prerender-tools: wrote ${written} static pages`);
