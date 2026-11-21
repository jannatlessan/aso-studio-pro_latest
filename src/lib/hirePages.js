// Shared, framework-free helpers for the /hire and /services/<slug> pages. Used by the React
// page (src/pages/Hire.tsx), the post-build pre-renderer (scripts/prerender-hire.mjs), the SEO
// file generator (scripts/generate-seo-files.mjs) and WebMCP (src/lib/webmcp.ts), so text,
// JSON-LD and tool answers are identical everywhere. Data: src/data/hireProfile.json (facts
// already public on the site) + src/data/appCatalog.json (live apps).
// Rules: no prices, no ratings/reviews markup (self-controlled testimonials are not eligible),
// sameAs only to profiles the site itself links.
import { BASE, ORG, ORG_ID, appPath } from './appPages.js';

export const HIRE_PATH = '/hire';
export const PERSON_ID = `${BASE}/hire#person`;
export const servicePath = (slug) => `/services/${slug}`;

export const HIRE_META = {
  title: 'Hire a freelance mobile and web app developer: Rizwan Rasheed | ShaadDev Studio',
  h1: 'Hire Rizwan Rasheed: freelance mobile and web app developer',
  description:
    'Rizwan Rasheed (ShaadDev Studio) builds iPhone and Android apps with Flutter and React Native, web apps with React and Next.js, full-stack backends and AI features. Live apps and client projects as proof; contact for a quote.'
};

/** Replace {APPS} with the live app count so copy never drifts from the catalogue. */
export const fill = (s, catalog) => String(s).replace(/\{APPS\}/g, String(catalog.apps.length));

export function getService(profile, slug) {
  return profile.services.find((s) => s.slug === String(slug || '').replace(/^\/?(services\/)?/, ''));
}

/** Resolve a case reference ({app} or {project}) to a uniform, linkable record. */
export function resolveCase(ref, profile, catalog) {
  if (ref.app) {
    const a = catalog.apps.find((x) => x.slug === ref.app);
    if (!a) throw new Error(`hire: unknown app ${ref.app}`);
    return {
      name: a.name,
      kind: 'Live app (' + a.platforms.map((p) => p.os).join(', ') + ')',
      what: a.oneLine,
      page: BASE + appPath(a.slug),
      links: a.platforms.map((p) => ({ label: `${p.store}`, url: p.url }))
    };
  }
  const p = profile.projects[ref.project];
  if (!p) throw new Error(`hire: unknown project ${ref.project}`);
  return { name: p.name, kind: p.type, what: p.what, page: p.url, links: [{ label: 'Live', url: p.url }] };
}

export function casesFor(service, profile, catalog) {
  return service.cases.map((c) => resolveCase(c, profile, catalog));
}

export function personNode(profile) {
  const p = profile.person;
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: p.name,
    jobTitle: p.jobTitle,
    description: p.headline,
    image: p.image,
    url: BASE + HIRE_PATH,
    sameAs: p.sameAs,
    knowsAbout: p.knowsAbout,
    worksFor: { '@id': ORG_ID },
    alumniOf: { '@type': 'CollegeOrUniversity', name: p.education.school },
    hasOccupation: { '@type': 'Occupation', name: 'Software engineer (mobile and web app development)' },
    contactPoint: { '@type': 'ContactPoint', contactType: 'freelance project inquiries', url: profile.contact.page, email: profile.contact.email }
  };
}

function serviceNode(s, profile, catalog) {
  const url = BASE + servicePath(s.slug);
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: s.name,
    serviceType: s.serviceType,
    description: fill(s.answer, catalog),
    url,
    provider: { '@id': PERSON_ID },
    brand: { '@id': ORG_ID },
    areaServed: 'Worldwide',
    // No price: quotes are per project. The Offer only says how to get one.
    offers: { '@type': 'Offer', url: profile.contact.page, description: 'Quote per project after a scope review; contact to request one.' }
  };
}

const faqNode = (url, faq) => ({
  '@type': 'FAQPage',
  '@id': `${url}#faq`,
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
});

export function hireFaq(profile, catalog) {
  return profile.faq.map((f) => ({ q: fill(f.q, catalog), a: fill(f.a, catalog) }));
}

export function hireJsonLd(profile, catalog) {
  const url = BASE + HIRE_PATH;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name: HIRE_META.title,
        description: HIRE_META.description,
        dateModified: profile.checked,
        mainEntity: { '@id': PERSON_ID },
        about: { '@id': PERSON_ID }
      },
      personNode(profile),
      {
        ...ORG,
        description: 'Mobile and web engineering studio of Rizwan Rasheed; publisher of Android and iPhone apps and free browser tools.',
        areaServed: 'Worldwide',
        founder: { '@id': PERSON_ID },
        sameAs: profile.person.sameAs,
        makesOffer: profile.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@id': `${BASE}${servicePath(s.slug)}#service` }, url: profile.contact.page }))
      },
      ...profile.services.map((s) => serviceNode(s, profile, catalog)),
      faqNode(url, hireFaq(profile, catalog)),
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Hire', item: url }] }
    ]
  };
}

export function serviceFaq(s, catalog) {
  return s.faq.map((f) => ({ q: fill(f.q, catalog), a: fill(f.a, catalog) }));
}

export function serviceTitle(s) {
  return `${s.name}: freelance developer Rizwan Rasheed | ShaadDev Studio`;
}

export function serviceDescription(s, catalog) {
  const a = fill(s.answer, catalog);
  return a.length > 300 ? a.slice(0, 297).replace(/\s+\S*$/, '') + '...' : a;
}

export function serviceJsonLd(s, profile, catalog) {
  const url = BASE + servicePath(s.slug);
  const cases = casesFor(s, profile, catalog);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      serviceNode(s, profile, catalog),
      personNode(profile),
      ORG,
      {
        '@type': 'ItemList',
        '@id': `${url}#cases`,
        name: `${s.short}: live work`,
        itemListElement: cases.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: c.page }))
      },
      faqNode(url, serviceFaq(s, catalog)),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Hire', item: BASE + HIRE_PATH },
          { '@type': 'ListItem', position: 2, name: s.short, item: url }
        ]
      }
    ]
  };
}

/** Compact profile for WebMCP / feeds. */
export function profileSummary(profile, catalog) {
  const p = profile.person;
  return {
    name: p.name,
    jobTitle: p.jobTitle,
    headline: p.headline,
    summary: p.summary,
    status: p.status,
    location: p.location,
    experienceYears: p.experienceYears,
    experience: p.experience,
    education: p.education,
    skills: p.knowsAbout,
    profiles: p.sameAs,
    studio: { name: 'ShaadDev Studio', url: BASE, liveApps: catalog.apps.length, appsPage: `${BASE}/apps`, toolsPage: `${BASE}/tools` },
    hirePage: BASE + HIRE_PATH,
    contactPage: profile.contact.page,
    pricing: 'No published prices; quote per project after a scope review (contact page).',
    checked: profile.checked
  };
}
