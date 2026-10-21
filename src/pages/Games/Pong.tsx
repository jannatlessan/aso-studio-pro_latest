import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, logicalPoint, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';

const SLUG = 'pong';
const W = 320;
const H = 420;

const PADDLE_W = 58;
const PADDLE_H = 9;
const BALL_R = 5;
const PLAYER_Y = H - 24;
const CPU_Y = 16;
const TARGET = 11;

type Difficulty = 'Chill' | 'Normal' | 'Sharp';

const CPU_SPEED: Record<Difficulty, number> = { Chill: 130, Normal: 185, Sharp: 245 };

interface State {
  playerX: number;
  cpuX: number;
  ballX: number;
  ballY: number;
  vx: number;
  vy: number;
  playerScore: number;
  cpuScore: number;
  serving: boolean;
  serveDelay: number;
  /** Which side serves next: +1 sends the ball down towards the player. */
  serveTo: number;
  finished: boolean;
}

const initialState = (): State => ({
  playerX: W / 2,
  cpuX: W / 2,
  ballX: W / 2,
  ballY: H / 2,
  vx: 0,
  vy: 0,
  playerScore: 0,
  cpuScore: 0,
  serving: true,
  serveDelay: 0.7,
  serveTo: 1,
  finished: false
});

export default function Pong() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<State>(initialState());
  const keys = useRef({ left: false, right: false });
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const difficultyRef = useRef<Difficulty>('Normal');

  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [result, setResult] = useState<'won' | 'lost' | null>(null);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(`${SLUG}.wins`);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  // Guards the win tally against being incremented again when `best` changes and the effect re-runs.
  const counted = useRef(false);

  const restart = useCallback(() => {
    state.current = initialState();
    counted.current = false;
    setPlayerScore(0);
    setCpuScore(0);
    setResult(null);
    setIsRecord(false);
  }, []);

  // The persisted record here is a running count of matches won, not a per-round score.
  useEffect(() => {
    if (result !== 'won' || counted.current) return;
    counted.current = true;
    setIsRecord(submit((best ?? 0) + 1));
  }, [result, best, submit]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true;
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
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = sizeCanvas(canvas, W, H);
    const onResize = () => {
      ctx = sizeCanvas(canvas, W, H);
    };
    window.addEventListener('resize', onResize);

    const serve = (s: State) => {
      s.ballX = W / 2;
      s.ballY = H / 2;
      s.vx = (Math.random() < 0.5 ? -1 : 1) * (70 + Math.random() * 60);
      s.vy = 200 * s.serveTo;
      s.serving = false;
    };

    const stop = startLoop((dt) => {
      const c = ctx;
      if (!c) return;
      const s = state.current;

      if (!s.finished) {
        if (keys.current.left) s.playerX -= 320 * dt;
        if (keys.current.right) s.playerX += 320 * dt;
        s.playerX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, s.playerX));

        if (s.serving) {
          s.serveDelay -= dt;
          if (s.serveDelay <= 0) serve(s);
        } else {
          s.ballX += s.vx * dt;
          s.ballY += s.vy * dt;

          if (s.ballX - BALL_R < 0) {
            s.ballX = BALL_R;
            s.vx = Math.abs(s.vx);
          }
          if (s.ballX + BALL_R > W) {
            s.ballX = W - BALL_R;
            s.vx = -Math.abs(s.vx);
          }

          const bounce = (paddleX: number, paddleY: number, downwards: boolean) => {
            const offset = (s.ballX - paddleX) / (PADDLE_W / 2);
            const speed = Math.min(430, Math.hypot(s.vx, s.vy) * 1.04);
            const angle = offset * 1.0;
            s.vx = Math.sin(angle) * speed;
            s.vy = (downwards ? 1 : -1) * Math.abs(Math.cos(angle) * speed);
            s.ballY = paddleY + (downwards ? BALL_R + 1 : -BALL_R - 1);
          };

          if (
            s.vy > 0 &&
            s.ballY + BALL_R >= PLAYER_Y &&
            s.ballY + BALL_R <= PLAYER_Y + PADDLE_H + 8 &&
            Math.abs(s.ballX - s.playerX) < PADDLE_W / 2 + BALL_R
          ) {
            bounce(s.playerX, PLAYER_Y, false);
          }

          if (
            s.vy < 0 &&
            s.ballY - BALL_R <= CPU_Y + PADDLE_H &&
            s.ballY - BALL_R >= CPU_Y - 8 &&
            Math.abs(s.ballX - s.cpuX) < PADDLE_W / 2 + BALL_R
          ) {
            bounce(s.cpuX, CPU_Y + PADDLE_H, true);
          }

          // CPU tracks the ball when it is incoming, drifts home otherwise. The dead zone keeps it
          // from being unbeatably precise.
          const aim = s.vy < 0 ? s.ballX : W / 2;
          const speed = CPU_SPEED[difficultyRef.current];
          if (Math.abs(aim - s.cpuX) > 6) s.cpuX += Math.sign(aim - s.cpuX) * speed * dt;
          s.cpuX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, s.cpuX));

          if (s.ballY > H + 20) {
            s.cpuScore += 1;
            setCpuScore(s.cpuScore);
            s.serving = true;
            s.serveDelay = 0.7;
            s.serveTo = -1;
          } else if (s.ballY < -20) {
            s.playerScore += 1;
            setPlayerScore(s.playerScore);
            s.serving = true;
            s.serveDelay = 0.7;
            s.serveTo = 1;
          }

          if (s.playerScore >= TARGET || s.cpuScore >= TARGET) {
            s.finished = true;
            setResult(s.playerScore > s.cpuScore ? 'won' : 'lost');
          }
        }
      }

      // ---- draw ----
      c.clearRect(0, 0, W, H);
      c.fillStyle = PALETTE.surfaceAlt;
      c.fillRect(0, 0, W, H);

      c.strokeStyle = 'rgba(16,19,18,0.12)';
      c.lineWidth = 2;
      c.setLineDash([7, 9]);
      c.beginPath();
      c.moveTo(0, H / 2);
      c.lineTo(W, H / 2);
      c.stroke();
      c.setLineDash([]);

      c.fillStyle = 'rgba(16,19,18,0.08)';
      c.font = 'bold 44px Outfit, Inter, sans-serif';
      c.textAlign = 'center';
      c.fillText(String(s.cpuScore), W / 2, H / 2 - 22);
      c.fillText(String(s.playerScore), W / 2, H / 2 + 58);

      c.fillStyle = PALETTE.ink;
      roundRect(c, s.cpuX - PADDLE_W / 2, CPU_Y, PADDLE_W, PADDLE_H, 5);
      c.fill();

      c.fillStyle = PALETTE.primary;
      roundRect(c, s.playerX - PADDLE_W / 2, PLAYER_Y, PADDLE_W, PADDLE_H, 5);
      c.fill();

      if (!s.serving) {
        c.fillStyle = PALETTE.primaryDark;
        c.beginPath();
        c.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
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
    state.current.playerX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x));
  };

  return (
    <GameShell
      slug={SLUG}
      title="Pong"
      tagline="Classic two-paddle tennis against a sharp computer opponent. First to eleven takes it."
      keywords="pong game online, classic pong free, paddle tennis game browser, retro arcade pong"
      stats={[
        { label: 'You', value: playerScore, accent: true },
        { label: 'CPU', value: cpuScore },
        { label: 'Wins', value: best ?? 0 },
        { label: 'Mode', value: difficulty }
      ]}
      onRestart={restart}
      restartLabel="New match"
      howTo={[
        'Drag along the board to slide your green paddle — arrow keys work on desktop.',
        'The ball leaves your paddle at an angle based on where it hit.',
        'A point goes to whoever gets the ball past the other paddle.',
        'First player to eleven points wins the match.'
      ]}
      about={
        <p>
          The computer paddle moves at a fixed top speed and only chases the ball while it is heading
          its way, so wide angles are what beat it. Each rally also speeds the ball up by about four
          percent per hit, which eventually gets past both of you.
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
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === 'touch') movePaddle(e.clientX);
          }}
        />

        <GameOverlay
          show={result !== null}
          tone={result === 'won' ? 'win' : 'lose'}
          title={result === 'won' ? 'Match won!' : 'Match lost'}
          subtitle={`${playerScore} – ${cpuScore}`}
          actionLabel="Rematch"
          onAction={restart}
          isRecord={result === 'won' && isRecord}
        />
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {(['Chill', 'Normal', 'Sharp'] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => {
              setDifficulty(level);
              restart();
            }}
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
