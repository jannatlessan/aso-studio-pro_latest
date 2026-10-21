import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowBigDown, ArrowBigLeft, ArrowBigRight, ChevronsDown, RotateCw } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';

const SLUG = 'tetro-blocks';
const COLS = 10;
const ROWS = 18;
const CELL = 18;
const W = COLS * CELL;
const H = ROWS * CELL;

type Shape = number[][];

// Classic seven tetrominoes. The index into COLORS is the value stored in the well.
const SHAPES: Shape[] = [
  [
    [1, 1, 1, 1]
  ],
  [
    [2, 2],
    [2, 2]
  ],
  [
    [0, 3, 0],
    [3, 3, 3]
  ],
  [
    [0, 4, 4],
    [4, 4, 0]
  ],
  [
    [5, 5, 0],
    [0, 5, 5]
  ],
  [
    [6, 0, 0],
    [6, 6, 6]
  ],
  [
    [0, 0, 7],
    [7, 7, 7]
  ]
];

const COLORS = [
  '',
  '#0E9D52',
  '#0A7D40',
  '#2EBA6B',
  '#4FCB89',
  '#006622',
  '#7CD9A6',
  '#0F766E'
];

const LINE_SCORE = [0, 100, 300, 500, 800];

interface Piece {
  shape: Shape;
  x: number;
  y: number;
}

interface State {
  well: number[][];
  piece: Piece | null;
  nextShape: Shape;
  dropTimer: number;
  lines: number;
  score: number;
  over: boolean;
  paused: boolean;
}

const emptyWell = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const randomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)].map((row) => [...row]);

/** Clockwise rotation of a shape matrix. */
const rotate = (shape: Shape): Shape =>
  shape[0].map((_, col) => shape.map((row) => row[col]).reverse());

function collides(well: number[][], piece: Piece) {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let col = 0; col < piece.shape[r].length; col++) {
      if (!piece.shape[r][col]) continue;
      const x = piece.x + col;
      const y = piece.y + r;
      if (x < 0 || x >= COLS || y >= ROWS) return true;
      if (y >= 0 && well[y][x]) return true;
    }
  }
  return false;
}

const spawn = (shape: Shape): Piece => ({
  shape,
  x: Math.floor((COLS - shape[0].length) / 2),
  y: -shape.length
});

const initialState = (): State => ({
  well: emptyWell(),
  piece: spawn(randomShape()),
  nextShape: randomShape(),
  dropTimer: 0,
  lines: 0,
  score: 0,
  over: false,
  paused: false
});

export default function TetroBlocks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<State>(initialState());

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [over, setOver] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const level = Math.floor(lines / 8) + 1;

  const restart = useCallback(() => {
    state.current = initialState();
    setScore(0);
    setLines(0);
    setOver(false);
    setIsRecord(false);
  }, []);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  /** Locks the current piece into the well, clears any full lines, and spawns the next one. */
  const lock = useCallback(() => {
    const s = state.current;
    if (!s.piece) return;
    s.piece.shape.forEach((row, r) =>
      row.forEach((value, col) => {
        const y = (s.piece as Piece).y + r;
        const x = (s.piece as Piece).x + col;
        if (value && y >= 0) s.well[y][x] = value;
      })
    );

    const kept = s.well.filter((row) => row.some((cell) => !cell));
    const cleared = ROWS - kept.length;
    if (cleared) {
      s.well = [...Array.from({ length: cleared }, () => Array(COLS).fill(0)), ...kept];
      s.lines += cleared;
      const currentLevel = Math.floor(s.lines / 8) + 1;
      s.score += LINE_SCORE[cleared] * currentLevel;
      setLines(s.lines);
      setScore(s.score);
    }

    const piece = spawn(s.nextShape);
    s.nextShape = randomShape();
    // No room for the new piece — the well is full.
    if (collides(s.well, piece)) {
      s.piece = null;
      s.over = true;
      setOver(true);
    } else {
      s.piece = piece;
    }
  }, []);

  const move = useCallback((dx: number) => {
    const s = state.current;
    if (!s.piece || s.over) return;
    const candidate = { ...s.piece, x: s.piece.x + dx };
    if (!collides(s.well, candidate)) s.piece = candidate;
  }, []);

  const softDrop = useCallback(() => {
    const s = state.current;
    if (!s.piece || s.over) return;
    const candidate = { ...s.piece, y: s.piece.y + 1 };
    if (collides(s.well, candidate)) {
      lock();
    } else {
      s.piece = candidate;
      s.score += 1;
      setScore(s.score);
    }
    s.dropTimer = 0;
  }, [lock]);

  const hardDrop = useCallback(() => {
    const s = state.current;
    if (!s.piece || s.over) return;
    let dropped = 0;
    while (!collides(s.well, { ...(s.piece as Piece), y: (s.piece as Piece).y + 1 })) {
      s.piece = { ...(s.piece as Piece), y: (s.piece as Piece).y + 1 };
      dropped++;
    }
    s.score += dropped * 2;
    setScore(s.score);
    lock();
  }, [lock]);

  const spin = useCallback(() => {
    const s = state.current;
    if (!s.piece || s.over) return;
    const rotated = rotate(s.piece.shape);
    // Try in place, then nudge off the wall by one or two cells (a simple wall kick).
    for (const offset of [0, -1, 1, -2, 2]) {
      const candidate: Piece = { shape: rotated, x: s.piece.x + offset, y: s.piece.y };
      if (!collides(s.well, candidate)) {
        s.piece = candidate;
        return;
      }
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          move(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          move(1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
        case 'x':
          e.preventDefault();
          spin();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, softDrop, spin, hardDrop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = sizeCanvas(canvas, W, H);
    const onResize = () => {
      ctx = sizeCanvas(canvas, W, H);
    };
    window.addEventListener('resize', onResize);

    const drawCell = (c: CanvasRenderingContext2D, x: number, y: number, value: number, size = CELL) => {
      c.fillStyle = COLORS[value];
      roundRect(c, x + 1, y + 1, size - 2, size - 2, 3);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.22)';
      roundRect(c, x + 3, y + 3, size - 6, (size - 6) / 2.4, 2);
      c.fill();
    };

    const stop = startLoop((dt) => {
      const c = ctx;
      if (!c) return;
      const s = state.current;

      if (!s.over && s.piece) {
        const currentLevel = Math.floor(s.lines / 8) + 1;
        const interval = Math.max(0.09, 0.62 - (currentLevel - 1) * 0.06);
        s.dropTimer += dt;
        if (s.dropTimer >= interval) {
          s.dropTimer = 0;
          const candidate = { ...s.piece, y: s.piece.y + 1 };
          if (collides(s.well, candidate)) lock();
          else s.piece = candidate;
        }
      }

      // ---- draw well ----
      c.clearRect(0, 0, W, H);
      c.fillStyle = PALETTE.surfaceAlt;
      c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(16,19,18,0.05)';
      c.lineWidth = 1;
      for (let i = 1; i < COLS; i++) {
        c.beginPath();
        c.moveTo(i * CELL, 0);
        c.lineTo(i * CELL, H);
        c.stroke();
      }

      s.well.forEach((row, r) =>
        row.forEach((value, col) => {
          if (value) drawCell(c, col * CELL, r * CELL, value);
        })
      );

      if (s.piece) {
        // Ghost of where a hard drop would land.
        let ghostY = s.piece.y;
        while (!collides(s.well, { ...s.piece, y: ghostY + 1 })) ghostY++;
        c.globalAlpha = 0.16;
        s.piece.shape.forEach((row, r) =>
          row.forEach((value, col) => {
            if (value && ghostY + r >= 0) drawCell(c, (s.piece as Piece).x * CELL + col * CELL, (ghostY + r) * CELL, value);
          })
        );
        c.globalAlpha = 1;

        s.piece.shape.forEach((row, r) =>
          row.forEach((value, col) => {
            const y = (s.piece as Piece).y + r;
            if (value && y >= 0) drawCell(c, ((s.piece as Piece).x + col) * CELL, y * CELL, value);
          })
        );
      }

      // ---- next piece preview ----
      const preview = nextRef.current;
      const pctx = preview?.getContext('2d');
      if (preview && pctx) {
        const size = 14;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (preview.width !== 72 * dpr) {
          preview.width = 72 * dpr;
          preview.height = 56 * dpr;
        }
        pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        pctx.clearRect(0, 0, 72, 56);
        const shape = s.nextShape;
        const offsetX = (72 - shape[0].length * size) / 2;
        const offsetY = (56 - shape.length * size) / 2;
        shape.forEach((row, r) =>
          row.forEach((value, col) => {
            if (value) drawCell(pctx, offsetX + col * size, offsetY + r * size, value, size);
          })
        );
      }
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, [lock]);

  return (
    <GameShell
      slug={SLUG}
      title="Tetro Blocks"
      tagline="Rotate and drop falling blocks to clear full lines. The speed climbs with every level."
      keywords="tetris style game, falling blocks game online, free block puzzle, tetromino game"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Lines', value: lines },
        { label: 'Level', value: level }
      ]}
      onRestart={restart}
      restartLabel="New game"
      howTo={[
        'Use the buttons below, or the arrow keys, to move and rotate the falling piece.',
        'Tap the double-chevron (or press space) to hard drop it instantly.',
        'Fill a whole row to clear it — four at once is worth 800 points times your level.',
        'Every eight lines raises the level and the pieces fall faster.'
      ]}
      about={
        <p>
          A faint ghost shows where a hard drop would land, and rotations try a one- or two-cell nudge
          away from the wall before being refused, so pieces turn in tight spots the way you expect them
          to.
        </p>
      }
    >
      <div className="flex items-start gap-4 justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-black/10 touch-none select-none"
            style={{ width: 'min(60vw, 200px)', aspectRatio: `${COLS} / ${ROWS}` }}
          />
          <GameOverlay
            show={over}
            tone="lose"
            title="Well full"
            subtitle={`${score} points across ${lines} lines.`}
            onAction={restart}
            isRecord={isRecord}
          />
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded-xl border border-black/10 bg-[#F6F8F7]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B958F] mb-2">Next</div>
            <canvas ref={nextRef} style={{ width: 72, height: 56 }} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 max-w-xs mx-auto">
        <ControlButton onPress={() => move(-1)} label="Left">
          <ArrowBigLeft className="w-5 h-5" />
        </ControlButton>
        <ControlButton onPress={spin} label="Rotate">
          <RotateCw className="w-5 h-5" />
        </ControlButton>
        <ControlButton onPress={softDrop} label="Down">
          <ArrowBigDown className="w-5 h-5" />
        </ControlButton>
        <ControlButton onPress={() => move(1)} label="Right">
          <ArrowBigRight className="w-5 h-5" />
        </ControlButton>
        <button
          onClick={hardDrop}
          className="col-span-4 h-11 rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-95 transition-all"
        >
          <ChevronsDown className="w-4 h-4" /> Hard drop
        </button>
      </div>
    </GameShell>
  );
}

function ControlButton({
  onPress,
  label,
  children
}: {
  onPress: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onPress}
      aria-label={label}
      className="h-12 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] inline-flex items-center justify-center active:scale-95 active:bg-mint active:text-primary transition-all"
    >
      {children}
    </button>
  );
}
