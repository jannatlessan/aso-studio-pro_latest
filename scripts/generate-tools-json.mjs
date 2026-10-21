// Generates public/tools.json — the machine-readable tool feed consumed by the ShaadDev mobile
// (Flutter) app. It is built from the same single sources of truth the website uses
// (src/data/tools.json and src/data/games.json), so adding an entry there automatically updates the
// public feed on the next build. Served at https://shaaddev.studio/tools.json
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE_URL = 'https://shaaddev.studio';
const here = dirname(fileURLToPath(import.meta.url));
const srcPath = join(here, '..', 'src', 'data', 'tools.json');
const gamesPath = join(here, '..', 'src', 'data', 'games.json');
const outPath = join(here, '..', 'public', 'tools.json');

const toSlug = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Tools and games share one entry shape so a single client-side model can render either feed.
const toEntry = (t) => {
  const slug = toSlug(t.icon);
  return {
    id: t.id,
    title: t.name,
    description: t.description,
    category: t.category,
    status: t.status,
    isNew: t.status === 'New',
    isTrending: t.status === 'Trending',
    path: t.path,
    link: `${BASE_URL}${t.path}`,
    icon: t.icon,          // lucide icon name (PascalCase)
    iconSlug: slug,        // kebab-case
    iconUrl: `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${slug}.svg`,
    color: '#0E9D52'       // brand emerald — tint the icon with this on the app side
  };
};

// Games are appended to the same `tools` array with an identical field set — the feed's shape is a
// contract with the Ryk Digital Hub app, so no new top-level keys and no extra per-entry fields.
// Games are distinguished only by their "Games" category and their /games/ path. The `genre` field
// in src/data/games.json is for on-site filtering and is deliberately not emitted here.
const tools = [
  ...JSON.parse(readFileSync(srcPath, 'utf8')).map(toEntry),
  ...JSON.parse(readFileSync(gamesPath, 'utf8')).map(toEntry)
];

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  brand: {
    name: 'ShaadDev Studio',
    color: '#0E9D52',
    logo: `${BASE_URL}/og-image.jpg`,
    icon: `${BASE_URL}/favicon.svg`
  },
  count: tools.length,
  categories: [...new Set(tools.map((t) => t.category))].sort(),
  tools
};

writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
const gameCount = tools.filter((t) => t.category === 'Games').length;
console.log(
  `generate-tools-json: wrote ${tools.length} entries (${tools.length - gameCount} tools + ${gameCount} games) to ${outPath}`
);
