import { Link } from 'react-router-dom';
import { ChevronLeft, Sparkles } from 'lucide-react';
import SEO from '../../components/SEO';

export default function EventSlideshow() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20 flex flex-col">
      <SEO
        title="Event Slideshow Player | ShaadDev Studio"
        description="Play a full-screen photo & video slideshow from your event folders — weddings, birthdays, anniversaries, corporate events, any occasion. Crossfade transitions, Ken Burns zoom, optional background music and title cards. 100% private, runs entirely in your browser."
        url="https://shaaddev.studio/tools/event-slideshow"
        keywords="event slideshow, wedding slideshow, photo video slideshow maker, offline slideshow player, ken burns slideshow, slideshow with music"
      />

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#08080A]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/tools" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-primary/80 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            Event Slideshow
          </div>
        </div>
      </nav>

      {/* Player (self-contained tool, runs in its own document) */}
      <iframe
        src="/tools/event-slideshow.html"
        title="Event Slideshow"
        allow="fullscreen"
        allowFullScreen
        className="w-full flex-1 border-0"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      />
    </div>
  );
}
