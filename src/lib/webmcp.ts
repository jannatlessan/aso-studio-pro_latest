// WebMCP: lets an AI agent running in the visitor's browser discover and open our tools, and
// look up our own mobile apps (list_apps, find_app_for_task, describe_app; read-only), and read the
// freelance profile behind the studio (get_freelancer_profile, list_services, get_case_studies,
// get_contact_options; read-only: they never submit the contact form or collect user data).
// Spec status (2026-11): Chrome origin trial (Chrome 149-156, extension requested), API on
// document.modelContext (older builds: navigator.modelContext). If neither exists this module
// does nothing. See knowledge/seo/geo-webmcp-notes.md in the AppFactory repo.
//
// Only read-only / navigation tools are registered. Nothing here uploads, deletes, signs in,
// pays or changes user data; tools that need the user's files stay in the page UI.
//
// Local test: chrome://flags/#enable-webmcp-testing -> Enabled, relaunch, open the site, and
// inspect the registered tools with the WebMCP Inspector extension. Production needs the origin
// trial token in index.html (placeholder there; the Boss registers it).
import tools from '../data/tools.json';
import { TOOL_DOCS } from '../components/ToolFacts';
import { CATALOG, getCatalogApp } from '../components/AppFacts';
import { findAppsForTask, appSummary, appPath, categoryPath } from './appPages.js';
import HIRE from '../data/hireProfile.json';
import { profileSummary, servicePath, getService, casesFor, fill } from './hirePages.js';

type Json = Record<string, unknown>;
interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: Json;
  annotations?: { readOnlyHint?: boolean; consequentialHint?: boolean; untrustedContentHint?: boolean };
  execute: (args: Json, client?: unknown) => Promise<unknown>;
}
interface ModelContext {
  registerTool: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => unknown;
}

const BASE = 'https://shaaddev.studio';
const slugOf = (path: string) => path.replace('/tools/', '');
const findTool = (slug: unknown) =>
  (tools as { path: string }[]).find((t) => t.path === `/tools/${String(slug ?? '').replace(/^\/?(tools\/)?/, '')}`) as
    | { name: string; description: string; category: string; path: string }
    | undefined;
const text = (value: unknown) => ({ content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }] });

let registered = false;

export function registerWebMcpTools(navigate: (path: string) => void): void {
  if (registered || typeof document === 'undefined') return;
  const mc: ModelContext | undefined =
    (document as unknown as { modelContext?: ModelContext }).modelContext ??
    (navigator as unknown as { modelContext?: ModelContext }).modelContext;
  if (!mc || typeof mc.registerTool !== 'function') return;
  registered = true;

  const slugSchema = {
    type: 'object',
    properties: { slug: { type: 'string', description: 'Tool slug, e.g. "image-resizer" (from list_tools).' } },
    required: ['slug'],
    additionalProperties: false,
  };

  const defs: ModelContextTool[] = [
    {
      name: 'list_tools',
      description:
        'List the free browser tools on ShaadDev Studio (images, video, audio, PDF, text, design, calculators). ' +
        'Returns slug, name, category, one-line description and URL. Optional category filter.',
      inputSchema: {
        type: 'object',
        properties: { category: { type: 'string', description: 'Optional exact category name, e.g. "Documents & Files".' } },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const cat = typeof args?.category === 'string' ? args.category : '';
        const list = (tools as { name: string; description: string; category: string; path: string }[])
          .filter((t) => !cat || t.category === cat)
          .map((t) => ({ slug: slugOf(t.path), name: t.name, category: t.category, description: t.description, url: BASE + t.path }));
        return text(list);
      },
    },
    {
      name: 'describe_tool',
      description:
        'Get the facts about one tool: who it is for, accepted input, output, limits, privacy (whether files stay on the device) and steps.',
      inputSchema: slugSchema,
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const t = findTool(args?.slug);
        if (!t) return text(`Unknown tool "${String(args?.slug)}". Call list_tools for valid slugs.`);
        return text({ slug: slugOf(t.path), name: t.name, url: BASE + t.path, description: t.description, ...TOOL_DOCS[t.path] });
      },
    },
    {
      name: 'open_tool',
      description:
        'Open a tool page in this tab so the user can use it (the user still picks their own files). Navigation only; nothing is uploaded or changed.',
      inputSchema: slugSchema,
      annotations: { readOnlyHint: false, consequentialHint: false },
      execute: async (args) => {
        const t = findTool(args?.slug);
        if (!t) return text(`Unknown tool "${String(args?.slug)}". Call list_tools for valid slugs.`);
        navigate(t.path);
        return text(`Opened ${t.name} at ${BASE + t.path}.`);
      },
    },
    // ---- Mobile apps (ShaadDev Studio's own Android/iPhone apps; facts from src/data/appCatalog.json)
    {
      name: 'list_apps',
      description:
        "List ShaadDev Studio's own mobile apps (Android and iPhone) with one-line description, platforms, store links and pricing model. " +
        'Optional filter by group (e.g. "Voice and audio") or platform ("Android" or "iOS").',
      inputSchema: {
        type: 'object',
        properties: {
          group: { type: 'string', description: `Optional group: ${CATALOG.groups.join(', ')}.` },
          platform: { type: 'string', enum: ['Android', 'iOS'], description: 'Optional platform filter.' },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const group = typeof args?.group === 'string' ? args.group.toLowerCase() : '';
        const platform = typeof args?.platform === 'string' ? args.platform.toLowerCase() : '';
        const list = CATALOG.apps
          .filter((a) => !group || a.group.toLowerCase() === group)
          .filter((a) => !platform || a.platforms.some((p) => p.os.toLowerCase() === platform))
          .map(appSummary);
        return text({ checked: CATALOG.checked, apps: list, comparisons: CATALOG.categories.map((c) => ({ title: c.title, url: BASE + categoryPath(c.slug) })) });
      },
    },
    {
      name: 'find_app_for_task',
      description:
        "Find which of ShaadDev Studio's own mobile apps fits a task described in plain words (e.g. \"text to speech\", \"clone my voice on Android\", \"limit my kid's volume\"). " +
        'Keyword match over the app catalogue; returns up to 3 apps with name, one-line description, store links and page URL, or none if nothing fits. ' +
        'Only covers this studio\'s apps; it is not a ranking of all apps on the market.',
      inputSchema: {
        type: 'object',
        properties: {
          task: { type: 'string', description: 'What the user wants to do, in plain words.' },
          platform: { type: 'string', enum: ['Android', 'iOS'], description: 'Optional platform filter.' },
        },
        required: ['task'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const task = typeof args?.task === 'string' ? args.task.slice(0, 300) : '';
        const platform = typeof args?.platform === 'string' ? args.platform : '';
        const hits = findAppsForTask(CATALOG, task, { platform, limit: 3 });
        if (!hits.length) {
          return text({ task, matches: [], message: 'None of our apps fits this task. Call list_apps to see everything we publish.' });
        }
        return text({ task, matches: hits.map((h) => ({ ...appSummary(h.app), matched: h.matched })) });
      },
    },
    {
      name: 'describe_app',
      description:
        'Get the checked facts about one ShaadDev Studio app: what it does, who it is for, features, platforms and store links, pricing model, privacy summary and FAQ.',
      inputSchema: {
        type: 'object',
        properties: { slug: { type: 'string', description: 'App slug from list_apps or find_app_for_task, e.g. "cardvault".' } },
        required: ['slug'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const slug = String(args?.slug ?? '').replace(/^\/?(apps\/)?/, '');
        const a = getCatalogApp(slug);
        if (!a) return text(`Unknown app "${slug}". Call list_apps for valid slugs.`);
        return text({
          slug: a.slug, name: a.name, storeName: a.storeName, page: BASE + appPath(a.slug), description: a.description,
          who: a.who, features: a.features, platforms: a.platforms, pricing: a.pricing, privacy: a.privacy,
          privacyPolicy: a.privacyUrl || null, note: a.note ?? null, faq: a.faq, checked: CATALOG.checked,
        });
      },
    },
    // ---- Freelance profile (facts in src/data/hireProfile.json; same text as /hire and /services/*)
    {
      name: 'get_freelancer_profile',
      description:
        'Get the public profile of Rizwan Rasheed, the freelance mobile and web app developer behind ShaadDev Studio: role, summary, availability, ' +
        'experience, education, skills, external profiles (GitHub, LinkedIn), proof links and the hire page. No prices are published; quotes are per project.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () => text(profileSummary(HIRE, CATALOG)),
    },
    {
      name: 'list_services',
      description:
        'List the freelance services offered (mobile app development, web development, Flutter, React/Next.js, full-stack and AI features) ' +
        'with a one-paragraph answer, what is included, stack and page URL.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () =>
        text(HIRE.services.map((s) => ({
          service: s.slug, name: s.name, summary: fill(s.answer, CATALOG), includes: s.includes, stack: s.stack, url: BASE + servicePath(s.slug),
        }))),
    },
    {
      name: 'get_case_studies',
      description:
        'Get live work that proves a service: apps in the App Store / Google Play and live client web apps, each with a link you can open. ' +
        'Optional service slug from list_services; without it, returns all case studies once.',
      inputSchema: {
        type: 'object',
        properties: { service: { type: 'string', enum: HIRE.services.map((s) => s.slug), description: 'Optional service slug.' } },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const wanted = typeof args?.service === 'string' && args.service ? args.service : '';
        const svc = wanted ? getService(HIRE, wanted) : undefined;
        if (wanted && !svc) return text(`Unknown service "${wanted}". Call list_services for valid slugs.`);
        const list = (svc ? [svc] : HIRE.services).flatMap((s) => casesFor(s, HIRE, CATALOG) as { name: string }[]);
        const unique = [...new Map(list.map((c) => [c.name, c])).values()];
        return text({ service: svc ? svc.slug : 'all', caseStudies: unique, checked: HIRE.checked });
      },
    },
    {
      name: 'get_contact_options',
      description:
        'How to contact Rizwan Rasheed about a freelance project: the contact page URL and the public contact methods shown on the site, with expected reply time. ' +
        'Read-only: this tool does not send messages or submit the contact form; the user contacts him themselves.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () =>
        text({
          contactPage: HIRE.contact.page, email: HIRE.contact.email, whatsapp: HIRE.contact.whatsapp,
          replyTime: HIRE.contact.replyTime, whatToInclude: HIRE.contact.note, hirePage: BASE + '/hire',
        }),
    },
  ];

  for (const def of defs) {
    try {
      const r = mc.registerTool(def);
      if (r && typeof (r as Promise<unknown>).catch === 'function') (r as Promise<unknown>).catch(() => undefined);
    } catch {
      // API shape changed or not allowed here: stay silent, the site works without it.
    }
  }
}
