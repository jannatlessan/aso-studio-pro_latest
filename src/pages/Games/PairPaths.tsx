import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, Undo2 } from 'lucide-react';
import GameShell from '../../components/GameShell';
import { DailyDone, ModeSwitch, SolvedPanel, ToolButton } from '../../components/PuzzleBits';
import { audio } from '../../lib/gameAudio';
import { canonPaths, generatePaths, pathsSolved, type PathsPuzzle } from '../../lib/mindPuzzles';
import { effectiveLevel } from '../../lib/reverseMath';
import type { PuzzleHistory } from '../../lib/puzzleHistory';
import { starsFor, usePuzzleRun } from '../../lib/usePuzzleRun';

const SLUG = 'pair-paths';

const makeLevel = (h: PuzzleHistory, level: number) =>
  h.next(`L${level}`, (seed, a) => generatePaths(seed, effectiveLevel(level, a, seed)), canonPaths);
const makeDaily = (h: PuzzleHistory, date: string) =>
  h.next(`daily-${date}`, (seed) => generatePaths(seed, 30), canonPaths, true);

// Ten inks picked to stay apart for common colour-vision differences; each dot also shows a number.
const INK = ['#E4572E', '#2E86DE', '#F2B134', '#16A05D', '#8E44AD', '#E84393', '#00A8A8', '#7F5539', '#5D6D7E', '#A3C618'];

type Paths = number[][];

function Board({ puzzle, onSolved }: { puzzle: PathsPuzzle; onSolved: (slips: number) => void }) {
  const { rows, cols, ends } = puzzle;
  const total = rows * cols;
  const dotColour = new Map<number, number>();
  ends.forEach(([a, b], k) => {
    dotColour.set(a, k);
    dotColour.set(b, k);
  });

  const [paths, setPaths] = useState<Paths>(() => ends.map(() => []));
  const [past, setPast] = useState<Paths[]>([]);
  const [active, setActive] = useState<number | null>(null); // colour being drawn
  const [cursor, setCursor] = useState(ends[0][0]);
  const [slips, setSlips] = useState(0);
  const [done, setDone] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drawing = useRef(false);
  // Pointer events can arrive faster than React re-renders: keep the live values in refs.
  const pathsRef = useRef(paths);
  pathsRef.current = paths;
  const activeRef = useRef(active);
  activeRef.current = active;
  const update = (ps: Paths) => {
    pathsRef.current = ps;
    setPaths(ps);
  };
  const activate = (k: number | null) => {
    activeRef.current = k;
    setActive(k);
  };

  const owner = new Array(total).fill(-1);
  paths.forEach((p, k) => p.forEach((i) => (owner[i] = k)));
  const complete = (k: number, ps = paths) => {
    const p = ps[k];
    if (p.length < 2) return false;
    const [a, b] = ends[k];
    return (p[0] === a && p[p.length - 1] === b) || (p[0] === b && p[p.length - 1] === a);
  };
  const linked = ends.filter((_, k) => complete(k)).length;
  const filled = owner.filter((o, i) => o >= 0 || dotColour.has(i)).length;
  const fillPct = Math.round((filled / total) * 100);

  useEffect(() => {
    if (done) return;
    if (pathsSolved(puzzle, paths)) {
      setDone(true);
      setActive(null);
      audio.play('win');
      onSolved(slips);
    }
  }, [paths]); // eslint-disable-line react-hooks/exhaustive-deps

  const adj = (a: number, b: number) => {
    const ar = Math.floor(a / cols), ac = a % cols, br = Math.floor(b / cols), bc = b % cols;
    return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
  };

  /** Start (or resume) drawing colour k from cell i. */
  const begin = (i: number) => {
    if (done) return false;
    const dot = dotColour.get(i);
    setPast((p) => [...p, paths]);
    if (dot !== undefined) {
      const next = paths.map((p, k) => (k === dot ? [i] : p.filter((c) => c !== i)));
      update(next);
      activate(dot);
      audio.play('ui');
      return true;
    }
    const k = owner[i];
    if (k >= 0) {
      const p = paths[k];
      const at = p.indexOf(i);
      update(paths.map((q, j) => (j === k ? q.slice(0, at + 1) : q)));
      activate(k);
      return true;
    }
    setPast((p) => p.slice(0, -1));
    return false;
  };

  /** Extend the active path one step to cell i (adjacent to its end). */
  const step = (ps: Paths, k: number, i: number): Paths | null => {
    const p = ps[k];
    const end = p[p.length - 1];
    if (end === undefined || !adj(end, i)) return null;
    const back = p.indexOf(i);
    if (back >= 0) return ps.map((q, j) => (j === k ? q.slice(0, back + 1) : q)); // backtrack
    if (complete(k, ps)) return null; // finished line: only backtracking allowed
    const dot = dotColour.get(i);
    if (dot !== undefined && dot !== k) return null; // cannot cross another colour's dot
    return ps.map((q, j) => {
      if (j === k) return [...q, i];
      const at = q.indexOf(i);
      return at >= 0 ? q.slice(0, at) : q; // cut the other line where we cross it
    });
  };

  const moveTo = (i: number) => {
    const active = activeRef.current;
    const paths = pathsRef.current;
    if (active === null || done) return;
    let ps = paths;
    // Walk toward the target one square at a time, so quick swipes do not skip cells.
    for (let guard = 0; guard < 20; guard++) {
      const p = ps[active];
      const end = p[p.length - 1];
      if (end === i || end === undefined) break;
      const er = Math.floor(end / cols), ec = end % cols, tr = Math.floor(i / cols), tc = i % cols;
      const dr = Math.sign(tr - er), dc = Math.sign(tc - ec);
      const nextCell = Math.abs(tr - er) >= Math.abs(tc - ec) ? end + dr * cols : end + dc;
      const n = step(ps, active, nextCell);
      if (!n) break;
      ps = n;
    }
    if (ps !== paths) {
      const was = complete(active, paths);
      update(ps);
      setCursor(i);
      if (!was && complete(active, ps)) audio.play('merge');
      else audio.play('move');
    }
  };

  const cellAt = (x: number, y: number) => {
    const el = svgRef.current;
    if (!el) return -1;
    const rect = el.getBoundingClientRect();
    const c = Math.floor(((x - rect.left) / rect.width) * cols);
    const r = Math.floor(((y - rect.top) / rect.height) * rows);
    return r < 0 || c < 0 || r >= rows || c >= cols ? -1 : r * cols + c;
  };

  const undo = () => {
    if (done || !past.length) return;
    setPaths(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    setActive(null);
    audio.play('ui');
  };

  const hint = () => {
    if (done) return;
    // Lay down the true line of the first colour that is not already right.
    const k = ends.findIndex((_, j) => {
      const sol = puzzle.solution[j];
      const p = paths[j];
      return !(p.length === sol.length && (p.every((c, x) => c === sol[x]) || p.every((c, x) => c === sol[sol.length - 1 - x])));
    });
    if (k < 0) return;
    const sol = puzzle.solution[k];
    const taken = new Set(sol);
    setPast((p) => [...p, paths]);
    setPaths(
      paths.map((q, j) => {
        if (j === k) return [...sol];
        const cut = q.findIndex((c) => taken.has(c));
        return cut >= 0 ? q.slice(0, cut) : q;
      })
    );
    setActive(null);
    setSlips((s) => s + 1);
    audio.play('bonus');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const r = Math.floor(cursor / cols), c = cursor % cols;
      const dir: Record<string, number | null> = {
        ArrowUp: r > 0 ? cursor - cols : null,
        ArrowDown: r < rows - 1 ? cursor + cols : null,
        ArrowLeft: c > 0 ? cursor - 1 : null,
        ArrowRight: c < cols - 1 ? cursor + 1 : null
      };
      if (e.key in dir) {
        const t = dir[e.key];
        if (t !== null) {
          if (active !== null) moveTo(t);
          setCursor(t);
        }
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (active !== null) activate(null);
        else begin(cursor);
      } else if (e.key === 'Escape') setActive(null);
      else if (e.key === 'Backspace') undo();
      else if (e.key.toLowerCase() === 'h') hint();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const center = (i: number) => [(i % cols) * 10 + 5, Math.floor(i / cols) * 10 + 5];

  return (
    <div className="relative select-none">
      <div className="mx-auto rounded-xl bg-[#101312] p-1.5 sm:p-2" style={{ maxWidth: `${cols * 3.4}rem` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${cols * 10} ${rows * 10}`}
          className="block w-full touch-none cursor-pointer"
          role="img"
          aria-label={`Pair Paths board, ${rows} by ${cols}, ${ends.length} pairs, ${linked} linked`}
          onPointerDown={(e) => {
            const i = cellAt(e.clientX, e.clientY);
            if (i < 0) return;
            setCursor(i);
            if (begin(i)) drawing.current = true;
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            const i = cellAt(e.clientX, e.clientY);
            if (i >= 0) moveTo(i);
          }}
          onPointerUp={() => {
            drawing.current = false;
            activate(null);
          }}
          onPointerCancel={() => {
            drawing.current = false;
            activate(null);
          }}
        >
          {Array.from({ length: total }, (_, i) => {
            const [x, y] = center(i);
            const k = owner[i];
            return (
              <rect
                key={i}
                x={x - 4.6}
                y={y - 4.6}
                width={9.2}
                height={9.2}
                rx={1.4}
                fill={k >= 0 ? INK[k % INK.length] : '#1E2422'}
                fillOpacity={k >= 0 ? (complete(k) ? 0.32 : 0.18) : 1}
              />
            );
          })}
          {paths.map((p, k) =>
            p.length > 1 ? (
              <polyline
                key={k}
                points={p.map((i) => center(i).join(',')).join(' ')}
                fill="none"
                stroke={INK[k % INK.length]}
                strokeWidth={3.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null
          )}
          {ends.map(([a, b], k) =>
            [a, b].map((i) => {
              const [x, y] = center(i);
              return (
                <g key={`${k}-${i}`}>
                  <circle cx={x} cy={y} r={active === k ? 3.9 : 3.5} fill={INK[k % INK.length]} />
                  <text x={x} y={y + 1.25} textAnchor="middle" fontSize={3.4} fontWeight={800} fill="#fff" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {k + 1}
                  </text>
                </g>
              );
            })
          )}
          {!done && (
            <rect
              x={center(cursor)[0] - 4.8}
              y={center(cursor)[1] - 4.8}
              width={9.6}
              height={9.6}
              rx={1.6}
              fill="none"
              stroke="#fff"
              strokeOpacity={0.55}
              strokeWidth={0.6}
              strokeDasharray="1.5 1"
            />
          )}
        </svg>
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-[#8B958F]" aria-live="polite">
        {linked === ends.length && !done ? (
          <span className="text-[#B45309]">All pairs linked. Now cover every square too.</span>
        ) : (
          <>
            {linked}/{ends.length} linked · {fillPct}% covered
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

export default function PairPaths() {
  const run = usePuzzleRun<PathsPuzzle>(SLUG, makeLevel, makeDaily);
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
      title="Pair Paths"
      tagline="Draw a line between every pair of matching dots. Lines cannot cross, and together they must cover the whole board."
      keywords="connect the dots puzzle, link pairs game, pipe puzzle online, line puzzle, path puzzle free, brain game browser"
      sound
      stats={[
        { label: 'Level', value: run.level, accent: true },
        { label: 'Stars', value: run.totalStars },
        { label: 'Streak', value: run.streak }
      ]}
      onRestart={run.restart}
      restartLabel="Clear"
      howTo={[
        'Press on a dot and drag to its twin (same colour and number) to draw a line.',
        'Lines run between neighbouring squares only, never diagonally, and never through another dot.',
        'Crossing an existing line cuts it. Drag back along your own line to shorten it.',
        'Link every pair and cover every square to finish. A hint lays down one correct line.',
        'Keyboard: arrows to move, Space on a dot to start a line, arrows to draw, Space to stop, Backspace to undo.'
      ]}
      about={
        <>
          <p>
            Pair Paths is a route-planning puzzle: the hard part is not linking the dots, it is linking them so that no
            square is left empty. Lines that hug the walls and corners first usually show you the rest.
          </p>
          <p>
            Every board is built by laying one long path through all of its squares and cutting it into pieces, so a
            full solution always exists. Boards grow from 5x5 to 9x9, and your device remembers the boards it has dealt
            (rotations and mirror images included), so none repeats.
          </p>
        </>
      }
    >
      <div className="relative">
        <ModeSwitch mode={run.mode} onMode={run.setMode} level={run.level} tier={`${run.puzzle.tier} · ${run.puzzle.rows}×${run.puzzle.cols}`} dailyDone={run.dailyDone} />
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
          detail={run.mode === 'daily' ? `Streak: ${run.streak} day${run.streak === 1 ? '' : 's'}.` : 'Every pair linked, every square covered.'}
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
