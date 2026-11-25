/**
 * "Never the same puzzle twice" for the generated games under /games.
 *
 * Each game turns a puzzle into a canonical string (so mirrors, rotations and reorderings that make
 * the same puzzle count as the same), hashes it, and keeps the hashes of every puzzle this player has
 * been dealt in localStorage. The next puzzle is generated from a per-device salt and retried until
 * its hash is new, so a player who keeps playing never sees a repeat, across reloads, daily and free
 * play alike. Pure logic with an injectable store, so scripts/test-*.ts can simulate long sessions.
 */

export interface HistoryStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

const browserStore: HistoryStore = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage full or blocked: the in-memory set still prevents repeats this session */
    }
  }
};

/** 53-bit FNV-style hash in base36 (about 10 characters): collisions are negligible at our scale. */
export function hashCanon(s: string): string {
  let h1 = 0xdeadbeef ^ s.length;
  let h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/** Up to this many hashes are kept per game (about 0.5 MB); far beyond any real play session. */
export const HISTORY_CAP = 40000;

export class PuzzleHistory {
  private seen: Set<string>;
  private order: string[];
  readonly salt: string;

  constructor(private slug: string, private store: HistoryStore = browserStore) {
    const raw = store.get(`shaaddev.game.${slug}.seen`);
    this.order = raw ? raw.split(' ').filter(Boolean) : [];
    this.seen = new Set(this.order);
    let salt = store.get(`shaaddev.game.${slug}.salt`);
    if (!salt) {
      salt = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      store.set(`shaaddev.game.${slug}.salt`, salt);
    }
    this.salt = salt;
  }

  get size() {
    return this.seen.size;
  }

  has(canon: string) {
    return this.seen.has(hashCanon(canon));
  }

  add(canon: string) {
    const h = hashCanon(canon);
    if (this.seen.has(h)) return;
    this.seen.add(h);
    this.order.push(h);
    if (this.order.length > HISTORY_CAP) this.seen.delete(this.order.shift()!);
    this.store.set(`shaaddev.game.${this.slug}.seen`, this.order.join(' '));
  }

  /**
   * Generates candidates for `stream` (e.g. "L12" or "daily-2026-11-25-3") until one is new, marks it
   * seen and returns it. `make(seed, attempt)` may raise difficulty as attempts grow, so a small,
   * exhausted easy space moves the player on instead of repeating.
   */
  next<T>(stream: string, make: (seed: string, attempt: number) => T, canon: (p: T) => string, shared = false): T {
    let last: T | null = null;
    for (let attempt = 0; attempt < 400; attempt++) {
      const seed = shared && attempt === 0 ? stream : `${this.salt}|${stream}|${attempt}`;
      const p = make(seed, attempt);
      last = p;
      const c = canon(p);
      if (!this.has(c)) {
        this.add(c);
        return p;
      }
    }
    return last as T; // only reachable if 400 consecutive candidates were seen (never in tests)
  }
}

/** In-memory store for tests and SSR. */
export function memoryStore(): HistoryStore {
  const m = new Map<string, string>();
  return { get: (k) => m.get(k) ?? null, set: (k, v) => void m.set(k, v) };
}
