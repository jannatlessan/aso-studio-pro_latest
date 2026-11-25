import type { ReactNode } from 'react';
import { CalendarDays, Check, Layers3, Star } from 'lucide-react';
import type { RunMode } from '../lib/usePuzzleRun';

/** Levels / Daily switch shown above the board of the generated puzzle games. */
export function ModeSwitch({
  mode,
  onMode,
  level,
  tier,
  dailyDone
}: {
  mode: RunMode;
  onMode: (m: RunMode) => void;
  level: number;
  tier: string;
  dailyDone: boolean;
}) {
  const tab = (m: RunMode, children: ReactNode) => (
    <button
      onClick={() => mode !== m && onMode(m)}
      aria-pressed={mode === m}
      className={`flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg text-xs font-semibold transition-colors ${
        mode === m ? 'bg-white text-ink shadow-sm shadow-black/10' : 'text-[#55605B] hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex flex-1 min-w-[220px] p-1 rounded-xl bg-[#F1F4F2] border border-black/[0.06]">
        {tab(
          'levels',
          <>
            <Layers3 className="w-3.5 h-3.5" /> Level {level}
          </>
        )}
        {tab(
          'daily',
          <>
            <CalendarDays className="w-3.5 h-3.5" /> Daily
            {dailyDone && <Check className="w-3.5 h-3.5 text-primary" aria-label="done" />}
          </>
        )}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8B958F]">
        {mode === 'daily' ? 'Same for everyone today' : tier}
      </span>
    </div>
  );
}

export function Stars({ n, size = 'w-5 h-5' }: { n: number; size?: string }) {
  return (
    <span className="inline-flex gap-1" aria-label={`${n} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <Star key={i} className={`${size} ${i < n ? 'fill-[#F2B43A] text-[#E0A12A]' : 'text-black/15'}`} />
      ))}
    </span>
  );
}

/** Small secondary control under the board (undo, hint, clear). */
export function ToolButton({
  onClick,
  disabled,
  label,
  icon,
  kbd
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  icon: ReactNode;
  kbd?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={kbd ? `${label} (${kbd})` : label}
      className="inline-flex items-center justify-center gap-1.5 h-11 px-3.5 rounded-xl border border-black/10 bg-white text-sm font-semibold text-[#55605B] hover:border-primary/40 hover:text-primary active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/** Win panel for the puzzle games: stars, a line of detail, and the next step. */
export function SolvedPanel({
  show,
  title,
  stars,
  detail,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary
}: {
  show: boolean;
  title: string;
  stars?: number;
  detail: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-white/85 backdrop-blur-sm rounded-xl animate-[fadeIn_160ms_ease-out]">
      <div role="dialog" aria-label={title} className="w-full max-w-xs text-center space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-xl shadow-black/10">
        {stars !== undefined && <Stars n={stars} size="w-7 h-7" />}
        <h3 className="text-xl font-bold tracking-tight text-primary">{title}</h3>
        <div className="text-sm text-[#55605B] leading-relaxed">{detail}</div>
        <button
          autoFocus
          onClick={onPrimary}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:scale-[0.98] transition-all"
        >
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary && (
          <button onClick={onSecondary} className="w-full text-sm font-semibold text-[#55605B] hover:text-primary">
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/** Shown in Daily mode once today's puzzle is solved. */
export function DailyDone({ streak, onLevels }: { streak: number; onLevels: () => void }) {
  return (
    <div className="py-10 text-center space-y-3">
      <p className="text-lg font-bold text-primary">Today's puzzle is done</p>
      <p className="text-sm text-[#55605B]">
        Streak: {streak} day{streak === 1 ? '' : 's'}. A new daily puzzle arrives at midnight.
      </p>
      <button
        onClick={onLevels}
        className="mt-2 inline-flex items-center justify-center h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark"
      >
        Play levels
      </button>
    </div>
  );
}
