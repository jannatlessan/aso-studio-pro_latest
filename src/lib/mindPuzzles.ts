/**
 * Generators, solvers and canonical forms for the logic games under /games: Kingdoms (one crown per
 * row, column and region), Pair Paths (connect matching dots and fill the board) and Hidden Pixels
 * (nonogram). Same contract as reverseMath.ts: seeded, built from a real solution, verified by a
 * solver in tests/mind-puzzles.test.ts, and canonical strings for the no-repeat history.
 */
import { pick, randInt, rngFromSeed, shuffled, type Rng } from './reverseMath';

// ---------------------------------------------------------------- symmetry helpers

/** The 8 symmetries of a square grid (4 for rectangles), as index maps old -> new. */
function symmetries(rows: number, cols: number): { rows: number; cols: number; map: (r: number, c: number) => [number, number] }[] {
  const out = [
    { rows, cols, map: (r: number, c: number) => [r, c] as [number, number] },
    { rows, cols, map: (r: number, c: number) => [r, cols - 1 - c] as [number, number] },
    { rows, cols, map: (r: number, c: number) => [rows - 1 - r, c] as [number, number] },
    { rows, cols, map: (r: number, c: number) => [rows - 1 - r, cols - 1 - c] as [number, number] }
  ];
  if (rows === cols) {
    out.push(
      { rows, cols, map: (r, c) => [c, r] },
      { rows, cols, map: (r, c) => [cols - 1 - c, r] },
      { rows, cols, map: (r, c) => [c, rows - 1 - r] },
      { rows, cols, map: (r, c) => [cols - 1 - c, rows - 1 - r] }
    );
  }
  return out;
}

/** Smallest string over all symmetries of a grid of labels, with labels renumbered by first use. */
function canonGrid(rows: number, cols: number, label: (r: number, c: number) => number | string, prefix: string): string {
  let best: string | null = null;
  for (const s of symmetries(rows, cols)) {
    const g: (number | string)[] = new Array(rows * cols);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const [nr, nc] = s.map(r, c);
      g[nr * cols + nc] = label(r, c);
    }
    const rename = new Map<number | string, number>();
    const str = g.map((v) => (v === -1 || v === '.' ? '.' : (rename.has(v) || rename.set(v, rename.size), rename.get(v)!.toString(36)))).join('');
    if (best === null || str < best) best = str;
  }
  return `${prefix}|${rows}x${cols}|${best}`;
}

// ---------------------------------------------------------------- Kingdoms (queens-style regions)

export interface KingdomsPuzzle {
  n: number;
  /** Region id per cell, row-major. */
  regions: number[];
  /** The unique solution: crown column for each row. */
  solution: number[];
  tier: string;
}

export function kingdomsTier(level: number) {
  if (level <= 5) return { name: 'Warm-up', n: 5 };
  if (level <= 15) return { name: 'Easy', n: 6 };
  if (level <= 35) return { name: 'Medium', n: 7 };
  if (level <= 60) return { name: 'Hard', n: 8 };
  return { name: 'Expert', n: 9 };
}

/** Counts solutions (up to `limit`); returns them as column-per-row arrays. */
export function solveKingdoms(n: number, regions: readonly number[], limit = 2): number[][] {
  const found: number[][] = [];
  const cols = new Array(n).fill(false);
  const regs = new Array(n).fill(false);
  const place: number[] = [];
  const walk = (r: number) => {
    if (found.length >= limit) return;
    if (r === n) {
      found.push([...place]);
      return;
    }
    for (let c = 0; c < n; c++) {
      const reg = regions[r * n + c];
      if (cols[c] || regs[reg]) continue;
      if (r > 0 && Math.abs(place[r - 1] - c) <= 1) continue;
      cols[c] = regs[reg] = true;
      place.push(c);
      walk(r + 1);
      place.pop();
      cols[c] = regs[reg] = false;
    }
  };
  walk(0);
  return found;
}

function randomCrowns(rng: Rng, n: number): number[] | null {
  const place: number[] = [];
  const used = new Array(n).fill(false);
  const walk = (r: number): boolean => {
    if (r === n) return true;
    for (const c of shuffled(rng, [...Array(n).keys()])) {
      if (used[c] || (r > 0 && Math.abs(place[r - 1] - c) <= 1)) continue;
      used[c] = true;
      place.push(c);
      if (walk(r + 1)) return true;
      place.pop();
      used[c] = false;
    }
    return false;
  };
  return walk(0) ? place : null;
}

function regionConnected(regions: readonly number[], n: number, reg: number): boolean {
  const cells = regions.map((v, i) => (v === reg ? i : -1)).filter((i) => i >= 0);
  if (cells.length === 0) return false;
  const seen = new Set([cells[0]]);
  const stack = [cells[0]];
  while (stack.length) {
    const i = stack.pop()!;
    const r = Math.floor(i / n), c = i % n;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc;
      const j = rr * n + cc;
      if (rr < 0 || cc < 0 || rr >= n || cc >= n || seen.has(j) || regions[j] !== reg) continue;
      seen.add(j);
      stack.push(j);
    }
  }
  return seen.size === cells.length;
}

export function generateKingdoms(seed: string, level: number): KingdomsPuzzle {
  const tier = kingdomsTier(level);
  const n = tier.n;
  const rng = rngFromSeed(`kingdoms|${seed}`);
  for (;;) {
    const crowns = randomCrowns(rng, n)!;
    // Several region layouts per crown set before drawing new crowns.
    for (let tryRegions = 0; tryRegions < 20; tryRegions++) {
      const regions = new Array(n * n).fill(-1);
      crowns.forEach((c, r) => (regions[r * n + c] = r));
      // Grow regions from their crowns at uneven speeds, so some are big and some are thin.
      const weight = crowns.map(() => 0.3 + rng() * 1.7);
      let left = n * n - n;
      while (left > 0) {
        const frontier: [number, number][] = [];
        for (let i = 0; i < n * n; i++) {
          if (regions[i] !== -1) continue;
          const r = Math.floor(i / n), c = i % n;
          for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const rr = r + dr, cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
            const reg = regions[rr * n + cc];
            if (reg !== -1) frontier.push([i, reg]);
          }
        }
        let total = 0;
        for (const [, reg] of frontier) total += weight[reg];
        let x = rng() * total;
        let chosen = frontier[0];
        for (const f of frontier) {
          x -= weight[f[1]];
          if (x <= 0) { chosen = f; break; }
        }
        regions[chosen[0]] = chosen[1];
        left--;
      }
      // Repair: while a second solution exists, move one of its crown cells into a neighbouring
      // region (keeping every region connected), which breaks that solution but not ours.
      for (let repair = 0; repair < 40; repair++) {
        const sols = solveKingdoms(n, regions, 2);
        if (sols.length === 1) return { n, regions, solution: sols[0], tier: tier.name };
        const alt = sols.find((s) => s.some((c, r) => c !== crowns[r]))!;
        const cells = shuffled(rng, alt.map((c, r) => r * n + c).filter((i) => crowns[Math.floor(i / n)] !== i % n));
        let moved = false;
        for (const i of cells) {
          const r = Math.floor(i / n), c = i % n;
          const from = regions[i];
          const targets = shuffled(rng, [[1, 0], [-1, 0], [0, 1], [0, -1]])
            .map(([dr, dc]) => [r + dr, c + dc])
            .filter(([rr, cc]) => rr >= 0 && cc >= 0 && rr < n && cc < n)
            .map(([rr, cc]) => regions[rr * n + cc])
            .filter((reg) => reg !== from);
          if (!targets.length) continue;
          regions[i] = targets[0];
          if (regionConnected(regions, n, from)) { moved = true; break; }
          regions[i] = from;
        }
        if (!moved) break;
      }
    }
  }
}

export const canonKingdoms = (p: KingdomsPuzzle) => canonGrid(p.n, p.n, (r, c) => p.regions[r * p.n + c], 'K');

// ---------------------------------------------------------------- Pair Paths (connect the dots, fill the board)

export interface PathsPuzzle {
  rows: number;
  cols: number;
  /** For each colour, its two end cells (index r*cols+c). */
  ends: [number, number][];
  /** A full solution: for each colour, the cells of its path from end 0 to end 1. */
  solution: number[][];
  tier: string;
}

export function pathsTier(level: number) {
  if (level <= 5) return { name: 'Warm-up', size: 5, pairs: [4, 5] };
  if (level <= 15) return { name: 'Easy', size: 6, pairs: [5, 6] };
  if (level <= 35) return { name: 'Medium', size: 7, pairs: [6, 8] };
  if (level <= 60) return { name: 'Hard', size: 8, pairs: [7, 9] };
  return { name: 'Expert', size: 9, pairs: [8, 10] };
}

/** Random Hamiltonian path on the grid: start from a serpentine and apply many "backbite" moves. */
function hamiltonianPath(rng: Rng, rows: number, cols: number): number[] {
  let path: number[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) path.push(r * cols + (r % 2 ? cols - 1 - c : c));
  const neighbours = (i: number) => {
    const r = Math.floor(i / cols), c = i % cols;
    const out: number[] = [];
    if (r > 0) out.push(i - cols);
    if (r < rows - 1) out.push(i + cols);
    if (c > 0) out.push(i - 1);
    if (c < cols - 1) out.push(i + 1);
    return out;
  };
  const steps = rows * cols * 30;
  for (let s = 0; s < steps; s++) {
    if (rng() < 0.5) path.reverse();
    const end = path[path.length - 1];
    const nb = pick(rng, neighbours(end));
    const j = path.indexOf(nb);
    if (j === path.length - 2) continue;
    // Connect end to nb and reverse the tail after nb.
    path = [...path.slice(0, j + 1), ...path.slice(j + 1).reverse()];
  }
  return path;
}

const adjacent = (a: number, b: number, cols: number) => {
  const ar = Math.floor(a / cols), ac = a % cols, br = Math.floor(b / cols), bc = b % cols;
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
};

export function generatePaths(seed: string, level: number): PathsPuzzle {
  const tier = pathsTier(level);
  const rows = tier.size, cols = tier.size;
  const rng = rngFromSeed(`paths|${seed}`);
  for (;;) {
    const path = hamiltonianPath(rng, rows, cols);
    const k = randInt(rng, tier.pairs[0], tier.pairs[1]);
    // Cut the path into k segments of length >= 3.
    const total = rows * cols;
    const cuts = new Set<number>();
    let guard = 0;
    while (cuts.size < k - 1 && guard++ < 1000) cuts.add(randInt(rng, 3, total - 3));
    const sorted = [0, ...[...cuts].sort((a, b) => a - b), total];
    const segs: number[][] = [];
    let ok = true;
    for (let i = 0; i < sorted.length - 1; i++) {
      const seg = path.slice(sorted[i], sorted[i + 1]);
      if (seg.length < 3) { ok = false; break; }
      // A pair whose two dots touch is no puzzle at all.
      if (adjacent(seg[0], seg[seg.length - 1], cols)) { ok = false; break; }
      segs.push(seg);
    }
    if (!ok || segs.length !== k) continue;
    // A segment that touches itself (two non-consecutive cells adjacent) has an obvious shortcut,
    // which can leave cells nobody needs; allow it only rarely to keep boards honest.
    const loose = segs.filter((seg) => seg.some((a, i) => seg.some((b, j) => j > i + 1 && adjacent(a, b, cols)))).length;
    if (loose > Math.ceil(k / 2)) continue;
    return { rows, cols, ends: segs.map((s) => [s[0], s[s.length - 1]]), solution: segs, tier: tier.name };
  }
}

/** Checks a set of player paths: every pair joined end to end, paths connected, board full. */
export function pathsSolved(p: PathsPuzzle, paths: readonly (readonly number[])[]): boolean {
  const seen = new Set<number>();
  for (let i = 0; i < p.ends.length; i++) {
    const path = paths[i] ?? [];
    if (path.length < 2) return false;
    const [a, b] = p.ends[i];
    const okEnds = (path[0] === a && path[path.length - 1] === b) || (path[0] === b && path[path.length - 1] === a);
    if (!okEnds) return false;
    for (let j = 0; j < path.length; j++) {
      if (seen.has(path[j])) return false;
      seen.add(path[j]);
      if (j > 0 && !adjacent(path[j - 1], path[j], p.cols)) return false;
    }
  }
  return seen.size === p.rows * p.cols;
}

export function canonPaths(p: PathsPuzzle): string {
  const owner = new Array(p.rows * p.cols).fill(-1);
  p.ends.forEach(([a, b], i) => (owner[a] = owner[b] = i));
  return canonGrid(p.rows, p.cols, (r, c) => owner[r * p.cols + c], 'P');
}

// ---------------------------------------------------------------- Hidden Pixels (nonogram)

export interface PixelsPuzzle {
  rows: number;
  cols: number;
  /** Solution, row-major, 1 = filled. */
  cells: number[];
  rowClues: number[][];
  colClues: number[][];
  tier: string;
}

export function pixelsTier(level: number) {
  if (level <= 6) return { name: 'Warm-up', rows: 5, cols: 5, density: 0.58 };
  if (level <= 18) return { name: 'Easy', rows: 7, cols: 7, density: 0.56 };
  if (level <= 40) return { name: 'Medium', rows: 8, cols: 8, density: 0.55 };
  if (level <= 70) return { name: 'Hard', rows: 10, cols: 8, density: 0.53 };
  return { name: 'Expert', rows: 10, cols: 10, density: 0.52 };
}

export function cluesOf(line: readonly number[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (const v of line) {
    if (v) run++;
    else if (run) { out.push(run); run = 0; }
  }
  if (run) out.push(run);
  return out.length ? out : [0];
}

/** All placements of `clue` in a line of length `len` that agree with `known` (-1 unknown, 0, 1). */
function linePlacements(clue: readonly number[], len: number, known: readonly number[]): number[][] {
  const blocks = clue[0] === 0 ? [] : clue;
  const out: number[][] = [];
  const line = new Array(len).fill(0);
  const fits = (from: number, to: number, v: number) => {
    for (let i = from; i < to; i++) if (known[i] !== -1 && known[i] !== v) return false;
    return true;
  };
  const walk = (bi: number, pos: number) => {
    if (out.length > 5000) return;
    if (bi === blocks.length) {
      if (fits(pos, len, 0)) out.push([...line]);
      return;
    }
    const rest = blocks.slice(bi + 1).reduce((s, b) => s + b + 1, 0);
    for (let start = pos; start + blocks[bi] + rest <= len; start++) {
      if (!fits(pos, start, 0)) break;
      if (!fits(start, start + blocks[bi], 1)) continue;
      const end = start + blocks[bi];
      if (end < len && known[end] === 1) continue;
      for (let i = start; i < end; i++) line[i] = 1;
      walk(bi + 1, end + 1 > len ? len : end + 1);
      for (let i = start; i < end; i++) line[i] = 0;
    }
  };
  walk(0, 0);
  return out;
}

/** Line-by-line logic solver. Returns the grid if logic alone fills it (unique, no guessing), else null. */
export function solvePixels(rows: number, cols: number, rowClues: number[][], colClues: number[][]): number[] | null {
  const g = new Array(rows * cols).fill(-1);
  let changed = true;
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      const lines = pass === 0 ? rows : cols;
      const len = pass === 0 ? cols : rows;
      for (let l = 0; l < lines; l++) {
        const idx = (i: number) => (pass === 0 ? l * cols + i : i * cols + l);
        const known = Array.from({ length: len }, (_, i) => g[idx(i)]);
        if (!known.includes(-1)) continue;
        const ps = linePlacements(pass === 0 ? rowClues[l] : colClues[l], len, known);
        if (ps.length === 0) return null;
        for (let i = 0; i < len; i++) {
          if (known[i] !== -1) continue;
          const v = ps[0][i];
          if (ps.every((p) => p[i] === v)) {
            g[idx(i)] = v;
            changed = true;
          }
        }
      }
    }
  }
  return g.includes(-1) ? null : g;
}

export function generatePixels(seed: string, level: number): PixelsPuzzle {
  const tier = pixelsTier(level);
  const { rows, cols } = tier;
  const rng = rngFromSeed(`pixels|${seed}`);
  for (;;) {
    let cells = Array.from({ length: rows * cols }, () => (rng() < tier.density ? 1 : 0));
    // One smoothing pass so the result reads as a shape, not static.
    cells = cells.map((v, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      let on = 0, tot = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
        tot++;
        on += cells[rr * cols + cc];
      }
      const share = on / tot;
      return share > 0.6 ? 1 : share < 0.3 ? 0 : v;
    });
    const filled = cells.reduce((s, v) => s + v, 0);
    if (filled < rows * cols * 0.35 || filled > rows * cols * 0.75) continue;
    const rowClues = Array.from({ length: rows }, (_, r) => cluesOf(cells.slice(r * cols, r * cols + cols)));
    const colClues = Array.from({ length: cols }, (_, c) => cluesOf(Array.from({ length: rows }, (_, r) => cells[r * cols + c])));
    // Empty rows or columns make dull boards.
    if (rowClues.some((x) => x[0] === 0) || colClues.some((x) => x[0] === 0)) continue;
    const solved = solvePixels(rows, cols, rowClues, colClues);
    if (!solved || solved.some((v, i) => v !== cells[i])) continue;
    return { rows, cols, cells, rowClues, colClues, tier: tier.name };
  }
}

export const canonPixels = (p: PixelsPuzzle) => canonGrid(p.rows, p.cols, (r, c) => (p.cells[r * p.cols + c] ? 'x' : '.'), 'N');
