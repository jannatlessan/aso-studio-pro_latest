import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCcw, ShieldAlert, X } from 'lucide-react';
import { useDetectAdBlock } from 'adblock-detect-react';

// Adsterra ad units for shaaddev.studio (website 6224645). Home page ("/") never shows ads.
const BANNER_KEYS: Record<string, { key: string; w: number; h: number }> = {
  '728x90': { key: '79dd6d77d4efd8dbb9da2b23626ba070', w: 728, h: 90 },
  '468x60': { key: 'dc4af9b2741a7e6c115deb48fa47c706', w: 468, h: 60 },
  '320x50': { key: '0a339c502d4fcb1b67575e097cfacab7', w: 320, h: 50 },
  '300x250': { key: 'd3302ed5d8fc9e7d0fabd6b7989d0068', w: 300, h: 250 },
  '160x300': { key: 'e3b4ede3f5fd1cd5cc92cf90c04e12ae', w: 160, h: 300 },
  '160x600': { key: '31a2bc5fb10b0c8ef7e26b2015efde22', w: 160, h: 600 },
};
const BANNER_HOST = 'https://bauval.org/22/';
const NATIVE_KEY = '422cf36ab897c1ddcd8115be19bea05b';
const POPUNDER_SRC = 'https://abscloud.org/1/2afbe426408f1bbe880221935a5545a4';
const SOCIAL_BAR_SRC = 'https://bauval.org/14/07b9fff71f0bb4fac2dfae0b3cbcf9c1';

// Each ad lives in its own sandboxed iframe: its script cannot read the page or navigate the
// page away (no allow-top-navigation), and several ads can share one page.
const SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox';

function bannerDoc(size: string) {
  const b = BANNER_KEYS[size];
  return `<!doctype html><html><body style="margin:0;overflow:hidden;background:transparent"><script>atOptions={'key':'${b.key}','format':'iframe','height':${b.h},'width':${b.w},'params':{}};</script><script data-cfasync="false" src="${BANNER_HOST}${b.key}"></script></body></html>`;
}

const nativeDoc = `<!doctype html><html><body style="margin:0;background:transparent"><script async fetchpriority="high" data-cfasync="false" src="https://bauval.org/21/${NATIVE_KEY}"></script><div id="container-${NATIVE_KEY}"></div></body></html>`;

function Banner({ size }: { size: keyof typeof BANNER_KEYS }) {
  const b = BANNER_KEYS[size];
  return (
    <iframe
      title={`Advertisement ${size}`}
      srcDoc={bannerDoc(size)}
      width={b.w}
      height={b.h}
      sandbox={SANDBOX}
      scrolling="no"
      loading="lazy"
      style={{ border: 0, maxWidth: '100%' }}
    />
  );
}

function Native() {
  return (
    <iframe
      title="Advertisement"
      srcDoc={nativeDoc}
      sandbox={SANDBOX}
      scrolling="no"
      loading="lazy"
      style={{ border: 0, width: '100%', height: 280 }}
    />
  );
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

// Reused: a request to an ad server that is rejected 3 times in a row (blockers reject at once,
// so one network hiccup alone never counts).
async function adRequestBlocked(url: string, tries = 3): Promise<boolean> {
  for (let i = 0; i < tries; i++) {
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
      return false;
    } catch {
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 300));
    }
  }
  return true;
}

function AdBlockWall() {
  const [blocked, setBlocked] = useState(false);
  // adblock-detect-react (pinned 1.3.1, MIT, vetted): flags a blocked doubleclick.net request.
  // It decides on a single failure, so we only trust it after confirming it again below.
  // The wall is based ONLY on this signal: some browsers/extensions still block Adsterra's domains
  // while the blocker is paused for the site, and the visitor cannot fix that, so it must not trigger it.
  const packageSuspects = useDetectAdBlock();

  useEffect(() => {
    if (!packageSuspects) return;
    let alive = true;
    adRequestBlocked('https://www3.doubleclick.net').then((b) => alive && b && setBlocked(true));
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
  const { pathname } = useLocation();
  const isHome = pathname === '/' || pathname === '';
  const desktop = useMinWidth(768);
  const wide = useMinWidth(1700);
  const [anchorClosed, setAnchorClosed] = useState(false);

  useEffect(() => {
    if (isHome) {
      // The pop-under and social bar scripts cannot be unloaded, so coming back to Home
      // reloads it clean and ad-free.
      if (adScriptsInjected) window.location.reload();
      return;
    }
    injectPageScripts();
  }, [isHome]);

  if (isHome) return <>{children}</>;

  return (
    <>
      <div className="w-full flex justify-center py-2 bg-white/60">
        {desktop ? <Banner size="728x90" /> : <Banner size="320x50" />}
      </div>

      {wide && (
        <>
          <div className="fixed left-3 top-24 z-30">
            <Banner size="160x600" />
          </div>
          <div className="fixed right-3 top-24 z-30">
            <Banner size="160x600" />
          </div>
        </>
      )}

      {children}

      <section aria-label="Advertisements" className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
        <Native />
        <div className="flex flex-wrap justify-center gap-4">
          {desktop && <Banner size="468x60" />}
          <Banner size="300x250" />
          {desktop && <Banner size="300x250" />}
          {desktop && <Banner size="160x300" />}
        </div>
        <div className="flex justify-center">
          <Banner size={desktop ? '728x90' : '320x50'} />
        </div>
      </section>

      {!desktop && !anchorClosed && (
        <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center bg-white/90 shadow-[0_-2px_10px_rgba(0,0,0,0.12)]">
          <div className="relative">
            <Banner size="320x50" />
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
