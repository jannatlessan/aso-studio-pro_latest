import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';
import { keyToDirection, useSwipe, type Direction } from '../../hooks/useSwipe';

const SLUG = 'snake';
const GRID = 17;
const CELL = 20;
const SIZE = GRID * CELL;

interface Point {
  x: number;
  y: number;
}

interface State {
  snake: Point[];
  dir: Point;
  /** Queued turns, so two quick swipes both register instead of overwriting each other. */
  queue: Point[];
  food: Point;
  stepTime: number;
  sinceStep: number;
  score: number;
  alive: boolean;
  started: boolean;
}

const VECTOR: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

function randomFood(snake: Point[]): Point {
  const free: Point[] = [];
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      if (!snake.some((p) => p.x === x && p.y === y)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

const initialState = (): State => {
  const snake = [
    { x: 8, y: 9 },
    { x: 8, y: 10 },
    { x: 8, y: 11 }
  ];
  return {
    snake,
    dir: VECTOR.up,
    queue: [],
    food: randomFood(snake),
    stepTime: 0.16,
    sinceStep: 0,
    score: 0,
    alive: true,
    started: false
  };
};

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const state = useRef<State>(initialState());

  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const restart = useCallback(() => {
    state.current = initialState();
    setScore(0);
    setOver(false);
    setStarted(false);
  }, []);

  const turn = useCallback((dir: Direction) => {
    const s = state.current;
    if (!s.alive) return;
    const next = VECTOR[dir];
    const reference = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
    // Ignore a reversal — it would run the head straight into the neck.
    if (reference.x === -next.x && reference.y === -next.y) return;
    if (reference.x === next.x && reference.y === next.y) return;
    if (s.queue.length < 2) s.queue.push(next);
    if (!s.started) {
      s.started = true;
      setStarted(true);
    }
  }, []);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = keyToDirection(e.key);
      if (!dir) return;
      e.preventDefault();
      turn(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  useSwipe(wrapRef, turn);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = sizeCanvas(canvas, SIZE, SIZE);
    const onResize = () => {
      ctx = sizeCanvas(canvas, SIZE, SIZE);
    };
    window.addEventListener('resize', onResize);

    const stop = startLoop((dt) => {
      const c = ctx;
      if (!c) return;
      const s = state.current;

      if (s.alive && s.started) {
        s.sinceStep += dt;
        if (s.sinceStep >= s.stepTime) {
          s.sinceStep = 0;
          if (s.queue.length) s.dir = s.queue.shift() as Point;

          const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
          const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
          // The tail tip moves away this step, so it is not a collision.
          const hitSelf = s.snake.slice(0, -1).some((p) => p.x === head.x && p.y === head.y);

          if (hitWall || hitSelf) {
            s.alive = false;
            setOver(true);
          } else {
            s.snake.unshift(head);
            if (head.x === s.food.x && head.y === s.food.y) {
              s.score += 1;
              setScore(s.score);
              s.food = randomFood(s.snake);
              s.stepTime = Math.max(0.065, 0.16 - s.score * 0.0035);
            } else {
              s.snake.pop();
            }
          }
        }
      }

      // ---- draw ----
      c.clearRect(0, 0, SIZE, SIZE);
      c.fillStyle = PALETTE.surfaceAlt;
      c.fillRect(0, 0, SIZE, SIZE);

      c.strokeStyle = 'rgba(16,19,18,0.04)';
      c.lineWidth = 1;
      for (let i = 1; i < GRID; i++) {
        c.beginPath();
        c.moveTo(i * CELL, 0);
        c.lineTo(i * CELL, SIZE);
        c.stroke();
        c.beginPath();
        c.moveTo(0, i * CELL);
        c.lineTo(SIZE, i * CELL);
        c.stroke();
      }

      // food
      c.fillStyle = '#B91C1C';
      c.beginPath();
      c.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL * 0.3, 0, Math.PI * 2);
      c.fill();

      // snake — head in the dark brand green, body fading towards the light tint
      s.snake.forEach((segment, i) => {
        const t = s.snake.length > 1 ? i / (s.snake.length - 1) : 0;
        c.fillStyle = i === 0 ? PALETTE.primaryDark : t > 0.75 ? '#7CD9A6' : PALETTE.primary;
        roundRect(c, segment.x * CELL + 1.5, segment.y * CELL + 1.5, CELL - 3, CELL - 3, i === 0 ? 7 : 5);
        c.fill();
      });
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <GameShell
      slug={SLUG}
      title="Snake"
      tagline="Eat, grow, and never bite your own tail. Swipe or use the arrow keys to turn."
      keywords="snake game online, play snake free, classic snake browser game, mobile snake"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Length', value: score + 3 }
      ]}
      onRestart={restart}
      restartLabel="New game"
      howTo={[
        'Swipe on the board, tap the arrows below, or use the arrow keys to turn.',
        'Eat the red dot to grow one segment and score a point.',
        'You speed up slightly with every bite.',
        'Hitting a wall or your own body ends the game.'
      ]}
      about={
        <p>
          Turns are queued rather than applied instantly, so a quick two-swipe corner — right then down —
          both register instead of the second one overwriting the first. Reversals are ignored, which
          saves you from an accidental instant loss.
        </p>
      }
    >
      <div ref={wrapRef} className="relative mx-auto w-full max-w-[340px] touch-none">
        <canvas
          ref={canvasRef}
          className="w-full aspect-square rounded-xl border border-black/10 select-none"
        />

        {!started && !over && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-xl">
            <div className="text-center space-y-3">
              <p className="text-xs text-[#55605B] font-medium">Swipe or press an arrow key to start</p>
              <button
                onClick={() => turn('up')}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:scale-95 transition-all"
              >
                Start
              </button>
            </div>
          </div>
        )}

        <GameOverlay
          show={over}
          tone="lose"
          title="Game over"
          subtitle={`You ate ${score} ${score === 1 ? 'dot' : 'dots'}.`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
        <span />
        <PadButton label="▲" onPress={() => turn('up')} />
        <span />
        <PadButton label="◀" onPress={() => turn('left')} />
        <PadButton label="▼" onPress={() => turn('down')} />
        <PadButton label="▶" onPress={() => turn('right')} />
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
