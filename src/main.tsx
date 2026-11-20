import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Pre-rendered tool pages (scripts/prerender-tools.mjs) carry static head tags marked data-ssg.
// The page's <SEO> component renders the same tags again, so drop the static copies first.
document.querySelectorAll('head [data-ssg]').forEach((n) => n.remove());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
