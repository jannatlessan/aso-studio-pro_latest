// Build-time only (loaded by scripts/prerender-pages.mjs through Vite's SSR loader; never part of
// the client bundle). Renders the real page components to HTML, so the static pages carry exactly
// the titles, descriptions, canonicals and wording the components show after hydration.
import { createElement, type ComponentType } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from '../pages/Home';
import GamesList from '../pages/Games/GamesList';
import MicroSaaS from '../pages/MicroSaaS';
import Stamppedia from '../pages/Apps/Stamppedia';
import StamppediaPrivacy from '../pages/Apps/StamppediaPrivacy';
import StamppediaTerms from '../pages/Apps/StamppediaTerms';
import AboutUs from '../pages/AboutUs';
import ContactUs from '../pages/ContactUs';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import gamesData from '../data/games.json';

type Loader = () => Promise<{ default: ComponentType }>;
const gameModules = import.meta.glob('../pages/Games/*.tsx') as Record<string, Loader>;

// URL slug -> component file, for the games whose file name is not the PascalCase slug.
const GAME_FILES: Record<string, string> = { '2048': 'Game2048' };
const gameFile = (slug: string) => GAME_FILES[slug] ?? slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

const PAGES: Record<string, { component: ComponentType; src?: string }> = {
  '/': { component: Home },
  '/games': { component: GamesList, src: 'src/pages/Games/GamesList.tsx' },
  '/microsaas': { component: MicroSaaS, src: 'src/pages/MicroSaaS.tsx' },
  '/apps/stamppedia': { component: Stamppedia, src: 'src/pages/Apps/Stamppedia.tsx' },
  '/apps/stamppedia/privacy': { component: StamppediaPrivacy, src: 'src/pages/Apps/StamppediaPrivacy.tsx' },
  '/apps/stamppedia/terms': { component: StamppediaTerms, src: 'src/pages/Apps/StamppediaTerms.tsx' },
  '/about': { component: AboutUs, src: 'src/pages/AboutUs.tsx' },
  '/contact': { component: ContactUs, src: 'src/pages/ContactUs.tsx' },
  '/privacy': { component: PrivacyPolicy, src: 'src/pages/PrivacyPolicy.tsx' },
  '/terms': { component: TermsOfService, src: 'src/pages/TermsOfService.tsx' },
};

export const PATHS = [...Object.keys(PAGES), ...gamesData.map((g) => g.path)];

export async function render(path: string): Promise<{ html: string; src?: string }> {
  let page = PAGES[path];
  if (!page) {
    const file = gameFile(path.replace('/games/', ''));
    const load = gameModules[`../pages/Games/${file}.tsx`];
    if (!load) throw new Error(`no component for ${path}`);
    page = { component: (await load()).default, src: `src/pages/Games/${file}.tsx` };
  }
  const html = renderToString(
    <HelmetProvider>
      <StaticRouter location={path}>{createElement(page.component)}</StaticRouter>
    </HelmetProvider>,
  );
  return { html, src: page.src };
}
