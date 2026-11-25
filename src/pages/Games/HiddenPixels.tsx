import { useCallback, useEffect, useRef, useState } from 'react';
import { Lightbulb, Square, Undo2, X } from 'lucide-react';
import GameShell from '../../components/GameShell';
import { DailyDone, ModeSwitch, SolvedPanel, ToolButton } from '../../components/PuzzleBits';
import { audio } from '../../lib/gameAudio';
import { canonPixels, cluesOf, generatePixels, type PixelsPuzzle } from '../../lib/mindPuzzles';
import { effectiveLevel } from '../../lib/reverseMath';
import type { PuzzleHistory } from '../../lib/puzzleHistory';
import { starsFor, usePuzzleRun } from '../../lib/usePuzzleRun';

const SLUG = 'hidden-pixels';

const makeLevel = (h: PuzzleHistory, level: number) =>
  h.next(`L${level}`, (seed, a) => generatePixels(seed, effectiveLevel(level, a, seed)), canonPixels);
const makeDaily = (h: PuzzleHistory, date: string) =>
  h.next(`daily-${date}`, (seed) => generatePixels(seed, 30), canonPixels, true);

type Cell = 0 | 1 | 2; // unknown, filled, crossed
type Tool = 1 | 2;

function Board({ puzzle, onSolved }: { puzzle: PixelsPuzzle; onSolved: (slips: number) => void }) {
  const { rows, cols, rowClues, colClues } = puzzle;
  const [grid, setGrid] = useState<Cell[]>(() => Array(rows * cols).fill(0));
  const [past, setPast] = useState<Cell[][]>([]);
  const [tool, setTool] = useState<Tool>(1);
  const [cursor, setCursor] = useState(0);
  const [slips, setSlips] = useState(0);
  const [done, setDone] = useState(false);
  const paint = useRef<{ value: Cell; snapshot: Cell[]; touched: Set<number> } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const lineOk = (cells: Cell[], clue: number[]) => cluesOf(cells.map((v) => (v === 1 ? 1 : 0))).join() === clue.join();
  const rowOk = rowClues.map((cl, r) => lineOk(grid.slice(r * cols, r * cols + cols), cl));
  const colOk = colClues.map((cl, c) => lineOk(Array.from({ length: rows }, (_, r) => grid[r * cols + c]), cl));

  useEffect(() => {
    if (done) return;
    if (rowOk.every(Boolean) && colOk.every(Boolean)) {
      setDone(true);
      audio.play('win');
      onSolved(slips);
    }
  }, [grid]); // eslint-disable-line react-hooks/exhaustive-deps

  const cellAt = (x: number, y: number) => {
    const el = gridRef.current;
    if (!el) return -1;
    const rect = el.getBoundingClientRect();
    const c = Math.floor(((x - rect.left) / rect.width) * cols);
    const r = Math.floor(((y - rect.top) / rect.height) * rows);
    return r < 0 || c < 0 || r >= rows || c >= cols ? -1 : r * cols + c;
  };

  const apply = (i: number) => {
    const p = paint.current;
    if (!p || p.touched.has(i)) return;
    p.touched.add(i);
    setGrid((g) => {
      // A stroke that started by clearing only clears; one that paints never overwrites the other mark.
      if (p.value !== 0 && g[i] !== 0 && g[i] !== p.value) return g;
      if (g[i] === p.value) return g;
      const next = [...g];
      next[i] = p.value;
      return next;
    });
  };

  const startStroke = (i: number, t: Tool) => {
    if (done || i < 0) return;
    setCursor(i);
    const value: Cell = grid[i] === t ? 0 : t;
    paint.current = { value, snapshot: grid, touched: new Set() };
    apply(i);
    audio.play(value === 1 ? 'move' : 'ui');
  };
  const endStroke = () => {
    const p = paint.current;
    paint.current = null;
    if (p && p.touched.size) setPast((h) => [...h, p.snapshot]);
  };

  const undo = () => {
    if (done || !past.length) return;
    setGrid(past[past.length - 1]);
    setPast((p) => p.slice(0, -1));
    audio.play('ui');
  };

  const hint = () => {
    if (done) return;
    // Fix a wrong mark first; otherwise reveal an unknown square in the most-solved row.
    const wrong = grid.findIndex((v, i) => (v === 1 && !puzzle.cells[i]) || (v === 2 && puzzle.cells[i]));
    let i = wrong;
    if (i < 0) {
      const unknown = grid.map((v, j) => (v === 0 ? j : -1)).filter((j) => j >= 0);
      if (!unknown.length) return;
      const known = (j: number) => grid.slice(Math.floor(j / cols) * cols, Math.floor(j / cols) * cols + cols).filter((v) => v).length;
      i = unknown.sort((a, b) => known(b) - known(a))[0];
    }
    const next = [...grid];
    next[i] = puzzle.cells[i] ? 1 : 2;
    setPast((p) => [...p, grid]);
    setGrid(next);
    setCursor(i);
    setSlips((s) => s + 1);
    audio.play('bonus');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const r = Math.floor(cursor / cols), c = cursor % cols;
      const k = e.key;
      const set = (v: Cell) => {
        if (done) return;
        const next = [...grid];
        next[cursor] = grid[cursor] === v ? 0 : v;
        setPast((p) => [...p, grid]);
        setGrid(next);
        audio.play('move');
      };
      if (k === 'ArrowUp' && r > 0) setCursor(cursor - cols);
      else if (k === 'ArrowDown' && r < rows - 1) setCursor(cursor + cols);
      else if (k === 'ArrowLeft' && c > 0) setCursor(cursor - 1);
      else if (k === 'ArrowRight' && c < cols - 1) setCursor(cursor + 1);
      else if (k === ' ' || k === 'Enter' || k.toLowerCase() === 'f') set(1);
      else if (k.toLowerCase() === 'x') set(2);
      else if (k === 'Backspace') undo();
      else if (k.toLowerCase() === 'h') hint();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const cr = Math.floor(cursor / cols), cc = cursor % cols;
  const maxColClue = Math.max(...colClues.map((c) => c.length));

  return (
    <div className="relative select-none">
      <div className="mx-auto w-fit max-w-full">
        <div className="grid" style={{ gridTemplateColumns: `auto minmax(0, ${cols * 2.6}rem)` }}>
          <div />
          {/* Column clues */}
          <div className="grid mb-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {colClues.map((cl, c) => (
              <div
                key={c}
                className={`flex flex-col items-center justify-end gap-0.5 pb-1 rounded-t-md font-mono text-[10px] sm:text-xs font-bold leading-none tabular-nums ${colOk[c] ? 'text-black/25' : 'text-ink'} ${c === cc && !done ? 'bg-mint' : ''}`}
                style={{ minHeight: `${maxColClue * 0.9 + 0.6}rem` }}
              >
                {cl.map((n, j) => (
                  <span key={j}>{n}</span>
                ))}
              </div>
            ))}
          </div>
          {/* Row clues */}
          <div className="grid mr-1" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
            {rowClues.map((cl, r) => (
              <div
                key={r}
                className={`flex items-center justify-end gap-1 pr-1.5 rounded-l-md font-mono text-[10px] sm:text-xs font-bold tabular-nums ${rowOk[r] ? 'text-black/25' : 'text-ink'} ${r === cr && !done ? 'bg-mint' : ''}`}
              >
                {cl.map((n, j) => (
                  <span key={j}>{n}</span>
                ))}
              </div>
            ))}
          </div>
          {/* Board */}
          <div
            ref={gridRef}
            role="grid"
            aria-label={`Hidden Pixels board, ${rows} rows by ${cols} columns`}
            className="grid touch-none border-2 border-ink rounded-sm bg-white"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={(e) => {
              (e.target as Element).releasePointerCapture?.(e.pointerId);
              startStroke(cellAt(e.clientX, e.clientY), e.button === 2 ? 2 : tool);
            }}
            onPointerMove={(e) => {
              if (!paint.current) return;
              const i = cellAt(e.clientX, e.clientY);
              if (i >= 0) apply(i);
            }}
            onPointerUp={endStroke}
            onPointerLeave={endStroke}
            onPointerCancel={endStroke}
          >
            {grid.map((v, i) => {
              const r = Math.floor(i / cols), c = i % cols;
              return (
                <button
                  key={i}
                  tabIndex={-1}
                  aria-label={`Row ${r + 1}, column ${c + 1}: ${v === 1 ? 'filled' : v === 2 ? 'crossed' : 'empty'}`}
                  className="relative aspect-square flex items-center justify-center"
                  style={{
                    borderRight: c < cols - 1 ? (c % 5 === 4 ? '2px solid rgba(16,19,18,0.55)' : '1px solid rgba(16,19,18,0.14)') : undefined,
                    borderBottom: r < rows - 1 ? (r % 5 === 4 ? '2px solid rgba(16,19,18,0.55)' : '1px solid rgba(16,19,18,0.14)') : undefined,
                    background: v === 1 ? (done ? '#0E9D52' : '#101312') : (r === cr || c === cc) && !done ? '#F2F7F4' : '#fff',
                    transition: 'background 120ms'
                  }}
                >
                  {v === 2 && !done && <X className="w-[60%] h-[60%] text-black/35" strokeWidth={2.5} />}
                  {i === cursor && !done && <span className="absolute inset-0 ring-2 ring-inset ring-primary pointer-events-none" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <div className="inline-flex p-1 rounded-xl bg-[#F1F4F2] border border-black/[0.06]" role="radiogroup" aria-label="Tool">
          {([1, 2] as Tool[]).map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={tool === t}
              onClick={() => setTool(t)}
              className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-semibold ${tool === t ? 'bg-white text-ink shadow-sm shadow-black/10' : 'text-[#55605B]'}`}
            >
              {t === 1 ? <Square className="w-4 h-4" fill="#101312" /> : <X className="w-4 h-4" />}
              {t === 1 ? 'Fill' : 'Cross'}
            </button>
          ))}
        </div>
        <ToolButton onClick={undo} disabled={!past.length || done} label="Undo" kbd="Backspace" icon={<Undo2 className="w-4 h-4" />} />
        <ToolButton onClick={hint} disabled={done} label="Hint" kbd="H" icon={<Lightbulb className="w-4 h-4" />} />
      </div>
    </div>
  );
}

export default function HiddenPixels() {
  const run = usePuzzleRun<PixelsPuzzle>(SLUG, makeLevel, makeDaily);
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
      // Let the finished picture show for a moment before the panel covers it.
      setTimeout(() => setResult({ stars }), 900);
    },
    [run]
  );

  return (
    <GameShell
      slug={SLUG}
      title="Hidden Pixels"
      tagline="A nonogram: the numbers beside each row and column tell you the runs of filled squares. Use them to uncover the hidden pixel shape."
      keywords="nonogram online, picross free, griddlers, paint by numbers logic puzzle, hanjie, pixel logic puzzle browser"
      sound
      stats={[
        { label: 'Level', value: run.level, accent: true },
        { label: 'Stars', value: run.totalStars },
        { label: 'Streak', value: run.streak }
      ]}
      onRestart={run.restart}
      restartLabel="Clear"
      howTo={[
        'Each clue lists the runs of filled squares in that row or column, in order. "3 1" means three in a row, a gap, then one.',
        'Fill squares with the Fill tool and mark squares you know are empty with Cross. Drag to paint several at once; right-click crosses.',
        'A row or column greys out once its clue is met. Solve every line to reveal the shape.',
        'Every board can be solved by logic alone, one line at a time, with no guessing. A hint fixes or reveals one square.',
        'Keyboard: arrows to move, Space or F to fill, X to cross, Backspace to undo, H for a hint.'
      ]}
      about={
        <>
          <p>
            Hidden Pixels is a nonogram, also called picross or griddlers. Start with the big numbers: a run of 7 in a row
            of 8 squares must cover the middle six, wherever it starts. Crossing out squares you have ruled out is half
            the game.
          </p>
          <p>
            Boards grow from 5x5 to 10x10. Each one is generated in your browser and kept only if a line-by-line solver
            can finish it, which proves there is exactly one answer and no guessing. Your device remembers the boards it
            has dealt, mirror images included, so none repeats.
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
          detail={run.mode === 'daily' ? `Streak: ${run.streak} day${run.streak === 1 ? '' : 's'}.` : 'Every line adds up.'}
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
