/** Shared canvas helpers and palette for the arcade games under /games. */

export const PALETTE = {
  primary: '#0E9D52',
  primaryLight: '#2EBA6B',
  primaryDark: '#006622',
  mint: '#E8F9EE',
  ink: '#101312',
  muted: '#8B958F',
  line: 'rgba(16,19,18,0.10)',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F8F7',
  danger: '#B91C1C',
  dangerSoft: '#FDE2E2'
};

/**
 * Points the canvas' pixel buffer at its displayed size (capped at 2x for retina) and maps a fixed
 * logical coordinate space onto it, so every game can draw in stable units like 320x480 regardless
 * of the screen it ends up on. Call it on mount and on resize.
 */
export function sizeCanvas(canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(width / logicalWidth, 0, 0, height / logicalHeight, 0, 0);
  return ctx;
}

/** Pointer position in the canvas' logical coordinate space. */
export function logicalPoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
  logicalWidth: number,
  logicalHeight: number
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * logicalWidth,
    y: ((clientY - rect.top) / rect.height) * logicalHeight
  };
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * requestAnimationFrame loop with a clamped delta (in seconds), so a backgrounded tab resuming
 * does not teleport everything across the screen in one step.
 */
export function startLoop(step: (dt: number) => void) {
  let frame = 0;
  let previous = performance.now();
  const tick = (now: number) => {
    const dt = Math.min((now - previous) / 1000, 1 / 20);
    previous = now;
    step(dt);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
