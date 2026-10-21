import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { keyToDirection, useSwipe, type Direction } from '../../hooks/useSwipe';

const SLUG = 'sliding-puzzle';
const SIZE = 4;
const CELLS = SIZE * SIZE;
const BLANK = 0;

type Tiles = number[];

const SOLVED: Tiles = [...Array(CELLS - 1)].map((_, i) => i + 1).concat(BLANK);

const solved = (): Tiles => [...SOLVED];

const isSolved = (tiles: Tiles) => tiles.every((v, i) => v === SOLVED[i]);

/** Indices the blank can swap with from `blankIndex`. */
function neighbours(blankIndex: number) {
  const row = Math.floor(blankIndex / SIZE);
  const col = blankIndex % SIZE;
  const list: number[] = [];
  if (row > 0) list.push(blankIndex - SIZE);
  if (row < SIZE - 1) list.push(blankIndex + SIZE);
  if (col > 0) list.push(blankIndex - 1);
  if (col < SIZE - 1) list.push(blankIndex + 1);
  return list;
}

/**
 * Shuffles by walking the blank through random legal moves, which guarantees the result is
 * solvable — a plain random permutation of 15 tiles is unsolvable half the time.
 */
function shuffled(): Tiles {
  const tiles = solved();
  let blank = CELLS - 1;
  let previous = -1;
  for (let i = 0; i < 400; i++) {
    const options = neighbours(blank).filter((n) => n !== previous);
    const pick = options[Math.floor(Math.random() * options.length)];
    tiles[blank] = tiles[pick];
    tiles[pick] = BLANK;
    previous = blank;
    blank = pick;
  }
  return isSolved(tiles) ? shuffled() : tiles;
}

export default function SlidingPuzzle() {
  const [tiles, setTiles] = useState<Tiles>(shuffled);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG, 'min');
  const boardRef = useRef<HTMLDivElement>(null);

  const liveTiles = useRef(tiles);
  const liveWon = useRef(false);

  const blankIndex = useMemo(() => tiles.indexOf(BLANK), [tiles]);

  const restart = useCallback(() => {
    const next = shuffled();
    liveTiles.current = next;
    liveWon.current = false;
    setTiles(next);
    setMoves(0);
    setSeconds(0);
    setWon(false);
    setIsRecord(false);
  }, []);

  const slide = useCallback((index: number) => {
    if (liveWon.current) return;
    const current = liveTiles.current;
    const blank = current.indexOf(BLANK);
    if (!neighbours(blank).includes(index)) return;
    const next = [...current];
    next[blank] = next[index];
    next[index] = BLANK;
    liveTiles.current = next;
    setTiles(next);
    setMoves((m) => m + 1);
    if (isSolved(next)) {
      liveWon.current = true;
      setWon(true);
    }
  }, []);

  /** A swipe moves the tile that sits opposite the gesture, the way a physical puzzle behaves. */
  const slideByDirection = useCallback(
    (dir: Direction) => {
      const blank = liveTiles.current.indexOf(BLANK);
      const offset = dir === 'up' ? SIZE : dir === 'down' ? -SIZE : dir === 'left' ? 1 : -1;
      const target = blank + offset;
      if (target < 0 || target >= CELLS) return;
      // Guard horizontal wrap-around across rows.
      if ((dir === 'left' || dir === 'right') && Math.floor(target / SIZE) !== Math.floor(blank / SIZE)) return;
      slide(target);
    },
    [slide]
  );

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [won]);

  useEffect(() => {
    if (won) setIsRecord(submit(moves));
  }, [won, moves, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = keyToDirection(e.key);
      if (!dir) return;
      e.preventDefault();
      slideByDirection(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slideByDirection]);

  useSwipe(boardRef, slideByDirection);

  const canMove = (index: number) => neighbours(blankIndex).includes(index);

  return (
    <GameShell
      slug={SLUG}
      title="Sliding Puzzle"
      tagline="Slide the numbered tiles back into order in as few moves as you can. Classic 15-puzzle, mobile friendly."
      keywords="sliding puzzle, 15 puzzle online, tile puzzle game, free sliding tile game"
      stats={[
        { label: 'Moves', value: moves, accent: true },
        { label: 'Best', value: best ?? '—' },
        { label: 'Time', value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` }
      ]}
      onRestart={restart}
      restartLabel="Shuffle"
      howTo={[
        'Tap any tile next to the empty square to slide it across.',
        'On desktop you can also use the arrow keys; on a phone, swipe towards the gap.',
        'Get the tiles into order, 1 through 15, with the gap in the bottom-right corner.',
        'Your best is the lowest move count you have ever finished with.'
      ]}
      about={
        <p>
          Every shuffle is produced by walking the empty square through hundreds of random legal moves,
          so the board you get is always solvable — unlike a naive random scramble, which is impossible
          to finish half the time. A good solve usually takes between 80 and 150 moves.
        </p>
      }
    >
      <div className="relative">
        <div
          ref={boardRef}
          className="mx-auto w-full max-w-sm aspect-square grid grid-cols-4 gap-2 p-2 sm:p-3 rounded-2xl bg-[#E6EAE8] touch-none select-none"
        >
          {tiles.map((value, index) =>
            value === BLANK ? (
              <div key={index} className="rounded-xl bg-[#DADEDC]/60" />
            ) : (
              <button
                key={index}
                onClick={() => slide(index)}
                className={`rounded-xl text-xl sm:text-3xl font-bold tabular-nums transition-all ${
                  canMove(index)
                    ? 'bg-primary text-white shadow-sm shadow-primary/30 active:scale-95'
                    : 'bg-white text-ink'
                }`}
              >
                {value}
              </button>
            )
          )}
        </div>

        <GameOverlay
          show={won}
          tone="win"
          title="Solved!"
          subtitle={`${moves} moves in ${Math.floor(seconds / 60)}m ${seconds % 60}s.`}
          actionLabel="Shuffle again"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
