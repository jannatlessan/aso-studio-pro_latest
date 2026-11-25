import { useCallback, useEffect, useState } from 'react';
import { Lightbulb, Undo2 } from 'lucide-react';
import GameShell from '../../components/GameShell';
import { DailyDone, ModeSwitch, SolvedPanel, ToolButton } from '../../components/PuzzleBits';
import { audio } from '../../lib/gameAudio';
import {
  OP_GLYPH,
  canonOps,
  effectiveLevel,
  evaluate,
  generateOps,
  solveOps,
  type Op,
  type OpsPuzzle
} from '../../lib/reverseMath';
import type { PuzzleHistory } from '../../lib/puzzleHistory';
import { starsFor, usePuzzleRun } from '../../lib/usePuzzleRun';

const SLUG = 'missing-signs';

const makeLevel = (h: PuzzleHistory, level: number) =>
  h.next(`L${level}`, (seed, a) => generateOps(seed, effectiveLevel(level, a, seed)), canonOps);
const makeDaily = (h: PuzzleHistory, date: string) =>
  h.next(`daily-${date}`, (seed) => generateOps(seed, 50), canonOps, true);

const KEY_TO_OP: Record<string, Op> = { '+': '+', '-': '-', '*': '*', x: '*', X: '*', '/': '/' };

function Board({ puzzle, onSolved }: { puzzle: OpsPuzzle; onSolved: (slips: number) => void }) {
  const n = puzzle.nums.length - 1;
  const [ops, setOps] = useState<(Op | null)[]>(() => Array(n).fill(null));
  const [past, setPast] = useState<(Op | null)[][]>([]);
  const [cursor, setCursor] = useState(0);
  const [locked, setLocked] = useState<boolean[]>(() => Array(n).fill(false));
  const [slips, setSlips] = useState(0);
  const [shake, setShake] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const full = ops.every((o) => o !== null);
  const value = full ? evaluate(puzzle.nums, ops as Op[]) : undefined;

  useEffect(() => {
    if (done || !full) return;
    if (value === puzzle.target) {
      setDone(true);
      audio.play('win');
      onSolved(slips);
    } else {
      setSlips((s) => s + 1);
      setShake((k) => k + 1);
      setMsg(value === null ? 'A division does not come out whole.' : `That makes ${value}. Change a sign.`);
      audio.play('crash');
    }
  }, [ops]); // eslint-disable-line react-hooks/exhaustive-deps

  const setAt = (slot: number, op: Op | null) => {
    if (done || locked[slot] || ops[slot] === op) return;
    setPast((p) => [...p, ops]);
    const next = [...ops];
    next[slot] = op;
    setOps(next);
    setMsg(null);
    audio.play(op ? 'move' : 'ui');
  };

  /** Tap a sign: fill it with the first allowed op, then cycle. */
  const cycle = (slot: number) => {
    setCursor(slot);
    const cur = ops[slot];
    const order = puzzle.allowed;
    setAt(slot, cur === null ? order[0] : order[(order.indexOf(cur) + 1) % order.length]);
  };

  const choose = (op: Op) => {
    let slot = cursor;
    if (locked[slot]) slot = ops.findIndex((o, i) => o === null && !locked[i]);
    if (slot < 0) return;
    setAt(slot, op);
    const nextFree = ops.findIndex((o, i) => o === null && !locked[i] && i > slot);
    if (nextFree >= 0) setCursor(nextFree);
    else if (slot < n - 1) setCursor(slot + 1);
  };

  const undo = () => {
    if (done || past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setOps(prev.map((o, i) => (locked[i] ? ops[i] : o)));
    setMsg(null);
    audio.play('ui');
  };

  const hint = () => {
    if (done) return;
    const sols = solveOps(puzzle.nums, puzzle.target, puzzle.allowed, 50).filter((s) => s.every((o, i) => !locked[i] || ops[i] === o));
    const score = (s: Op[]) => s.reduce((k, o, i) => k + (ops[i] === o ? 1 : 0), 0);
    const best = sols.sort((a, b) => score(b) - score(a))[0];
    if (!best) return;
    const slot = best.findIndex((o, i) => ops[i] !== o);
    if (slot < 0) return;
    setPast((p) => [...p, ops]);
    const next = [...ops];
    next[slot] = best[slot];
    const lock = [...locked];
    lock[slot] = true;
    setLocked(lock);
    setOps(next);
    setSlips((s) => s + 1);
    setMsg(null);
    audio.play('bonus');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const op = KEY_TO_OP[e.key];
      if (op && puzzle.allowed.includes(op)) {
        choose(op);
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        undo();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') setCursor((c) => Math.min(n - 1, c + 1));
      else if (e.key === 'ArrowLeft') setCursor((c) => Math.max(0, c - 1));
      else if (e.key.toLowerCase() === 'h') hint();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative select-none">
      <div key={shake} className={`mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-3 ${shake ? 'animate-[shake_380ms_ease-in-out]' : ''}`}>
        {puzzle.nums.map((num, i) => (
          <div key={i} className="contents">
            <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-ink px-0.5">{num}</span>
            {i < n && (
              <button
                onClick={() => cycle(i)}
                aria-label={`Sign ${i + 1}: ${ops[i] ? OP_GLYPH[ops[i]!] : 'empty'}`}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full font-sans text-2xl font-bold flex items-center justify-center transition-all active:scale-90
                  ${done ? 'bg-primary text-white' : locked[i] ? 'bg-[#FFF6E0] border-2 border-[#E0A12A] text-[#8A5A00]' : ops[i] ? 'bg-ink text-white' : 'border-2 border-dashed border-black/25 bg-[#FAFBFA] text-transparent'}
                  ${!done && cursor === i ? 'ring-4 ring-primary/30' : ''}`}
              >
                {ops[i] ? OP_GLYPH[ops[i]!] : '?'}
              </button>
            )}
          </div>
        ))}
        <span className="font-mono text-3xl sm:text-4xl font-bold text-[#8B958F] px-1">=</span>
        <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-primary">{puzzle.target}</span>
      </div>

      <p className="mt-4 h-5 text-center text-sm font-semibold" aria-live="polite">
        {msg ? <span className="text-[#B91C1C]">{msg}</span> : <span className="text-[#8B958F]">Tap a circle to cycle its sign. × and ÷ go first.</span>}
      </p>

      <div className="mt-5 flex justify-center gap-2 sm:gap-3">
        {puzzle.allowed.map((op) => (
          <button
            key={op}
            onClick={() => choose(op)}
            disabled={done}
            aria-label={`Put ${OP_GLYPH[op]}`}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-black/15 font-sans text-3xl font-bold text-ink shadow-[0_3px_0_0_rgba(16,19,18,0.25)] hover:text-primary hover:border-primary/50 active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-40"
          >
            {OP_GLYPH[op]}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <ToolButton onClick={undo} disabled={past.length === 0 || done} label="Undo" kbd="Backspace" icon={<Undo2 className="w-4 h-4" />} />
        <ToolButton onClick={hint} disabled={done} label="Hint" kbd="H" icon={<Lightbulb className="w-4 h-4" />} />
      </div>
    </div>
  );
}

export default function MissingSigns() {
  const run = usePuzzleRun<OpsPuzzle>(SLUG, makeLevel, makeDaily);
  const [result, setResult] = useState<{ stars: number } | null>(null);
  const [boardKey, setBoardKey] = useState(run.boardKey);
  if (boardKey !== run.boardKey) {
    setBoardKey(run.boardKey);
    setResult(null);
  }
  const onSolved = useCallback(
    (slips: number) => {
      const stars = starsFor(slips);
      run.complete(stars);
      setResult({ stars });
    },
    [run]
  );

  return (
    <GameShell
      slug={SLUG}
      title="Missing Signs"
      tagline="The numbers and the answer are there; the plus, minus, times and divide signs are gone. Put them back so the sum is true."
      keywords="missing operators puzzle, reverse math, math signs game, fill in the operators, arithmetic puzzle online, brain math game"
      sound
      stats={[
        { label: 'Level', value: run.level, accent: true },
        { label: 'Stars', value: run.totalStars },
        { label: 'Streak', value: run.streak }
      ]}
      onRestart={run.restart}
      restartLabel="Clear"
      howTo={[
        'Each circle between two numbers is a missing sign. Tap it to cycle through +, −, × and ÷, or pick a circle and tap a sign below.',
        'When every circle is filled, the sum is checked: × and ÷ are worked out before + and −, left to right.',
        'Division has to come out whole. Any set of signs that makes the answer counts.',
        'Hints lock one correct sign. Three stars for a clean solve. Keyboard: + − * (or x) /, arrows, Backspace, H.'
      ]}
      about={
        <>
          <p>
            Missing Signs is the reverse of a calculator: the result is known and you work back to the operations that
            produce it. The early levels use three numbers and no division; later ones string five and six numbers
            together, where getting the order of operations right is the whole puzzle.
          </p>
          <p>
            Puzzles are generated in your browser and only kept when a solver confirms they have one or two answers, so
            there is real thinking to do and never a dead end. Your device remembers the puzzles it has dealt, so levels
            never repeat.
          </p>
        </>
      }
    >
      <div className="relative">
        <ModeSwitch mode={run.mode} onMode={run.setMode} level={run.level} tier={run.puzzle.tier} dailyDone={run.dailyDone} />
        <div className="mt-4">
          {run.mode === 'daily' && run.dailyDone && !result ? (
            <DailyDone streak={run.streak} onLevels={() => run.setMode('levels')} />
          ) : (
            <Board key={run.boardKey} puzzle={run.puzzle} onSolved={onSolved} />
          )}
        </div>
        <SolvedPanel
          show={!!result}
          title={run.mode === 'daily' ? 'Daily solved' : `Level ${run.level} solved`}
          stars={result?.stars}
          detail={run.mode === 'daily' ? `Streak: ${run.streak} day${run.streak === 1 ? '' : 's'}.` : 'Ready for the next one?'}
          primaryLabel={run.mode === 'daily' ? 'Play levels' : 'Next level'}
          onPrimary={() => {
            setResult(null);
            if (run.mode === 'daily') run.setMode('levels');
            else run.nextLevel();
          }}
        />
      </div>
    </GameShell>
  );
}
