// Post-build (after prerender-hire, before prerender-home): static HTML for every sitemap page the
// other prerender scripts do not cover: /, /games and each game, /microsaas, /apps/stamppedia (+
// privacy, terms), /about, /contact, /privacy, /terms. Nothing is written by hand here: each page
// component is rendered with react-dom/server (src/ssg/staticPages.tsx); its own <SEO> tags become
// the static <head> tags, and its markup, reduced to headings/text/links, becomes the static copy
// inside #root that React replaces on load.
// It also writes dist/spa.html, the untouched app shell that vercel.json serves for unknown paths,
// so the home page's canonical and text never leak onto other URLs. Last, it fails the build if a
// sitemap URL has no static file or two pages share a title or description.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { build } from 'vite';
import { makePreloader } from './route-preload.mjs';

const BASE = 'https://shaaddev.studio';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const shell = readFileSync(join(dist, 'index.html'), 'utf8');
if (!shell.includes('<div id="root"></div>')) { console.error('prerender-pages: dist/index.html is not a clean shell (run vite build first)'); process.exit(1); }
writeFileSync(join(dist, 'spa.html'), shell);

const ssrDir = join(root, 'node_modules/.cache/ssg-pages');
await build({
  root, logLevel: 'warn',
  build: { ssr: 'src/ssg/staticPages.tsx', outDir: ssrDir, emptyOutDir: true, manifest: false, rollupOptions: { output: { entryFileNames: 'entry.mjs', inlineDynamicImports: true } } },
});
const { PATHS, render } = await import(pathToFileURL(join(ssrDir, 'entry.mjs')).href);

// ---- React's markup -> small tree (its output is well formed, so a tag scanner is enough) ----
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
function parse(html) {
  const top = { tag: '', attrs: '', children: [] };
  const stack = [top];
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>|[^<]+/g;
  for (const m of html.matchAll(re)) {
    const parent = stack[stack.length - 1];
    if (m[1]) { if (stack.length > 1) stack.pop(); }
    else if (m[2]) {
      const node = { tag: m[2].toLowerCase(), attrs: m[3], children: [] };
      parent.children.push(node);
      if (!m[4] && !VOID.has(node.tag)) stack.push(node);
    } else if (!m[0].startsWith('<!--')) parent.children.push(m[0]);
  }
  return top;
}
const attr = (node, name) => (node.attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`)) || [])[1];

// Not page text: chrome (the static copy has its own links), controls, media and ad slots.
const DROP = new Set(['nav', 'footer', 'script', 'style', 'svg', 'button', 'form', 'input', 'textarea', 'select', 'iframe', 'img', 'canvas', 'video', 'audio', 'title', 'meta', 'link']);
const dropped = (n) => DROP.has(n.tag) || attr(n, 'aria-label') === 'Advertisements' || attr(n, 'aria-hidden') === 'true';
const INLINE = new Set(['span', 'strong', 'b', 'em', 'i', 'code', 'small', 'br', 'a']);
const KEEP = new Set(['h1', 'h2', 'h3', 'h4', 'p', 'li', 'td', 'th', 'dt', 'dd']);
const LISTS = new Set(['ul', 'ol', 'dl', 'table', 'thead', 'tbody', 'tr']);

// All text of a node on one line, keeping links and emphasis.
function inline(node, inLink = false) {
  if (typeof node === 'string') return node;
  if (dropped(node)) return '';
  if (node.tag === 'br') return ' ';
  const isLink = node.tag === 'a';
  // Sibling elements with no text between them are separate labels on screen: keep a space.
  let text = node.children.map((c, i) => `${i && typeof c !== 'string' && typeof node.children[i - 1] !== 'string' ? ' ' : ''}${inline(c, inLink || isLink)}`).join('');
  if (!INLINE.has(node.tag)) text = ` ${text} `;
  const href = isLink && !inLink ? attr(node, 'href') : undefined;
  if (href && !href.startsWith('#') && text.trim()) return `<a href="${href}">${text.trim()}</a>`;
  return node.tag === 'strong' ? `<strong>${text}</strong>` : text;
}
const tidy = (s) => s.replace(/\s+/g, ' ').trim();
const hasBlock = (node) => node.children.some((c) => typeof c !== 'string' && !dropped(c) && (!INLINE.has(c.tag) || hasBlock(c)));

// Flat list of blocks: layout wrappers disappear, stray text is gathered into paragraphs.
function blocks(node) {
  const out = [];
  let run = '';
  const flush = () => { if (tidy(run).replace(/<[^>]+>/g, '').replace(/[\s/·]/g, '')) out.push(`<p>${tidy(run)}</p>`); run = ''; };
  let previous;
  for (const c of node.children) {
    if (typeof c === 'string') { run += c; previous = c; continue; }
    if (dropped(c)) continue;
    if (previous && typeof previous !== 'string') run += ' ';
    previous = c;
    if (KEEP.has(c.tag)) { flush(); const t = tidy(c.children.map((x) => inline(x)).join('')); if (t) out.push(`<${c.tag}>${t}</${c.tag}>`); }
    else if (LISTS.has(c.tag)) { flush(); const t = blocks(c).join(''); if (t) out.push(`<${c.tag}>${t}</${c.tag}>`); }
    else if (c.tag === 'a' && hasBlock(c)) { flush(); const t = tidy(inline(c)); if (t) out.push(`<p>${t}</p>`); }
    else if (INLINE.has(c.tag) && !hasBlock(c)) run += inline(c);
    else { flush(); out.push(...blocks(c)); }
  }
  flush();
  return out;
}

const walk = (node, fn) => { if (typeof node !== 'string') { fn(node); [...node.children].forEach((c) => walk(c, fn)); } };

// GameShell: between the title block and "How to play" sit the score boxes and the empty board;
// each step's number badge repeats the <ol> numbering.
function dropGameBoard(tree) {
  walk(tree, (n) => {
    if (n.tag === 'li' && n.children[0]?.tag === 'span' && /^\d+$/.test(String(n.children[0].children.join('')))) n.children.shift();
    const kids = n.children;
    const a = kids.findIndex((c) => c.tag === 'header');
    const b = kids.findIndex((c) => c.tag === 'section');
    if (a >= 0 && b > a) kids.splice(a + 1, b - a - 1);
  });
}
// Home: the hero is already static HTML outside #root (scripts/prerender-home.mjs).
// The tech marquee also repeats its list once for the scroll loop.
function dropHero(tree) {
  let done = false;
  walk(tree, (n) => {
    if (attr(n, 'class')?.includes('marquee-track')) n.children.splice(n.children.length / 2);
    if (done || n.tag !== 'main') return;
    const i = n.children.findIndex((c) => c.tag === 'section');
    if (i >= 0) { n.children.splice(i, 1); done = true; }
  });
}

// ---- head ----
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Values read from React's markup are already escaped.
function head(markup, path) {
  const title = (markup.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
  const metas = {};
  for (const m of markup.matchAll(/<meta (name|property)="([^"]+)" content="([^"]*)"\/>/g)) metas[m[2]] = { kind: m[1], value: m[3] };
  const url = (markup.match(/<link rel="canonical" href="([^"]+)"\/>/) || [])[1];
  const want = path === '/' ? [BASE, `${BASE}/`] : [`${BASE}${path}`];
  if (!title || !metas.description || !want.includes(url)) throw new Error(`${path}: bad <SEO> tags (title=${title}, canonical=${url})`);
  // The sitemap lists the home page with a trailing slash.
  const canonical = path === '/' ? `${BASE}/` : url;
  let h = shell.replace(/<title>[^<]*<\/title>/, () => `<title>${title}</title>`);
  let extra = '';
  for (const [key, { kind, value }] of Object.entries(metas)) {
    if (key === 'viewport') continue;
    const tag = `<meta ${kind}="${key}" content="${key === 'og:url' ? esc(canonical) : value}" data-ssg="1" />`;
    const re = new RegExp(`<meta ${kind}="${key}" content="[^"]*" ?/?>`);
    if (re.test(h)) h = h.replace(re, () => tag); else extra += `    ${tag}\n`;
  }
  extra += `    <link rel="canonical" href="${esc(canonical)}" data-ssg="1" />\n`;
  for (const m of markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) extra += `    <script type="application/ld+json" data-ssg="1">${m[1].replace(/</g, '\\u003c')}</script>\n`;
  h = h.replace('</head>', () => `${extra}  </head>`).replace(/<noscript>[\s\S]*?<\/noscript>/, '');
  return h;
}

const nav = `<nav><a href="/">ShaadDev Studio</a> · <a href="/apps">Apps</a> · <a href="/tools">Free tools</a> · <a href="/games">Games</a> · <a href="/hire">Hire a developer</a> · <a href="/about">About</a></nav>`;
const foot = `<footer><p><a href="/privacy">Privacy policy</a> · <a href="/terms">Terms</a> · <a href="/contact">Contact</a></p></footer>`;
const rules = (c) => `<style>.${c}{max-width:860px;margin:0 auto;padding:32px 20px;font-family:Inter,system-ui,sans-serif;color:#101312;line-height:1.6}.${c} a{color:#0E9D52}.${c} h2{margin-top:28px}.${c} li{margin:4px 0}</style>`;
// With JavaScript the home copy stays invisible until React replaces it (no unstyled text under the hero).
const homeWait = `<script>document.documentElement.classList.add('has-js')</script><style>.has-js .ssg-home{visibility:hidden;max-height:100vh;overflow:hidden}</style>`;
const preload = makePreloader(dist);

for (const path of PATHS) {
  const { html: markup, src } = await render(path);
  const tree = parse(markup);
  if (path.startsWith('/games/')) dropGameBoard(tree);
  if (path === '/') dropHero(tree);
  const content = blocks(tree).join('\n');
  // The home copy sits under the static hero, so it does not use the "ssg" loading-skeleton class.
  const cls = path === '/' ? 'ssg-home' : 'ssg';
  const body = `${nav}\n<main>\n${content}\n</main>\n${foot}`;
  const out = head(markup, path)
    .replace('</head>', () => `${rules(cls)}${path === '/' ? homeWait : ''}${src ? preload(src) : ''}</head>`)
    .replace('<div id="root"></div>', () => `<div id="root"><div class="${cls}">${body}</div></div>`);
  const dir = join(dist, path.replace(/^\//, ''));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), out);
}
rmSync(ssrDir, { recursive: true, force: true });

// Guard: every sitemap URL has its own static page with a unique title and description.
const sitemap = readFileSync(join(root, 'public/sitemap.xml'), 'utf8');
const problems = [];
const seen = { title: new Map(), description: new Map() };
for (const [, loc] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const path = new URL(loc).pathname;
  const file = join(dist, path.replace(/^\//, ''), 'index.html');
  if (!existsSync(file)) { problems.push(`no static page for ${path}`); continue; }
  const page = readFileSync(file, 'utf8');
  const found = { title: page.match(/<title>([^<]*)<\/title>/)?.[1], description: page.match(/<meta name="description" content="([^"]*)"/)?.[1] };
  for (const [k, v] of Object.entries(found)) {
    if (seen[k].has(v)) problems.push(`duplicate ${k}: ${path} and ${seen[k].get(v)}`);
    seen[k].set(v, path);
  }
}
if (problems.length) { console.error(`prerender-pages:\n  ${problems.join('\n  ')}`); process.exit(1); }
console.log(`prerender-pages: wrote ${PATHS.length} static pages + spa.html`);
