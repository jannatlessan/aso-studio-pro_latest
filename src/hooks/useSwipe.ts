import { useEffect, type RefObject } from 'react';

export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * Attaches touch swipe detection to an element. Used by the grid games (2048, Snake, Tetro) so
 * phones get the same controls the arrow keys give on desktop.
 *
 * The listener is non-passive and calls preventDefault once a gesture clears the threshold, which
 * is what stops iOS from scrolling the page or triggering pull-to-refresh mid-swipe.
 */
export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (direction: Direction) => void,
  threshold = 24
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let fired = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      fired = false;
    };

    const onMove = (e: TouchEvent) => {
      if (fired) {
        e.preventDefault();
        return;
      }
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
      fired = true;
      e.preventDefault();
      if (Math.abs(dx) > Math.abs(dy)) onSwipe(dx > 0 ? 'right' : 'left');
      else onSwipe(dy > 0 ? 'down' : 'up');
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
    };
  }, [ref, onSwipe, threshold]);
}

/** Maps an arrow/WASD keydown to a direction, or null for any other key. */
export function keyToDirection(key: string): Direction | null {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'up';
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'down';
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'left';
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'right';
    default:
      return null;
  }
}
