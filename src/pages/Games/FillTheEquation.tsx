import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, Undo2 } from 'lucide-react';
import GameShell from '../../components/GameShell';
import { DailyDone, ModeSwitch, SolvedPanel, ToolButton } from '../../components/PuzzleBits';
import { audio } from '../../lib/gameAudio';
import {
  OP_GLYPH,
  canonFill,
  effectiveLevel,
  evaluate,
  generateFill,
  solveFill,
  type FillPuzzle
} from '../../lib/reverseMath';
import type { PuzzleHistory } from '../../lib/puzzleHistory';
import { starsFor, usePuzzleRun } from '../../lib/usePuzzleRun';

const SLUG = 'fill-the-equation';

const makeLevel = (h: PuzzleHistory, level: number) =>
  h.next(`L${level}`, (seed, a) => generateFill(seed, effectiveLevel(level, a, seed)), canonFill);
// The daily is the same for everyone: a Hard-tier puzzle seeded by the date.
const makeDaily = (h: PuzzleHistory, date: string) =>
  h.next(`daily-${date}`, (seed) => generateFill(seed, 40), canonFill, true);

/** slot -> tile index (or null). */
type Placement = (number | null)[];

function Board({
  puzzle,
  onSolved
}: {
  puzzle: FillPuzzle;
  onSolved: (slips: number) => void;
}) {
  const slots = puzzle.ops.length + 1;
  const [place, setPlace] = useState<Placement>(() => Array(slots).fill(null));
  const [past, setPast] = useState<Placement[]>([]);
  const [cursor, setCursor] = useState(0);
  const [locked, setLocked] = useState<boolean[]>(() => Array(slots).fill(false));
  const [slips, setSlips] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [done, setDone] = useState(false);
  const typed = useRef({ text: '', at: 0 });

  const usedTiles = new Set(place.filter((t): t is number => t !== null));
  const values = place.map((t) => (t === null ? null : puzzle.tiles[t]));
  const full = values.every((v) => v !== null);

  const commit = useCallback(
    (next: Placement) => {
      setPast((p) => [...p, place]);
      setPlace(next);
      setWrong(null);
    },
    [place]
  );

  // Check the equation whenever the last blank is filled.
  useEffect(() => {
    if (done || !full) return;
    const result = evaluate(values as number[], puzzle.ops);
    if (result === puzzle.target) {
      setDone(true);
      audio.play('win');
      onSolved(slips);
    } else {
      setWrong(result === null ? 'Division must come out whole. Swap a tile.' : `That makes ${result}, not ${puzzle.target}. Swap a tile.`);
      setSlips((s) => s + 1);
      setShakeKey((k) => k + 1);
      audio.play('crash');
    }
  }, [place]);

  const putTile = (tile: number) => {
    if (done || usedTiles.has(tile)) return;
    let slot = cursor;
    if (place[slot] !== null || locked[slot]) slot = place.findIndex((t, i) => t === null && !locked[i]);
    if (slot < 0) return;
    const next = [...place];
    next[slot] = tile;
    commit(next);
    audio.play('move');
    const after = next.findIndex((t, i) => t === null && !locked[i] && i > slot);
    const any = next.findIndex((t, i) => t === null && !locked[i]);
    setCursor(after >= 0 ? after : any >= 0 ? any : slot);
  };

  const tapSlot = (slot: number) => {
    if (done) return;
    setCursor(slot);
    if (place[slot] !== null && !locked[slot]) {
      const next = [...place];
      next[slot] = null;
      commit(next);
      audio.play('ui');
    }
  };

  const undo = () => {
    if (done || past.length === 0) return;
    const prev = past[past.length - 1];
    // Never undo a hinted (locked) tile.
    const restored = prev.map((t, i) => (locked[i] ? place[i] : t));
    setPast((p) => p.slice(0, -1));
    setPlace(restored);
    setWrong(null);
    audio.play('ui');
  };

  const hint = () => {
    if (done) return;
    const solutions = solveFill(puzzle.ops, puzzle.tiles, puzzle.target, 200);
    // Pick the solution closest to what the player already has, then fix its first differing slot.
    const score = (s: number[]) => s.reduce((n, v, i) => n + (values[i] === v ? 1 : 0), 0);
    const best = solutions.filter((s) => s.every((v, i) => !locked[i] || values[i] === v)).sort((a, b) => score(b) - score(a))[0];
    if (!best) return;
    const slot = best.findIndex((v, i) => values[i] !== v);
    if (slot < 0) return;
    const next: Placement = [...place];
    // Free the tile wherever it sits, then put it in its slot.
    const candidates = puzzle.tiles.map((v, i) => i).filter((i) => puzzle.tiles[i] === best[slot] && !locked[next.indexOf(i)]);
    const tile = candidates.find((i) => !usedTiles.has(i)) ?? candidates[0];
    if (tile === undefined) return;
    const was = next.indexOf(tile);
    if (was >= 0) next[was] = null;
    next[slot] = tile;
    const lock = [...locked];
    lock[slot] = true;
    setLocked(lock);
    setSlips((s) => s + 1);
    commit(next);
    audio.play('bonus');
    const free = next.findIndex((t, i) => t === null && !lock[i]);
    if (free >= 0) setCursor(free);
  };

  // Keyboard: type a tile's number, Backspace to undo, arrows to move, H for a hint.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) {
        const now = Date.now();
        const text = now - typed.current.at < 700 ? typed.current.text + e.key : e.key;
        typed.current = { text, at: now };
        const exact = puzzle.tiles.findIndex((v, i) => String(v) === text && !usedTiles.has(i));
        const longer = puzzle.tiles.some((v, i) => String(v).startsWith(text) && String(v) !== text && !usedTiles.has(i));
        if (exact >= 0 && !longer) {
          putTile(exact);
          typed.current.text = '';
        } else if (exact >= 0) {
          // Wait briefly for a second digit; place the single-digit tile if none comes.
          const snap = text;
          setTimeout(() => {
            if (typed.current.text === snap) {
              typed.current.text = '';
              putTile(exact);
            }
          }, 700);
        }
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        undo();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') setCursor((c) => Math.min(slots - 1, c + 1));
      else if (e.key === 'ArrowLeft') setCursor((c) => Math.max(0, c - 1));
      else if (e.key.toLowerCase() === 'h') hint();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative select-none">
      {/* Target: the answer you start from. */}
      <div className="flex flex-col items-center pt-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B958F]">Make</span>
        <span className="mt-1 font-mono text-5xl sm:text-6xl font-bold tabular-nums text-ink leading-none">{puzzle.target}</span>
      </div>

      {/* The equation: blanks and fixed operators. */}
      <div
        key={shakeKey}
        className={`mt-6 mx-auto max-w-md flex items-center justify-center gap-1 sm:gap-2 ${shakeKey ? 'animate-[shake_380ms_ease-in-out]' : ''}`}
      >
        {Array.from({ length: slots }, (_, i) => {
          const v = values[i];
          const active = !done && cursor === i;
          return (
            <div key={i} className="contents">
              <button
                onClick={() => tapSlot(i)}
                aria-label={v === null ? `Blank ${i + 1}` : `Slot ${i + 1}: ${v}${locked[i] ? ' (hint)' : ''}`}
                className={`flex-1 min-w-0 max-w-[4rem] aspect-[4/5] rounded-xl font-mono text-2xl sm:text-3xl font-bold tabular-nums flex items-center justify-center transition-all
                  ${v === null ? 'border-2 border-dashed bg-[#FAFBFA]' : 'border-2 border-solid'}
                  ${done ? 'border-primary bg-mint text-primary' : locked[i] ? 'border-[#E0A12A] bg-[#FFF6E0] text-[#8A5A00]' : v !== null ? 'border-ink/80 bg-white text-ink' : ''}
                  ${active && v === null ? 'border-primary bg-mint/60' : v === null ? 'border-black/20' : ''}
                  ${active && v !== null && !locked[i] ? 'ring-2 ring-primary/40' : ''}`}
              >
                {v ?? ''}
              </button>
              {i < puzzle.ops.length && (
                <span className="shrink-0 w-4 sm:w-6 text-center font-sans text-xl sm:text-2xl font-bold text-[#8B958F]">{OP_GLYPH[puzzle.ops[i]]}</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 h-5 text-center text-sm font-semibold" aria-live="polite">
        {wrong !== null ? (
          <span className="text-[#B91C1C]">{wrong}</span>
        ) : (
          <span className="text-[#8B958F]">{puzzle.ops.some((o) => o === '*' || o === '/') ? '× and ÷ first, then + and −' : 'Use each tile once'}</span>
        )}
      </p>

      {/* Tile tray: chunky keycaps. */}
      <div className="mt-5 flex flex-wrap justify-center gap-2 sm:gap-3">
        {puzzle.tiles.map((v, i) => {
          const used = usedTiles.has(i);
          return (
            <button
              key={i}
              onClick={() => putTile(i)}
              disabled={used || done}
              aria-label={`Tile ${v}`}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-mono text-2xl font-bold tabular-nums transition-all
                ${used ? 'bg-[#F1F4F2] text-black/20 shadow-none translate-y-[3px]' : 'bg-white text-ink border border-black/15 shadow-[0_3px_0_0_rgba(16,19,18,0.25)] hover:border-primary/50 hover:text-primary active:translate-y-[3px] active:shadow-none'}`}
            >
              {v}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-2">
        <ToolButton onClick={undo} disabled={past.length === 0 || done} label="Undo" kbd="Backspace" icon={<Undo2 className="w-4 h-4" />} />
        <ToolButton onClick={hint} disabled={done} label="Hint" kbd="H" icon={<Lightbulb className="w-4 h-4" />} />
      </div>
    </div>
  );
}

export default function FillTheEquation() {
  const run = usePuzzleRun<FillPuzzle>(SLUG, makeLevel, makeDaily);
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
      title="Fill the Equation"
      tagline="Reverse math: you get the answer and the operators, you find the numbers. Place every tile so the equation hits the target."
      keywords="reverse math game, fill the equation, math puzzle online, number puzzle, find the numbers, brain math game, daily math puzzle"
      sound
      stats={[
        { label: 'Level', value: run.level, accent: true },
        { label: 'Stars', value: run.totalStars },
        { label: 'Streak', value: run.streak }
      ]}
      onRestart={run.restart}
      restartLabel="Clear"
      howTo={[
        'The big number is the answer. Fill the blanks with the number tiles so the equation equals it.',
        'Each tile is used once. At higher levels there are spare tiles that do not belong.',
        'Normal math rules: × and ÷ are worked out before + and −, and division has to come out whole.',
        'Tap a filled blank to take its tile back, or use Undo. A hint places one correct tile.',
        'Solve without hints or wrong tries for three stars. Keyboard: type the number, Backspace to undo, H for a hint.'
      ]}
      about={
        <>
          <p>
            Fill the Equation is a reverse math puzzle: instead of working out an answer, you start from it and
            rebuild the sum. Early levels use three tiles with plus and minus; later levels bring in times and
            divide, four and five blanks, and decoy tiles you have to leave out.
          </p>
          <p>
            Every puzzle is generated in your browser and checked by a solver before you see it, so there is always
            at least one answer, and any arrangement that reaches the target counts. Your device remembers every
            puzzle it has dealt you, so the levels never repeat. The daily puzzle is the same for everyone.
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
          detail={run.mode === 'daily' ? `Streak: ${run.streak} day${run.streak === 1 ? '' : 's'}. Come back tomorrow for a new one.` : 'The next one is a little harder.'}
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
