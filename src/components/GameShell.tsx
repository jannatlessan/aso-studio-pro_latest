import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy, Volume2, VolumeX } from 'lucide-react';
import { audio } from '../lib/gameAudio';
import SEO from './SEO';
import Footer from './Footer';
import RelatedGames from './RelatedGames';

export interface GameStat {
  label: string;
  value: React.ReactNode;
  /** Renders in brand green — use for the live score so the eye lands on it first. */
  accent?: boolean;
}

interface GameShellProps {
  /** Slug only, e.g. "snake" — the shell builds the /games/<slug> URL from it. */
  slug: string;
  title: string;
  tagline: string;
  keywords?: string;
  stats?: GameStat[];
  onRestart: () => void;
  restartLabel?: string;
  /** Short ordered steps shown under the board. */
  howTo: string[];
  /** Optional longer prose for SEO, rendered after "How to play". */
  about?: React.ReactNode;
  /** Extra controls rendered next to the restart button (pause, mode toggles). */
  actions?: React.ReactNode;
  /** Shows the sound toggle. Opt-in: only the games that actually play sound pass this. */
  sound?: boolean;
  children: React.ReactNode;
}

/**
 * Shared chrome for every game under /games/<slug>: SEO tags, back navigation, the score HUD,
 * the restart control, the board frame, and the how-to-play/related sections. Individual games
 * only own what happens inside `children`, which keeps the whole section visually identical.
 */
export default function GameShell({
  slug,
  title,
  tagline,
  keywords,
  stats = [],
  onRestart,
  restartLabel = 'Restart',
  howTo,
  about,
  actions,
  sound = false,
  children
}: GameShellProps) {
  const url = `https://shaaddev.studio/games/${slug}`;
  const [muted, setMuted] = useState(audio.muted);

  // The mute preference is global and persisted, so mirror changes made on any other game page.
  useEffect(() => audio.subscribe(setMuted), []);

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20">
      <SEO
        title={`${title} — Free Online Game | ShaadDev Studio`}
        description={tagline}
        url={url}
        keywords={keywords ?? `${title.toLowerCase()}, free online game, browser game, play ${title.toLowerCase()} online`}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-sm text-[#55605B] hover:text-primary transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          All games
        </Link>

        <header className="mt-6 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-[#55605B] leading-relaxed">{tagline}</p>
        </header>

        {/* Score HUD + restart. Scrolls horizontally rather than wrapping on narrow phones. */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto pb-1 -mb-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="shrink-0 px-3.5 py-2 rounded-xl border border-black/10 bg-[#F6F8F7] text-center min-w-[72px]"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B958F]">{stat.label}</div>
                <div
                  className={`text-lg font-bold tabular-nums leading-tight ${
                    stat.accent ? 'text-primary' : 'text-ink'
                  }`}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          {actions}
          {sound && (
            <button
              onClick={() => {
                audio.setMuted(!muted);
                if (muted) audio.play('ui');
              }}
              aria-label={muted ? 'Unmute sound' : 'Mute sound'}
              title={muted ? 'Unmute' : 'Mute'}
              className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] hover:text-primary hover:border-primary/30 active:scale-95 transition-all"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onRestart}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark active:scale-95 transition-all shadow-sm shadow-primary/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{restartLabel}</span>
          </button>
        </div>

        {/* Board. `touch-none` stops the browser scrolling/zooming mid-swipe on mobile. */}
        <div className="mt-4 rounded-2xl border border-black/10 bg-white shadow-sm shadow-black/[0.03] p-3 sm:p-5">
          {children}
        </div>

        <section className="mt-8 rounded-2xl border border-black/10 bg-[#F6F8F7] p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink mb-3">How to play</h2>
          <ol className="space-y-2 text-sm text-[#55605B] leading-relaxed">
            {howTo.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-mint border border-primary/20 text-primary text-[11px] font-bold inline-flex items-center justify-center">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {about && <div className="mt-5 pt-5 border-t border-black/10 text-sm text-[#55605B] leading-relaxed space-y-3">{about}</div>}
        </section>

        <RelatedGames currentPath={`/games/${slug}`} />
      </div>

      <Footer />
    </div>
  );
}

interface GameOverlayProps {
  show: boolean;
  tone?: 'win' | 'lose' | 'neutral';
  title: string;
  subtitle?: React.ReactNode;
  actionLabel?: string;
  onAction: () => void;
  /** Shown when the finished round beat the stored best. */
  isRecord?: boolean;
}

/**
 * Game-over / win panel. Absolutely positioned, so the element wrapping the board must be
 * `relative`.
 */
export function GameOverlay({
  show,
  tone = 'neutral',
  title,
  subtitle,
  actionLabel = 'Play again',
  onAction,
  isRecord = false
}: GameOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-white/85 backdrop-blur-sm rounded-xl animate-[fadeIn_160ms_ease-out]">
      <div className="w-full max-w-xs text-center space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-xl shadow-black/10">
        {isRecord && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint border border-primary/25 text-[11px] font-bold text-primary">
            <Trophy className="w-3 h-3" /> New best
          </div>
        )}
        <h3
          className={`text-xl font-bold tracking-tight ${
            tone === 'win' ? 'text-primary' : tone === 'lose' ? 'text-ink' : 'text-ink'
          }`}
        >
          {title}
        </h3>
        {subtitle && <p className="text-sm text-[#55605B] leading-relaxed">{subtitle}</p>}
        <button
          onClick={onAction}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-4 h-4" /> {actionLabel}
        </button>
      </div>
    </div>
  );
}
