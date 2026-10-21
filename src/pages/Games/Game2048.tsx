import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { keyToDirection, useSwipe, type Direction } from '../../hooks/useSwipe';

const SIZE = 4;
const SLUG = '2048';

type Board = number[];

const emptyBoard = (): Board => Array(SIZE * SIZE).fill(0);

function spawn(board: Board) {
  const free: number[] = [];
  board.forEach((v, i) => {
    if (v === 0) free.push(i);
  });
  if (!free.length) return;
  board[free[Math.floor(Math.random() * free.length)]] = Math.random() < 0.9 ? 2 : 4;
}

function freshBoard(): Board {
  const board = emptyBoard();
  spawn(board);
  spawn(board);
  return board;
}

/** Cell indices for one line, ordered from the wall the tiles are pushed against. */
function lineIndices(dir: Direction, line: number): number[] {
  const base: number[] = [];
  for (let i = 0; i < SIZE; i++) {
    base.push(dir === 'left' || dir === 'right' ? line * SIZE + i : i * SIZE + line);
  }
  return dir === 'right' || dir === 'down' ? base.reverse() : base;
}

/** Compacts one line toward the wall, merging each pair at most once. */
function collapse(values: number[]) {
  const tiles = values.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      const merged = tiles[i] * 2;
      out.push(merged);
      gained += merged;
      i++;
    } else {
      out.push(tiles[i]);
    }
  }
  while (out.length < SIZE) out.push(0);
  return { out, gained };
}

function move(board: Board, dir: Direction) {
  const next = [...board];
  let gained = 0;
  let moved = false;
  for (let line = 0; line < SIZE; line++) {
    const idx = lineIndices(dir, line);
    const { out, gained: g } = collapse(idx.map((i) => board[i]));
    gained += g;
    idx.forEach((cellIndex, position) => {
      if (next[cellIndex] !== out[position]) moved = true;
      next[cellIndex] = out[position];
    });
  }
  return { board: next, gained, moved };
}

const hasMoves = (board: Board) =>
  (['up', 'down', 'left', 'right'] as Direction[]).some((d) => move(board, d).moved);

/** Brand-green ramp: the bigger the tile, the deeper the green and the lighter the text. */
function tileStyle(value: number) {
  if (value === 0) return 'bg-[#F0F3F1] text-transparent';
  const ramp: Record<number, string> = {
    2: 'bg-mint text-ink',
    4: 'bg-[#D3F3E0] text-ink',
    8: 'bg-[#A9E7C4] text-ink',
    16: 'bg-[#7CD9A6] text-ink',
    32: 'bg-[#4FCB89] text-white',
    64: 'bg-[#2EBA6B] text-white',
    128: 'bg-primary text-white',
    256: 'bg-[#0C8D49] text-white',
    512: 'bg-[#0A7D40] text-white',
    1024: 'bg-[#076C37] text-white',
    2048: 'bg-primary-dark text-white ring-2 ring-primary/40'
  };
  return ramp[value] ?? 'bg-primary-dark text-white ring-2 ring-primary/40';
}

const fontForValue = (value: number) =>
  value >= 1024 ? 'text-lg sm:text-2xl' : value >= 128 ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-4xl';

export default function Game2048() {
  const [board, setBoard] = useState<Board>(freshBoard);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);
  const boardRef = useRef<HTMLDivElement>(null);

  // Mirrors of the board and the over flag, so two key presses inside one frame both land on the
  // up-to-date board instead of the one React has re-rendered with.
  const liveBoard = useRef(board);
  const liveOver = useRef(false);

  const restart = useCallback(() => {
    const next = freshBoard();
    liveBoard.current = next;
    liveOver.current = false;
    setBoard(next);
    setScore(0);
    setOver(false);
    setWon(false);
    setWinDismissed(false);
    setIsRecord(false);
  }, []);

  const play = useCallback((dir: Direction) => {
    if (liveOver.current) return;
    const result = move(liveBoard.current, dir);
    if (!result.moved) return;
    spawn(result.board);
    liveBoard.current = result.board;
    setBoard(result.board);
    if (result.gained) setScore((s) => s + result.gained);
    if (result.board.includes(2048)) setWon(true);
    if (!hasMoves(result.board)) {
      liveOver.current = true;
      setOver(true);
    }
  }, []);

  // Record the run only once it is finished, so the stored best is a completed score.
  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = keyToDirection(e.key);
      if (!dir) return;
      e.preventDefault();
      play(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [play]);

  useSwipe(boardRef, play);

  return (
    <GameShell
      slug={SLUG}
      title="2048"
      tagline="Swipe to merge matching tiles and chase the elusive 2048 tile before the board jams up."
      keywords="2048 game, play 2048 online, free 2048, merge tiles game"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Top tile', value: Math.max(...board) }
      ]}
      onRestart={restart}
      restartLabel="New game"
      howTo={[
        'Swipe on the board, or use the arrow keys, to push every tile in that direction.',
        'Two tiles with the same number merge into one tile worth double — that is your score.',
        'A new tile appears after every move that changes the board.',
        'Reach 2048 to win. If no move is left, the run is over.'
      ]}
      about={
        <>
          <p>
            2048 is a single-player sliding puzzle where the whole board moves at once. The trick is to keep
            your largest tile parked in a corner and never swipe in the direction that would pull it away.
          </p>
          <p>
            Everything runs locally in your browser, and your best score is saved on this device only.
          </p>
        </>
      }
    >
      <div className="relative">
        <div
          ref={boardRef}
          className="mx-auto w-full max-w-sm aspect-square grid grid-cols-4 gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-[#E6EAE8] touch-none select-none"
        >
          {board.map((value, i) => (
            <div
              key={i}
              className={`rounded-xl flex items-center justify-center font-bold tabular-nums transition-colors duration-150 ${tileStyle(
                value
              )} ${fontForValue(value)}`}
            >
              {value || ''}
            </div>
          ))}
        </div>

        <GameOverlay
          show={over}
          tone="lose"
          title="No moves left"
          subtitle={`You finished with ${score.toLocaleString()} points.`}
          onAction={restart}
          isRecord={isRecord}
        />
        <GameOverlay
          show={won && !winDismissed && !over}
          tone="win"
          title="2048 reached!"
          subtitle="You can keep merging for a higher score."
          actionLabel="Keep playing"
          onAction={() => setWinDismissed(true)}
        />
      </div>

      {/* On-screen pad so the game is fully playable without a keyboard or a swipe. */}
      <div className="mt-4 grid grid-cols-3 gap-2 max-w-[180px] mx-auto sm:hidden">
        <span />
        <PadButton label="▲" onPress={() => play('up')} />
        <span />
        <PadButton label="◀" onPress={() => play('left')} />
        <PadButton label="▼" onPress={() => play('down')} />
        <PadButton label="▶" onPress={() => play('right')} />
      </div>
    </GameShell>
  );
}

function PadButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="h-11 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] font-bold active:scale-95 active:bg-mint active:text-primary transition-all"
    >
      {label}
    </button>
  );
}
