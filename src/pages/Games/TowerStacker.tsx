import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';

const SLUG = 'tower-stacker';
const W = 320;
const H = 460;
const BLOCK_H = 20;
const BASE_W = 150;

interface Slab {
  x: number;
  w: number;
  /** Row index from the bottom. */
  row: number;
}

interface State {
  stack: Slab[];
  moving: Slab | null;
  dir: number;
  speed: number;
  /** How far the view has scrolled up, in pixels. */
  camera: number;
  score: number;
  perfects: number;
  over: boolean;
  /** Chips sheared off a miss, falling away for effect. */
  debris: { x: number; y: number; w: number; vy: number; vx: number }[];
}

const initialState = (): State => ({
  stack: [{ x: (W - BASE_W) / 2, w: BASE_W, row: 0 }],
  moving: { x: 0, w: BASE_W, row: 1 },
  dir: 1,
  speed: 130,
  camera: 0,
  score: 0,
  perfects: 0,
  over: false,
  debris: []
});

export default function TowerStacker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<State>(initialState());

  const [score, setScore] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [over, setOver] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const restart = useCallback(() => {
    state.current = initialState();
    setScore(0);
    setPerfects(0);
    setOver(false);
    setIsRecord(false);
  }, []);

  useEffect(() => {
    if (over) setIsRecord(submit(score));
  }, [over, score, submit]);

  /** Drops the sliding slab, trimming it to its overlap with the slab below. */
  const drop = useCallback(() => {
    const s = state.current;
    if (s.over || !s.moving) return;

    const below = s.stack[s.stack.length - 1];
    const moving = s.moving;
    const left = Math.max(moving.x, below.x);
    const right = Math.min(moving.x + moving.w, below.x + below.w);
    const overlap = right - left;

    if (overlap <= 0) {
      // Complete miss — the slab falls away and the run ends.
      s.debris.push({ x: moving.x, y: H - (moving.row + 1) * BLOCK_H + s.camera, w: moving.w, vy: 0, vx: s.dir * 40 });
      s.moving = null;
      s.over = true;
      setOver(true);
      return;
    }

    // Within two pixels counts as a perfect stack: nothing is trimmed and you get a bonus.
    const perfect = Math.abs(moving.x - below.x) <= 2;
    const placed: Slab = perfect
      ? { x: below.x, w: below.w, row: moving.row }
      : { x: left, w: overlap, row: moving.row };

    if (!perfect) {
      const chipX = moving.x < below.x ? moving.x : right;
      const chipW = moving.w - overlap;
      s.debris.push({
        x: chipX,
        y: H - (moving.row + 1) * BLOCK_H + s.camera,
        w: chipW,
        vy: 0,
        vx: moving.x < below.x ? -30 : 30
      });
    } else {
      s.perfects += 1;
      setPerfects(s.perfects);
    }

    s.stack.push(placed);
    s.score += perfect ? 2 : 1;
    setScore(s.score);
    s.speed = Math.min(360, 130 + s.score * 7);
    s.dir = Math.random() < 0.5 ? 1 : -1;
    s.moving = { x: s.dir > 0 ? -placed.w : W, w: placed.w, row: placed.row + 1 };

    // Keep the active row roughly a third of the way up the view.
    const activeY = H - (s.moving.row + 1) * BLOCK_H;
    if (activeY < H * 0.42) s.camera = H * 0.42 - activeY;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (state.current.over) restart();
        else drop();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drop, restart]);

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

      if (!s.over && s.moving) {
        s.moving.x += s.dir * s.speed * dt;
        // Bounce off both edges, allowing the slab to travel fully off-screen for a hard swing.
        if (s.moving.x + s.moving.w > W + 8 && s.dir > 0) s.dir = -1;
        if (s.moving.x < -8 && s.dir < 0) s.dir = 1;
      }

      s.debris.forEach((chip) => {
        chip.vy += 900 * dt;
        chip.y += chip.vy * dt;
        chip.x += chip.vx * dt;
      });
      s.debris = s.debris.filter((chip) => chip.y < H + 60);

      // ---- draw ----
      c.clearRect(0, 0, W, H);
      const sky = c.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#FFFFFF');
      sky.addColorStop(1, PALETTE.mint);
      c.fillStyle = sky;
      c.fillRect(0, 0, W, H);

      const colorFor = (row: number) => {
        const ramp = ['#006622', '#0A7D40', PALETTE.primary, '#2EBA6B', '#4FCB89', '#7CD9A6'];
        return ramp[row % ramp.length];
      };

      s.stack.forEach((slab) => {
        const y = H - (slab.row + 1) * BLOCK_H + s.camera;
        if (y > H + BLOCK_H || y < -BLOCK_H) return;
        c.fillStyle = colorFor(slab.row);
        roundRect(c, slab.x, y, slab.w, BLOCK_H - 2, 3);
        c.fill();
      });

      if (s.moving) {
        const y = H - (s.moving.row + 1) * BLOCK_H + s.camera;
        c.fillStyle = colorFor(s.moving.row);
        roundRect(c, s.moving.x, y, s.moving.w, BLOCK_H - 2, 3);
        c.fill();
      }

      c.fillStyle = 'rgba(16,19,18,0.18)';
      s.debris.forEach((chip) => {
        roundRect(c, chip.x, chip.y, chip.w, BLOCK_H - 2, 3);
        c.fill();
      });

      c.fillStyle = 'rgba(16,19,18,0.12)';
      c.font = 'bold 52px Outfit, Inter, sans-serif';
      c.textAlign = 'center';
      c.fillText(String(s.score), W / 2, 70);
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <GameShell
      slug={SLUG}
      title="Tower Stacker"
      tagline="Time your tap to drop each slab dead centre. Miss and the tower narrows until nothing is left."
      keywords="stacker game, tower stacking game online, timing game free, stack the blocks"
      stats={[
        { label: 'Height', value: score, accent: true },
        { label: 'Best', value: best ?? 0 },
        { label: 'Perfect', value: perfects }
      ]}
      onRestart={restart}
      restartLabel="New tower"
      howTo={[
        'A slab slides back and forth above the tower — tap anywhere to drop it.',
        'Only the part that overlaps the slab below survives; the rest shears off.',
        'Land it within two pixels for a perfect stack: nothing is lost and it is worth double.',
        'Miss the tower completely and the run is over.'
      ]}
      about={
        <p>
          The slab speeds up by seven units of travel for every block you place, topping out at nearly
          three times the starting pace. Because a trimmed slab stays trimmed, a few sloppy taps early
          make the late game much harder than the speed alone suggests.
        </p>
      }
    >
      <div className="relative mx-auto w-full max-w-[320px]">
        <canvas
          ref={canvasRef}
          className="w-full rounded-xl border border-black/10 touch-none select-none"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={(e) => {
            e.preventDefault();
            drop();
          }}
        />

        <GameOverlay
          show={over}
          tone="lose"
          title="Missed the tower"
          subtitle={`${score} blocks high, ${perfects} perfect.`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
