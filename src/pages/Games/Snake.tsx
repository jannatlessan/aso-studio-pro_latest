import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, roundRect, sizeCanvas, startLoop } from '../../lib/gameCanvas';
import { keyToDirection, useSwipe, type Direction } from '../../hooks/useSwipe';
import { audio } from '../../lib/gameAudio';
import { FloatingTexts, Particles, Shake, clamp01, easeOutBack } from '../../lib/juice';

const SLUG = 'snake';
const GRID = 19;
const CELL = 20;
const SIZE = GRID * CELL;

/** Apples needed per level, and the speed/obstacle curve that follows from it. */
const APPLES_PER_LEVEL = 5;
const BASE_STEP = 0.155;
const MIN_STEP = 0.062;
const COMBO_WINDOW = 2.6;

type Mode = 'Walls' | 'Wrap';
type Phase = 'idle' | 'playing' | 'paused' | 'dying' | 'dead';

interface Pt {
  x: number;
  y: number;
}

interface Golden {
  pos: Pt;
  ttl: number;
  maxTtl: number;
}

interface State {
  snake: Pt[];
  /** Where each segment was on the previous step, so movement can be drawn between ticks. */
  prev: Pt[];
  dir: Pt;
  queue: Pt[];
  apple: Pt;
  golden: Golden | null;
  walls: Pt[];
  stepTime: number;
  sinceStep: number;
  score: number;
  apples: number;
  level: number;
  combo: number;
  comboTimer: number;
  phase: Phase;
  dieTimer: number;
  /** Eaten-this-step flash used to pulse the head. */
  chomp: number;
}

const VECTOR: Record<Direction, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const same = (a: Pt, b: Pt) => a.x === b.x && a.y === b.y;

function freeCells(s: Pick<State, 'snake' | 'walls' | 'apple' | 'golden'>, includeApple = true) {
  const taken = new Set<string>();
  s.snake.forEach((p) => taken.add(`${p.x},${p.y}`));
  s.walls.forEach((p) => taken.add(`${p.x},${p.y}`));
  if (includeApple && s.apple) taken.add(`${s.apple.x},${s.apple.y}`);
  if (s.golden) taken.add(`${s.golden.pos.x},${s.golden.pos.y}`);
  const free: Pt[] = [];
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  return free;
}

const pickFree = (s: Pick<State, 'snake' | 'walls' | 'apple' | 'golden'>): Pt => {
  const free = freeCells(s);
  return free.length ? free[Math.floor(Math.random() * free.length)] : { x: 0, y: 0 };
};

function initialState(): State {
  const snake = [
    { x: 9, y: 10 },
    { x: 9, y: 11 },
    { x: 9, y: 12 }
  ];
  const base: State = {
    snake,
    prev: snake.map((p) => ({ ...p })),
    dir: VECTOR.up,
    queue: [],
    apple: { x: 9, y: 5 },
    golden: null,
    walls: [],
    stepTime: BASE_STEP,
    sinceStep: 0,
    score: 0,
    apples: 0,
    level: 1,
    combo: 0,
    comboTimer: 0,
    phase: 'idle',
    dieTimer: 0,
    chomp: 0
  };
  base.apple = pickFree(base);
  return base;
}

/** Two wall blocks per level from level 3, never adjacent to the snake's current path. */
function addWalls(s: State) {
  const free = freeCells(s).filter(
    (c) => Math.abs(c.x - s.snake[0].x) > 2 || Math.abs(c.y - s.snake[0].y) > 2
  );
  for (let i = 0; i < 2 && free.length; i++) {
    const index = Math.floor(Math.random() * free.length);
    s.walls.push(free.splice(index, 1)[0]);
  }
}

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const state = useRef<State>(initialState());
  const fx = useRef({ particles: new Particles(), shake: new Shake(), texts: new FloatingTexts() });
  const modeRef = useRef<Mode>('Walls');

  const [mode, setMode] = useState<Mode>('Walls');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(`${SLUG}.walls`);
  const { best: bestWrap, submit: submitWrap } = useBestScore(`${SLUG}.wrap`);

  const activeBest = mode === 'Walls' ? best : bestWrap;
  const activeSubmit = mode === 'Walls' ? submit : submitWrap;

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  const restart = useCallback(() => {
    state.current = initialState();
    fx.current.particles.clear();
    fx.current.texts.clear();
    fx.current.shake.clear();
    setScore(0);
    setLevel(1);
    setCombo(0);
    setPhase('idle');
    setIsRecord(false);
  }, []);

  /** Begins the run. Kept separate from `turn` so the Start button never depends on a direction. */
  const begin = useCallback(() => {
    const s = state.current;
    if (s.phase !== 'idle') return;
    s.phase = 'playing';
    setPhase('playing');
    audio.play('ui');
  }, []);

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

  const turn = useCallback(
    (dir: Direction) => {
      const s = state.current;
      if (s.phase === 'idle') begin();
      if (s.phase !== 'playing') return;
      const next = VECTOR[dir];
      const reference = s.queue.length ? s.queue[s.queue.length - 1] : s.dir;
      // A reversal would drive the head into the neck, and repeating the current heading is a no-op.
      if (reference.x === -next.x && reference.y === -next.y) return;
      if (reference.x === next.x && reference.y === next.y) return;
      if (s.queue.length < 2) {
        s.queue.push(next);
        audio.play('move');
      }
    },
    [begin]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        if (state.current.phase === 'idle') begin();
        else togglePause();
        return;
      }
      const dir = keyToDirection(e.key);
      if (!dir) return;
      e.preventDefault();
      turn(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn, begin, togglePause]);

  useSwipe(wrapRef, turn);

  // ---- simulation + rendering ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = sizeCanvas(canvas, SIZE, SIZE);
    const onResize = () => {
      ctx = sizeCanvas(canvas, SIZE, SIZE);
    };
    window.addEventListener('resize', onResize);

    const center = (p: Pt) => ({ x: p.x * CELL + CELL / 2, y: p.y * CELL + CELL / 2 });

    const die = (s: State) => {
      s.phase = 'dying';
      s.dieTimer = 0.75;
      setPhase('dying');
      fx.current.shake.trigger(13, 0.4);
      const head = center(s.snake[0]);
      fx.current.particles.burst(head.x, head.y, PALETTE.primaryDark, 22, { speed: 210, life: 0.7 });
      audio.play('crash');
    };

    const step = (s: State) => {
      if (s.queue.length) s.dir = s.queue.shift() as Pt;
      s.prev = s.snake.map((p) => ({ ...p }));

      const head: Pt = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      const wrapping = modeRef.current === 'Wrap';

      if (wrapping) {
        head.x = (head.x + GRID) % GRID;
        head.y = (head.y + GRID) % GRID;
      } else if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
        die(s);
        return;
      }

      // The tail tip vacates this step, so it is not an obstacle.
      if (s.snake.slice(0, -1).some((p) => same(p, head)) || s.walls.some((p) => same(p, head))) {
        die(s);
        return;
      }

      s.snake.unshift(head);

      const ateGolden = s.golden && same(head, s.golden.pos);
      const ateApple = same(head, s.apple);

      if (ateApple || ateGolden) {
        const at = center(head);
        s.chomp = 0.18;
        s.combo = s.comboTimer > 0 ? Math.min(5, s.combo + 1) : 1;
        s.comboTimer = COMBO_WINDOW;

        const base = ateGolden ? 50 : 10;
        const gained = base * s.combo;
        s.score += gained;
        setScore(s.score);
        setCombo(s.combo);

        fx.current.texts.add(
          at.x,
          at.y - 6,
          `+${gained}${s.combo > 1 ? ` x${s.combo}` : ''}`,
          ateGolden ? '#B8860B' : PALETTE.primaryDark,
          ateGolden ? 18 : 15
        );

        if (ateGolden) {
          fx.current.particles.burst(at.x, at.y, '#F6C445', 26, { speed: 200, life: 0.7 });
          fx.current.shake.trigger(6, 0.22);
          audio.play('bonus');
          s.golden = null;
        } else {
          fx.current.particles.burst(at.x, at.y, '#D34545', 14, { speed: 150 });
          audio.play(s.combo > 1 ? 'combo' : 'eat', 1 + (s.combo - 1) * 0.08);
          s.apples += 1;
          s.apple = pickFree(s);

          // A golden apple shows up every sixth apple and expires if ignored.
          if (s.apples % 6 === 0) {
            const spot = pickFree(s);
            s.golden = { pos: spot, ttl: 7, maxTtl: 7 };
          }

          if (s.apples % APPLES_PER_LEVEL === 0) {
            s.level += 1;
            setLevel(s.level);
            s.stepTime = Math.max(MIN_STEP, BASE_STEP - (s.level - 1) * 0.0085);
            if (s.level >= 3 && modeRef.current === 'Walls') addWalls(s);
            fx.current.texts.add(SIZE / 2, SIZE / 2, `LEVEL ${s.level}`, PALETTE.primary, 22, 1.1);
            fx.current.shake.trigger(5, 0.2);
            audio.play('levelup');
          }
        }
      } else {
        s.snake.pop();
      }
    };

    const stop = startLoop((dt) => {
      const c = ctx;
      if (!c) return;
      const s = state.current;
      const { particles, shake, texts } = fx.current;

      if (s.phase === 'playing') {
        s.sinceStep += dt;
        s.chomp = Math.max(0, s.chomp - dt);
        if (s.comboTimer > 0) {
          s.comboTimer = Math.max(0, s.comboTimer - dt);
          if (s.comboTimer === 0 && s.combo) {
            s.combo = 0;
            setCombo(0);
          }
        }
        if (s.golden) {
          s.golden.ttl -= dt;
          if (s.golden.ttl <= 0) s.golden = null;
        }
        while (s.sinceStep >= s.stepTime && s.phase === 'playing') {
          s.sinceStep -= s.stepTime;
          step(s);
        }
      } else if (s.phase === 'dying') {
        s.dieTimer -= dt;
        if (s.dieTimer <= 0) {
          s.phase = 'dead';
          setPhase('dead');
          audio.play('gameover');
        }
      }

      particles.update(dt);
      texts.update(dt);
      shake.update(dt);

      // ---------- draw ----------
      c.clearRect(0, 0, SIZE, SIZE);
      shake.apply(c);

      // board
      c.fillStyle = '#F2F6F4';
      c.fillRect(-20, -20, SIZE + 40, SIZE + 40);
      for (let x = 0; x < GRID; x++) {
        for (let y = 0; y < GRID; y++) {
          if ((x + y) % 2 === 0) {
            c.fillStyle = '#EDF2EF';
            c.fillRect(x * CELL, y * CELL, CELL, CELL);
          }
        }
      }

      // walls
      s.walls.forEach((w) => {
        c.fillStyle = '#39443E';
        roundRect(c, w.x * CELL + 1, w.y * CELL + 1, CELL - 2, CELL - 2, 4);
        c.fill();
        c.fillStyle = 'rgba(255,255,255,0.12)';
        roundRect(c, w.x * CELL + 3.5, w.y * CELL + 3.5, CELL - 7, (CELL - 7) / 2.4, 2);
        c.fill();
      });

      // apple
      const pulse = 1 + Math.sin(performance.now() / 220) * 0.06;
      const ap = center(s.apple);
      c.save();
      c.translate(ap.x, ap.y);
      c.scale(pulse, pulse);
      c.fillStyle = '#D34545';
      c.beginPath();
      c.arc(0, 1, CELL * 0.31, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#2F7D4F';
      c.beginPath();
      c.ellipse(3.5, -CELL * 0.3, 4, 2.2, -0.6, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.beginPath();
      c.arc(-2.5, -2, 1.8, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // golden apple with a draining timer ring
      if (s.golden) {
        const gp = center(s.golden.pos);
        const remaining = s.golden.ttl / s.golden.maxTtl;
        c.save();
        c.translate(gp.x, gp.y);
        c.rotate(performance.now() / 900);
        c.fillStyle = '#F6C445';
        c.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = i % 2 === 0 ? CELL * 0.36 : CELL * 0.17;
          c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.closePath();
        c.fill();
        c.restore();
        c.strokeStyle = '#B8860B';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(gp.x, gp.y, CELL * 0.46, -Math.PI / 2, -Math.PI / 2 + remaining * Math.PI * 2);
        c.stroke();
      }

      // snake, drawn as one rounded polyline through interpolated segment centres
      const t = s.phase === 'playing' ? clamp01(s.sinceStep / s.stepTime) : 1;
      const points: Pt[] = s.snake.map((seg, i) => {
        const from = s.prev[i] ?? s.prev[s.prev.length - 1] ?? seg;
        // A wrapped segment jumps across the board, so snap instead of sliding through the middle.
        if (Math.abs(from.x - seg.x) > 1 || Math.abs(from.y - seg.y) > 1) return center(seg);
        const a = center(from);
        const b = center(seg);
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      });

      const dying = s.phase === 'dying';
      const flash = dying && Math.floor(s.dieTimer * 12) % 2 === 0;

      c.lineJoin = 'round';
      c.lineCap = 'round';
      c.strokeStyle = flash ? '#D34545' : PALETTE.primary;
      c.lineWidth = CELL * 0.78;
      c.beginPath();
      points.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      if (points.length === 1) c.lineTo(points[0].x + 0.01, points[0].y);
      c.stroke();

      // lighter inner highlight down the spine
      c.strokeStyle = flash ? '#E27A7A' : '#43C183';
      c.lineWidth = CELL * 0.34;
      c.beginPath();
      points.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
      if (points.length === 1) c.lineTo(points[0].x + 0.01, points[0].y);
      c.stroke();

      // head
      const head = points[0];
      const chomp = 1 + s.chomp * 1.6;
      c.save();
      c.translate(head.x, head.y);
      c.scale(chomp, chomp);
      c.fillStyle = flash ? '#B91C1C' : PALETTE.primaryDark;
      roundRect(c, -CELL * 0.42, -CELL * 0.42, CELL * 0.84, CELL * 0.84, 7);
      c.fill();

      // eyes look along the direction of travel
      const dx = s.dir.x;
      const dy = s.dir.y;
      const eyeOffset = CELL * 0.17;
      const forward = CELL * 0.13;
      const eyes: Pt[] = [
        { x: dx * forward - dy * eyeOffset, y: dy * forward + dx * eyeOffset },
        { x: dx * forward + dy * eyeOffset, y: dy * forward - dx * eyeOffset }
      ];
      eyes.forEach((e) => {
        c.fillStyle = '#FFFFFF';
        c.beginPath();
        c.arc(e.x, e.y, 2.9, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#101312';
        c.beginPath();
        c.arc(e.x + dx * 1.1, e.y + dy * 1.1, 1.5, 0, Math.PI * 2);
        c.fill();
      });
      c.restore();

      particles.draw(c);
      texts.draw(c);
      shake.restore(c);

      // combo pip in the corner
      if (s.combo > 1 && s.phase === 'playing') {
        const fade = clamp01(s.comboTimer / COMBO_WINDOW);
        c.globalAlpha = 0.25 + fade * 0.6;
        c.fillStyle = PALETTE.primaryDark;
        c.font = 'bold 15px Outfit, Inter, sans-serif';
        c.textAlign = 'left';
        c.fillText(`COMBO x${s.combo}`, 10, 22);
        c.globalAlpha = 1;
      }

      if (s.phase === 'paused') {
        c.fillStyle = 'rgba(255,255,255,0.72)';
        c.fillRect(0, 0, SIZE, SIZE);
        c.fillStyle = PALETTE.ink;
        c.font = 'bold 26px Outfit, Inter, sans-serif';
        c.textAlign = 'center';
        c.fillText('Paused', SIZE / 2, SIZE / 2 + 8);
      }

      if (s.phase === 'idle') {
        const bob = easeOutBack(clamp01((performance.now() % 2400) / 1200));
        c.globalAlpha = 0.55 + Math.sin(performance.now() / 500) * 0.2;
        c.fillStyle = PALETTE.ink;
        c.font = 'bold 13px Inter, sans-serif';
        c.textAlign = 'center';
        c.fillText('swipe · arrows · WASD', SIZE / 2, SIZE - 26 - bob * 2);
        c.globalAlpha = 1;
      }
    });

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (phase === 'dead') setIsRecord(activeSubmit(state.current.score));
  }, [phase, activeSubmit]);

  const length = state.current.snake.length;

  return (
    <GameShell
      slug={SLUG}
      title="Snake"
      tagline="Eat, grow, and never bite your own tail. Chain apples for combo multipliers before the walls close in."
      keywords="snake game online, play snake free, classic snake browser game, mobile snake with levels"
      stats={[
        { label: 'Score', value: score, accent: true },
        { label: 'Best', value: activeBest ?? 0 },
        { label: 'Level', value: level },
        { label: 'Combo', value: combo > 1 ? `x${combo}` : '—' }
      ]}
      onRestart={restart}
      sound
      restartLabel="New game"
      actions={
        <button
          onClick={() => (phase === 'idle' ? begin() : togglePause())}
          aria-label={phase === 'paused' ? 'Resume' : 'Pause'}
          disabled={phase === 'dead' || phase === 'dying'}
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-xl border border-black/10 bg-[#F6F8F7] text-[#55605B] hover:text-primary hover:border-primary/30 active:scale-95 transition-all disabled:opacity-40"
        >
          {phase === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      }
      howTo={[
        'Swipe the board, tap the arrows, or use the arrow keys / WASD to turn.',
        'Red apples are 10 points. Eat the next one within a couple of seconds to build a combo, up to 5x.',
        'A golden star appears every sixth apple — worth 50 a pop, but it expires if you dawdle.',
        'Every 5 apples is a level: you speed up, and from level 3 two walls drop into the arena.'
      ]}
      about={
        <>
          <p>
            Two modes: <strong>Walls</strong> is the classic — the edge of the board kills you, and
            obstacles accumulate as you level up. <strong>Wrap</strong> removes the border so you pass
            through one side and come out the other, which makes long snakes far more manageable. Each
            mode keeps its own best score.
          </p>
          <p>
            Turns are queued, so a quick two-swipe corner registers both inputs instead of the second
            overwriting the first, and reversals are ignored so a mis-swipe never kills you outright.
          </p>
        </>
      }
    >
      <div ref={wrapRef} className="relative mx-auto w-full max-w-[380px] touch-none">
        <canvas
          ref={canvasRef}
          className="w-full aspect-square rounded-xl border border-black/10 select-none"
          onPointerDown={() => {
            if (state.current.phase === 'idle') begin();
          }}
        />

        {phase === 'idle' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85 backdrop-blur-sm rounded-xl">
            <div className="text-center space-y-3">
              <p className="text-xs text-[#55605B] font-medium">Eat apples, dodge yourself</p>
              <button
                onClick={begin}
                className="px-7 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark active:scale-95 transition-all shadow-sm shadow-primary/25"
              >
                Start game
              </button>
            </div>
          </div>
        )}

        <GameOverlay
          show={phase === 'dead'}
          tone="lose"
          title="Game over"
          subtitle={`${score} points · level ${level} · length ${length}`}
          onAction={restart}
          isRecord={isRecord}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 max-w-[190px] mx-auto">
        <span />
        <PadButton label="▲" onPress={() => turn('up')} />
        <span />
        <PadButton label="◀" onPress={() => turn('left')} />
        <PadButton label="▼" onPress={() => turn('down')} />
        <PadButton label="▶" onPress={() => turn('right')} />
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {(['Walls', 'Wrap'] as Mode[]).map((option) => (
          <button
            key={option}
            onClick={() => {
              setMode(option);
              modeRef.current = option;
              restart();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              mode === option
                ? 'border-primary/40 bg-mint text-primary'
                : 'border-black/10 bg-white text-[#55605B] hover:border-primary/30'
            }`}
          >
            {option}
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
