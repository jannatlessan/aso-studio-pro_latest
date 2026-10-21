import { useCallback, useEffect, useRef, useState } from 'react';
import { Undo2 } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { keyToDirection, useSwipe, type Direction } from '../../hooks/useSwipe';
import { audio } from '../../lib/gameAudio';

const SLUG = '2048';

type Size = 4 | 5;

interface Tile {
  id: number;
  value: number;
  r: number;
  c: number;
  /** Set on the tile produced by a merge, so it can play the bump animation. */
  merged?: boolean;
  /** Set on a freshly spawned tile, so it can fade/scale in. */
  spawned?: boolean;
  /** A consumed tile: it slides to the merge target, then is removed. */
  dying?: boolean;
}

let tileId = 1;
const nextId = () => tileId++;

/** Cell indices for one line, ordered from the wall the tiles are pushed against. */
function lineIndices(size: number, dir: Direction, line: number): [number, number][] {
  const base: [number, number][] = [];
  for (let i = 0; i < size; i++) {
    base.push(dir === 'left' || dir === 'right' ? [line, i] : [i, line]);
  }
  return dir === 'right' || dir === 'down' ? base.reverse() : base;
}

interface MoveResult {
  tiles: Tile[];
  gained: number;
  moved: boolean;
  biggestMerge: number;
}

/**
 * Computes the post-move board. Consumed tiles are kept (flagged `dying`) at the merge target so
 * the UI can animate them sliding in before they are dropped a frame later — that slide is what
 * makes the board feel physical rather than snapping between states.
 */
function moveTiles(tiles: Tile[], size: number, dir: Direction): MoveResult {
  const grid: (Tile | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  tiles.forEach((t) => {
    grid[t.r][t.c] = t;
  });

  const out: Tile[] = [];
  let gained = 0;
  let moved = false;
  let biggestMerge = 0;

  for (let line = 0; line < size; line++) {
    const idx = lineIndices(size, dir, line);
    const lineTiles = idx.map(([r, c]) => grid[r][c]).filter(Boolean) as Tile[];
    let target = 0;
    let i = 0;

    while (i < lineTiles.length) {
      const a = lineTiles[i];
      const b = lineTiles[i + 1];
      const [tr, tc] = idx[target];

      if (b && a.value === b.value) {
        const value = a.value * 2;
        out.push({ ...a, r: tr, c: tc, dying: true, merged: false, spawned: false });
        out.push({ ...b, r: tr, c: tc, dying: true, merged: false, spawned: false });
        out.push({ id: nextId(), value, r: tr, c: tc, merged: true });
        gained += value;
        biggestMerge = Math.max(biggestMerge, value);
        moved = true;
        i += 2;
      } else {
        if (a.r !== tr || a.c !== tc) moved = true;
        out.push({ ...a, r: tr, c: tc, merged: false, spawned: false });
        i += 1;
      }
      target++;
    }
  }

  return { tiles: out, gained, moved, biggestMerge };
}

const liveTiles = (tiles: Tile[]) => tiles.filter((t) => !t.dying);

function spawnTile(tiles: Tile[], size: number): Tile | null {
  const taken = new Set(liveTiles(tiles).map((t) => `${t.r},${t.c}`));
  const free: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!taken.has(`${r},${c}`)) free.push([r, c]);
    }
  }
  if (!free.length) return null;
  const [r, c] = free[Math.floor(Math.random() * free.length)];
  return { id: nextId(), value: Math.random() < 0.9 ? 2 : 4, r, c, spawned: true };
}

function freshTiles(size: number): Tile[] {
  let tiles: Tile[] = [];
  for (let i = 0; i < 2; i++) {
    const tile = spawnTile(tiles, size);
    if (tile) tiles = [...tiles, tile];
  }
  return tiles;
}

const hasMoves = (tiles: Tile[], size: number) => {
  const live = liveTiles(tiles);
  if (live.length < size * size) return true;
  return (['up', 'down', 'left', 'right'] as Direction[]).some((d) => moveTiles(live, size, d).moved);
};

/** Brand-green ramp: the bigger the tile, the deeper the green and the lighter the text. */
const TILE_STYLE: Record<number, string> = {
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

const tileStyle = (value: number) => TILE_STYLE[value] ?? 'bg-primary-dark text-white ring-2 ring-primary/40';

const fontSize = (value: number, size: Size) => {
  const big = size === 4;
  if (value >= 1024) return big ? 'text-xl sm:text-2xl' : 'text-base sm:text-xl';
  if (value >= 128) return big ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl';
  return big ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';
};

interface Snapshot {
  tiles: Tile[];
  score: number;
}

export default function Game2048() {
  const [size, setSize] = useState<Size>(4);
  const [tiles, setTiles] = useState<Tile[]>(() => freshTiles(4));
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const [pops, setPops] = useState<{ id: number; text: string }[]>([]);
  const [undoLeft, setUndoLeft] = useState(1);

  const { best, submit } = useBestScore(`${SLUG}.${size}`);
  const boardRef = useRef<HTMLDivElement>(null);

  // The board is advanced from event handlers that can fire several times before React re-renders,
  // so the refs are the authority and state mirrors them.
  const live = useRef<Tile[]>(tiles);
  const liveScore = useRef(0);
  const liveOver = useRef(false);
  const snapshot = useRef<Snapshot | null>(null);
  const timers = useRef<number[]>([]);
  // The id of the pending "settle" step (drop consumed tiles, spawn the new one). A move that
  // arrives while it is pending settles it immediately instead of being dropped, so swiping fast
  // never loses an input.
  const settleTimer = useRef<number | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const reset = useCallback((nextSize: Size) => {
    clearTimers();
    const fresh = freshTiles(nextSize);
    live.current = fresh;
    liveScore.current = 0;
    liveOver.current = false;
    snapshot.current = null;
    settleTimer.current = null;
    setTiles(fresh);
    setCanUndo(false);
    setScore(0);
    setOver(false);
    setWon(false);
    setWinDismissed(false);
    setIsRecord(false);
    setPops([]);
    setUndoLeft(1);
  }, []);

  const restart = useCallback(() => reset(size), [reset, size]);

  /** Finishes a move: removes the consumed tiles and drops in the next one. */
  const settle = useCallback(() => {
    if (settleTimer.current === null) return;
    clearTimeout(settleTimer.current);
    settleTimer.current = null;

    const survivors = liveTiles(live.current).map((t) => ({ ...t, merged: false, spawned: false }));
    const spawned = spawnTile(survivors, size);
    const next = spawned ? [...survivors, spawned] : survivors;
    live.current = next;
    setTiles(next);

    if (next.some((t) => t.value >= 2048)) setWon(true);
    if (!hasMoves(next, size)) {
      liveOver.current = true;
      setOver(true);
      audio.play('gameover');
    }
  }, [size]);

  const play = useCallback(
    (dir: Direction) => {
      if (liveOver.current) return;
      // A queued settle is applied first, so a fast second swipe acts on the finished board.
      if (settleTimer.current !== null) settle();

      const current = liveTiles(live.current);
      const result = moveTiles(current, size, dir);
      if (!result.moved) return;

      snapshot.current = { tiles: current.map((t) => ({ ...t })), score: liveScore.current };
      setCanUndo(undoLeft > 0);

      // Frame 1: everything (including consumed tiles) slides to its new cell.
      live.current = result.tiles;
      setTiles(result.tiles);

      if (result.gained) {
        liveScore.current += result.gained;
        setScore(liveScore.current);
        const popId = nextId();
        setPops((p) => [...p.slice(-3), { id: popId, text: `+${result.gained}` }]);
        timers.current.push(
          window.setTimeout(() => setPops((x) => x.filter((item) => item.id !== popId)), 700)
        );
        // Higher merges ring out brighter.
        audio.play('merge', Math.min(2, 0.85 + Math.log2(result.biggestMerge) * 0.07));
      } else {
        audio.play('move');
      }

      // Frame 2: drop the consumed tiles and drop in the new one.
      settleTimer.current = window.setTimeout(settle, 120);
    },
    [size, settle, undoLeft]
  );

  const undo = useCallback(() => {
    if (!snapshot.current || undoLeft <= 0 || liveOver.current) return;
    clearTimers();
    if (settleTimer.current !== null) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    const { tiles: previous, score: previousScore } = snapshot.current;
    snapshot.current = null;
    setCanUndo(false);
    live.current = previous;
    liveScore.current = previousScore;
    setTiles(previous);
    setScore(previousScore);
    setUndoLeft((n) => n - 1);
    audio.play('ui');
  }, [undoLeft]);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  useEffect(() => {
    if (won && !winDismissed) audio.play('win');
  }, [won, winDismissed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        undo();
        return;
      }
      const dir = keyToDirection(e.key);
      if (!dir) return;
      e.preventDefault();
      play(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [play, undo]);

  useSwipe(boardRef, play);

  const topTile = tiles.reduce((max, t) => (t.dying ? max : Math.max(max, t.value)), 0);
  const cellPercent = 100 / size;

  return (
    <GameShell
      slug={SLUG}
      title="2048"
      tagline="Swipe to merge matching tiles and chase the elusive 2048 tile before the board jams up."
      keywords="2048 game, play 2048 online, free 2048, merge tiles game, 2048 5x5"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Top tile', value: topTile },
        { label: 'Board', value: `${size}×${size}` }
      ]}
      onRestart={restart}
      sound
      restartLabel="New game"
      actions={
        <button
          onClick={undo}
          disabled={!canUndo || undoLeft <= 0}
          aria-label="Undo last move"
          title="Undo last move"
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] hover:text-primary hover:border-primary/30 active:scale-95 transition-all disabled:opacity-40"
        >
          <Undo2 className="w-4 h-4" />
        </button>
      }
      howTo={[
        'Swipe the board, use the arrow keys, or tap the pad to push every tile one way.',
        'Two tiles with the same number merge into one worth double — that is your score.',
        'A new tile appears after every move that changes the board.',
        'Reach 2048 to win, then keep going for a higher score. One undo per game.'
      ]}
      about={
        <>
          <p>
            The winning strategy is to keep your largest tile pinned in one corner and never swipe in
            the direction that would pull it away — build along one edge and the merges cascade.
          </p>
          <p>
            The 5×5 board is the gentler variant: more room means fewer dead ends, but 2048 takes
            noticeably longer to reach. Each board size keeps its own best score.
          </p>
        </>
      }
    >
      <div className="relative">
        <div className="relative mx-auto w-full max-w-sm">
          {/* floating score popups */}
          <div className="absolute -top-1 right-2 z-20 pointer-events-none">
            {pops.map((pop) => (
              <span
                key={pop.id}
                className="block text-lg font-bold text-primary animate-[floatUp_700ms_ease-out_forwards]"
              >
                {pop.text}
              </span>
            ))}
          </div>

          <div
            ref={boardRef}
            className="relative w-full aspect-square rounded-2xl bg-[#E6EAE8] p-1.5 sm:p-2 touch-none select-none overflow-hidden"
          >
            {/* empty cells */}
            <div className="absolute inset-1.5 sm:inset-2">
              <div
                className="grid gap-0 w-full h-full"
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: size * size }).map((_, i) => (
                  <div key={i} className="p-1 sm:p-1.5">
                    <div className="w-full h-full rounded-xl bg-[#F0F3F1]" />
                  </div>
                ))}
              </div>
            </div>

            {/* tiles */}
            <div className="absolute inset-1.5 sm:inset-2">
              {tiles.map((tile) => (
                <div
                  key={tile.id}
                  className="absolute top-0 left-0 will-change-transform"
                  style={{
                    width: `${cellPercent}%`,
                    height: `${cellPercent}%`,
                    transform: `translate(${tile.c * 100}%, ${tile.r * 100}%)`,
                    transition: 'transform 110ms cubic-bezier(0.25, 0.9, 0.3, 1)',
                    zIndex: tile.dying ? 1 : tile.merged ? 3 : 2
                  }}
                >
                  <div className="absolute inset-1 sm:inset-1.5">
                    <div
                      className={`w-full h-full rounded-xl flex items-center justify-center font-bold tabular-nums shadow-sm ${tileStyle(
                        tile.value
                      )} ${fontSize(tile.value, size)} ${
                        tile.merged
                          ? 'animate-[tilePop_170ms_ease-out]'
                          : tile.spawned
                          ? 'animate-[tileAppear_150ms_ease-out]'
                          : ''
                      }`}
                    >
                      {tile.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <GameOverlay
          show={over}
          tone="lose"
          title="No moves left"
          subtitle={`You finished with ${score.toLocaleString()} points and a ${topTile} tile.`}
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
      <div className="mt-4 grid grid-cols-3 gap-2 max-w-[190px] mx-auto sm:hidden">
        <span />
        <PadButton label="▲" onPress={() => play('up')} />
        <span />
        <PadButton label="◀" onPress={() => play('left')} />
        <PadButton label="▼" onPress={() => play('down')} />
        <PadButton label="▶" onPress={() => play('right')} />
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {([4, 5] as Size[]).map((option) => (
          <button
            key={option}
            onClick={() => {
              setSize(option);
              reset(option);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              size === option
                ? 'border-primary/40 bg-mint text-primary'
                : 'border-black/10 bg-white text-[#55605B] hover:border-primary/30'
            }`}
          >
            {option}×{option}
          </button>
        ))}
      </div>
    </GameShell>
  );
}

function PadButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className="h-12 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] font-bold active:scale-95 active:bg-mint active:text-primary transition-all touch-none"
    >
      {label}
    </button>
  );
}
