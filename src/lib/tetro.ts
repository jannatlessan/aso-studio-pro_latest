/**
 * Pure well logic for Tetro Blocks, kept out of the component so it can be reasoned about and
 * tested on its own: what counts as a completed row, how the well collapses afterwards, and what a
 * clear is worth.
 */

export const TETRO_COLS = 10;
export const TETRO_ROWS = 20;

export type Well = number[][];

export const emptyWell = (): Well =>
  Array.from({ length: TETRO_ROWS }, () => Array(TETRO_COLS).fill(0));

/** Row indices where every cell is filled. */
export function fullRows(well: Well): number[] {
  const rows: number[] = [];
  well.forEach((row, index) => {
    if (row.length === TETRO_COLS && row.every((cell) => cell !== 0)) rows.push(index);
  });
  return rows;
}

/** Removes the given rows and drops everything above them down, refilling the top with blanks. */
export function collapseWell(well: Well, rows: number[]): Well {
  const kept = well.filter((_, index) => !rows.includes(index));
  const blanks = Array.from({ length: rows.length }, () => Array(TETRO_COLS).fill(0));
  return [...blanks, ...kept];
}

export const LINE_SCORE = [0, 100, 300, 500, 800];

export interface ClearScore {
  points: number;
  /** Whether this clear sets up a back-to-back bonus for the next one. */
  backToBack: boolean;
}

/**
 * Scoring for one clear. A quad is worth half again when it follows another quad, and each
 * consecutive clear adds a combo bonus — `combo` is the number of clears *before* this one.
 */
export function scoreClear(
  lineCount: number,
  level: number,
  backToBack: boolean,
  combo: number
): ClearScore {
  if (lineCount <= 0) return { points: 0, backToBack };
  const isQuad = lineCount === 4;
  let points = LINE_SCORE[Math.min(lineCount, 4)] * level;
  if (isQuad && backToBack) points = Math.round(points * 1.5);
  if (combo > 0) points += 50 * combo * level;
  return { points, backToBack: isQuad };
}

export const levelOf = (lines: number) => Math.floor(lines / 10) + 1;

/** Seconds per row at a given level: brisk by level 10, frantic past 15. */
export const gravityFor = (level: number) => Math.max(0.055, 0.8 * Math.pow(0.84, level - 1));
