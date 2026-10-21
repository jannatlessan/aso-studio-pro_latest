import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowBigDown, ArrowBigLeft, ArrowBigRight, ChevronsDown, Pause, Play, RotateCw } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, logicalPoint, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';
import { audio } from '../../lib/gameAudio';
import { FloatingTexts, Particles, Shake, clamp01 } from '../../lib/juice';
import {
  TETRO_COLS as COLS,
  TETRO_ROWS as ROWS,
  collapseWell,
  emptyWell,
  fullRows,
  gravityFor,
  levelOf,
  scoreClear
} from '../../lib/tetro';

const SLUG = 'tetro-blocks';
const CELL = 18;
const W = COLS * CELL;
const H = ROWS * CELL;

const LOCK_DELAY = 0.5;
const MAX_LOCK_RESETS = 15;
const CLEAR_TIME = 0.28;

type Shape = number[][];

/** The seven tetrominoes. The stored number is the index into COLORS. */
const SHAPES: Shape[] = [
  [[1, 1, 1, 1]],
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

const COLORS = ['', '#0E9D52', '#0A7D40', '#2EBA6B', '#4FCB89', '#006622', '#7CD9A6', '#0F766E'];
const LINE_NAME = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD!'];

interface Piece {
  shape: Shape;
  x: number;
  y: number;
  /** Index into SHAPES, needed so Hold can re-spawn the piece upright. */
  type: number;
}

interface State {
  well: number[][];
  piece: Piece | null;
  /** 7-bag queue: every seven pieces contains each tetromino exactly once. */
  bag: number[];
  queue: number[];
  hold: number | null;
  holdUsed: boolean;
  dropTimer: number;
  lockTimer: number;
  lockResets: number;
  grounded: boolean;
  clearing: { rows: number[]; t: number } | null;
  lines: number;
  score: number;
  combo: number;
  backToBack: boolean;
  phase: 'playing' | 'paused' | 'over';
}

const cloneShape = (shape: Shape): Shape => shape.map((row) => [...row]);

function refillBag(bag: number[]) {
  if (bag.length > 7) return bag;
  const next = [0, 1, 2, 3, 4, 5, 6];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return [...bag, ...next];
}

/** Clockwise rotation of a shape matrix. */
const rotate = (shape: Shape): Shape => shape[0].map((_, col) => shape.map((row) => row[col]).reverse());

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

/**
 * Pieces spawn inside the well rather than above it. Spawning above the ceiling means the spawn
 * collision check has nothing to test against, so a full well would silently swallow pieces and the
 * game could never end.
 */
const spawnPiece = (type: number): Piece => {
  const shape = cloneShape(SHAPES[type]);
  return { shape, type, x: Math.floor((COLS - shape[0].length) / 2), y: 0 };
};

function initialState(): State {
  let bag = refillBag([]);
  const queue = bag.splice(0, 4);
  bag = refillBag(bag);
  const first = queue.shift() as number;
  queue.push(bag.shift() as number);
  return {
    well: emptyWell(),
    piece: spawnPiece(first),
    bag,
    queue,
    hold: null,
    holdUsed: false,
    dropTimer: 0,
    lockTimer: 0,
    lockResets: 0,
    grounded: false,
    clearing: null,
    lines: 0,
    score: 0,
    combo: -1,
    backToBack: false,
    phase: 'playing'
  };
}

export default function TetroBlocks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sideRef = useRef<HTMLCanvasElement>(null);
  const holdRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<State>(initialState());
  const fx = useRef({ particles: new Particles(), shake: new Shake(), texts: new FloatingTexts() });

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'paused' | 'over'>('playing');
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const level = levelOf(lines);

  const restart = useCallback(() => {
    state.current = initialState();
    fx.current.particles.clear();
    fx.current.texts.clear();
    fx.current.shake.clear();
    setScore(0);
    setLines(0);
    setPhase('playing');
    setIsRecord(false);
  }, []);

  useEffect(() => {
    if (phase === 'over') setIsRecord(submit(state.current.score));
  }, [phase, submit]);

  /** Pulls the next piece from the queue, refilling the bag behind it. */
  const takeNext = (s: State) => {
    const type = s.queue.shift() as number;
    s.bag = refillBag(s.bag);
    s.queue.push(s.bag.shift() as number);
    return spawnPiece(type);
  };

  const place = useCallback((s: State, piece: Piece) => {
    s.piece = piece;
    s.dropTimer = 0;
    s.lockTimer = 0;
    s.lockResets = 0;
    s.grounded = false;
    if (collides(s.well, piece)) {
      s.phase = 'over';
      s.piece = null;
      setPhase('over');
      audio.play('gameover');
      fx.current.shake.trigger(10, 0.4);
    }
  }, []);

  /** Locks the piece into the well and starts the clear animation if any rows completed. */
  const lock = useCallback(
    (s: State) => {
      if (!s.piece) return;
      const piece = s.piece;
      piece.shape.forEach((row, r) =>
        row.forEach((value, col) => {
          const y = piece.y + r;
          const x = piece.x + col;
          if (value && y >= 0) s.well[y][x] = value;
        })
      );

      const full = fullRows(s.well);

      audio.play('lock');
      s.holdUsed = false;

      if (full.length) {
        s.clearing = { rows: full, t: CLEAR_TIME };
        s.piece = null;
        const particles = fx.current.particles;
        full.forEach((row) => {
          particles.line(0, W, row * CELL + CELL / 2, PALETTE.primaryLight, 26);
        });
        fx.current.shake.trigger(full.length >= 4 ? 12 : 5 + full.length * 1.5, 0.3);
        audio.play(full.length >= 4 ? 'quad' : 'clear');
      } else {
        s.combo = -1;
        place(s, takeNext(s));
      }
    },
    [place]
  );

  /** Applies scoring for the finished clear and drops the remaining rows down. */
  const finishClear = useCallback(
    (s: State) => {
      const rows = s.clearing?.rows ?? [];
      s.clearing = null;
      if (!rows.length) return;

      s.well = collapseWell(s.well, rows);

      const currentLevel = levelOf(s.lines);
      const isQuad = rows.length === 4;
      s.combo += 1;
      const { points: gained, backToBack } = scoreClear(rows.length, currentLevel, s.backToBack, s.combo);
      s.backToBack = backToBack;

      s.lines += rows.length;
      s.score += gained;
      setLines(s.lines);
      setScore(s.score);

      const label = `${LINE_NAME[rows.length]}${s.combo > 0 ? ` x${s.combo + 1}` : ''}`;
      fx.current.texts.add(W / 2, rows[0] * CELL, label, isQuad ? '#B8860B' : PALETTE.primaryDark, isQuad ? 17 : 14, 1);
      fx.current.texts.add(W / 2, rows[0] * CELL + 18, `+${gained}`, PALETTE.ink, 13, 0.9);

      if (levelOf(s.lines) > currentLevel) {
        fx.current.texts.add(W / 2, H / 2, `LEVEL ${levelOf(s.lines)}`, PALETTE.primary, 20, 1.1);
        audio.play('levelup');
      }

      place(s, takeNext(s));
    },
    [place]
  );

  const move = useCallback((dx: number) => {
    const s = state.current;
    if (!s.piece || s.phase !== 'playing') return;
    const candidate = { ...s.piece, x: s.piece.x + dx };
    if (collides(s.well, candidate)) return;
    s.piece = candidate;
    audio.play('move');
    // Sliding under a ledge should buy you time, but not forever.
    if (s.grounded && s.lockResets < MAX_LOCK_RESETS) {
      s.lockTimer = 0;
      s.lockResets += 1;
    }
  }, []);

  const spin = useCallback(() => {
    const s = state.current;
    if (!s.piece || s.phase !== 'playing') return;
    const rotated = rotate(s.piece.shape);
    // Try in place, then kick off the wall or floor by one or two cells.
    for (const [ox, oy] of [
      [0, 0],
      [-1, 0],
      [1, 0],
      [-2, 0],
      [2, 0],
      [0, -1],
      [-1, -1],
      [1, -1]
    ]) {
      const candidate: Piece = { ...s.piece, shape: rotated, x: s.piece.x + ox, y: s.piece.y + oy };
      if (!collides(s.well, candidate)) {
        s.piece = candidate;
        audio.play('rotate');
        if (s.grounded && s.lockResets < MAX_LOCK_RESETS) {
          s.lockTimer = 0;
          s.lockResets += 1;
        }
        return;
      }
    }
  }, []);

  const softDrop = useCallback(() => {
    const s = state.current;
    if (!s.piece || s.phase !== 'playing') return;
    const candidate = { ...s.piece, y: s.piece.y + 1 };
    if (collides(s.well, candidate)) {
      lock(s);
    } else {
      s.piece = candidate;
      s.score += 1;
      setScore(s.score);
      s.dropTimer = 0;
    }
  }, [lock]);

  const hardDrop = useCallback(() => {
    const s = state.current;
    if (!s.piece || s.phase !== 'playing') return;
    let dropped = 0;
    while (!collides(s.well, { ...(s.piece as Piece), y: (s.piece as Piece).y + 1 })) {
      s.piece = { ...(s.piece as Piece), y: (s.piece as Piece).y + 1 };
      dropped++;
    }
    s.score += dropped * 2;
    setScore(s.score);
    fx.current.shake.trigger(3 + Math.min(7, dropped * 0.5), 0.16);
    audio.play('drop');
    lock(s);
  }, [lock]);

  const holdPiece = useCallback(() => {
    const s = state.current;
    if (!s.piece || s.phase !== 'playing' || s.holdUsed) return;
    const currentType = s.piece.type;
    const swap = s.hold;
    s.hold = currentType;
    s.holdUsed = true;
    audio.play('ui');
    place(s, swap === null ? takeNext(s) : spawnPiece(swap));
  }, [place]);

  const togglePause = useCallback(() => {
    const s = state.current;
    if (s.phase === 'playing') {
      s.phase = 'paused';
      setPhase('paused');
    } else if (s.phase === 'paused') {
      s.phase = 'playing';
      setPhase('playing');
    }
    audio.play('ui');
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
        case 'X':
          e.preventDefault();
          spin();
          break;
        case 'Shift':
        case 'c':
        case 'C':
          e.preventDefault();
          holdPiece();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, softDrop, spin, hardDrop, holdPiece, togglePause]);

  // ---- loop ----
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

    const drawMini = (
      canvasEl: HTMLCanvasElement | null,
      types: number[],
      width: number,
      height: number
    ) => {
      const mctx = canvasEl?.getContext('2d');
      if (!canvasEl || !mctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvasEl.width !== width * dpr) {
        canvasEl.width = width * dpr;
        canvasEl.height = height * dpr;
      }
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, width, height);
      const slot = height / Math.max(1, types.length);
      const size = 11;
      types.forEach((type, i) => {
        const shape = SHAPES[type];
        const ox = (width - shape[0].length * size) / 2;
        const oy = i * slot + (slot - shape.length * size) / 2;
        shape.forEach((row, r) =>
          row.forEach((value, col) => {
            if (value) drawCell(mctx, ox + col * size, oy + r * size, value, size);
          })
        );
      });
    };

    const stop = startLoop((dt) => {
      const c = ctx;
      if (!c) return;
      const s = state.current;
      const { particles, shake, texts } = fx.current;

      if (s.phase === 'playing') {
        if (s.clearing) {
          s.clearing.t -= dt;
          if (s.clearing.t <= 0) finishClear(s);
        } else if (s.piece) {
          const interval = gravityFor(levelOf(s.lines));
          const landed = collides(s.well, { ...s.piece, y: s.piece.y + 1 });
          s.grounded = landed;

          if (landed) {
            // Lock delay: a grounded piece can still be nudged for half a second.
            s.lockTimer += dt;
            if (s.lockTimer >= LOCK_DELAY) lock(s);
          } else {
            s.lockTimer = 0;
            s.dropTimer += dt;
            if (s.dropTimer >= interval) {
              s.dropTimer = 0;
              s.piece = { ...s.piece, y: s.piece.y + 1 };
            }
          }
        }
      }

      particles.update(dt);
      texts.update(dt);
      shake.update(dt);

      // ---------- draw ----------
      c.clearRect(0, 0, W, H);
      shake.apply(c);

      c.fillStyle = PALETTE.surfaceAlt;
      c.fillRect(-20, -20, W + 40, H + 40);
      c.strokeStyle = 'rgba(16,19,18,0.05)';
      c.lineWidth = 1;
      for (let i = 1; i < COLS; i++) {
        c.beginPath();
        c.moveTo(i * CELL, 0);
        c.lineTo(i * CELL, H);
        c.stroke();
      }
      for (let i = 1; i < ROWS; i++) {
        c.beginPath();
        c.moveTo(0, i * CELL);
        c.lineTo(W, i * CELL);
        c.stroke();
      }

      const clearingRows = s.clearing?.rows ?? [];
      const clearProgress = s.clearing ? 1 - clamp01(s.clearing.t / CLEAR_TIME) : 0;

      s.well.forEach((row, r) =>
        row.forEach((value, col) => {
          if (!value) return;
          if (clearingRows.includes(r)) {
            // Clearing rows blow out to white and shrink away.
            const squash = 1 - clearProgress;
            c.save();
            c.translate(col * CELL + CELL / 2, r * CELL + CELL / 2);
            c.scale(1, squash);
            c.globalAlpha = 1 - clearProgress * 0.4;
            drawCell(c, -CELL / 2, -CELL / 2, value);
            c.fillStyle = `rgba(255,255,255,${clearProgress * 0.85})`;
            roundRect(c, -CELL / 2 + 1, -CELL / 2 + 1, CELL - 2, CELL - 2, 3);
            c.fill();
            c.globalAlpha = 1;
            c.restore();
          } else {
            drawCell(c, col * CELL, r * CELL, value);
          }
        })
      );

      if (s.piece) {
        const piece = s.piece;
        let ghostY = piece.y;
        while (!collides(s.well, { ...piece, y: ghostY + 1 })) ghostY++;

        if (ghostY !== piece.y) {
          c.globalAlpha = 0.17;
          piece.shape.forEach((row, r) =>
            row.forEach((value, col) => {
              if (value && ghostY + r >= 0) drawCell(c, (piece.x + col) * CELL, (ghostY + r) * CELL, value);
            })
          );
          c.globalAlpha = 1;
        }

        // A grounded piece pulses slightly so the lock delay is readable.
        const pulse = s.grounded ? 0.75 + Math.sin(performance.now() / 70) * 0.25 : 1;
        c.globalAlpha = pulse;
        piece.shape.forEach((row, r) =>
          row.forEach((value, col) => {
            const y = piece.y + r;
            if (value && y >= 0) drawCell(c, (piece.x + col) * CELL, y * CELL, value);
          })
        );
        c.globalAlpha = 1;
      }

      particles.draw(c);
      texts.draw(c);
      shake.restore(c);

      if (s.phase === 'paused') {
        c.fillStyle = 'rgba(255,255,255,0.78)';
        c.fillRect(0, 0, W, H);
        c.fillStyle = PALETTE.ink;
        c.font = 'bold 20px Outfit, Inter, sans-serif';
        c.textAlign = 'center';
        c.fillText('Paused', W / 2, H / 2 + 6);
      }

      drawMini(sideRef.current, s.queue.slice(0, 3), 64, 150);
      drawMini(holdRef.current, s.hold === null ? [] : [s.hold], 64, 52);
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, [lock, finishClear]);

  // ---- touch controls on the well itself ----
  const touch = useRef({ x: 0, y: 0, startX: 0, startY: 0, time: 0, moved: false, dropped: false });

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = logicalPoint(e.currentTarget, e.clientX, e.clientY, W, H);
    touch.current = { x: p.x, y: p.y, startX: p.x, startY: p.y, time: performance.now(), moved: false, dropped: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const t = touch.current;
    if (t.dropped) return;
    const p = logicalPoint(e.currentTarget, e.clientX, e.clientY, W, H);

    // One cell of horizontal travel moves the piece one column.
    while (p.x - t.x >= CELL) {
      move(1);
      t.x += CELL;
      t.moved = true;
    }
    while (t.x - p.x >= CELL) {
      move(-1);
      t.x -= CELL;
      t.moved = true;
    }

    // A deliberate downward drag soft-drops a row at a time.
    while (p.y - t.y >= CELL) {
      softDrop();
      t.y += CELL;
      t.moved = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const t = touch.current;
    const p = logicalPoint(e.currentTarget, e.clientX, e.clientY, W, H);
    const elapsed = performance.now() - t.time;
    const dy = p.y - t.startY;
    const dx = Math.abs(p.x - t.startX);

    if (!t.moved && elapsed < 250 && dy < CELL && dx < CELL) {
      spin();
    } else if (dy > CELL * 3 && elapsed < 300 && dx < CELL * 2) {
      hardDrop();
    }
  };

  return (
    <GameShell
      slug={SLUG}
      title="Tetro Blocks"
      tagline="Rotate and drop falling blocks to clear full lines. Hold a piece, chain combos, and survive the speed."
      keywords="tetris style game, falling blocks game online, free block puzzle, tetromino game with hold"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Lines', value: lines },
        { label: 'Level', value: level }
      ]}
      onRestart={restart}
      sound
      restartLabel="New game"
      actions={
        <button
          onClick={togglePause}
          aria-label={phase === 'paused' ? 'Resume' : 'Pause'}
          disabled={phase === 'over'}
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] hover:text-primary hover:border-primary/30 active:scale-95 transition-all disabled:opacity-40"
        >
          {phase === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      }
      howTo={[
        'Drag across the well to slide the piece, tap it to rotate, and flick down to hard drop.',
        'On a keyboard: arrows to move and rotate, space to hard drop, C to hold, P to pause.',
        'Hold parks a piece for later — once per piece, so use it to save an I-piece for a quad.',
        'Clearing four rows at once is a QUAD, and back-to-back quads pay 50% extra.'
      ]}
      about={
        <>
          <p>
            Pieces come from a seven-bag randomiser: every run of seven contains each tetromino exactly
            once, so you never get starved of the long piece for twenty drops the way a purely random
            bag allows.
          </p>
          <p>
            A landed piece pulses for half a second before it locks, and nudging it resets that timer up
            to fifteen times — enough to slide a piece under an overhang without it sticking the moment
            it touches down.
          </p>
        </>
      }
    >
      <div className="flex items-start gap-3 sm:gap-4 justify-center">
        <div className="space-y-3">
          <Panel label="Hold">
            <canvas ref={holdRef} style={{ width: 64, height: 52 }} />
          </Panel>
          <button
            onClick={holdPiece}
            className="w-full px-2 py-2 rounded-lg border border-black/10 bg-white text-[10px] font-bold uppercase tracking-wider text-[#55605B] hover:border-primary/30 hover:text-primary active:scale-95 transition-all"
          >
            Hold
          </button>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-black/10 touch-none select-none"
            style={{ width: 'min(52vw, 190px)', aspectRatio: `${COLS} / ${ROWS}` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          <GameOverlay
            show={phase === 'over'}
            tone="lose"
            title="Well full"
            subtitle={`${score.toLocaleString()} points · ${lines} lines · level ${level}`}
            onAction={restart}
            isRecord={isRecord}
          />
        </div>

        <Panel label="Next">
          <canvas ref={sideRef} style={{ width: 64, height: 150 }} />
        </Panel>
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

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="p-2.5 rounded-xl border border-black/10 bg-[#F6F8F7]">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B958F] mb-1.5">{label}</div>
      {children}
    </div>
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
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      aria-label={label}
      className="h-12 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] inline-flex items-center justify-center active:scale-95 active:bg-mint active:text-primary transition-all touch-none"
    >
      {children}
    </button>
  );
}
