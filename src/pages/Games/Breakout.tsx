import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, logicalPoint, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';

const SLUG = 'breakout';
const W = 320;
const H = 440;

const PADDLE_W = 62;
const PADDLE_H = 10;
const PADDLE_Y = H - 26;
const BALL_R = 5;

const COLS = 7;
const ROWS = 6;
const BRICK_W = 40;
const BRICK_H = 15;
const BRICK_TOP = 46;
const BRICK_GAP = 4;

interface Brick {
  x: number;
  y: number;
  row: number;
  alive: boolean;
}

interface State {
  paddleX: number;
  ballX: number;
  ballY: number;
  vx: number;
  vy: number;
  bricks: Brick[];
  score: number;
  lives: number;
  launched: boolean;
  status: 'playing' | 'won' | 'lost';
}

function buildBricks(): Brick[] {
  const bricks: Brick[] = [];
  const totalW = COLS * BRICK_W + (COLS - 1) * BRICK_GAP;
  const left = (W - totalW) / 2;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({
        x: left + col * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + row * (BRICK_H + BRICK_GAP),
        row,
        alive: true
      });
    }
  }
  return bricks;
}

const initialState = (): State => ({
  paddleX: W / 2,
  ballX: W / 2,
  ballY: PADDLE_Y - BALL_R - 1,
  vx: 0,
  vy: 0,
  bricks: buildBricks(),
  score: 0,
  lives: 3,
  launched: false,
  status: 'playing'
});

// Deeper green for the top rows, which are also worth more.
const ROW_COLOR = ['#006622', '#0A7D40', PALETTE.primary, '#2EBA6B', '#4FCB89', '#7CD9A6'];
const rowPoints = (row: number) => (ROWS - row) * 10;

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<State>(initialState());
  const keys = useRef({ left: false, right: false });

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [launched, setLaunched] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const restart = useCallback(() => {
    state.current = initialState();
    setScore(0);
    setLives(3);
    setStatus('playing');
    setLaunched(false);
    setIsRecord(false);
  }, []);

  const launch = useCallback(() => {
    const s = state.current;
    if (s.launched || s.status !== 'playing') return;
    s.launched = true;
    // Always serve upwards, angled slightly in a random direction.
    s.vx = (Math.random() < 0.5 ? -1 : 1) * 120;
    s.vy = -210;
    setLaunched(true);
  }, []);

  useEffect(() => {
    if (status !== 'playing') setIsRecord(submit(score));
  }, [status, score, submit]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true;
      if (e.key === ' ') {
        e.preventDefault();
        launch();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [launch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = sizeCanvas(canvas, W, H);
    const onResize = () => {
      ctx = sizeCanvas(canvas, W, H);
    };
    window.addEventListener('resize', onResize);

    const stop = startLoop((dt) => {
      const c = ctx;
      if (!c) return;
      const s = state.current;

      if (s.status === 'playing') {
        if (keys.current.left) s.paddleX -= 300 * dt;
        if (keys.current.right) s.paddleX += 300 * dt;
        s.paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, s.paddleX));

        if (!s.launched) {
          s.ballX = s.paddleX;
          s.ballY = PADDLE_Y - BALL_R - 1;
        } else {
          // Sub-stepping keeps the ball from tunnelling through a brick at high speed.
          const steps = 3;
          for (let i = 0; i < steps; i++) {
            const step = dt / steps;
            s.ballX += s.vx * step;
            s.ballY += s.vy * step;

            if (s.ballX - BALL_R < 0) {
              s.ballX = BALL_R;
              s.vx = Math.abs(s.vx);
            }
            if (s.ballX + BALL_R > W) {
              s.ballX = W - BALL_R;
              s.vx = -Math.abs(s.vx);
            }
            if (s.ballY - BALL_R < 0) {
              s.ballY = BALL_R;
              s.vy = Math.abs(s.vy);
            }

            // Paddle: the bounce angle depends on where the ball lands on it.
            if (
              s.vy > 0 &&
              s.ballY + BALL_R >= PADDLE_Y &&
              s.ballY + BALL_R <= PADDLE_Y + PADDLE_H + 6 &&
              s.ballX > s.paddleX - PADDLE_W / 2 - BALL_R &&
              s.ballX < s.paddleX + PADDLE_W / 2 + BALL_R
            ) {
              const offset = (s.ballX - s.paddleX) / (PADDLE_W / 2);
              const speed = Math.min(360, Math.hypot(s.vx, s.vy) * 1.015);
              const angle = offset * 1.05; // radians from vertical
              s.vx = Math.sin(angle) * speed;
              s.vy = -Math.abs(Math.cos(angle) * speed);
              s.ballY = PADDLE_Y - BALL_R - 1;
            }

            for (const brick of s.bricks) {
              if (!brick.alive) continue;
              if (
                s.ballX + BALL_R > brick.x &&
                s.ballX - BALL_R < brick.x + BRICK_W &&
                s.ballY + BALL_R > brick.y &&
                s.ballY - BALL_R < brick.y + BRICK_H
              ) {
                brick.alive = false;
                s.score += rowPoints(brick.row);
                setScore(s.score);
                // Bounce off whichever face was closer.
                const overlapX = Math.min(
                  Math.abs(s.ballX + BALL_R - brick.x),
                  Math.abs(brick.x + BRICK_W - (s.ballX - BALL_R))
                );
                const overlapY = Math.min(
                  Math.abs(s.ballY + BALL_R - brick.y),
                  Math.abs(brick.y + BRICK_H - (s.ballY - BALL_R))
                );
                if (overlapX < overlapY) s.vx = -s.vx;
                else s.vy = -s.vy;
                break;
              }
            }

            if (s.bricks.every((b) => !b.alive)) {
              s.status = 'won';
              setStatus('won');
              break;
            }

            if (s.ballY - BALL_R > H) {
              s.lives -= 1;
              setLives(s.lives);
              s.launched = false;
              setLaunched(false);
              s.vx = 0;
              s.vy = 0;
              if (s.lives <= 0) {
                s.status = 'lost';
                setStatus('lost');
              }
              break;
            }
          }
        }
      }

      // ---- draw ----
      c.clearRect(0, 0, W, H);
      c.fillStyle = PALETTE.surfaceAlt;
      c.fillRect(0, 0, W, H);

      s.bricks.forEach((brick) => {
        if (!brick.alive) return;
        c.fillStyle = ROW_COLOR[brick.row];
        roundRect(c, brick.x, brick.y, BRICK_W, BRICK_H, 4);
        c.fill();
      });

      c.fillStyle = PALETTE.ink;
      roundRect(c, s.paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, 5);
      c.fill();

      c.fillStyle = PALETTE.primaryDark;
      c.beginPath();
      c.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      c.fill();

      // lives, drawn as small dots in the corner
      for (let i = 0; i < s.lives; i++) {
        c.fillStyle = PALETTE.muted;
        c.beginPath();
        c.arc(12 + i * 11, 14, 3.5, 0, Math.PI * 2);
        c.fill();
      }
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const movePaddle = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x } = logicalPoint(canvas, clientX, 0, W, H);
    state.current.paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x));
  };

  return (
    <GameShell
      slug={SLUG}
      title="Breakout"
      tagline="Bounce the ball, break every brick, and keep the paddle under it. Six rows, three lives."
      keywords="breakout game, brick breaker online, arkanoid style game free, paddle ball game"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Lives', value: lives }
      ]}
      onRestart={restart}
      restartLabel="New game"
      howTo={[
        'Drag along the board to move the paddle — arrow keys work on desktop.',
        'Tap the board (or press space) to serve the ball.',
        'Higher rows are worth more: 60 points at the top down to 10 at the bottom.',
        'Clear all 42 bricks to win. Drop the ball three times and the game is over.'
      ]}
      about={
        <p>
          Where the ball meets the paddle decides the rebound angle, so you can aim: hit it with the
          paddle's edge to send the ball out wide, or catch it dead centre to fire it straight back up.
          Each paddle hit also nudges the speed up slightly.
        </p>
      }
    >
      <div className="relative mx-auto w-full max-w-[320px]">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-black/10 touch-none select-none"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            movePaddle(e.clientX);
            launch();
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === 'touch') movePaddle(e.clientX);
          }}
        />

        {!launched && status === 'playing' && (
          <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none">
            <span className="px-4 py-2 rounded-full bg-white/90 border border-black/10 text-xs font-semibold text-[#55605B]">
              Tap to serve
            </span>
          </div>
        )}

        <GameOverlay
          show={status === 'lost'}
          tone="lose"
          title="Out of lives"
          subtitle={`Final score: ${score}.`}
          onAction={restart}
          isRecord={isRecord}
        />
        <GameOverlay
          show={status === 'won'}
          tone="win"
          title="All bricks cleared!"
          subtitle={`${score} points with ${lives} ${lives === 1 ? 'life' : 'lives'} to spare.`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
