import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';

const SLUG = 'word-search';
const SIZE = 10;
const WORD_COUNT = 8;

const WORD_POOL = [
  'PIXEL', 'CANVAS', 'ROCKET', 'ISLAND', 'GUITAR', 'ORBIT', 'JUNGLE', 'MARBLE',
  'GALAXY', 'ANCHOR', 'BAMBOO', 'COMPASS', 'DOLPHIN', 'EMERALD', 'FOSSIL', 'HARBOUR',
  'LANTERN', 'MOSAIC', 'NOMAD', 'QUARTZ', 'VELVET', 'WALNUT', 'ZENITH', 'TEMPEST',
  'CIRCUIT', 'MAGNET', 'PUZZLE', 'SAFFRON'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const DIRECTIONS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1]
];

interface Puzzle {
  letters: string[];
  words: string[];
}

const shuffle = <T,>(list: T[]) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/** Places as many words as will fit in random directions, then fills the gaps with noise. */
function buildPuzzle(): Puzzle {
  const letters: string[] = Array(SIZE * SIZE).fill('');
  const placed: string[] = [];

  for (const word of shuffle(WORD_POOL)) {
    if (placed.length >= WORD_COUNT) break;
    if (word.length > SIZE) continue;

    const options = shuffle(DIRECTIONS);
    let done = false;

    for (const [dc, dr] of options) {
      if (done) break;
      const starts = shuffle([...Array(SIZE * SIZE).keys()]);
      for (const start of starts) {
        const row = Math.floor(start / SIZE);
        const col = start % SIZE;
        const endRow = row + dr * (word.length - 1);
        const endCol = col + dc * (word.length - 1);
        if (endRow < 0 || endRow >= SIZE || endCol < 0 || endCol >= SIZE) continue;

        // Overlaps are allowed only where the existing letter already matches.
        const cells: number[] = [];
        let fits = true;
        for (let i = 0; i < word.length; i++) {
          const index = (row + dr * i) * SIZE + (col + dc * i);
          const existing = letters[index];
          if (existing && existing !== word[i]) {
            fits = false;
            break;
          }
          cells.push(index);
        }
        if (!fits) continue;

        cells.forEach((index, i) => {
          letters[index] = word[i];
        });
        placed.push(word);
        done = true;
        break;
      }
    }
  }

  for (let i = 0; i < letters.length; i++) {
    if (!letters[i]) letters[i] = ALPHABET[Math.floor(Math.random() * 26)];
  }

  return { letters, words: placed.sort((a, b) => a.localeCompare(b)) };
}

/** The straight line of cells between two indices, or null if they are not aligned. */
function lineBetween(from: number, to: number): number[] | null {
  const r1 = Math.floor(from / SIZE);
  const c1 = from % SIZE;
  const r2 = Math.floor(to / SIZE);
  const c2 = to % SIZE;
  const dr = r2 - r1;
  const dc = c2 - c1;
  if (dr === 0 && dc === 0) return [from];
  const aligned = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!aligned) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = Math.sign(dr);
  const stepC = Math.sign(dc);
  return [...Array(steps + 1).keys()].map((i) => (r1 + stepR * i) * SIZE + (c1 + stepC * i));
}

export default function WordSearch() {
  const [puzzle, setPuzzle] = useState<Puzzle>(buildPuzzle);
  const [found, setFound] = useState<Record<string, number[]>>({});
  const [selection, setSelection] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG, 'min');

  const dragFrom = useRef<number | null>(null);
  // Pointer down, move and up can all land in a single frame on a quick drag, before React has
  // re-rendered — so the committed selection is read from a ref rather than from state.
  const liveSelection = useRef<number[]>([]);
  const timers = useRef<number[]>([]);

  const foundCells = useMemo(() => new Set(Object.values(found).flat()), [found]);
  const won = Object.keys(found).length === puzzle.words.length && puzzle.words.length > 0;

  const restart = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPuzzle(buildPuzzle());
    setFound({});
    setSelection([]);
    setSeconds(0);
    setWrong(false);
    setIsRecord(false);
    dragFrom.current = null;
    liveSelection.current = [];
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [won]);

  useEffect(() => {
    if (won) setIsRecord(submit(seconds));
  }, [won, seconds, submit]);

  const indexFromPoint = (clientX: number, clientY: number) => {
    const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const raw = element?.dataset?.cell;
    return raw === undefined ? null : Number(raw);
  };

  const commit = useCallback(
    (cells: number[]) => {
      if (cells.length < 2) return;
      const forward = cells.map((i) => puzzle.letters[i]).join('');
      const backward = [...forward].reverse().join('');
      const match = puzzle.words.find((word) => (word === forward || word === backward) && !found[word]);

      if (match) {
        setFound((current) => ({ ...current, [match]: cells }));
      } else {
        setWrong(true);
        timers.current.push(window.setTimeout(() => setWrong(false), 280));
      }
    },
    [puzzle, found]
  );

  const onPointerDown = (e: ReactPointerEvent) => {
    const index = indexFromPoint(e.clientX, e.clientY);
    if (index === null) return;
    dragFrom.current = index;
    liveSelection.current = [index];
    setSelection([index]);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (dragFrom.current === null) return;
    const index = indexFromPoint(e.clientX, e.clientY);
    if (index === null) return;
    const line = lineBetween(dragFrom.current, index);
    if (line) {
      liveSelection.current = line;
      setSelection(line);
    }
  };

  const onPointerUp = () => {
    if (dragFrom.current === null) return;
    commit(liveSelection.current);
    dragFrom.current = null;
    liveSelection.current = [];
    setSelection([]);
  };

  return (
    <GameShell
      slug={SLUG}
      title="Word Search"
      tagline="Drag across the grid to find every hidden word. Words run in any direction, including backwards."
      keywords="word search online, free word search puzzle, find the words game, hidden word grid"
      stats={[
        { label: 'Found', value: `${Object.keys(found).length}/${puzzle.words.length}`, accent: true },
        { label: 'Time', value: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` },
        { label: 'Best', value: best !== null ? `${Math.floor(best / 60)}:${String(best % 60).padStart(2, '0')}` : '—' }
      ]}
      onRestart={restart}
      restartLabel="New grid"
      howTo={[
        'Press on the first letter of a word and drag to its last letter.',
        'Words run horizontally, vertically, or diagonally — forwards or backwards.',
        'A correct word locks in green and is ticked off the list below.',
        'Find all eight to finish. Your best time is saved on this device.'
      ]}
      about={
        <p>
          Each grid is generated fresh: eight words are dropped into random directions, sharing letters
          wherever they happen to line up, and everything left over is filled with random letters. That
          overlap is what makes the decoys convincing.
        </p>
      }
    >
      <div className="relative">
        <div
          className="mx-auto w-full max-w-sm grid touch-none select-none rounded-xl overflow-hidden border border-black/10"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {puzzle.letters.map((letter, index) => {
            const isFound = foundCells.has(index);
            const isSelected = selection.includes(index);
            return (
              <div
                key={index}
                data-cell={index}
                className={`aspect-square flex items-center justify-center text-[11px] sm:text-sm font-semibold transition-colors ${
                  isFound
                    ? 'bg-primary text-white'
                    : isSelected
                    ? wrong
                      ? 'bg-[#FDE2E2] text-[#B91C1C]'
                      : 'bg-mint text-primary'
                    : 'bg-white text-ink'
                }`}
              >
                {letter}
              </div>
            );
          })}
        </div>

        <GameOverlay
          show={won}
          tone="win"
          title="All words found!"
          subtitle={`Finished in ${Math.floor(seconds / 60)}m ${seconds % 60}s.`}
          actionLabel="New grid"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {puzzle.words.map((word) => {
          const done = Boolean(found[word]);
          return (
            <span
              key={word}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                done
                  ? 'border-primary/30 bg-mint text-primary line-through'
                  : 'border-black/10 bg-[#F6F8F7] text-[#55605B]'
              }`}
            >
              {done && <Check className="w-3 h-3" />}
              {word}
            </span>
          );
        })}
      </div>
    </GameShell>
  );
}
