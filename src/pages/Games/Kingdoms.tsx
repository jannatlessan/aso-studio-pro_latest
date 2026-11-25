import { useCallback, useEffect, useRef, useState } from 'react';
import { Crown, Lightbulb, Undo2 } from 'lucide-react';
import GameShell from '../../components/GameShell';
import { DailyDone, ModeSwitch, SolvedPanel, ToolButton } from '../../components/PuzzleBits';
import { audio } from '../../lib/gameAudio';
import { canonKingdoms, generateKingdoms, type KingdomsPuzzle } from '../../lib/mindPuzzles';
import { effectiveLevel } from '../../lib/reverseMath';
import type { PuzzleHistory } from '../../lib/puzzleHistory';
import { starsFor, usePuzzleRun } from '../../lib/usePuzzleRun';

const SLUG = 'kingdoms';

const makeLevel = (h: PuzzleHistory, level: number) =>
  h.next(`L${level}`, (seed, a) => generateKingdoms(seed, effectiveLevel(level, a, seed)), canonKingdoms);
const makeDaily = (h: PuzzleHistory, date: string) =>
  h.next(`daily-${date}`, (seed) => generateKingdoms(seed, 30), canonKingdoms, true);

// Map-like land colours: distinct in hue and lightness so neighbouring kingdoms never blur together.
const LAND = ['#F4C9A8', '#BFDDB0', '#B9D4EE', '#EDD98C', '#D9C2EC', '#F2B8C0', '#A9DDD3', '#E3CDB4', '#C9CED6'];

type Mark = 0 | 1 | 2; // empty, cross, crown

function conflicts(n: number, regions: number[], marks: Mark[]) {
  const bad = new Set<number>();
  const crowns = marks.map((m, i) => (m === 2 ? i : -1)).filter((i) => i >= 0);
  for (let a = 0; a < crowns.length; a++)
    for (let b = a + 1; b < crowns.length; b++) {
      const i = crowns[a], j = crowns[b];
      const ri = Math.floor(i / n), ci = i % n, rj = Math.floor(j / n), cj = j % n;
      if (ri === rj || ci === cj || regions[i] === regions[j] || (Math.abs(ri - rj) <= 1 && Math.abs(ci - cj) <= 1)) {
        bad.add(i);
        bad.add(j);
      }
    }
  return bad;
}

function Board({ puzzle, onSolved }: { puzzle: KingdomsPuzzle; onSolved: (slips: number) => void }) {
  const { n, regions } = puzzle;
  const [marks, setMarks] = useState<Mark[]>(() => Array(n * n).fill(0));
  const [past, setPast] = useState<Mark[][]>([]);
  const [cursor, setCursor] = useState(0);
  const [slips, setSlips] = useState(0);
  const [done, setDone] = useState(false);
  const drag = useRef<{ start: number; moved: boolean; snapshot: Mark[] } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const bad = conflicts(n, regions, marks);
  const crownCount = marks.filter((m) => m === 2).length;

  useEffect(() => {
    if (done) return;
    if (crownCount === n && bad.size === 0) {
      setDone(true);
      audio.play('win');
      onSolved(slips);
    }
  }, [marks]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (next: Mark[], from = marks) => {
    setPast((p) => [...p, from]);
    setMarks(next);
  };

  const setCell = (i: number, m: Mark) => {
    if (done || marks[i] === m) return;
    const next = [...marks];
    next[i] = m;
    commit(next);
    audio.play(m === 2 ? (conflicts(n, regions, next).has(i) ? 'crash' : 'merge') : 'ui');
  };
  const cycle = (i: number) => setCell(i, ((marks[i] + 1) % 3) as Mark);

  const cellAt = (x: number, y: number) => {
    const el = gridRef.current;
    if (!el) return -1;
    const rect = el.getBoundingClientRect();
    const c = Math.floor(((x - rect.left) / rect.width) * n);
    const r = Math.floor(((y - rect.top) / rect.height) * n);
    return r < 0 || c < 0 || r >= n || c >= n ? -1 : r * n + c;
  };

  // Tap cycles a square; dragging across empty squares crosses them all out.
  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i < 0) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    drag.current = { start: i, moved: false, snapshot: marks };
    setCursor(i);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || done) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i < 0 || (i === d.start && !d.moved)) return;
    setMarks((cur) => {
      const next = [...cur];
      if (!d.moved && next[d.start] === 0) next[d.start] = 1;
      if (next[i] === 0) next[i] = 1;
      return next;
    });
    d.moved = true;
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      setPast((p) => [...p, d.snapshot]);
      audio.play('move');
    } else cycle(d.start);
  };

  const undo = () => {
    if (done || !past.length) return;
    setMarks(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    audio.play('ui');
  };

  const hint = () => {
    if (done) return;
    const next = [...marks];
    const wrong = marks.findIndex((m, i) => m === 2 && puzzle.solution[Math.floor(i / n)] !== i % n);
    if (wrong >= 0) next[wrong] = 1;
    else {
      // Put a correct crown in the row that has the fewest open squares (the most "forced" one).
      const rows = [...Array(n).keys()].filter((r) => marks[r * n + puzzle.solution[r]] !== 2);
      if (!rows.length) return;
      const open = (r: number) => marks.slice(r * n, r * n + n).filter((m) => m === 0).length;
      const r = rows.sort((a, b) => open(a) - open(b))[0];
      next[r * n + puzzle.solution[r]] = 2;
      setCursor(r * n + puzzle.solution[r]);
    }
    setSlips((s) => s + 1);
    commit(next);
    audio.play('bonus');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const r = Math.floor(cursor / n), c = cursor % n;
      const k = e.key;
      if (k === 'ArrowUp' && r > 0) setCursor(cursor - n);
      else if (k === 'ArrowDown' && r < n - 1) setCursor(cursor + n);
      else if (k === 'ArrowLeft' && c > 0) setCursor(cursor - 1);
      else if (k === 'ArrowRight' && c < n - 1) setCursor(cursor + 1);
      else if (k === ' ' || k === 'Enter') cycle(cursor);
      else if (k.toLowerCase() === 'x') setCell(cursor, marks[cursor] === 1 ? 0 : 1);
      else if (k.toLowerCase() === 'c') setCell(cursor, marks[cursor] === 2 ? 0 : 2);
      else if (k === 'Backspace') undo();
      else if (k.toLowerCase() === 'h') hint();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative select-none">
      <div
        ref={gridRef}
        role="grid"
        aria-label={`Kingdoms board, ${n} by ${n}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
        className="mx-auto grid touch-none rounded-lg overflow-hidden border-[3px] border-ink"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, maxWidth: `${n * 3.4}rem` }}
      >
        {marks.map((m, i) => {
          const r = Math.floor(i / n), c = i % n;
          const reg = regions[i];
          const edge = (rr: number, cc: number) => rr < 0 || cc < 0 || rr >= n || cc >= n || regions[rr * n + cc] !== reg;
          const isBad = bad.has(i);
          return (
            <button
              key={i}
              tabIndex={-1}
              aria-label={`Row ${r + 1}, column ${c + 1}: ${m === 2 ? 'crown' : m === 1 ? 'crossed' : 'empty'}`}
              className="relative aspect-square flex items-center justify-center"
              style={{
                background: isBad ? '#F6B3B3' : LAND[reg % LAND.length],
                borderTop: edge(r - 1, c) && r > 0 ? '2.5px solid #101312' : '1px solid rgba(16,19,18,0.12)',
                borderLeft: edge(r, c - 1) && c > 0 ? '2.5px solid #101312' : '1px solid rgba(16,19,18,0.12)'
              }}
            >
              {m === 2 && (
                <Crown
                  className={`w-[58%] h-[58%] ${done ? 'text-primary-dark' : isBad ? 'text-[#B91C1C]' : 'text-ink'} animate-[popUp_200ms_ease-out]`}
                  fill={done ? '#2EBA6B' : isBad ? '#F87171' : '#101312'}
                  strokeWidth={1.5}
                />
              )}
              {m === 1 && <span className="text-[#101312]/45 font-bold text-base leading-none">×</span>}
              {!done && cursor === i && <span className="absolute inset-[3px] rounded-sm ring-2 ring-ink/70 pointer-events-none" />}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-[#8B958F]" aria-live="polite">
        {bad.size > 0 ? (
          <span className="text-[#B91C1C]">Two crowns clash: same row, column, kingdom, or touching.</span>
        ) : (
          <>
            {crownCount} of {n} crowns placed
          </>
        )}
      </p>

      <div className="mt-5 flex justify-center gap-2">
        <ToolButton onClick={undo} disabled={!past.length || done} label="Undo" kbd="Backspace" icon={<Undo2 className="w-4 h-4" />} />
        <ToolButton onClick={hint} disabled={done} label="Hint" kbd="H" icon={<Lightbulb className="w-4 h-4" />} />
      </div>
    </div>
  );
}

export default function Kingdoms() {
  const run = usePuzzleRun<KingdomsPuzzle>(SLUG, makeLevel, makeDaily);
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
      title="Kingdoms"
      tagline="Crown one ruler in every row, every column and every coloured kingdom, and never let two crowns touch."
      keywords="queens puzzle online, crown logic puzzle, star battle puzzle, region logic game, daily logic puzzle, brain game free"
      sound
      stats={[
        { label: 'Level', value: run.level, accent: true },
        { label: 'Stars', value: run.totalStars },
        { label: 'Streak', value: run.streak }
      ]}
      onRestart={run.restart}
      restartLabel="Clear"
      howTo={[
        'Each row, each column and each coloured kingdom must hold exactly one crown.',
        'Two crowns may never touch, not even corner to corner.',
        'Tap a square once to cross it out (a note for yourself), twice for a crown, three times to clear it. Drag to cross out many.',
        'Every board has exactly one answer and can be solved by logic alone, without guessing.',
        'Keyboard: arrows to move, Space to cycle, C for a crown, X to cross out, Backspace to undo, H for a hint.'
      ]}
      about={
        <>
          <p>
            Kingdoms is a pure deduction puzzle. Small kingdoms are the place to start: a kingdom squeezed into one row
            or column decides that line for everyone else, and every crown you place rules out the eight squares around
            it.
          </p>
          <p>
            Boards grow from 5x5 to 9x9 as you level up. Each one is generated in your browser and accepted only when a
            solver proves it has a single solution. Your device remembers the boards it has dealt (mirrored and rotated
            copies count as the same), so you never get one twice.
          </p>
        </>
      }
    >
      <div className="relative">
        <ModeSwitch mode={run.mode} onMode={run.setMode} level={run.level} tier={`${run.puzzle.tier} · ${run.puzzle.n}×${run.puzzle.n}`} dailyDone={run.dailyDone} />
        <div className="mt-5">
          {run.mode === 'daily' && run.dailyDone && !result ? (
            <DailyDone streak={run.streak} onLevels={() => run.setMode('levels')} />
          ) : (
            <Board key={run.boardKey} puzzle={run.puzzle} onSolved={onSolved} />
          )}
        </div>
        <SolvedPanel
          show={!!result}
          title={run.mode === 'daily' ? 'Daily board solved' : `Level ${run.level} solved`}
          stars={result?.stars}
          detail={run.mode === 'daily' ? `Streak: ${run.streak} day${run.streak === 1 ? '' : 's'}.` : 'Every kingdom has its ruler.'}
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
