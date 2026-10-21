import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, logicalPoint, sizeCanvas, startLoop } from '../../lib/gameCanvas';

const SLUG = 'hoop-shot';
const W = 320;
const H = 440;

const GRAVITY = 760;
const BALL_R = 11;
const START = { x: 60, y: H - 50 };
const RIM_W = 54;
const RIM_Y = 150;
const ROUND_SECONDS = 60;

interface State {
  ball: { x: number; y: number; vx: number; vy: number };
  flying: boolean;
  /** Current drag, used to draw the aim line and compute the launch impulse. */
  drag: { x: number; y: number } | null;
  rimX: number;
  rimDir: number;
  rimSpeed: number;
  score: number;
  shots: number;
  /** Set once per flight, so a ball cannot score twice on the way down. */
  scored: boolean;
  swish: number;
  elapsed: number;
}

const initialState = (): State => ({
  ball: { ...START, vx: 0, vy: 0 },
  flying: false,
  drag: null,
  rimX: W / 2 + 40,
  rimDir: 1,
  rimSpeed: 34,
  score: 0,
  shots: 0,
  scored: false,
  swish: 0,
  elapsed: 0
});

export default function HoopShot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<State>(initialState());

  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [over, setOver] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const restart = useCallback(() => {
    state.current = initialState();
    setScore(0);
    setShots(0);
    setSecondsLeft(ROUND_SECONDS);
    setOver(false);
    setIsRecord(false);
  }, []);

  useEffect(() => {
    if (over) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [over]);

  useEffect(() => {
    if (secondsLeft === 0) setOver(true);
  }, [secondsLeft]);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

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

      if (!over) {
        s.elapsed += dt;
        // The hoop drifts side to side, a little faster as the round goes on.
        s.rimSpeed = 34 + Math.min(46, s.elapsed * 1.1);
        s.rimX += s.rimDir * s.rimSpeed * dt;
        if (s.rimX > W - RIM_W / 2 - 8) s.rimDir = -1;
        if (s.rimX < W / 2 - 10) s.rimDir = 1;
      }

      if (s.swish > 0) s.swish = Math.max(0, s.swish - dt);

      if (s.flying) {
        const ball = s.ball;
        ball.vy += GRAVITY * dt;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Side walls bounce, with some energy lost.
        if (ball.x - BALL_R < 0) {
          ball.x = BALL_R;
          ball.vx = Math.abs(ball.vx) * 0.7;
        }
        if (ball.x + BALL_R > W) {
          ball.x = W - BALL_R;
          ball.vx = -Math.abs(ball.vx) * 0.7;
        }

        // Backboard behind the hoop.
        const boardX = s.rimX + RIM_W / 2 + 4;
        if (ball.x + BALL_R > boardX && ball.y > RIM_Y - 64 && ball.y < RIM_Y + 6 && ball.vx > 0) {
          ball.x = boardX - BALL_R;
          ball.vx = -Math.abs(ball.vx) * 0.6;
        }

        // A basket counts when the ball crosses the rim line downwards, between the posts.
        const left = s.rimX - RIM_W / 2;
        const right = s.rimX + RIM_W / 2;
        if (
          !s.scored &&
          ball.vy > 0 &&
          ball.y - BALL_R < RIM_Y &&
          ball.y + BALL_R > RIM_Y &&
          ball.x > left + 6 &&
          ball.x < right - 6
        ) {
          s.scored = true;
          s.score += 1;
          s.swish = 0.6;
          setScore(s.score);
        }

        // Rim edges deflect the ball.
        [left, right].forEach((edgeX) => {
          const dx = ball.x - edgeX;
          const dy = ball.y - RIM_Y;
          const distance = Math.hypot(dx, dy);
          if (distance < BALL_R + 2 && !s.scored) {
            const nx = dx / (distance || 1);
            const ny = dy / (distance || 1);
            ball.x = edgeX + nx * (BALL_R + 2);
            ball.y = RIM_Y + ny * (BALL_R + 2);
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * 0.62;
            ball.vy = (ball.vy - 2 * dot * ny) * 0.62;
          }
        });

        // Floor, then reset for the next shot.
        if (ball.y + BALL_R > H - 8) {
          ball.y = H - 8 - BALL_R;
          ball.vy = -ball.vy * 0.45;
          ball.vx *= 0.7;
          if (Math.abs(ball.vy) < 60) {
            s.flying = false;
            s.scored = false;
            s.ball = { ...START, vx: 0, vy: 0 };
          }
        }
        if (ball.y > H + 80) {
          s.flying = false;
          s.scored = false;
          s.ball = { ...START, vx: 0, vy: 0 };
        }
      }

      // ---- draw ----
      c.clearRect(0, 0, W, H);
      const bg = c.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#FFFFFF');
      bg.addColorStop(1, PALETTE.mint);
      c.fillStyle = bg;
      c.fillRect(0, 0, W, H);

      // floor
      c.fillStyle = '#D7E3DB';
      c.fillRect(0, H - 8, W, 8);

      // backboard + rim
      const left = s.rimX - RIM_W / 2;
      const right = s.rimX + RIM_W / 2;
      c.strokeStyle = PALETTE.ink;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(right + 4, RIM_Y - 64);
      c.lineTo(right + 4, RIM_Y + 6);
      c.stroke();

      c.strokeStyle = '#B91C1C';
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(left, RIM_Y);
      c.lineTo(right, RIM_Y);
      c.stroke();

      // net
      c.strokeStyle = 'rgba(16,19,18,0.28)';
      c.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const x = left + (RIM_W / 4) * i;
        c.beginPath();
        c.moveTo(x, RIM_Y);
        c.lineTo(s.rimX + (x - s.rimX) * 0.45, RIM_Y + 26);
        c.stroke();
      }
      c.beginPath();
      c.moveTo(left + RIM_W * 0.275, RIM_Y + 26);
      c.lineTo(right - RIM_W * 0.275, RIM_Y + 26);
      c.stroke();

      if (s.swish > 0) {
        c.fillStyle = `rgba(14,157,82,${s.swish})`;
        c.font = 'bold 20px Outfit, Inter, sans-serif';
        c.textAlign = 'center';
        c.fillText('SWISH', s.rimX, RIM_Y - 18);
      }

      // aim line while dragging
      if (s.drag && !s.flying) {
        const dx = START.x - s.drag.x;
        const dy = START.y - s.drag.y;
        c.strokeStyle = 'rgba(14,157,82,0.45)';
        c.lineWidth = 2;
        c.setLineDash([5, 5]);
        c.beginPath();
        c.moveTo(START.x, START.y);
        c.lineTo(START.x + dx * 0.9, START.y + dy * 0.9);
        c.stroke();
        c.setLineDash([]);

        // power meter
        const power = Math.min(1, Math.hypot(dx, dy) / 150);
        c.fillStyle = 'rgba(16,19,18,0.08)';
        c.fillRect(16, H - 22, 90, 6);
        c.fillStyle = PALETTE.primary;
        c.fillRect(16, H - 22, 90 * power, 6);
      }

      // ball
      c.fillStyle = '#D97706';
      c.beginPath();
      c.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.35)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(s.ball.x - BALL_R, s.ball.y);
      c.lineTo(s.ball.x + BALL_R, s.ball.y);
      c.stroke();
      c.beginPath();
      c.moveTo(s.ball.x, s.ball.y - BALL_R);
      c.lineTo(s.ball.x, s.ball.y + BALL_R);
      c.stroke();
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, [over]);

  const pointFrom = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return logicalPoint(canvas, clientX, clientY, W, H);
  };

  const release = () => {
    const s = state.current;
    if (!s.drag || s.flying || over) {
      s.drag = null;
      return;
    }
    const dx = START.x - s.drag.x;
    const dy = START.y - s.drag.y;
    s.drag = null;
    // Flick must be meaningful, and upward, to count as a shot.
    if (Math.hypot(dx, dy) < 18 || dy > -8) return;
    const power = Math.min(1, Math.hypot(dx, dy) / 150);
    const speed = 240 + power * 420;
    const length = Math.hypot(dx, dy) || 1;
    s.ball = { ...START, vx: (dx / length) * speed, vy: (dy / length) * speed };
    s.flying = true;
    s.scored = false;
    s.shots += 1;
    setShots(s.shots);
  };

  const accuracy = shots ? Math.round((score / shots) * 100) : 0;

  return (
    <GameShell
      slug={SLUG}
      title="Hoop Shot"
      tagline="Drag back, aim, and release. Real gravity, a moving hoop, and sixty seconds on the clock."
      keywords="basketball shooting game, hoop shot online, physics basketball game free, flick shooting game"
      stats={[
        { label: 'Baskets', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Shots', value: shots },
        { label: 'Time', value: `${secondsLeft}s` }
      ]}
      onRestart={restart}
      restartLabel="New round"
      howTo={[
        'Drag down and back from the ball, like pulling a slingshot, then release to shoot.',
        'The dashed line shows your direction and the bar shows your power.',
        'The ball must drop through the rim from above to count.',
        'You have sixty seconds — the hoop also speeds up as the clock runs down.'
      ]}
      about={
        <p>
          The ball is simulated with constant gravity and loses energy on every bounce, so the rim and
          the backboard are both live — bank shots genuinely work. The hoop drifts faster the longer the
          round runs, which is what stops a single groove from carrying you.
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
            const point = pointFrom(e.clientX, e.clientY);
            if (point) state.current.drag = point;
          }}
          onPointerMove={(e) => {
            if (!state.current.drag) return;
            const point = pointFrom(e.clientX, e.clientY);
            if (point) state.current.drag = point;
          }}
          onPointerUp={release}
          onPointerCancel={release}
        />

        <GameOverlay
          show={over}
          tone={score > 0 ? 'win' : 'neutral'}
          title="Time!"
          subtitle={`${score} ${score === 1 ? 'basket' : 'baskets'} from ${shots} ${
            shots === 1 ? 'shot' : 'shots'
          } (${accuracy}%).`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
