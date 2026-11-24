import { useEffect, useId, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCcw, ShieldAlert, X } from 'lucide-react';
import { useDetectAdBlock } from 'adblock-detect-react';

// Adsterra ad units for shaaddev.studio (website 6224645). Home, About and Contact never show ads.
// Each unit is hosted on /ads/frame.html (a real shaaddev.studio URL, so the ad network sees the
// registered domain and referrer). The frame tells the page when an ad really rendered; until then
// the slot takes no space, so there are never empty gaps.
const BANNER_KEYS: Record<string, { key: string; w: number; h: number }> = {
  '728x90': { key: '79dd6d77d4efd8dbb9da2b23626ba070', w: 728, h: 90 },
  '468x60': { key: 'dc4af9b2741a7e6c115deb48fa47c706', w: 468, h: 60 },
  '320x50': { key: '0a339c502d4fcb1b67575e097cfacab7', w: 320, h: 50 },
  '300x250': { key: 'd3302ed5d8fc9e7d0fabd6b7989d0068', w: 300, h: 250 },
  '160x300': { key: 'e3b4ede3f5fd1cd5cc92cf90c04e12ae', w: 160, h: 300 },
  '160x600': { key: '31a2bc5fb10b0c8ef7e26b2015efde22', w: 160, h: 600 },
};
const NATIVE_KEY = '422cf36ab897c1ddcd8115be19bea05b';
const POPUNDER_SRC = 'https://abscloud.org/1/2afbe426408f1bbe880221935a5545a4';
const SOCIAL_BAR_SRC = 'https://bauval.org/14/07b9fff71f0bb4fac2dfae0b3cbcf9c1';

// No allow-top-navigation: an ad can never redirect the page away. allow-same-origin is needed
// because Adsterra's banner script uses cookies/storage.
const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox';

// Pages that never show ads (Boss 2026-11-24): Home, About, Contact.
const AD_FREE_PATHS = ['/', '/about', '/contact'];

function useIsHome() {
  const { pathname } = useLocation();
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
  return clean === '' || AD_FREE_PATHS.includes(clean.toLowerCase());
}

function useMinWidth(px: number) {
  const [ok, setOk] = useState(() => typeof window !== 'undefined' && window.innerWidth >= px);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width:${px}px)`);
    const on = () => setOk(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [px]);
  return ok;
}

// One ad slot. Collapsed (0 height, no label) until the frame reports a real ad.
function AdSlot({
  size,
  native = false,
  label = true,
  onReady,
}: {
  size?: keyof typeof BANNER_KEYS;
  native?: boolean;
  label?: boolean;
  onReady?: () => void;
}) {
  const id = useId();
  const [ready, setReady] = useState(false);
  const [nativeH, setNativeH] = useState(0);
  const b = size ? BANNER_KEYS[size] : null;
  const key = native ? NATIVE_KEY : b!.key;
  const src = `/ads/frame.html?t=${native ? 'native' : 'banner'}&k=${key}&id=${encodeURIComponent(id)}`;

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data || e.data.adReady !== id) return;
      setReady(true);
      onReady?.();
      if (native && typeof e.data.h === 'number') setNativeH(Math.min(Math.max(e.data.h, 120), 400));
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [id, native, onReady]);

  // Not ready: no layout space, but the iframe stays in the viewport (invisible, not clickable) so
  // the ad script still treats it as viewable and renders. Ready: a normal slot with a label.
  return (
    <div style={{ maxWidth: '100%', width: native ? '100%' : undefined }} className={ready ? 'flex flex-col items-center m-2' : ''}>
      {ready && label && <span className="mb-1 text-[10px] uppercase tracking-widest text-black/35">Advertisement</span>}
      <div style={{ position: 'relative', height: ready ? 'auto' : 0, maxWidth: '100%', width: native ? '100%' : undefined }}>
        <iframe
          title={`Advertisement ${size ?? 'native'}`}
          src={src}
          width={native ? '100%' : b!.w}
          height={native ? nativeH || 280 : b!.h}
          sandbox={SANDBOX}
          scrolling="no"
          style={{
            border: 0,
            display: 'block',
            maxWidth: '100%',
            ...(ready ? {} : { position: 'absolute', left: 0, top: 0, opacity: 0, pointerEvents: 'none' }),
          }}
        />
      </div>
    </div>
  );
}

let adScriptsInjected = false;

function injectPageScripts() {
  if (adScriptsInjected) return;
  adScriptsInjected = true;
  const pop = document.createElement('script');
  pop.async = true;
  pop.setAttribute('data-cfasync', 'false');
  pop.src = POPUNDER_SRC;
  document.head.appendChild(pop);
  const bar = document.createElement('script');
  bar.async = true;
  bar.setAttribute('data-cfasync', 'false');
  bar.src = SOCIAL_BAR_SRC;
  document.body.appendChild(bar);
}

// Rendered by Footer, so the ads sit in the page just above the footer (never below it).
export function AdsBeforeFooter() {
  const isHome = useIsHome();
  const desktop = useMinWidth(768);
  if (isHome) return null;
  return (
    <section aria-label="Advertisements" className="relative z-10 w-full">
      <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col items-center">
        <AdSlot native />
        <div className="flex flex-wrap justify-center items-start">
          <AdSlot size="300x250" />
          {desktop && <AdSlot size="300x250" />}
          {desktop && <AdSlot size="160x300" />}
          {desktop && <AdSlot size="468x60" />}
        </div>
        <AdSlot size={desktop ? '728x90' : '320x50'} />
      </div>
    </section>
  );
}

// Adblock wall. Two signals, either one is enough:
//  1. Adsterra's own ad server cannot be reached (this is what a blocker does to our ads). Four
//     tries ~0.4s apart must all fail, so one network hiccup never shows the wall.
//  2. adblock-detect-react (pinned 1.3.1, MIT, vetted) flags a blocked doubleclick.net request;
//     it decides on one failure, so we confirm it again.
const ADSTERRA_PROBE = `https://bauval.org/22/${BANNER_KEYS['728x90'].key}`;

async function requestBlocked(url: string, tries = 3, gap = 300): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
      return false;
    } catch {
      if (i < tries - 1) await new Promise((r) => setTimeout(r, gap));
    }
  }
  return true;
}

function AdBlockWall() {
  const [blocked, setBlocked] = useState(false);
  const packageSuspects = useDetectAdBlock();

  useEffect(() => {
    let alive = true;
    requestBlocked(ADSTERRA_PROBE, 4, 400).then((b) => alive && b && setBlocked(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!packageSuspects) return;
    let alive = true;
    requestBlocked('https://www3.doubleclick.net').then((b) => alive && b && setBlocked(true));
    return () => {
      alive = false;
    };
  }, [packageSuspects]);

  if (!blocked) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[99999] bg-[#0A0C0B]/95 backdrop-blur-2xl flex items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">Please pause your ad blocker</h2>
          <p className="text-[#55605B] leading-relaxed">
            Every tool and game here is free. A few ads pay for the servers and the time it takes to build them.
            Could you pause your ad blocker for shaaddev.studio and reload? It only takes a few seconds, and we really appreciate it.
          </p>
          <p className="text-sm text-[#55605B]">
            Click the blocker icon in your browser toolbar, choose &ldquo;Pause on this site&rdquo;, then press the button below.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full flex justify-center items-center gap-2 py-4 bg-primary-dark text-white hover:bg-[#048532] rounded-full font-semibold text-sm transition-all"
        >
          <RefreshCcw className="w-5 h-5" /> I&rsquo;ve paused it, reload
        </button>
      </div>
    </div>
  );
}

export default function SiteAds({ children }: { children: ReactNode }) {
  const isHome = useIsHome();
  const desktop = useMinWidth(768);
  const wide = useMinWidth(1700);
  const [anchorClosed, setAnchorClosed] = useState(false);
  const [anchorReady, setAnchorReady] = useState(false);

  useEffect(() => {
    if (isHome) {
      // The pop-under and social bar scripts cannot be unloaded, so coming back to an ad-free
      // page (Home, About, Contact) reloads it clean.
      if (adScriptsInjected) window.location.reload();
      return;
    }
    injectPageScripts();
  }, [isHome]);

  if (isHome) return <>{children}</>;

  return (
    <>
      {/* Top strip: takes no space until an ad is really there. */}
      <div className="w-full flex justify-center bg-white/60">
        <AdSlot size={desktop ? '728x90' : '320x50'} label={false} />
      </div>

      {wide && (
        <>
          <div className="fixed left-3 top-24 z-30">
            <AdSlot size="160x600" label={false} />
          </div>
          <div className="fixed right-3 top-24 z-30">
            <AdSlot size="160x600" label={false} />
          </div>
        </>
      )}

      {children}

      {!desktop && !anchorClosed && (
        <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none">
          <div className={`relative pointer-events-auto bg-white/90 shadow-[0_-2px_10px_rgba(0,0,0,0.12)] ${anchorReady ? '' : 'invisible h-0 overflow-hidden'}`}>
            <AdSlot size="320x50" label={false} onReady={() => setAnchorReady(true)} />
            <button
              aria-label="Close ad"
              onClick={() => setAnchorClosed(true)}
              className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <AdBlockWall />
    </>
  );
}
