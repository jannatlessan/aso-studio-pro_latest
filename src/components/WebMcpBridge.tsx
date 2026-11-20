import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerWebMcpTools } from '../lib/webmcp';

// Registers the read-only WebMCP tools once (no-op in browsers without WebMCP).
export default function WebMcpBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    registerWebMcpTools((path) => navigate(path));
  }, [navigate]);
  return null;
}
