import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'tic-tac-toe';

type Mark = 'X' | 'O' | null;
type Board = Mark[];
type Mode = 'Easy' | 'Perfect' | '2 Player';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function winnerOf(board: Board): { mark: Mark; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { mark: board[a], line };
    }
  }
  return null;
}

const openCells = (board: Board) => board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

/**
 * Minimax with depth preference, so the computer wins as quickly as it can and loses as slowly as
 * it can. 'O' is the computer.
 */
function minimax(board: Board, turn: Mark, depth = 0): { score: number; move: number } {
  const result = winnerOf(board);
  if (result) return { score: result.mark === 'O' ? 10 - depth : depth - 10, move: -1 };
  const open = openCells(board);
  if (!open.length) return { score: 0, move: -1 };

  let bestScore = turn === 'O' ? -Infinity : Infinity;
  let bestMove = open[0];

  for (const move of open) {
    const next = [...board];
    next[move] = turn;
    const { score } = minimax(next, turn === 'O' ? 'X' : 'O', depth + 1);
    if (turn === 'O' ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { score: bestScore, move: bestMove };
}

/** Easy mode blocks or wins when it is obvious, and otherwise plays at random. */
function easyMove(board: Board): number {
  const open = openCells(board);
  for (const mark of ['O', 'X'] as Mark[]) {
    for (const move of open) {
      const next = [...board];
      next[move] = mark;
      if (winnerOf(next)?.mark === mark) return move;
    }
  }
  return open[Math.floor(Math.random() * open.length)];
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<Mark>('X');
  const [mode, setMode] = useState<Mode>('Perfect');
  const [tally, setTally] = useState({ wins: 0, draws: 0, losses: 0 });
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(`${SLUG}.wins`);

  const result = winnerOf(board);
  const full = openCells(board).length === 0;
  const finished = Boolean(result) || full;
  const settled = useRef(false);
  const thinking = useRef<number | null>(null);
  // Guards the all-time win tally against double counting when `best` updates and the effect re-runs.
  const counted = useRef(false);

  const reset = useCallback(() => {
    if (thinking.current !== null) clearTimeout(thinking.current);
    settled.current = false;
    counted.current = false;
    setBoard(Array(9).fill(null));
    setTurn('X');
  }, []);

  const restart = useCallback(() => {
    setTally({ wins: 0, draws: 0, losses: 0 });
    setIsRecord(false);
    reset();
  }, [reset]);

  useEffect(() => () => {
    if (thinking.current !== null) clearTimeout(thinking.current);
  }, []);

  // Record the outcome once per finished game.
  useEffect(() => {
    if (!finished || settled.current) return;
    settled.current = true;
    if (!result) {
      setTally((t) => ({ ...t, draws: t.draws + 1 }));
      return;
    }
    if (result.mark === 'X') {
      setTally((t) => ({ ...t, wins: t.wins + 1 }));
    } else {
      setTally((t) => ({ ...t, losses: t.losses + 1 }));
    }
  }, [finished, result]);

  // Persisted best is a lifetime count of wins against the computer.
  useEffect(() => {
    if (mode === '2 Player') return;
    if (!finished || result?.mark !== 'X' || counted.current) return;
    counted.current = true;
    setIsRecord(submit((best ?? 0) + 1));
  }, [finished, result, best, submit, mode]);

  const play = (index: number) => {
    if (board[index] || finished) return;
    if (mode !== '2 Player' && turn !== 'X') return;
    const next = [...board];
    next[index] = turn;
    setBoard(next);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  // Computer turn.
  useEffect(() => {
    if (mode === '2 Player' || turn !== 'O' || finished) return;
    thinking.current = window.setTimeout(() => {
      const move = mode === 'Perfect' ? minimax(board, 'O').move : easyMove(board);
      if (move < 0) return;
      const next = [...board];
      next[move] = 'O';
      setBoard(next);
      setTurn('X');
    }, 320);
    return () => {
      if (thinking.current !== null) clearTimeout(thinking.current);
    };
  }, [turn, board, finished, mode]);

  const statusText = finished
    ? result
      ? `${result.mark} wins`
      : 'Draw'
    : mode === '2 Player'
    ? `${turn} to play`
    : turn === 'X'
    ? 'Your turn'
    : 'Thinking…';

  return (
    <GameShell
      slug={SLUG}
      title="Tic-Tac-Toe"
      tagline="Three in a row against a perfect computer opponent, or pass the phone for two-player mode."
      keywords="tic tac toe online, noughts and crosses free, play tic tac toe vs computer, xo game"
      stats={[
        { label: 'Won', value: tally.wins, accent: true },
        { label: 'Drawn', value: tally.draws },
        { label: 'Lost', value: tally.losses },
        { label: 'All-time', value: best ?? 0 }
      ]}
      onRestart={restart}
      restartLabel="Reset score"
      howTo={[
        'You are X and always move first. Tap any empty square.',
        'Get three of your marks in a row, column, or diagonal to win.',
        'Perfect mode uses full minimax search — the best you can do is a draw.',
        'Switch to Easy for a beatable opponent, or 2 Player to share one screen.'
      ]}
      about={
        <p>
          Tic-tac-toe is a solved game: with both sides playing perfectly every game is a draw. The
          Perfect opponent searches the entire remaining game tree and prefers faster wins and slower
          losses, so if you ever beat it, something has gone very wrong.
        </p>
      }
    >
      <div className="relative">
        <p className="text-center text-sm font-semibold text-[#55605B] mb-4">{statusText}</p>

        <div className="mx-auto w-full max-w-[280px] grid grid-cols-3 gap-2">
          {board.map((mark, index) => {
            const inWin = result?.line.includes(index);
            return (
              <button
                key={index}
                onClick={() => play(index)}
                className={`aspect-square rounded-2xl border text-3xl sm:text-4xl font-bold transition-all ${
                  inWin
                    ? 'border-primary bg-mint text-primary'
                    : mark
                    ? 'border-black/10 bg-white text-ink'
                    : 'border-black/10 bg-[#F6F8F7] hover:border-primary/30 hover:bg-mint/50 active:scale-95'
                }`}
              >
                {mark}
              </button>
            );
          })}
        </div>

        <GameOverlay
          show={finished}
          tone={result?.mark === 'X' ? 'win' : result ? 'lose' : 'neutral'}
          title={result ? (result.mark === 'X' ? 'You win!' : mode === '2 Player' ? 'O wins!' : 'Computer wins') : 'Draw'}
          subtitle={
            mode === 'Perfect' && !result
              ? 'A draw is the best possible result against a perfect opponent.'
              : undefined
          }
          actionLabel="Next game"
          onAction={reset}
          isRecord={isRecord && result?.mark === 'X'}
        />
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {(['Easy', 'Perfect', '2 Player'] as Mode[]).map((option) => (
          <button
            key={option}
            onClick={() => {
              setMode(option);
              reset();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              mode === option
                ? 'border-primary/40 bg-mint text-primary'
                : 'border-black/10 bg-white text-[#55605B] hover:border-primary/30'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
