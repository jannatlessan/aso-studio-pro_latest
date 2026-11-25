// Solver + no-repeat tests for Kingdoms, Pair Paths and Hidden Pixels. Run: npm test
import {
  generateKingdoms, solveKingdoms, canonKingdoms,
  generatePaths, pathsSolved, canonPaths,
  generatePixels, solvePixels, canonPixels, cluesOf
} from '../src/lib/mindPuzzles';
import { effectiveLevel } from '../src/lib/reverseMath';
import { PuzzleHistory, memoryStore } from '../src/lib/puzzleHistory';

let failures = 0;
const fail = (msg: string) => { failures++; console.error('FAIL', msg); };
const N = Number(process.env.LEVELS ?? 3000);

function run<T>(name: string, gen: (s: string, l: number) => T, canon: (p: T) => string, check: (p: T) => boolean) {
  const t0 = Date.now();
  const h = new PuzzleHistory(name, memoryStore());
  const seen = new Set<string>();
  const tiers = new Map<string, number>();
  for (let lvl = 1; lvl <= N; lvl++) {
    const p = h.next(`L${lvl}`, (seed, a) => gen(seed, effectiveLevel(lvl, a, seed)), canon);
    const c = canon(p);
    if (seen.has(c)) fail(`${name}: duplicate at level ${lvl}`);
    seen.add(c);
    if (!check(p)) fail(`${name}: level ${lvl} failed its solver check`);
    const t = (p as { tier: string }).tier;
    tiers.set(t, (tiers.get(t) ?? 0) + 1);
  }
  console.log(`${name}: ${N} consecutive levels, ${seen.size} unique, tiers ${JSON.stringify(Object.fromEntries(tiers))} in ${Date.now() - t0} ms`);
}

run('kingdoms', generateKingdoms, canonKingdoms, (p) => {
  const sols = solveKingdoms(p.n, p.regions, 3);
  return sols.length === 1 && sols[0].join() === p.solution.join() && new Set(p.regions).size === p.n;
});
run('paths', generatePaths, canonPaths, (p) => pathsSolved(p, p.solution));
run('pixels', generatePixels, canonPixels, (p) => {
  const g = solvePixels(p.rows, p.cols, p.rowClues, p.colClues);
  const rowsOk = p.rowClues.every((cl, r) => cluesOf(p.cells.slice(r * p.cols, r * p.cols + p.cols)).join() === cl.join());
  return !!g && g.every((v, i) => v === p.cells[i]) && rowsOk;
});

// Symmetry: a mirrored Kingdoms board is the same puzzle.
{
  const p = generateKingdoms('sym', 20);
  const mirrored = { ...p, regions: p.regions.map((_, i) => p.regions[Math.floor(i / p.n) * p.n + (p.n - 1 - (i % p.n))]) };
  if (canonKingdoms(p) !== canonKingdoms(mirrored)) fail('canonKingdoms should ignore mirroring');
}

function space<T>(name: string, gen: (s: string, l: number) => T, canon: (p: T) => string, level: number, samples: number) {
  const s = new Set<string>();
  for (let i = 0; i < samples; i++) s.add(canon(gen(`space${i}`, level)));
  console.log(`space ${name} level ${level}: ${s.size} distinct in ${samples} samples`);
}
space('kingdoms', generateKingdoms, canonKingdoms, 1, 5000);
space('paths', generatePaths, canonPaths, 1, 5000);
space('pixels', generatePixels, canonPixels, 1, 5000);

if (failures) { console.error(`${failures} failures`); process.exit(1); }
console.log('mind-puzzles: all passed');
