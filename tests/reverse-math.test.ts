// Solver + no-repeat tests for the reverse-math games. Run: npm test
import {
  generateFill, solveFill, canonFill, evaluate,
  generateOps, solveOps, canonOps,
  generateTarget, generateDaily24, solveTarget, canonTarget, combine,
  generateCross, solveCross, crossSolved, canonCross, effectiveLevel
} from '../src/lib/reverseMath';
import { PuzzleHistory, memoryStore } from '../src/lib/puzzleHistory';

let failures = 0;
const fail = (msg: string) => { failures++; console.error('FAIL', msg); };
const N = Number(process.env.LEVELS ?? 3000);

function run<T>(name: string, gen: (s: string, l: number) => T, canon: (p: T) => string, check: (p: T) => boolean) {
  const t0 = Date.now();
  const h = new PuzzleHistory(name, memoryStore());
  const seenCanon = new Set<string>();
  const tiers = new Map<string, number>();
  for (let lvl = 1; lvl <= N; lvl++) {
    const p = h.next(`L${lvl}`, (seed, a) => gen(seed, effectiveLevel(lvl, a, seed)), canon);
    const c = canon(p);
    if (seenCanon.has(c)) fail(`${name}: duplicate at level ${lvl}: ${c}`);
    seenCanon.add(c);
    if (!check(p)) fail(`${name}: level ${lvl} not solvable: ${c}`);
    const tier = (p as { tier: string }).tier;
    tiers.set(tier, (tiers.get(tier) ?? 0) + 1);
  }
  console.log(`${name}: ${N} consecutive levels, ${seenCanon.size} unique, 0 dup check done, tiers ${JSON.stringify(Object.fromEntries(tiers))} in ${Date.now() - t0} ms`);
}

run('fill', generateFill, canonFill, (p) => evaluate(p.solution, p.ops) === p.target && solveFill(p.ops, p.tiles, p.target, 1).length > 0);
run('ops', generateOps, canonOps, (p) => evaluate(p.nums, p.solution) === p.target && solveOps(p.nums, p.target, p.allowed, 1).length > 0);
run('target', generateTarget, canonTarget, (p) => {
  const s = solveTarget(p.nums, p.target);
  if (!s) return false;
  // replay the stored route
  let list = [...p.nums];
  for (const st of p.solution) {
    const i = list.indexOf(st.a); if (i < 0) return false; list.splice(i, 1);
    const j = list.indexOf(st.b); if (j < 0) return false; list.splice(j, 1);
    if (combine(st.a, st.op, st.b) !== st.result) return false; list.push(st.result);
  }
  return list.length === 1 && list[0] === p.target;
});
run('cross', generateCross, canonCross, (p) => {
  const given: Record<string, number> = {};
  for (const k of p.blanks) given[k] = (p.cells[k] as { value: number }).value;
  return crossSolved(p, given) && solveCross(p) !== null && p.tray.length === p.blanks.length && p.cols <= 9 && p.rows <= 9;
});

// Reload: a new PuzzleHistory on the same storage keeps refusing earlier puzzles; daily and levels share it.
{
  const store = memoryStore();
  const all = new Set<string>();
  for (let session = 0; session < 5; session++) {
    const h = new PuzzleHistory('reload', store);
    for (let l = 1; l <= 150; l++) {
      const p = h.next(`L${l}`, (seed, a) => generateFill(seed, effectiveLevel(l, a, seed)), canonFill); // same level numbers every session
      if (all.has(canonFill(p))) fail(`reload duplicate session ${session} level ${l}`);
      all.add(canonFill(p));
    }
    const d = h.next(`daily-2026-11-2${session}`, (seed) => generateFill(seed, 40), canonFill, true);
    if (all.has(canonFill(d))) fail('daily repeated a level puzzle');
    all.add(canonFill(d));
  }
  console.log(`reload: 5 sessions x 150 levels + dailies, ${all.size} unique`);
}

// Exhaustion: 1000 puzzles all requested at level 1 (whose space is ~215) still never repeat;
// the generator moves on in difficulty instead.
{
  const h = new PuzzleHistory('exhaust', memoryStore());
  const seen = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    const p = h.next(`X${i}`, (seed, a) => generateFill(seed, effectiveLevel(1, a, seed)), canonFill);
    if (seen.has(canonFill(p))) fail(`exhaust: repeat at ${i}`);
    seen.add(canonFill(p));
  }
  console.log(`exhaust: 1000 level-1 requests, ${seen.size} unique`);
}

// Canonical forms: reordered terms count as the same Fill puzzle.
{
  const a = { ops: ['*', '+'] as const, target: 14, tiles: [2, 4, 6], solution: [2, 4, 6], tier: '' };
  const b = { ops: ['+', '*'] as const, target: 14, tiles: [2, 4, 6], solution: [6, 2, 4], tier: '' };
  if (canonFill(a as never) !== canonFill(b as never)) fail('canonFill should ignore term order');
}

// Daily 24 across ~3 years of dates is always solvable.
for (let d = 0; d < 1100; d++) {
  const p = generateDaily24(`day${d}`);
  if (!solveTarget(p.nums, 24)) fail(`daily24 day${d}`);
}
console.log('daily24: 1100 days solvable');

// Puzzle space of the easiest tier (how many distinct warm-up puzzles exist), measured by sampling.
function space<T>(name: string, gen: (s: string, l: number) => T, canon: (p: T) => string, level: number, samples = 20000) {
  const s = new Set<string>();
  for (let i = 0; i < samples; i++) s.add(canon(gen(`space${i}`, level)));
  console.log(`space ${name} level ${level}: ${s.size} distinct in ${samples} samples`);
}
space('fill', generateFill, canonFill, 1);
space('ops', generateOps, canonOps, 1);
space('target', generateTarget, canonTarget, 1, 5000);
space('cross', generateCross, canonCross, 1, 5000);

if (failures) { console.error(`${failures} failures`); process.exit(1); }
console.log('reverse-math: all passed');
