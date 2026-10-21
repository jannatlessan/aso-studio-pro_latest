import { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { GameOverlay } from '../../components/GameShell';
import { useBestScore } from '../../hooks/useBestScore';
import { PALETTE, logicalPoint, sizeCanvas } from '../../lib/gameCanvas';

const SLUG = 'trace-master';
const SIZE = 300;
const ROUNDS = 3;
/** How far off the line you can be, in logical units, before accuracy starts dropping hard. */
const TOLERANCE = 16;

interface Point {
  x: number;
  y: number;
}

interface Shape {
  name: string;
  /** Closed or open polyline sampled densely enough to measure against. */
  path: Point[];
}

const circle = (cx: number, cy: number, r: number, turns = 1): Point[] =>
  [...Array(121).keys()].map((i) => {
    const t = (i / 120) * Math.PI * 2 * turns - Math.PI / 2;
    return { x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r };
  });

const polygon = (cx: number, cy: number, r: number, sides: number, rotation = -Math.PI / 2): Point[] => {
  const corners = [...Array(sides).keys()].map((i) => ({
    x: cx + Math.cos(rotation + (i / sides) * Math.PI * 2) * r,
    y: cy + Math.sin(rotation + (i / sides) * Math.PI * 2) * r
  }));
  const path: Point[] = [];
  for (let i = 0; i <= sides; i++) {
    const a = corners[i % sides];
    const b = corners[(i + 1) % sides];
    for (let s = 0; s < 20; s++) {
      path.push({ x: a.x + (b.x - a.x) * (s / 20), y: a.y + (b.y - a.y) * (s / 20) });
    }
  }
  return path;
};

const star = (cx: number, cy: number, outer: number, inner: number): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    points.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  const path: Point[] = [];
  for (let i = 0; i <= points.length; i++) {
    const a = points[i % points.length];
    const b = points[(i + 1) % points.length];
    for (let s = 0; s < 12; s++) {
      path.push({ x: a.x + (b.x - a.x) * (s / 12), y: a.y + (b.y - a.y) * (s / 12) });
    }
  }
  return path;
};

const wave = (): Point[] =>
  [...Array(121).keys()].map((i) => ({
    x: 30 + (i / 120) * 240,
    y: 150 + Math.sin((i / 120) * Math.PI * 4) * 60
  }));

const spiral = (): Point[] =>
  [...Array(181).keys()].map((i) => {
    const t = (i / 180) * Math.PI * 5;
    const r = 18 + (i / 180) * 100;
    return { x: 150 + Math.cos(t) * r, y: 150 + Math.sin(t) * r };
  });

const SHAPES: Shape[] = [
  { name: 'Circle', path: circle(150, 150, 110) },
  { name: 'Square', path: polygon(150, 150, 115, 4, Math.PI / 4) },
  { name: 'Triangle', path: polygon(150, 155, 120, 3) },
  { name: 'Star', path: star(150, 152, 118, 50) },
  { name: 'Wave', path: wave() },
  { name: 'Spiral', path: spiral() }
];

/** Shortest distance from `p` to segment ab. */
function distanceToSegment(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

const distanceToPath = (p: Point, path: Point[]) => {
  let shortest = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    shortest = Math.min(shortest, distanceToSegment(p, path[i], path[i + 1]));
  }
  return shortest;
};

/**
 * Accuracy combines two things: how close the stroke stayed to the guide, and how much of the guide
 * it actually covered — so a tiny perfect squiggle on one corner cannot score well.
 */
function scoreStroke(stroke: Point[], path: Point[]) {
  if (stroke.length < 8) return 0;

  const errors = stroke.map((p) => distanceToPath(p, path));
  const averageError = errors.reduce((a, b) => a + b, 0) / errors.length;
  const precision = Math.max(0, 1 - averageError / TOLERANCE);

  const covered = path.filter((p) => stroke.some((q) => Math.hypot(p.x - q.x, p.y - q.y) < TOLERANCE * 1.4));
  const coverage = covered.length / path.length;

  return Math.round(precision * coverage * 100);
}

const pickShapes = () => {
  const pool = [...SHAPES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, ROUNDS);
};

export default function TraceMaster() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The whole stroke can be delivered before React re-renders, so the points that get scored are
  // read from a ref rather than from state.
  const liveStroke = useRef<Point[]>([]);
  const [shapes, setShapes] = useState<Shape[]>(pickShapes);
  const [round, setRound] = useState(0);
  const [stroke, setStroke] = useState<Point[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [done, setDone] = useState(false);
  const [isRecord, setIsRecord] = useState(false);
  const { best, submit } = useBestScore(SLUG);

  const shape = shapes[round];
  const lastScore = scores[scores.length - 1];
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  const restart = useCallback(() => {
    setShapes(pickShapes());
    setRound(0);
    liveStroke.current = [];
    setStroke([]);
    setScores([]);
    setDone(false);
    setDrawing(false);
    setIsRecord(false);
  }, []);

  useEffect(() => {
    if (done && average !== null) setIsRecord(submit(average));
  }, [done, average, submit]);

  // ---- rendering ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = sizeCanvas(canvas, SIZE, SIZE);
      if (!ctx) return;

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = PALETTE.surfaceAlt;
      ctx.fillRect(0, 0, SIZE, SIZE);

      // guide path
      ctx.strokeStyle = 'rgba(16,19,18,0.22)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 7]);
      ctx.beginPath();
      shape.path.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      ctx.setLineDash([]);

      // start marker
      const start = shape.path[0];
      ctx.fillStyle = PALETTE.primary;
      ctx.beginPath();
      ctx.arc(start.x, start.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // user stroke
      if (stroke.length > 1) {
        ctx.strokeStyle = PALETTE.primary;
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        stroke.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
      }
    };

    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [shape, stroke]);

  const pointFrom = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return logicalPoint(canvas, clientX, clientY, SIZE, SIZE);
  };

  const finishStroke = (points: Point[]) => {
    setDrawing(false);
    const result = scoreStroke(points, shape.path);
    const nextScores = [...scores, result];
    setScores(nextScores);
    if (nextScores.length >= ROUNDS) {
      setDone(true);
    } else {
      window.setTimeout(() => {
        setRound((r) => r + 1);
        liveStroke.current = [];
        setStroke([]);
      }, 850);
    }
  };

  return (
    <GameShell
      slug={SLUG}
      title="Trace Master"
      tagline="Trace the shape with one unbroken stroke. Scored on how closely you hug the line."
      keywords="drawing accuracy game, trace the shape game online, steady hand game, free drawing game"
      stats={[
        { label: 'Shape', value: <span className="text-xs">{shape.name}</span>, accent: true },
        { label: 'Round', value: `${Math.min(round + 1, ROUNDS)}/${ROUNDS}` },
        { label: 'Last', value: lastScore !== undefined ? `${lastScore}%` : '—' },
        { label: 'Best avg', value: best !== null ? `${best}%` : '—' }
      ]}
      onRestart={restart}
      restartLabel="New set"
      howTo={[
        'Start at the green dot and drag along the dotted guide in one continuous stroke.',
        'Lift your finger (or release the mouse) to finish and be scored.',
        'Accuracy rewards staying close to the line and covering the whole shape.',
        'Three shapes per set — your score is the average of the three.'
      ]}
      about={
        <p>
          Each stroke is measured two ways: the average distance from your line to the guide, and how
          much of the guide you actually covered. That second half is why rushing a shape scores badly
          even when the part you drew was neat.
        </p>
      }
    >
      <div className="relative mx-auto w-full max-w-[300px]">
        <canvas
          ref={canvasRef}
          className="w-full aspect-square rounded-xl border border-black/10 touch-none select-none cursor-crosshair"
          onPointerDown={(e) => {
            if (done) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            const point = pointFrom(e.clientX, e.clientY);
            if (!point) return;
            setDrawing(true);
            liveStroke.current = [point];
            setStroke([point]);
          }}
          onPointerMove={(e) => {
            if (!drawing) return;
            const point = pointFrom(e.clientX, e.clientY);
            if (!point) return;
            liveStroke.current = [...liveStroke.current, point];
            setStroke(liveStroke.current);
          }}
          onPointerUp={(e) => {
            if (!drawing) return;
            const point = pointFrom(e.clientX, e.clientY);
            const points = point ? [...liveStroke.current, point] : liveStroke.current;
            liveStroke.current = points;
            setStroke(points);
            finishStroke(points);
          }}
          onPointerCancel={() => {
            if (drawing) finishStroke(liveStroke.current);
          }}
        />

        {lastScore !== undefined && !done && !drawing && (
          <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-white/95 border border-primary/25 text-xs font-bold text-primary">
              {lastScore}% accurate
            </span>
          </div>
        )}

        <GameOverlay
          show={done}
          tone={(average ?? 0) >= 70 ? 'win' : 'neutral'}
          title={`${average}% average`}
          subtitle={`Rounds: ${scores.map((s) => `${s}%`).join(' · ')}`}
          actionLabel="New set"
          onAction={restart}
          isRecord={isRecord}
        />
      </div>
    </GameShell>
  );
}
