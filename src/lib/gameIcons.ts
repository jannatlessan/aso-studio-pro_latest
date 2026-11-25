import {
  Bird,
  Blocks,
  Bomb,
  Boxes,
  Brain,
  CircleDot,
  Gem,
  Hammer,
  Hash,
  LayoutGrid,
  Layers,
  Lightbulb,
  MousePointerClick,
  Music,
  PenTool,
  Puzzle,
  Search,
  Shield,
  Shuffle,
  Spade,
  Table,
  Target,
  Type,
  Worm,
  Zap,
  Diff,
  Equal,
  Calculator,
  Sigma,
  Gamepad2,
  type LucideIcon
} from 'lucide-react';

/**
 * Maps the lucide icon name stored in src/data/games.json back to its component. The stored name
 * is also what the public /tools.json feed turns into a lucide-static iconUrl, so the two stay in
 * sync by construction.
 */
export const GAME_ICON_MAP: Record<string, LucideIcon> = {
  Bird,
  Blocks,
  Bomb,
  Boxes,
  Brain,
  CircleDot,
  Gem,
  Hammer,
  Hash,
  LayoutGrid,
  Layers,
  Lightbulb,
  MousePointerClick,
  Music,
  PenTool,
  Puzzle,
  Search,
  Shield,
  Shuffle,
  Spade,
  Table,
  Target,
  Type,
  Worm,
  Zap,
  Diff,
  Equal,
  Calculator,
  Sigma
};

export const GAME_ICON_FALLBACK: LucideIcon = Gamepad2;
