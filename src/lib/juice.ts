/**
 * The small visual effects that separate a prototype from a game: particle bursts, screen shake,
 * and floating score text. All canvas-space, all allocation-light enough to run every frame.
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  gravity: number;
  /** Square particles read as debris, circles as sparks. */
  square: boolean;
  spin: number;
  angle: number;
}

export class Particles {
  private items: Particle[] = [];

  get count() {
    return this.items.length;
  }

  burst(
    x: number,
    y: number,
    color: string,
    count = 12,
    options: { speed?: number; gravity?: number; life?: number; size?: number; square?: boolean } = {}
  ) {
    const { speed = 150, gravity = 420, life = 0.55, size = 3.5, square = false } = options;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const velocity = speed * (0.45 + Math.random() * 0.75);
      this.items.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: life * (0.7 + Math.random() * 0.6),
        maxLife: life,
        size: size * (0.6 + Math.random() * 0.8),
        color,
        gravity,
        square,
        spin: (Math.random() - 0.5) * 12,
        angle: Math.random() * Math.PI
      });
    }
  }

  /** A horizontal spray, used for cleared rows and impacts along a surface. */
  line(x1: number, x2: number, y: number, color: string, count = 24) {
    for (let i = 0; i < count; i++) {
      this.items.push({
        x: x1 + ((x2 - x1) * i) / count,
        y,
        vx: (Math.random() - 0.5) * 220,
        vy: -Math.random() * 230 - 40,
        life: 0.5 + Math.random() * 0.35,
        maxLife: 0.8,
        size: 2.5 + Math.random() * 3,
        color,
        gravity: 700,
        square: true,
        spin: (Math.random() - 0.5) * 14,
        angle: Math.random() * Math.PI
      });
    }
  }

  update(dt: number) {
    for (const p of this.items) {
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.spin * dt;
      p.life -= dt;
    }
    if (this.items.some((p) => p.life <= 0)) this.items = this.items.filter((p) => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.items) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.square) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.items = [];
  }
}

/** Decaying random camera offset. Call `update` each frame and wrap drawing in `apply`/`restore`. */
export class Shake {
  private time = 0;
  private duration = 0;
  private magnitude = 0;

  trigger(magnitude: number, duration = 0.25) {
    // A bigger hit overrides a smaller one still in progress rather than stacking.
    if (magnitude >= this.magnitude || this.time <= 0) {
      this.magnitude = magnitude;
      this.duration = duration;
      this.time = duration;
    }
  }

  update(dt: number) {
    if (this.time > 0) this.time = Math.max(0, this.time - dt);
  }

  apply(ctx: CanvasRenderingContext2D) {
    ctx.save();
    if (this.time <= 0) return;
    const falloff = this.time / this.duration;
    const amount = this.magnitude * falloff * falloff;
    ctx.translate((Math.random() - 0.5) * amount * 2, (Math.random() - 0.5) * amount * 2);
  }

  restore(ctx: CanvasRenderingContext2D) {
    ctx.restore();
  }

  clear() {
    this.time = 0;
    this.magnitude = 0;
  }
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

/** "+40" style callouts that rise and fade where the action happened. */
export class FloatingTexts {
  private items: FloatingText[] = [];

  add(x: number, y: number, text: string, color = '#0E9D52', size = 16, life = 0.85) {
    this.items.push({ x, y, text, color, life, maxLife: life, size });
  }

  update(dt: number) {
    for (const t of this.items) {
      t.y -= 42 * dt;
      t.life -= dt;
    }
    if (this.items.some((t) => t.life <= 0)) this.items = this.items.filter((t) => t.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = 'center';
    for (const t of this.items) {
      const progress = t.life / t.maxLife;
      ctx.globalAlpha = Math.max(0, Math.min(1, progress * 1.6));
      ctx.fillStyle = t.color;
      const scale = 1 + (1 - progress) * 0.18;
      ctx.font = `bold ${t.size * scale}px Outfit, Inter, sans-serif`;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.items = [];
  }
}

/** Ease helpers used for tile/entity motion. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
