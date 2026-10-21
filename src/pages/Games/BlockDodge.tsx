import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, logicalPoint, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';

const SLUG = 'block-dodge';
const W = 320;
const H = 480;
const PLAYER_SIZE = 26;
const PLAYER_Y = H - 56;

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
}

interface State {
  playerX: number;
  targetX: number;
  blocks: Block[];
  spawnIn: number;
  elapsed: number;
  score: number;
  alive: boolean;
}

const initialState = (): State => ({
  playerX: W / 2,
  targetX: W / 2,
  blocks: [],
  spawnIn: 0.6,
  elapsed: 0,
  score: 0,
  alive: true
});

export default function BlockDodge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<State>(initialState());
  const keys = useRef({ left: false, right: false });

  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const restart = useCallback(() => {
    state.current = initialState();
    setScore(0);
    setOver(false);
    setIsRecord(false);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true;
      if (e.key === ' ' && !state.current.alive) restart();
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
  }, [restart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = sizeCanvas(canvas, W, H);
    const onResize = () => {
      ctx = sizeCanvas(canvas, W, H);
    };
    window.addEventListener('resize', onResize);

    const stop = startLoop((dt) => {
      const s = state.current;
      const c = ctx;
      if (!c) return;

      if (running && s.alive) {
        s.elapsed += dt;
        // Difficulty ramp: blocks fall faster and more often the longer you survive.
        const speed = 120 + s.elapsed * 14;
        const interval = Math.max(0.22, 0.65 - s.elapsed * 0.012);

        if (keys.current.left) s.targetX -= 330 * dt;
        if (keys.current.right) s.targetX += 330 * dt;
        s.targetX = Math.max(PLAYER_SIZE / 2, Math.min(W - PLAYER_SIZE / 2, s.targetX));
        // Ease towards the target so both drag and key control feel smooth rather than twitchy.
        s.playerX += (s.targetX - s.playerX) * Math.min(1, dt * 18);

        s.spawnIn -= dt;
        if (s.spawnIn <= 0) {
          s.spawnIn = interval;
          const w = 26 + Math.random() * 54;
          s.blocks.push({
            x: Math.random() * (W - w),
            y: -40,
            w,
            h: 18 + Math.random() * 16,
            vy: speed * (0.85 + Math.random() * 0.4)
          });
        }

        const px = s.playerX - PLAYER_SIZE / 2;
        for (const block of s.blocks) {
          block.y += block.vy * dt;
          const hit =
            px < block.x + block.w &&
            px + PLAYER_SIZE > block.x &&
            PLAYER_Y < block.y + block.h &&
            PLAYER_Y + PLAYER_SIZE > block.y;
          if (hit) s.alive = false;
        }

        const before = s.blocks.length;
        s.blocks = s.blocks.filter((b) => b.y < H + 40);
        // One point per block that makes it past you.
        if (s.blocks.length !== before) {
          s.score += before - s.blocks.length;
          setScore(s.score);
        }

        if (!s.alive) {
          setRunning(false);
          setOver(true);
        }
      }

      // ---- draw ----
      c.clearRect(0, 0, W, H);
      c.fillStyle = PALETTE.surfaceAlt;
      c.fillRect(0, 0, W, H);

      // lane guides
      c.strokeStyle = 'rgba(16,19,18,0.05)';
      c.lineWidth = 1;
      for (let x = 40; x < W; x += 40) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, H);
        c.stroke();
      }

      c.fillStyle = PALETTE.ink;
      s.blocks.forEach((block) => {
        roundRect(c, block.x, block.y, block.w, block.h, 5);
        c.fill();
      });

      // player
      c.fillStyle = s.alive ? PALETTE.primary : PALETTE.danger;
      roundRect(c, s.playerX - PLAYER_SIZE / 2, PLAYER_Y, PLAYER_SIZE, PLAYER_SIZE, 8);
      c.fill();

      // ground line
      c.strokeStyle = PALETTE.line;
      c.beginPath();
      c.moveTo(0, PLAYER_Y + PLAYER_SIZE + 8);
      c.lineTo(W, PLAYER_Y + PLAYER_SIZE + 8);
      c.stroke();
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, [running]);

  const movePointer = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x } = logicalPoint(canvas, clientX, 0, W, H);
    state.current.targetX = Math.max(PLAYER_SIZE / 2, Math.min(W - PLAYER_SIZE / 2, x));
  };

  return (
    <GameShell
      slug={SLUG}
      title="Block Dodge"
      tagline="Steer through a thickening rain of blocks. One touch ends the run, so every near miss counts."
      keywords="dodge the blocks game, avoid falling blocks, free reflex arcade game online"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: best ?? 0 }
      ]}
      onRestart={restart}
      restartLabel="New run"
      howTo={[
        'Drag anywhere on the board to slide left and right — on desktop use the arrow keys.',
        'Every block that falls past you is worth a point.',
        'Touching a single block ends the run.',
        'Blocks get faster and more frequent the longer you last.'
      ]}
      about={
        <p>
          The difficulty curve is time-based rather than score-based: fall speed climbs steadily and the
          gap between spawns shrinks to a floor of about a fifth of a second, so a long run eventually
          becomes a reading-the-gaps problem rather than a reaction one.
        </p>
      }
    >
      <div className="relative mx-auto w-full max-w-[320px]">
        <canvas
          ref={canvasRef}
          className="w-full aspect-[2/3] rounded-xl border border-black/10 touch-none select-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            movePointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === 'touch') movePointer(e.clientX);
          }}
        />

        {!running && !over && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-xl">
            <button
              onClick={restart}
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:scale-95 transition-all"
            >
              Start run
            </button>
          </div>
        )}

        <GameOverlay
          show={over}
          tone="lose"
          title="Hit!"
          subtitle={`You dodged ${score} blocks.`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
