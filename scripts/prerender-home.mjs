// Post-build (runs last): puts the static home hero (src/ssg/home-shell.html, made by
// scripts/snapshot-home.mjs) into dist/index.html so the first paint needs only HTML + CSS.
// dist/index.html serves only "/" (unknown paths get dist/spa.html, see prerender-pages.mjs); the
// inline script still drops the hero if a host falls back to index.html for another path.
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// The Vite manifest is only needed by the prerender scripts; do not publish it.
rmSync(join(root, 'dist/.vite'), { recursive: true, force: true });
const file = join(root, 'dist/index.html');
const shellFile = join(root, 'src/ssg/home-shell.html');
if (!existsSync(shellFile)) { console.log('prerender-home: no snapshot, skipped'); process.exit(0); }
const shell = readFileSync(shellFile, 'utf8').trim();
const html = readFileSync(file, 'utf8');
if (!html.includes('<div id="root">')) { console.error('prerender-home: #root not found'); process.exit(1); }
// The hero sits outside #root so React never replaces it (Home.tsx keeps the node and renders the
// rest of the page). min-h-screen is dropped from the static wrapper so no gap appears below it.
const m = shell.match(/^<div class="([^"]*)">/);
if (!m) { console.error('prerender-home: unexpected snapshot root'); process.exit(1); }
const cls = m[1].split(/\s+/).filter((c) => c !== 'min-h-screen').join(' ');
const hero = shell.replace(m[0], `<div id="ssg-hero" class="${cls}">`);
const drop = `<script>if(location.pathname!=='/')document.getElementById('ssg-hero').remove()</script>`;
writeFileSync(file, html.replace('<div id="root">', () => `${hero}${drop}<div id="root">`));
console.log(`prerender-home: hero ${shell.length} bytes`);
