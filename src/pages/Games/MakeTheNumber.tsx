import { useCallback, useEffect, useState } from 'react';
import { Lightbulb, Undo2 } from 'lucide-react';
import GameShell from '../../components/GameShell';
import { DailyDone, ModeSwitch, SolvedPanel, ToolButton } from '../../components/PuzzleBits';
import { audio } from '../../lib/gameAudio';
import {
  OPS,
  OP_GLYPH,
  canonTarget,
  combine,
  effectiveLevel,
  generateDaily24,
  generateTarget,
  solveTarget,
  type Op,
  type Step,
  type TargetPuzzle
} from '../../lib/reverseMath';
import type { PuzzleHistory } from '../../lib/puzzleHistory';
import { starsFor, usePuzzleRun } from '../../lib/usePuzzleRun';

const SLUG = 'make-the-number';

const makeLevel = (h: PuzzleHistory, level: number) =>
  h.next(`L${level}`, (seed, a) => generateTarget(seed, effectiveLevel(level, a, seed)), canonTarget);
// Daily: four numbers that make 24, the same for everyone on a given date.
const makeDaily = (h: PuzzleHistory, date: string) => h.next(`daily-${date}`, (seed) => generateDaily24(seed), canonTarget, true);

interface Card {
  id: number;
  value: number;
  /** Made by combining two cards (shown with a different face). */
  made: boolean;
}

interface Snapshot {
  cards: Card[];
  steps: Step[];
}

const KEY_TO_OP: Record<string, Op> = { '+': '+', '-': '-', '*': '*', x: '*', X: '*', '/': '/' };

function Board({ puzzle, onSolved }: { puzzle: TargetPuzzle; onSolved: (slips: number) => void }) {
  const [cards, setCards] = useState<Card[]>(() => puzzle.nums.map((value, id) => ({ id, value, made: false })));
  const [steps, setSteps] = useState<Step[]>([]);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [first, setFirst] = useState<number | null>(null); // card id
  const [op, setOp] = useState<Op | null>(null);
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);
  const [slips, setSlips] = useState(0);
  const [nextId, setNextId] = useState(puzzle.nums.length);
  const [pulse, setPulse] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);

  const apply = (aId: number, o: Op, bId: number, extraSlips = 0) => {
    const a = cards.find((c) => c.id === aId)!;
    const b = cards.find((c) => c.id === bId)!;
    const r = combine(a.value, o, b.value);
    if (r === null) {
      setMsg({ text: o === '-' ? 'Results cannot go below zero.' : 'That division is not whole.', bad: true });
      setShake((k) => k + 1);
      audio.play('crash');
      setOp(null);
      return;
    }
    const made: Card = { id: nextId, value: r, made: true };
    const next = cards.filter((c) => c.id !== aId && c.id !== bId);
    const at = cards.findIndex((c) => c.id === bId) - (cards.findIndex((c) => c.id === aId) < cards.findIndex((c) => c.id === bId) ? 1 : 0);
    next.splice(Math.max(0, Math.min(at, next.length)), 0, made);
    setPast((p) => [...p, { cards, steps }]);
    setCards(next);
    setSteps((s) => [...s, { a: a.value, op: o, b: b.value, result: r }]);
    setNextId((i) => i + 1);
    setFirst(next.length > 1 ? made.id : null);
    setOp(null);
    setPulse(made.id);
    if (next.length === 1) {
      if (r === puzzle.target) {
        setDone(true);
        setMsg(null);
        audio.play('win');
        onSolved(slips + extraSlips);
      } else {
        setMsg({ text: `You ended on ${r}. Undo a step and try another route.`, bad: true });
        setSlips((s) => s + 1);
        audio.play('gameover');
      }
    } else {
      setMsg(null);
      audio.play('merge');
    }
  };

  const tapCard = (id: number) => {
    if (done) return;
    if (first === null || first === id) {
      setFirst(first === id ? null : id);
      setOp(null);
      audio.play('ui');
      return;
    }
    if (op) apply(first, op, id);
    else {
      setFirst(id);
      audio.play('ui');
    }
  };

  const tapOp = (o: Op) => {
    if (done || first === null) {
      if (!done) setMsg({ text: 'Pick a number first, then a sign, then another number.' });
      return;
    }
    setOp(op === o ? null : o);
    audio.play('move');
  };

  const undo = () => {
    if (done || past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setCards(prev.cards);
    setSteps(prev.steps);
    setFirst(null);
    setOp(null);
    setMsg(null);
    audio.play('ui');
  };

  const hint = () => {
    if (done) return;
    const route = solveTarget(cards.map((c) => c.value), puzzle.target);
    if (!route) {
      setMsg({ text: 'There is no way to the target from here. Undo a step.', bad: true });
      return;
    }
    const s = route[0];
    const aCard = cards.find((c) => c.value === s.a)!;
    const bCard = cards.find((c) => c.value === s.b && c.id !== aCard.id)!;
    setSlips((n) => n + 1);
    audio.play('bonus');
    apply(aCard.id, s.op, bCard.id, 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const o = KEY_TO_OP[e.key];
      if (o) {
        tapOp(o);
        e.preventDefault();
      } else if (/^[1-9]$/.test(e.key) && Number(e.key) <= cards.length) {
        tapCard(cards[Number(e.key) - 1].id);
      } else if (e.key === 'Backspace') {
        undo();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setFirst(null);
        setOp(null);
      } else if (e.key.toLowerCase() === 'h') hint();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative select-none">
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B958F]">Target</span>
        <div className={`mt-1 inline-flex items-center justify-center min-w-[6rem] px-5 h-16 rounded-2xl font-mono text-4xl font-bold tabular-nums ${done ? 'bg-primary text-white' : 'bg-ink text-white'}`}>
          {puzzle.target}
        </div>
      </div>

      {/* Number cards. Combined cards get the green face so you can see your progress. */}
      <div key={shake} className={`mt-7 flex flex-wrap justify-center gap-2.5 sm:gap-3 min-h-[5rem] ${shake ? 'animate-[shake_380ms_ease-in-out]' : ''}`}>
        {cards.map((c, i) => {
          const sel = first === c.id;
          return (
            <button
              key={c.id}
              onClick={() => tapCard(c.id)}
              aria-label={`Number ${c.value}${sel ? ', selected' : ''}`}
              aria-pressed={sel}
              className={`relative w-[4.25rem] h-[4.25rem] sm:w-20 sm:h-20 rounded-full font-mono font-bold tabular-nums flex items-center justify-center transition-all
                ${c.value > 999 ? 'text-lg' : c.value > 99 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}
                ${sel ? 'bg-primary text-white -translate-y-1 shadow-lg shadow-primary/30' : c.made ? 'bg-mint text-primary border-2 border-primary/40' : 'bg-white text-ink border-2 border-ink/80'}
                ${pulse === c.id ? 'animate-[popUp_260ms_ease-out]' : ''}`}
            >
              {c.value}
              <span className="absolute -bottom-1 right-0 text-[10px] font-sans font-semibold text-[#8B958F] hidden sm:block">{i + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-2 sm:gap-3">
        {OPS.map((o) => (
          <button
            key={o}
            onClick={() => tapOp(o)}
            disabled={done}
            aria-pressed={op === o}
            aria-label={`Sign ${OP_GLYPH[o]}`}
            className={`w-14 h-14 rounded-2xl font-sans text-3xl font-bold transition-all disabled:opacity-40
              ${op === o ? 'bg-ink text-white translate-y-[3px]' : 'bg-white text-ink border border-black/15 shadow-[0_3px_0_0_rgba(16,19,18,0.25)] hover:text-primary hover:border-primary/50 active:translate-y-[3px] active:shadow-none'}`}
          >
            {OP_GLYPH[o]}
          </button>
        ))}
      </div>

      <p className="mt-4 min-h-5 text-center text-sm font-semibold" aria-live="polite">
        {msg ? (
          <span className={msg.bad ? 'text-[#B91C1C]' : 'text-[#55605B]'}>{msg.text}</span>
        ) : (
          <span className="text-[#8B958F]">{first === null ? 'Use every number once.' : op ? 'Now tap the second number.' : 'Now pick a sign.'}</span>
        )}
      </p>

      {/* Working: every step you took, like a till receipt. */}
      <div className="mt-4 mx-auto max-w-[15rem] min-h-[2.5rem] rounded-xl border border-dashed border-black/15 px-4 py-2 font-mono text-sm text-[#55605B] tabular-nums">
        {steps.length === 0 ? (
          <span className="block text-center text-[#B0B8B3]">your working</span>
        ) : (
          steps.map((s, i) => (
            <div key={i} className="flex justify-between">
              <span>
                {s.a} {OP_GLYPH[s.op]} {s.b}
              </span>
              <span className={i === steps.length - 1 && s.result === puzzle.target && cards.length === 1 ? 'text-primary font-bold' : 'text-ink'}>= {s.result}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex justify-center gap-2">
        <ToolButton onClick={undo} disabled={past.length === 0 || done} label="Undo" kbd="Backspace" icon={<Undo2 className="w-4 h-4" />} />
        <ToolButton onClick={hint} disabled={done} label="Hint" kbd="H" icon={<Lightbulb className="w-4 h-4" />} />
      </div>
    </div>
  );
}

export default function MakeTheNumber() {
  const run = usePuzzleRun<TargetPuzzle>(SLUG, makeLevel, makeDaily);
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
      title="Make the Number"
      tagline="Combine the numbers two at a time with +, −, × and ÷ until only the target is left. Every number must be used once."
      keywords="make 24 game online, reach the target number, number puzzle, math card game, reverse math puzzle, daily math game"
      sound
      stats={[
        { label: 'Level', value: run.level, accent: true },
        { label: 'Stars', value: run.totalStars },
        { label: 'Streak', value: run.streak }
      ]}
      onRestart={run.restart}
      restartLabel="Reset"
      howTo={[
        'Tap a number, tap a sign, then tap a second number. The two are replaced by the result.',
        'Keep combining until one number is left. If it is the target, you win.',
        'Results must be whole numbers and never below zero. Every starting number has to be used.',
        'Undo steps back one move; a hint plays the next step of a route that works.',
        'The daily puzzle is the classic: four numbers, make 24. Keyboard: 1-6 pick a number, + − * /, Backspace, H.'
      ]}
      about={
        <>
          <p>
            Make the Number is the old card-table game of reaching a total from a handful of numbers, played backwards
            from the answer. Levels start with three small numbers and grow to five and six numbers with targets in the
            hundreds, where you have to plan two or three steps ahead.
          </p>
          <p>
            Each target is picked from the totals the numbers can really make, and a solver checks the route before the
            puzzle is shown. Your device remembers every set it has dealt, so you never get the same numbers and target
            twice.
          </p>
        </>
      }
    >
      <div className="relative">
        <ModeSwitch mode={run.mode} onMode={run.setMode} level={run.level} tier={run.mode === 'daily' ? 'Daily 24' : run.puzzle.tier} dailyDone={run.dailyDone} />
        <div className="mt-5">
          {run.mode === 'daily' && run.dailyDone && !result ? (
            <DailyDone streak={run.streak} onLevels={() => run.setMode('levels')} />
          ) : (
            <Board key={run.boardKey} puzzle={run.puzzle} onSolved={onSolved} />
          )}
        </div>
        <SolvedPanel
          show={!!result}
          title={run.mode === 'daily' ? 'Made 24' : `Level ${run.level} solved`}
          stars={result?.stars}
          detail={run.mode === 'daily' ? `Streak: ${run.streak} day${run.streak === 1 ? '' : 's'}.` : 'Next target is waiting.'}
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
