// Post-build (runs last): puts the static home hero (src/ssg/home-shell.html, made by
// scripts/snapshot-home.mjs) into dist/index.html so the first paint needs only HTML + CSS.
// dist/index.html is also the SPA fallback for every non-prerendered route, so an inline
// script drops the hero before first paint on any path other than "/".
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
if (!html.includes('<div id="root"></div>')) { console.error('prerender-home: #root not found'); process.exit(1); }
const drop = `<script>if(location.pathname!=='/')document.currentScript.previousElementSibling.remove()</script>`;
writeFileSync(file, html.replace('<div id="root"></div>', `<div id="root"><div class="ssg ssg-home">${shell}</div>${drop}</div>`));
console.log(`prerender-home: hero ${shell.length} bytes`);
