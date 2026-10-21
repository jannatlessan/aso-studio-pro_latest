import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import gamesData from '../data/games.json';
import { GAME_ICON_MAP } from '../lib/gameIcons';

/**
 * Three sibling games suggested under whichever game you are playing — same-genre first, then the
 * rest of the catalog in order, so every game always has three picks.
 */
export default function RelatedGames({ currentPath }: { currentPath: string }) {
  const current = gamesData.find((g) => g.path === currentPath);

  const picks: typeof gamesData = [];
  const pushUnique = (game?: (typeof gamesData)[number]) => {
    if (game && game.path !== currentPath && !picks.some((p) => p.path === game.path)) picks.push(game);
  };

  if (current) gamesData.filter((g) => g.genre === current.genre).forEach(pushUnique);
  gamesData.forEach(pushUnique);

  const links = picks.slice(0, 3);
  if (links.length === 0) return null;

  return (
    <div className="mt-10 pt-8 border-t border-black/10">
      <h3 className="text-base font-semibold text-ink mb-4">More games to try</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {links.map((game) => {
          const Icon = GAME_ICON_MAP[game.icon];
          return (
            <Link
              key={game.path}
              to={game.path}
              className="group p-4 rounded-2xl border border-black/10 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-mint border border-primary/15 text-primary group-hover:bg-primary group-hover:text-white transition-colors inline-flex items-center justify-center mb-3">
                {Icon && <Icon className="w-4 h-4" />}
              </div>
              <h4 className="text-sm font-semibold text-ink group-hover:text-primary transition-colors mb-1">
                {game.name}
              </h4>
              <p className="text-xs text-[#55605B] leading-relaxed line-clamp-2">{game.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-primary text-xs font-semibold group-hover:gap-1.5 transition-all">
                Play <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
