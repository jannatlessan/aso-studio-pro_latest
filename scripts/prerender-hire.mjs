// Post-build: writes dist/hire/index.html and dist/services/<slug>/index.html with real HTML text,
// the same way prerender-apps.mjs does for /apps: the SPA shell with page-specific <head> tags and
// a static copy of the page inside #root. React (src/pages/Hire.tsx) replaces it on load with the
// same facts, so crawlers that do not run JavaScript (GPTBot, OAI-SearchBot, ClaudeBot,
// PerplexityBot...) read the same answer-first content.
// Data: src/data/hireProfile.json + src/data/appCatalog.json; text/JSON-LD: src/lib/hirePages.js.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { makePreloader } from './route-preload.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const H = await import(pathToFileURL(join(root, 'src/lib/hirePages.js')).href);
const catalog = JSON.parse(readFileSync(join(root, 'src/data/appCatalog.json'), 'utf8'));
const profile = JSON.parse(readFileSync(join(root, 'src/data/hireProfile.json'), 'utf8'));
if (!existsSync(join(dist, 'index.html'))) { console.error('prerender-hire: run vite build first'); process.exit(1); }
const shell = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');
const fill = (s) => H.fill(s, catalog);

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
    `    <style>.ssg{max-width:860px;margin:0 auto;padding:32px 20px;font-family:Inter,system-ui,sans-serif;color:#101312;line-height:1.6}.ssg a{color:#0E9D52}.ssg dt{font-weight:700;margin-top:10px}.ssg dd{margin:0 0 6px}.ssg h2{margin-top:28px}.ssg li{margin:4px 0}</style>\n  </head>`;
  h = h.replace('</head>', extra);
  h = h.replace(/<noscript>[\s\S]*?<\/noscript>/, '');
  return h;
}

const nav = `<nav><a href="/">ShaadDev Studio</a> · <a href="/hire">Hire</a> · <a href="/apps">Apps</a> · <a href="/tools">Free tools</a> · <a href="/about">About</a> · <a href="/contact">Contact</a></nav>`;
const foot = `<footer><p><a href="/privacy">Privacy policy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a></p></footer>`;
const preload = makePreloader(dist);
const page = (html, body) => html
  .replace('</head>', `${preload('src/pages/Hire.tsx')}</head>`)
  .replace('<div id="root"></div>', `<div id="root"><div class="ssg">${body}</div></div>`);
const out = (path, html) => {
  const dir = join(dist, path.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
};
const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const a = (href, text, ext) => `<a href="${esc(href)}"${ext ? ' rel="noopener noreferrer"' : ''}>${esc(text)}</a>`;
const ext = (u) => /^https?:/.test(u) && !u.startsWith('https://shaaddev.studio');
const caseLi = (c) => `<strong>${a(c.page, c.name, ext(c.page))}</strong> (${esc(c.kind)}): ${esc(c.what)}` +
  (c.links.length && c.links[0].url !== c.page ? ` ${c.links.map((l) => a(l.url, l.label, true)).join(' · ')}` : '');
const contact = profile.contact;
const contactBlock = `<h2>How to contact</h2>
<p>${esc(contact.note)} Replies ${esc(contact.replyTime)}.</p>
${ul([a('/contact', 'Contact page (form)'), `Email: ${a(`mailto:${contact.email}`, contact.email)}`, `WhatsApp: ${a(contact.whatsapp, 'chat on WhatsApp', true)}`])}`;
const p = profile.person;
let written = 0;

// /hire
{
  const url = H.HIRE_PATH;
  const body = `${nav}
<main>
<h1>${esc(H.HIRE_META.h1)}</h1>
<p><strong>${esc(p.headline)}.</strong> ${esc(p.summary)} ${esc(p.status)}.</p>
<dl>
<dt>Who</dt><dd>${esc(p.name)}, ${esc(p.jobTitle)} at ShaadDev Studio. ${esc(p.experienceYears)} years of production mobile and web work.</dd>
<dt>Where</dt><dd>${esc(p.location)}.</dd>
<dt>Proof</dt><dd>${a('/apps', `${catalog.apps.length} live Android and iPhone apps`)}, live client web apps and ${a('/tools', 'free browser tools')} built by him (links below).</dd>
<dt>Profiles</dt><dd>${p.sameAs.map((u) => a(u, u.includes('github') ? 'GitHub' : 'LinkedIn', true)).join(' · ')}</dd>
<dt>Pricing</dt><dd>No published prices: you get a quote for your project after a short scope review.</dd>
</dl>
<h2>Services</h2>
${ul(profile.services.map((s) => `${a(H.servicePath(s.slug), s.name)}: ${esc(fill(s.answer))}`))}
<h2>Selected work you can check</h2>
${ul([...new Map(profile.services.flatMap((s) => H.casesFor(s, profile, catalog)).map((c) => [c.name, c])).values()].map(caseLi))}
<p>All studio apps: ${a('/apps', 'shaaddev.studio/apps')}.</p>
<h2>How he works</h2>
${ul(profile.howIWork.map(esc))}
<h2>Experience</h2>
${ul(p.experience.map((e) => `<strong>${esc(e.role)}</strong>, ${esc(e.org)} (${esc(e.period)}): ${esc(e.what)}`))}
<p>Education: ${esc(p.education.degree)}, ${esc(p.education.school)} (${esc(p.education.period)}).</p>
<p>Skills: ${esc(p.knowsAbout.join(', '))}.</p>
${contactBlock}
<h2>Common questions</h2>
${H.hireFaq(profile, catalog).map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n')}
<p>Facts on this page are taken from this site's portfolio and the live store listings, checked ${esc(profile.checked)}.</p>
</main>
${foot}`;
  out(url, page(head({ title: H.HIRE_META.title, description: H.HIRE_META.description, url: 'https://shaaddev.studio' + url, ld: H.hireJsonLd(profile, catalog) }), body));
  written++;
}

// /services/<slug>
for (const s of profile.services) {
  const path = H.servicePath(s.slug);
  const others = profile.services.filter((o) => o.slug !== s.slug);
  const body = `${nav}
<main>
<p>${a('/hire', 'Hire Rizwan Rasheed')}</p>
<h1>${esc(s.name)}</h1>
<p><strong>${esc(s.question)}</strong> ${esc(fill(s.answer))}</p>
<h2>What is included</h2>
${ul(s.includes.map(esc))}
<p>Stack: ${esc(s.stack.join(', '))}.</p>
<h2>Case studies: live work</h2>
${ul(H.casesFor(s, profile, catalog).map(caseLi))}
<h2>How it works</h2>
${ul(profile.howIWork.map(esc))}
${contactBlock}
<h2>Common questions</h2>
${H.serviceFaq(s, catalog).map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n')}
<h2>Other services</h2>
${ul(others.map((o) => a(H.servicePath(o.slug), o.name)))}
</main>
${foot}`;
  out(path, page(head({ title: H.serviceTitle(s), description: H.serviceDescription(s, catalog), url: 'https://shaaddev.studio' + path, ld: H.serviceJsonLd(s, profile, catalog) }), body));
  written++;
}
console.log(`prerender-hire: wrote ${written} static pages`);
