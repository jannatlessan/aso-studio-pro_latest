// Post-build (right after vite build, before the prerender scripts copy dist/index.html):
// inlines the single CSS bundle into dist/index.html so first paint needs no extra request
// (about 17 KB gzipped; saves a full round trip on slow mobile networks).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const file = join(dist, 'index.html');
let html = readFileSync(file, 'utf8');
const re = /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/;
const m = html.match(re);
if (!m) { console.error('inline-css: stylesheet link not found'); process.exit(1); }
const css = readFileSync(join(dist, m[1]), 'utf8').replace(/<\/style/gi, '<\\/style');
html = html.replace(re, () => `<style>${css}</style>`);

// Start the app bundle once the browser reports first-contentful-paint of the pre-rendered markup.
// The download still starts at once (modulepreload), but evaluating ~150 KB of JS no longer holds
// back the first paint. Only the home page (static hero snapshot) waits; every other page boots at
// DOMContentLoaded as before. A 1 s timer is the fallback (hidden tabs).
const sre = /<script type="module" crossorigin src="(\/assets\/[^"]+\.js)"><\/script>/;
const sm = html.match(sre);
if (!sm) { console.error('inline-css: entry script not found'); process.exit(1); }
const boot = `<link rel="modulepreload" crossorigin href="${sm[1]}">` +
  `<script>(function(){var done=0;function go(){if(done)return;done=1;var s=document.createElement('script');` +
  `s.type='module';s.crossOrigin='';s.src='${sm[1]}';document.head.appendChild(s)}` +
  `function after(){if(!document.querySelector('#root>.ssg-home')){go();return}try{var po=new PerformanceObserver(function(l){if(l.getEntriesByName('first-contentful-paint').length){po.disconnect();setTimeout(go,0)}});` +
  `po.observe({type:'paint',buffered:true})}catch(e){requestAnimationFrame(function(){setTimeout(go,0)})}setTimeout(go,1000)}` +
  `if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',after);else after()})()</script>`;
html = html.replace(sre, () => boot);
writeFileSync(file, html);
console.log(`inline-css: ${m[1]} (${css.length} bytes) inlined; entry ${sm[1]} boots after first paint`);
