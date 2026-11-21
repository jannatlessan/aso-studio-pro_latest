// Builds <link rel="modulepreload"> tags for a lazy route's chunk and its static imports, from
// Vite's build manifest (dist/.vite/manifest.json). Pre-rendered pages use it so the route code
// downloads in parallel with the main bundle instead of after it (shorter LCP on mobile).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function makePreloader(dist) {
  const file = join(dist, '.vite', 'manifest.json');
  const manifest = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  return function preloadTags(src) {
    if (!manifest[src]) return '';
    const seen = new Set();
    const walk = (key) => {
      const e = manifest[key];
      if (!e || e.isEntry || seen.has(e.file)) return;
      seen.add(e.file);
      (e.imports || []).forEach(walk);
    };
    walk(src);
    return [...seen].map((f) => `<link rel="modulepreload" crossorigin href="/${f}">`).join('');
  };
}
