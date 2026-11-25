import { useCallback, useMemo, useState } from 'react';
import { readGameState, writeGameState } from '../hooks/useBestScore';
import { PuzzleHistory } from './puzzleHistory';
import { localDateKey, previousDateKey } from './reverseMath';

export type RunMode = 'levels' | 'daily';

interface Saved<P> {
  level: number;
  levelPuzzle: P | null;
  stars: Record<string, number>;
  daily: { date: string; puzzle: P | null; done: boolean };
  streak: number;
  lastDaily: string | null;
  solved: number;
}

/**
 * Progress for the endless generated puzzle games: the current level (kept across reloads, so a
 * half-played puzzle comes back exactly as it was dealt), stars per level, the daily puzzle and its
 * streak. New puzzles come from PuzzleHistory, so a player never gets the same puzzle twice.
 */
export function usePuzzleRun<P>(
  slug: string,
  makeLevel: (h: PuzzleHistory, level: number) => P,
  makeDaily: (h: PuzzleHistory, date: string) => P
) {
  const history = useMemo(() => new PuzzleHistory(slug), [slug]);
  const today = localDateKey();

  const [saved, setSaved] = useState<Saved<P>>(() => {
    const fallback: Saved<P> = {
      level: 1,
      levelPuzzle: null,
      stars: {},
      daily: { date: '', puzzle: null, done: false },
      streak: 0,
      lastDaily: null,
      solved: 0
    };
    const s = readGameState<Saved<P>>(slug, fallback);
    // Tolerate an old or corrupt save: fall back field by field.
    const level = Number.isInteger(s.level) && s.level > 0 ? s.level : 1;
    const next: Saved<P> = {
      ...fallback,
      ...s,
      level,
      stars: s.stars && typeof s.stars === 'object' ? s.stars : {},
      daily: s.daily && typeof s.daily === 'object' ? s.daily : fallback.daily
    };
    let changed = false;
    if (!next.levelPuzzle) {
      next.levelPuzzle = makeLevel(history, level);
      changed = true;
    }
    if (next.daily.date !== today || !next.daily.puzzle) {
      next.daily = { date: today, puzzle: makeDaily(history, today), done: false };
      changed = true;
    }
    if (changed) writeGameState(slug, next);
    return next;
  });

  const [mode, setMode] = useState<RunMode>('levels');
  const [round, setRound] = useState(0); // bumps to remount the board on restart

  const save = useCallback(
    (fn: (s: Saved<P>) => Saved<P>) =>
      setSaved((s) => {
        const n = fn(s);
        writeGameState(slug, n);
        return n;
      }),
    [slug]
  );

  /** Record a solve. Returns nothing; the caller shows its own win panel. */
  const complete = useCallback(
    (stars: number) =>
      save((s) => {
        if (mode === 'daily') {
          if (s.daily.done) return s;
          const streak = s.lastDaily === previousDateKey(today) ? s.streak + 1 : s.lastDaily === today ? s.streak : 1;
          return { ...s, daily: { ...s.daily, done: true }, streak, lastDaily: today, solved: s.solved + 1 };
        }
        const prev = s.stars[s.level] ?? 0;
        return { ...s, stars: { ...s.stars, [s.level]: Math.max(prev, stars) }, solved: s.solved + 1 };
      }),
    [save, mode, today]
  );

  /** Deal the next level (levels mode) and switch to it. */
  const nextLevel = useCallback(() => {
    // Generate outside the state updater (StrictMode runs updaters twice; history must advance once).
    const level = saved.level + 1;
    const levelPuzzle = makeLevel(history, level);
    save((s) => ({ ...s, level, levelPuzzle }));
    setMode('levels');
    setRound((r) => r + 1);
  }, [save, makeLevel, history, saved.level]);

  const restart = useCallback(() => setRound((r) => r + 1), []);

  const streakAlive = saved.lastDaily === today || saved.lastDaily === previousDateKey(today);
  const puzzle = (mode === 'daily' ? saved.daily.puzzle : saved.levelPuzzle) as P;

  return {
    mode,
    setMode: (m: RunMode) => {
      setMode(m);
      setRound((r) => r + 1);
    },
    level: saved.level,
    puzzle,
    boardKey: `${mode}-${mode === 'daily' ? saved.daily.date : saved.level}-${round}`,
    complete,
    nextLevel,
    restart,
    dailyDone: saved.daily.done,
    streak: streakAlive ? saved.streak : 0,
    totalStars: Object.values(saved.stars).reduce((a, b) => a + b, 0),
    solved: saved.solved
  };
}

/** 3 stars clean, 2 with one slip (hint or mistake), 1 otherwise. */
export const starsFor = (slips: number) => (slips === 0 ? 3 : slips === 1 ? 2 : 1);
