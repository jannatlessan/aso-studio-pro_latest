import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'gem-swap';
const SIZE = 7;
const CELLS = SIZE * SIZE;
const ROUND_SECONDS = 60;
const COLORS = 6;

type Board = number[];

// Six distinguishable gem colors, with the brand green leading the set.
const GEM_CLASS = [
  'bg-primary',
  'bg-[#2EBA6B]',
  'bg-[#0F766E]',
  'bg-[#B45309]',
  'bg-[#6D28D9]',
  'bg-[#BE123C]'
];

const GEM_SHAPE = [
  'rounded-full',
  'rounded-lg rotate-45',
  'rounded-md',
  'rounded-full',
  'rounded-lg',
  'rounded-md rotate-45'
];

const at = (r: number, c: number) => r * SIZE + c;

/** Every cell that belongs to a horizontal or vertical run of three or more. */
function findMatches(board: Board) {
  const matched = new Set<number>();

  for (let r = 0; r < SIZE; r++) {
    let run = 1;
    for (let c = 1; c <= SIZE; c++) {
      const same = c < SIZE && board[at(r, c)] === board[at(r, c - 1)] && board[at(r, c)] >= 0;
      if (same) {
        run++;
      } else {
        if (run >= 3) for (let k = c - run; k < c; k++) matched.add(at(r, k));
        run = 1;
      }
    }
  }

  for (let c = 0; c < SIZE; c++) {
    let run = 1;
    for (let r = 1; r <= SIZE; r++) {
      const same = r < SIZE && board[at(r, c)] === board[at(r - 1, c)] && board[at(r, c)] >= 0;
      if (same) {
        run++;
      } else {
        if (run >= 3) for (let k = r - run; k < r; k++) matched.add(at(k, c));
        run = 1;
      }
    }
  }

  return matched;
}

const swapped = (board: Board, a: number, b: number) => {
  const next = [...board];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
};

const areNeighbours = (a: number, b: number) => {
  const dr = Math.abs(Math.floor(a / SIZE) - Math.floor(b / SIZE));
  const dc = Math.abs((a % SIZE) - (b % SIZE));
  return dr + dc === 1;
};

/** True when at least one legal swap would create a match — otherwise the board is dead. */
function hasAnyMove(board: Board) {
  for (let i = 0; i < CELLS; i++) {
    for (const j of [i + 1, i + SIZE]) {
      if (j >= CELLS || !areNeighbours(i, j)) continue;
      if (findMatches(swapped(board, i, j)).size > 0) return true;
    }
  }
  return false;
}

function freshBoard(): Board {
  let board: Board;
  do {
    board = Array.from({ length: CELLS }, () => Math.floor(Math.random() * COLORS));
    // Re-roll any cell that lands in a match so the round starts stable.
    let guard = 0;
    while (findMatches(board).size > 0 && guard++ < 200) {
      findMatches(board).forEach((i) => {
        board[i] = Math.floor(Math.random() * COLORS);
      });
    }
  } while (findMatches(board).size > 0 || !hasAnyMove(board));
  return board;
}

/** Drops surviving gems into cleared cells and refills the top of each column. */
function collapse(board: Board) {
  const next = [...board];
  for (let c = 0; c < SIZE; c++) {
    const column: number[] = [];
    for (let r = SIZE - 1; r >= 0; r--) {
      const value = next[at(r, c)];
      if (value >= 0) column.push(value);
    }
    while (column.length < SIZE) column.push(Math.floor(Math.random() * COLORS));
    column.forEach((value, i) => {
      next[at(SIZE - 1 - i, c)] = value;
    });
  }
  return next;
}

export default function GemSwap() {
  const [board, setBoard] = useState<Board>(freshBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [over, setOver] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [shake, setShake] = useState<number | null>(null);
  const { best, submit } = useBestScore(SLUG);

  const liveBoard = useRef(board);
  const resolving = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const restart = useCallback(() => {
    clearTimers();
    const next = freshBoard();
    liveBoard.current = next;
    resolving.current = false;
    setBoard(next);
    setSelected(null);
    setScore(0);
    setCombo(0);
    setSecondsLeft(ROUND_SECONDS);
    setOver(false);
    setIsRecord(false);
  }, []);

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    if (over) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [over]);

  useEffect(() => {
    if (secondsLeft === 0) setOver(true);
  }, [secondsLeft]);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  /**
   * Clears matches, drops the survivors, and repeats on a short delay so cascades are visible.
   * Each extra cascade step is worth progressively more.
   */
  const resolve = useCallback((start: Board, cascade: number) => {
    const matches = findMatches(start);

    if (matches.size === 0) {
      resolving.current = false;
      setCombo(0);
      // A dead board is reshuffled rather than leaving the player stuck with time on the clock.
      if (!hasAnyMove(start)) {
        const fresh = freshBoard();
        liveBoard.current = fresh;
        setBoard(fresh);
      }
      return;
    }

    setScore((s) => s + matches.size * 10 * cascade);
    setCombo(cascade);

    const cleared = [...start];
    matches.forEach((i) => {
      cleared[i] = -1;
    });
    liveBoard.current = cleared;
    setBoard(cleared);

    timers.current.push(
      window.setTimeout(() => {
        const dropped = collapse(cleared);
        liveBoard.current = dropped;
        setBoard(dropped);
        timers.current.push(window.setTimeout(() => resolve(dropped, cascade + 1), 140));
      }, 150)
    );
  }, []);

  const tap = useCallback(
    (index: number) => {
      if (over || resolving.current) return;

      if (selected === null) {
        setSelected(index);
        return;
      }
      if (selected === index) {
        setSelected(null);
        return;
      }
      if (!areNeighbours(selected, index)) {
        setSelected(index);
        return;
      }

      const attempt = swapped(liveBoard.current, selected, index);
      setSelected(null);

      if (findMatches(attempt).size === 0) {
        // Illegal swap: bounce it back with a shake instead of silently doing nothing.
        setShake(index);
        timers.current.push(window.setTimeout(() => setShake(null), 220));
        return;
      }

      resolving.current = true;
      liveBoard.current = attempt;
      setBoard(attempt);
      timers.current.push(window.setTimeout(() => resolve(attempt, 1), 140));
    },
    [selected, over, resolve]
  );

  return (
    <GameShell
      slug={SLUG}
      title="Gem Swap"
      tagline="Swap neighbouring gems to line up three or more and rack up cascading combos before the clock runs out."
      keywords="match 3 game, gem swap, bejeweled style game online, free match three puzzle"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Time', value: `${secondsLeft}s` },
        { label: 'Combo', value: combo ? `x${combo}` : '—' }
      ]}
      onRestart={restart}
      restartLabel="New round"
      howTo={[
        'Tap one gem, then tap a gem next to it to swap the two.',
        'A swap is only allowed if it lines up three or more of the same gem.',
        'Cleared gems drop new ones in, and chain reactions score a multiplier.',
        'You have 60 seconds — score as high as you can before time is up.'
      ]}
      about={
        <p>
          Matches are worth ten points per gem, multiplied by how deep the cascade goes, so setting up a
          chain is worth far more than clearing three at a time. If the board ever runs out of legal
          swaps it reshuffles itself automatically.
        </p>
      }
    >
      <div className="relative">
        <div
          className="mx-auto w-full max-w-sm grid gap-1.5 p-2 rounded-2xl bg-[#E6EAE8] select-none touch-manipulation"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
        >
          {board.map((gem, index) => (
            <button
              key={index}
              onClick={() => tap(index)}
              className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-150 ${
                selected === index ? 'bg-white ring-2 ring-primary scale-95' : 'bg-white/70'
              } ${shake === index ? 'animate-[shake_200ms_ease-in-out]' : ''}`}
            >
              {gem >= 0 && (
                <span
                  className={`block w-[70%] h-[70%] ${GEM_CLASS[gem]} ${GEM_SHAPE[gem]} shadow-sm transition-transform duration-150`}
                />
              )}
            </button>
          ))}
        </div>

        <GameOverlay
          show={over}
          tone="neutral"
          title="Time!"
          subtitle={`You scored ${score.toLocaleString()} points.`}
          actionLabel="Play again"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
