import { useCallback, useEffect, useRef, useState } from 'react';

type Mode = 'max' | 'min';

const storageKey = (slug: string) => `shaaddev.game.${slug}.best`;

/**
 * Persisted best score for a game, keyed by its slug in localStorage.
 *
 * `mode: 'min'` is for games where lower is better (reaction time, move counts); in that mode a
 * best of `null` means "no record yet", so the first result always wins.
 *
 * The current best is held in a ref as well as in state: `submit` has to decide whether a value is
 * a record and write it synchronously, and a state updater would not have run yet at that point.
 * Reads and writes are guarded because localStorage throws in some privacy modes.
 */
export function useBestScore(slug: string, mode: Mode = 'max') {
  const [best, setBest] = useState<number | null>(null);
  const bestRef = useRef<number | null>(null);

  useEffect(() => {
    bestRef.current = null;
    setBest(null);
    try {
      const raw = localStorage.getItem(storageKey(slug));
      if (raw !== null) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
          bestRef.current = parsed;
          setBest(parsed);
        }
      }
    } catch {
      /* storage unavailable — play without a saved record */
    }
  }, [slug]);

  /** Records `value` if it beats the stored best. Returns true when a new record was set. */
  const submit = useCallback(
    (value: number) => {
      if (!Number.isFinite(value)) return false;
      const current = bestRef.current;
      const isRecord = current === null || (mode === 'max' ? value > current : value < current);
      if (!isRecord) return false;

      bestRef.current = value;
      setBest(value);
      try {
        localStorage.setItem(storageKey(slug), String(value));
      } catch {
        /* ignore — the in-memory best still works for this session */
      }
      return true;
    },
    [slug, mode]
  );

  const clearBest = useCallback(() => {
    bestRef.current = null;
    setBest(null);
    try {
      localStorage.removeItem(storageKey(slug));
    } catch {
      /* ignore */
    }
  }, [slug]);

  return { best, submit, clearBest };
}

/** Any JSON-serialisable value persisted under the same game namespace. */
export function readGameState<T>(slug: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`shaaddev.game.${slug}.state`);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeGameState(slug: string, value: unknown) {
  try {
    localStorage.setItem(`shaaddev.game.${slug}.state`, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
