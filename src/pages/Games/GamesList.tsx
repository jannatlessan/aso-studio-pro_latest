import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Gamepad2, Search } from 'lucide-react';
import gsap from 'gsap';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav from '../../components/Nav';
import gamesData from '../../data/games.json';
import { GAME_ICON_FALLBACK, GAME_ICON_MAP } from '../../lib/gameIcons';

// Single source of truth for the games catalog lives in src/data/games.json; it also feeds the
// public /tools.json "games" array consumed by the mobile app.
const games = gamesData.map((g) => ({ ...g, Icon: GAME_ICON_MAP[g.icon] ?? GAME_ICON_FALLBACK }));

export default function GamesList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = useMemo(() => Array.from(new Set(games.map((g) => g.genre))).sort(), []);

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return games.filter((game) => {
      const matchesSearch =
        !q ||
        game.name.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q) ||
        game.genre.toLowerCase().includes(q);
      const matchesGenre = !selectedGenre || game.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [searchQuery, selectedGenre]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) setSearchQuery('');
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.game-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power3.out', clearProps: 'all' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [searchQuery, selectedGenre]);

  return (
    <div className="relative min-h-screen bg-white text-ink selection:bg-primary/20 overflow-x-hidden">
      <SEO
        title="Free Browser Games | ShaadDev Studio"
        description="25 free mini-games you can play instantly in your browser — puzzle, arcade, word, card, and reflex games. No downloads, no sign-up, works on mobile."
        url="https://shaaddev.studio/games"
        keywords="free online games, browser games, mini games, puzzle games, arcade games, play free games on mobile"
      />

      <Nav />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-32 pb-16 space-y-10" ref={containerRef}>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint border border-primary/15 text-xs font-medium text-primary w-fit">
            <Gamepad2 className="w-3.5 h-3.5" />
            {games.length} free games
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Mini <span className="text-primary">games.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#55605B] max-w-2xl leading-relaxed">
            Quick, one-more-try games that run entirely in your browser. Nothing to install, no account,
            and your best scores stay on your own device.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#8B958F]" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-white border border-black/10 rounded-xl py-3 pl-11 pr-14 text-sm text-ink placeholder-[#8B958F] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all shadow-sm shadow-black/[0.02]"
              placeholder="Search games... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-[#8B958F] hover:text-ink transition-colors font-bold text-sm"
                title="Clear search (ESC)"
              >
                ✕
              </button>
            )}
          </div>

          {(searchQuery || selectedGenre) && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-[#55605B]">
                Showing <span className="text-primary font-semibold">{filteredGames.length}</span> of{' '}
                <span className="font-semibold">{games.length}</span> games
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre(null);
                }}
                className="text-xs px-2.5 py-1 rounded-full border border-black/10 hover:border-primary/40 bg-white hover:bg-mint text-[#55605B] hover:text-primary transition-all font-medium"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedGenre === genre
                    ? 'border-primary/40 bg-mint text-primary'
                    : 'border-black/10 bg-white text-[#55605B] hover:border-primary/30 hover:bg-mint hover:text-primary'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {filteredGames.map((game) => (
              <Link
                to={game.path}
                key={game.id}
                className="block game-card group p-5 border border-black/10 rounded-2xl bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg border border-primary/20 bg-mint flex items-center justify-center">
                      <game.Icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 border border-black/10 rounded-full text-[10px] font-medium text-[#55605B] bg-[#F6F8F7]">
                        {game.genre}
                      </span>
                      {game.status !== 'Ready' && (
                        <span className="px-2.5 py-1 border border-primary/30 rounded-full text-[10px] font-medium text-primary bg-mint">
                          {game.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-[#55605B] text-xs leading-relaxed line-clamp-2">{game.description}</p>
                  </div>

                  <div className="pt-4 border-t border-black/[0.06]">
                    <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs group-hover:gap-2 transition-all">
                      Play now <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F6F8F7] border border-black/10">
              <Search className="w-6 h-6 text-[#8B958F]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-ink">No games found</h3>
              <p className="text-[#55605B] max-w-md mx-auto text-xs">
                Nothing matches "<span className="font-semibold text-ink">{searchQuery}</span>"
                {selectedGenre && ` in ${selectedGenre}`}. Try a different search or clear the filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint hover:bg-primary/20 border border-primary/30 text-primary font-semibold text-xs transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="p-4 border border-black/10 rounded-2xl bg-[#F6F8F7] text-xs text-[#55605B] leading-relaxed">
          Every game runs fully client-side, so there is no server keeping score — your best results are
          saved privately in your own browser.
        </div>
      </div>
      <Footer />
    </div>
  );
}
