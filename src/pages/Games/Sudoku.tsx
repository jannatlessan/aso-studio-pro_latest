import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eraser } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'sudoku';

type Grid = number[]; // 81 cells, 0 = empty

const DIFFICULTY = {
  Easy: 44,
  Medium: 34,
  Hard: 28
} as const;

type Difficulty = keyof typeof DIFFICULTY;

const shuffle = <T,>(list: T[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

function canPlace(grid: Grid, index: number, value: number) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  for (let i = 0; i < 9; i++) {
    if (grid[row * 9 + i] === value) return false;
    if (grid[i * 9 + col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r * 9 + c] === value) return false;
    }
  }
  return true;
}

/** Randomised backtracking fill — produces a different complete board every time. */
function fillSolution(grid: Grid): boolean {
  const index = grid.indexOf(0);
  if (index === -1) return true;
  for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (canPlace(grid, index, value)) {
      grid[index] = value;
      if (fillSolution(grid)) return true;
      grid[index] = 0;
    }
  }
  return false;
}

/** Counts solutions, stopping at `limit` — used to keep every generated puzzle uniquely solvable. */
function countSolutions(grid: Grid, limit = 2): number {
  const index = grid.indexOf(0);
  if (index === -1) return 1;
  let found = 0;
  for (let value = 1; value <= 9; value++) {
    if (!canPlace(grid, index, value)) continue;
    grid[index] = value;
    found += countSolutions(grid, limit - found);
    grid[index] = 0;
    if (found >= limit) break;
  }
  return found;
}

function generate(difficulty: Difficulty) {
  const solution: Grid = Array(81).fill(0);
  fillSolution(solution);

  const puzzle = [...solution];
  const targetGivens = DIFFICULTY[difficulty];
  for (const index of shuffle([...Array(81).keys()])) {
    if (puzzle.filter((v) => v !== 0).length <= targetGivens) break;
    const backup = puzzle[index];
    puzzle[index] = 0;
    // Keep the removal only if the puzzle still has exactly one solution.
    if (countSolutions([...puzzle]) !== 1) puzzle[index] = backup;
  }
  return { puzzle, solution };
}

/** Indices that conflict with another filled cell of the same value. */
function conflicts(grid: Grid) {
  const bad = new Set<number>();
  for (let index = 0; index < 81; index++) {
    const value = grid[index];
    if (!value) continue;
    const copy = [...grid];
    copy[index] = 0;
    if (!canPlace(copy, index, value)) bad.add(index);
  }
  return bad;
}

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [{ puzzle, solution }, setGame] = useState(() => generate('Easy'));
  const [grid, setGrid] = useState<Grid>(puzzle);
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(`${SLUG}.${difficulty.toLowerCase()}`, 'min');

  const bad = useMemo(() => conflicts(grid), [grid]);
  const remaining = grid.filter((v) => v === 0).length;

  const newGame = useCallback((level: Difficulty) => {
    const next = generate(level);
    setGame(next);
    setGrid(next.puzzle);
    setDifficulty(level);
    setSelected(null);
    setSeconds(0);
    setWon(false);
    setIsRecord(false);
  }, []);

  const restart = useCallback(() => newGame(difficulty), [newGame, difficulty]);

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [won]);

  const setValue = useCallback(
    (value: number) => {
      if (selected === null || won) return;
      if (puzzle[selected] !== 0) return; // givens are locked
      setGrid((current) => {
        const next = [...current];
        next[selected] = next[selected] === value ? 0 : value;
        return next;
      });
    },
    [selected, puzzle, won]
  );

  // A board is solved when it is full and matches the unique solution it was generated from.
  useEffect(() => {
    if (won) return;
    if (grid.some((v, i) => v !== solution[i])) return;
    setWon(true);
    setIsRecord(submit(seconds));
  }, [grid, solution, won, seconds, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') setValue(Number(e.key));
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') setValue(grid[selected ?? 0]);
      if (selected === null) return;
      if (e.key === 'ArrowRight') setSelected(Math.min(80, selected + 1));
      if (e.key === 'ArrowLeft') setSelected(Math.max(0, selected - 1));
      if (e.key === 'ArrowDown') setSelected(Math.min(80, selected + 9));
      if (e.key === 'ArrowUp') setSelected(Math.max(0, selected - 9));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setValue, selected, grid]);

  const selectedValue = selected !== null ? grid[selected] : 0;

  return (
    <GameShell
      slug={SLUG}
      title="Sudoku"
      tagline="Fill the 9x9 grid so every row, column, and box holds the digits 1 to 9 exactly once."
      keywords="sudoku online, free sudoku, play sudoku browser, easy medium hard sudoku"
      stats={[
        { label: 'Left', value: remaining, accent: true },
        { label: 'Time', value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` },
        { label: 'Best', value: best !== null ? `${Math.floor(best / 60)}:${String(best % 60).padStart(2, '0')}` : '—' },
        { label: 'Level', value: difficulty }
      ]}
      onRestart={restart}
      restartLabel="New puzzle"
      howTo={[
        'Tap an empty cell, then tap a number from the pad below to place it.',
        'Tap the same number again, or use the eraser, to clear the cell.',
        'Digits that clash with another in the same row, column, or box turn red.',
        'Fill the whole grid correctly to win. Pick a harder level for fewer starting clues.'
      ]}
      about={
        <p>
          Every puzzle is generated fresh in your browser and then checked to make sure it has exactly
          one solution, so you never have to guess. Easy boards start with 44 clues, Medium with 34, and
          Hard with 28.
        </p>
      }
    >
      <div className="relative">
        <div className="mx-auto w-full max-w-sm">
          <div className="grid grid-cols-9 rounded-xl overflow-hidden border-2 border-ink/70 bg-white select-none">
            {grid.map((value, index) => {
              const isGiven = puzzle[index] !== 0;
              const row = Math.floor(index / 9);
              const col = index % 9;
              const isSelected = selected === index;
              const sameValue = !isSelected && value !== 0 && value === selectedValue;
              const inLine =
                selected !== null &&
                !isSelected &&
                (row === Math.floor(selected / 9) ||
                  col === selected % 9 ||
                  (Math.floor(row / 3) === Math.floor(Math.floor(selected / 9) / 3) &&
                    Math.floor(col / 3) === Math.floor((selected % 9) / 3)));

              return (
                <button
                  key={index}
                  onClick={() => setSelected(index)}
                  className={`aspect-square flex items-center justify-center text-sm sm:text-lg font-semibold tabular-nums transition-colors
                    ${col % 3 === 2 && col !== 8 ? 'border-r-2 border-r-ink/50' : 'border-r border-r-black/10'}
                    ${row % 3 === 2 && row !== 8 ? 'border-b-2 border-b-ink/50' : 'border-b border-b-black/10'}
                    ${isSelected ? 'bg-primary text-white' : sameValue ? 'bg-[#CFEFDD]' : inLine ? 'bg-[#F2F6F4]' : 'bg-white'}
                    ${bad.has(index) && !isSelected ? 'text-[#B91C1C] bg-[#FDE2E2]' : isGiven ? 'text-ink' : isSelected ? '' : 'text-primary'}
                  `}
                >
                  {value || ''}
                </button>
              );
            })}
          </div>
        </div>

        <GameOverlay
          show={won}
          tone="win"
          title="Solved!"
          subtitle={`${difficulty} puzzle finished in ${Math.floor(seconds / 60)}m ${seconds % 60}s.`}
          actionLabel="New puzzle"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>

      <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-2 max-w-sm mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const used = grid.filter((v) => v === n).length >= 9;
          return (
            <button
              key={n}
              onClick={() => setValue(n)}
              className={`h-11 rounded-xl border text-base font-bold transition-all active:scale-95 ${
                used
                  ? 'border-black/10 bg-[#F6F8F7] text-[#B9C1BC]'
                  : 'border-black/10 bg-white text-ink hover:border-primary/40 hover:text-primary'
              }`}
            >
              {n}
            </button>
          );
        })}
        <button
          onClick={() => selectedValue && setValue(selectedValue)}
          className="h-11 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] inline-flex items-center justify-center hover:border-primary/40 hover:text-primary transition-all active:scale-95"
          title="Erase"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {(Object.keys(DIFFICULTY) as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => newGame(level)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              difficulty === level
                ? 'border-primary/40 bg-mint text-primary'
                : 'border-black/10 bg-white text-[#55605B] hover:border-primary/30'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </GameShell>
  );
}
