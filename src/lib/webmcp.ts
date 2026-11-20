// WebMCP: lets an AI agent running in the visitor's browser discover and open our tools.
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
