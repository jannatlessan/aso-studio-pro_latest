import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';

const SLUG = 'tap-flyer';
const W = 320;
const H = 480;

const GRAVITY = 1150;
const FLAP = -340;
const BIRD_X = 86;
const BIRD_R = 11;
const GAP = 128;
const PIPE_W = 46;
const GROUND = 36;

interface Pipe {
  x: number;
  /** Top of the gap. */
  gapY: number;
  scored: boolean;
}

interface State {
  y: number;
  vy: number;
  pipes: Pipe[];
  speed: number;
  score: number;
  alive: boolean;
  started: boolean;
  wing: number;
}

const initialState = (): State => ({
  y: H / 2,
  vy: 0,
  pipes: [],
  speed: 108,
  score: 0,
  alive: true,
  started: false,
  wing: 0
});

const spawnPipe = (x: number): Pipe => ({
  x,
  gapY: 56 + Math.random() * (H - GROUND - GAP - 110),
  scored: false
});

export default function TapFlyer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const flap = useCallback(() => {
    const s = state.current;
    if (!s.alive) return;
    if (!s.started) {
      s.started = true;
      s.pipes = [spawnPipe(W + 40), spawnPipe(W + 40 + 168)];
      setStarted(true);
    }
    s.vy = FLAP;
    s.wing = 0.18;
  }, []);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (state.current.alive) flap();
        else restart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap, restart]);

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

      if (s.alive && s.started) {
        s.vy += GRAVITY * dt;
        s.y += s.vy * dt;
        s.wing = Math.max(0, s.wing - dt);
        // Gentle speed-up keeps late pipes interesting without becoming unreadable.
        s.speed = 108 + Math.min(52, s.score * 1.6);

        s.pipes.forEach((pipe) => {
          pipe.x -= s.speed * dt;
          if (!pipe.scored && pipe.x + PIPE_W < BIRD_X - BIRD_R) {
            pipe.scored = true;
            s.score += 1;
            setScore(s.score);
          }
        });

        if (s.pipes.length && s.pipes[0].x < -PIPE_W - 10) s.pipes.shift();
        const last = s.pipes[s.pipes.length - 1];
        if (last && last.x < W - 168) s.pipes.push(spawnPipe(W + 20));

        // Collisions: ceiling, ground, and either pipe body.
        if (s.y + BIRD_R > H - GROUND || s.y - BIRD_R < 0) s.alive = false;
        for (const pipe of s.pipes) {
          const withinX = BIRD_X + BIRD_R > pipe.x && BIRD_X - BIRD_R < pipe.x + PIPE_W;
          if (withinX && (s.y - BIRD_R < pipe.gapY || s.y + BIRD_R > pipe.gapY + GAP)) s.alive = false;
        }

        if (!s.alive) setOver(true);
      } else if (!s.started && s.alive) {
        // Idle bob before the first tap.
        s.y = H / 2 + Math.sin(performance.now() / 320) * 7;
      } else if (!s.alive) {
        // Fall to the floor after a crash.
        s.vy += GRAVITY * dt;
        s.y = Math.min(H - GROUND - BIRD_R, s.y + s.vy * dt);
      }

      // ---- draw ----
      c.clearRect(0, 0, W, H);
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#F2FBF6');
      sky.addColorStop(1, PALETTE.mint);
      c.fillStyle = sky;
      c.fillRect(0, 0, W, H);

      c.fillStyle = PALETTE.primary;
      s.pipes.forEach((pipe) => {
        roundRect(c, pipe.x, -10, PIPE_W, pipe.gapY + 10, 7);
        c.fill();
        roundRect(c, pipe.x, pipe.gapY + GAP, PIPE_W, H - GROUND - pipe.gapY - GAP, 7);
        c.fill();
        // lip detail
        c.fillStyle = PALETTE.primaryDark;
        c.fillRect(pipe.x - 2, pipe.gapY - 9, PIPE_W + 4, 9);
        c.fillRect(pipe.x - 2, pipe.gapY + GAP, PIPE_W + 4, 9);
        c.fillStyle = PALETTE.primary;
      });

      // ground
      c.fillStyle = '#D7E3DB';
      c.fillRect(0, H - GROUND, W, GROUND);
      c.fillStyle = '#C6D6CC';
      for (let x = 0; x < W; x += 18) c.fillRect(x, H - GROUND, 9, 4);

      // bird
      const tilt = Math.max(-0.5, Math.min(0.9, s.vy / 520));
      c.save();
      c.translate(BIRD_X, s.y);
      c.rotate(tilt);
      c.fillStyle = PALETTE.ink;
      c.beginPath();
      c.arc(0, 0, BIRD_R, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#F6C445';
      c.beginPath();
      c.moveTo(BIRD_R - 2, -1);
      c.lineTo(BIRD_R + 7, 2);
      c.lineTo(BIRD_R - 2, 5);
      c.closePath();
      c.fill();
      c.fillStyle = '#FFFFFF';
      c.beginPath();
      c.arc(3, -4, 3, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = PALETTE.primaryLight;
      c.beginPath();
      c.ellipse(-3, s.wing > 0 ? -5 : 3, 7, 4, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // score
      c.fillStyle = 'rgba(16,19,18,0.14)';
      c.font = 'bold 58px Outfit, Inter, sans-serif';
      c.textAlign = 'center';
      c.fillText(String(s.score), W / 2, 86);
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <GameShell
      slug={SLUG}
      title="Tap Flyer"
      tagline="Tap to flap, glide through the gaps, and see how far you get before gravity wins."
      keywords="flappy bird style game, tap flyer, free flying game online, one tap arcade game"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 }
      ]}
      onRestart={restart}
      restartLabel="New run"
      howTo={[
        'Tap the board (or press space) to flap upwards.',
        'Gravity pulls you down constantly — find a rhythm instead of panic-tapping.',
        'Pass between two pipes to score a point.',
        'Clipping a pipe, the ceiling, or the ground ends the run.'
      ]}
      about={
        <p>
          The gap stays a constant 128 units tall, but the pipes creep from 108 to 160 units per second
          as your score climbs, so the margin for a late correction shrinks even though the course never
          gets narrower.
        </p>
      }
    >
      <div className="relative mx-auto w-full max-w-[320px]">
        <canvas
          ref={canvasRef}
          className="w-full aspect-[2/3] rounded-xl border border-black/10 touch-none select-none"
          onPointerDown={(e) => {
            e.preventDefault();
            flap();
          }}
        />

        {!started && !over && (
          <div className="absolute inset-x-0 bottom-10 flex justify-center pointer-events-none">
            <span className="px-4 py-2 rounded-full bg-white/90 border border-black/10 text-xs font-semibold text-[#55605B]">
              Tap to start
            </span>
          </div>
        )}

        <GameOverlay
          show={over}
          tone="lose"
          title="Down you go"
          subtitle={`You cleared ${score} ${score === 1 ? 'pipe' : 'pipes'}.`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
