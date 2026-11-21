// Captures the rendered home hero (wrapper + Nav + first <section>) into src/ssg/home-shell.html.
// scripts/prerender-home.mjs injects it into dist/index.html so the hero paints before any JS runs.
// Re-run after changing the hero or Nav: npm run build && npx vite preview --port 4173, then
//   PUPPETEER_CORE=/path/to/node_modules/puppeteer-core node scripts/snapshot-home.mjs http://localhost:4173/
// (puppeteer-core is not a project dependency; point PUPPETEER_CORE at any local install.)
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const url = process.argv[2] || 'http://localhost:4173/';
const mod = process.env.PUPPETEER_CORE;
if (!mod) { console.error('Set PUPPETEER_CORE to a puppeteer-core folder'); process.exit(1); }
const puppeteer = (await import(pathToFileURL(join(mod, 'lib/puppeteer/puppeteer-core.js')).href)).default;
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 823, deviceScaleFactor: 1 });
// Drop any existing static hero so React renders (and we capture) the live one.
await page.evaluateOnNewDocument(() => {
  document.addEventListener('DOMContentLoaded', () => document.getElementById('ssg-hero')?.remove());
});
await page.goto(url, { waitUntil: 'networkidle0' });
await page.waitForSelector('main section h1');
await new Promise((r) => setTimeout(r, 2500)); // let entry animations finish (final inline styles)
const html = await page.evaluate(() => {
  const wrap = document.querySelector('#root > div');
  const out = wrap.cloneNode(false);
  for (const child of wrap.children) {
    if (child.tagName === 'MAIN') {
      const main = child.cloneNode(false);
      main.appendChild(child.querySelector(':scope > section').cloneNode(true));
      out.appendChild(main);
    } else {
      out.appendChild(child.cloneNode(true));
    }
  }
  return out.outerHTML;
});
await browser.close();
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
writeFileSync(join(root, 'src/ssg/home-shell.html'), html + '\n');
console.log(`snapshot-home: ${html.length} bytes`);
