import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Registers the read-only WebMCP tools once (no-op in browsers without WebMCP).
// The tool definitions (and the tool/app catalogs they read) load as a separate chunk,
// only in browsers that expose WebMCP, so normal visitors do not download them.
export default function WebMcpBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    const mc =
      (document as unknown as { modelContext?: { registerTool?: unknown } }).modelContext ??
      (navigator as unknown as { modelContext?: { registerTool?: unknown } }).modelContext;
    if (!mc || typeof mc.registerTool !== 'function') return;
    import('../lib/webmcp').then(({ registerWebMcpTools }) => registerWebMcpTools((path) => navigate(path)));
  }, [navigate]);
  return null;
}
