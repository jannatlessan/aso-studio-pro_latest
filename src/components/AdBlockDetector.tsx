import { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

export default function AdBlockDetector() {
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    // Give it a tiny delay to allow extensions to parse the DOM
    const timer = setTimeout(async () => {
      let adBlockDetected = false;

      // Check 1: Most ad blockers block requests to standard known ad servers.
      try {
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
      } catch (error) {
        adBlockDetected = true;
      }

      // Check 2: DOM Injection
      // Ad blockers actively hunt down elements with these standard class names and set them to `display: none`
      if (!adBlockDetected) {
        const ad = document.createElement('div');
        ad.className = 'ad-banner adsbox doubleclick spinner-wrapper';
        ad.style.display = 'block';
        ad.style.position = 'absolute';
        ad.style.left = '-9999px';
        document.body.appendChild(ad);

        await new Promise(resolve => setTimeout(resolve, 50));

        const computedStyle = window.getComputedStyle(ad);
        if (ad.offsetHeight === 0 || ad.offsetParent === null || computedStyle.display === 'none') {
          adBlockDetected = true;
        }

        ad.remove();
      }

      if (adBlockDetected) {
        // Disabled for now:
        // setIsBlocking(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isBlocking) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#020202]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 font-sans selection:bg-purple-500/30">
      <div className="max-w-lg w-full bg-[#050505] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-700 delay-150 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Ad Blocker Detected</h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed font-medium">
            We rely on optional ads to keep this powerful Pro Tool <strong className="text-white">100% free</strong> and running privately.
            Please disable your ad blocker or pause it on this site to continue.
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full flex justify-center items-center gap-2 py-5 bg-gradient-to-r from-white to-white/90 text-black hover:scale-[1.02] transform rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        >
          <RefreshCcw className="w-5 h-5" /> I've Disabled It — Reload
        </button>
      </div>

      <p className="mt-8 text-white/30 text-xs font-mono uppercase tracking-widest max-w-sm text-center">
        Your privacy remains fully intact. We never track or sell your data.
      </p>
    </div>
  );
}
