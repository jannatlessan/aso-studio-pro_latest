import { useCallback, useEffect, useRef, useState } from 'react';
import { Bomb, Flag, Shovel } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'minesweeper';
const COLS = 9;
const ROWS = 9;
const MINES = 10;

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  /** Adjacent mine count, filled in once the mines are placed. */
  count: number;
}

const inBounds = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

const around = (r: number, c: number) => {
  const list: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if ((dr || dc) && inBounds(r + dr, c + dc)) list.push([r + dr, c + dc]);
    }
  }
  return list;
};

const blankGrid = (): Cell[][] =>
  Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  );

/**
 * Mines are placed after the first tap, skipping that cell and its neighbours, so the opening
 * click always opens a usable area instead of ending the game instantly.
 */
function placeMines(grid: Cell[][], safeR: number, safeC: number) {
  const banned = new Set([`${safeR},${safeC}`, ...around(safeR, safeC).map(([r, c]) => `${r},${c}`)]);
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (grid[r][c].mine || banned.has(`${r},${c}`)) continue;
    grid[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c].count = around(r, c).filter(([ar, ac]) => grid[ar][ac].mine).length;
    }
  }
}

/** Iterative flood fill from an empty cell out to the first numbered ring. */
function flood(grid: Cell[][], startR: number, startC: number) {
  const stack: [number, number][] = [[startR, startC]];
  while (stack.length) {
    const [r, c] = stack.pop() as [number, number];
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.count === 0 && !cell.mine) {
      around(r, c).forEach(([ar, ac]) => {
        if (!grid[ar][ac].revealed) stack.push([ar, ac]);
      });
    }
  }
}

const cloneGrid = (grid: Cell[][]) => grid.map((row) => row.map((cell) => ({ ...cell })));

const NUMBER_COLOR = [
  '',
  'text-[#0E9D52]',
  'text-[#0A7D40]',
  'text-[#B8860B]',
  'text-[#C2410C]',
  'text-[#B91C1C]',
  'text-[#7E22CE]',
  'text-[#1F2937]',
  'text-[#4B5563]'
];

export default function Minesweeper() {
  const [grid, setGrid] = useState<Cell[][]>(blankGrid);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [seconds, setSeconds] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG, 'min');
  const longPress = useRef<number | null>(null);
  const longPressFired = useRef(false);

  // The grid is mutated outside of React's updater (mine placement is random, and StrictMode runs
  // updaters twice in development), so the ref is the authority and state only mirrors it.
  const liveGrid = useRef(grid);
  const liveStarted = useRef(false);
  const liveStatus = useRef<'playing' | 'won' | 'lost'>('playing');

  const flagsUsed = grid.flat().filter((cell) => cell.flagged).length;

  const restart = useCallback(() => {
    const next = blankGrid();
    liveGrid.current = next;
    liveStarted.current = false;
    liveStatus.current = 'playing';
    setGrid(next);
    setStarted(false);
    setStatus('playing');
    setSeconds(0);
    setIsRecord(false);
  }, []);

  useEffect(() => {
    if (!started || status !== 'playing') return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, status]);

  useEffect(() => {
    if (status === 'won') setIsRecord(submit(seconds));
  }, [status, seconds, submit]);

  const reveal = useCallback((r: number, c: number) => {
    if (liveStatus.current !== 'playing') return;
    const next = cloneGrid(liveGrid.current);

    if (!liveStarted.current) {
      placeMines(next, r, c);
      liveStarted.current = true;
      setStarted(true);
    }

    const cell = next[r][c];
    if (cell.flagged || cell.revealed) return;

    if (cell.mine) {
      next.forEach((row) => row.forEach((x) => { if (x.mine) x.revealed = true; }));
      liveStatus.current = 'lost';
      setStatus('lost');
    } else {
      flood(next, r, c);
      const safeLeft = next.flat().filter((x) => !x.mine && !x.revealed).length;
      if (safeLeft === 0) {
        next.forEach((row) => row.forEach((x) => { if (x.mine) x.flagged = true; }));
        liveStatus.current = 'won';
        setStatus('won');
      }
    }

    liveGrid.current = next;
    setGrid(next);
  }, []);

  const toggleFlag = useCallback((r: number, c: number) => {
    if (liveStatus.current !== 'playing') return;
    if (liveGrid.current[r][c].revealed) return;
    const next = cloneGrid(liveGrid.current);
    next[r][c].flagged = !next[r][c].flagged;
    liveGrid.current = next;
    setGrid(next);
  }, []);

  const handleTap = (r: number, c: number) => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    if (flagMode) toggleFlag(r, c);
    else reveal(r, c);
  };

  // Long-press flags without needing the mode toggle, which is how most phone players expect it.
  const startLongPress = (r: number, c: number) => {
    longPressFired.current = false;
    longPress.current = window.setTimeout(() => {
      longPressFired.current = true;
      toggleFlag(r, c);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPress.current !== null) {
      clearTimeout(longPress.current);
      longPress.current = null;
    }
  };

  return (
    <GameShell
      slug={SLUG}
      title="Minesweeper"
      tagline="Clear every safe square without tripping a mine. Long-press or right-click to plant a flag."
      keywords="minesweeper online, play minesweeper free, mine game, classic minesweeper browser"
      stats={[
        { label: 'Mines', value: `${MINES - flagsUsed}`, accent: true },
        { label: 'Time', value: seconds },
        { label: 'Best', value: best !== null ? `${best}s` : '—' }
      ]}
      onRestart={restart}
      restartLabel="New board"
      howTo={[
        'Tap a square to clear it. The first tap is always safe.',
        'A number tells you how many mines touch that square, counting diagonals.',
        'Long-press (or right-click) a square to flag a suspected mine, or switch to flag mode below.',
        'Clear all 71 safe squares to win. Tapping a mine ends the round.'
      ]}
      about={
        <p>
          This is the beginner layout: a 9×9 grid with 10 mines. Mines are only placed after your first
          tap, and never next to it, so you always get an opening pocket to reason from rather than a
          coin-flip start.
        </p>
      }
    >
      <div className="relative">
        <div className="mx-auto w-full max-w-sm">
          <div
            className="grid gap-1 p-2 rounded-2xl bg-[#E6EAE8] select-none touch-manipulation"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleTap(r, c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    toggleFlag(r, c);
                  }}
                  onTouchStart={() => startLongPress(r, c)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs sm:text-sm font-bold transition-colors ${
                    cell.revealed
                      ? cell.mine
                        ? 'bg-[#FDE2E2] text-[#B91C1C]'
                        : 'bg-white'
                      : 'bg-[#CBD3CE] hover:bg-[#BCC6C0] active:scale-95'
                  }`}
                >
                  {cell.revealed && cell.mine && <Bomb className="w-3.5 h-3.5" />}
                  {!cell.revealed && cell.flagged && <Flag className="w-3 h-3 text-primary" />}
                  {cell.revealed && !cell.mine && cell.count > 0 && (
                    <span className={NUMBER_COLOR[cell.count]}>{cell.count}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <GameOverlay
          show={status === 'lost'}
          tone="lose"
          title="Boom."
          subtitle="That one was a mine. The rest are shown on the board."
          onAction={restart}
        />
        <GameOverlay
          show={status === 'won'}
          tone="win"
          title="Board cleared!"
          subtitle={`All 10 mines found in ${seconds} seconds.`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>

      <div className="mt-4 flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-[#F6F8F7] border border-black/10 gap-1">
          <button
            onClick={() => setFlagMode(false)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
              !flagMode ? 'bg-primary text-white' : 'text-[#55605B] hover:bg-black/[0.04]'
            }`}
          >
            <Shovel className="w-3.5 h-3.5" /> Dig
          </button>
          <button
            onClick={() => setFlagMode(true)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
              flagMode ? 'bg-primary text-white' : 'text-[#55605B] hover:bg-black/[0.04]'
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> Flag
          </button>
        </div>
      </div>
    </GameShell>
  );
}
