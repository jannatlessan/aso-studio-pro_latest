import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

// Cross-origin isolation (COOP/COEP) is only needed on the WASM-threaded
// tools (ffmpeg / bg-removal). Applying it site-wide blocks every
// cross-origin image without a CORP header (CDN icons, store badges,
// screenshots), so scope it to just those routes — mirrors vercel.json.
const ISOLATED_ROUTES = /^\/tools\/(gif-viewer|background-remover|video-to-gif)/;

function crossOriginIsolation(): Plugin {
  return {
    name: 'scoped-cross-origin-isolation',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && ISOLATED_ROUTES.test(req.url)) {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        }
        next();
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), crossOriginIsolation()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@imgly/background-removal'],
    },
  };
});
