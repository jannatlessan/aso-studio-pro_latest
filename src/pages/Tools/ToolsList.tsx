import { useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Film,
  Smartphone,
  ChevronRight,
  Sparkles,
  Clock3,
  Lock,
  FileJson,
  Type,
  Image as ImageIcon,
  Music,
  FileBox,
  QrCode,
  Calculator,
  Timer,
  Scale,
  Palette,
  Paintbrush,
  AlignLeft,
  Code,
  Percent,
  Youtube,
  Search,
  Wand2,
  Layers,
  Heart,
  Images
} from 'lucide-react';
import gsap from 'gsap';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav, { GRADIENT } from '../../components/Nav';

const tools = [
  {
    id: "GIF-001",
    name: "GIF Online Viewer",
    description: "Upload any GIF to pause, scrub frame-by-frame, and extract absolute high-definition PNG frame slices locally.",
    icon: ImageIcon,
    path: "/tools/gif-viewer",
    status: "New",
    color: "sky",
    actionLabel: "Launch Viewer"
  },
  {
    id: "VID-001",
    name: "Video to GIF Maker",
    description: "Convert any video into an exceptionally high-quality animated GIF instantly. 100% offline edge-processing running locally in your browser.",
    icon: Film,
    path: "/tools/video-to-gif",
    status: "Trending",
    color: "rose",
    actionLabel: "Open Tool"
  },
  {
    id: "VID-002",
    name: "Video to Images",
    description: "Convert any video into a full sequence of high-quality images. Set a custom frame rate, preview every frame, and download one image or the entire batch as a ZIP.",
    icon: Images,
    path: "/tools/video-to-images",
    status: "New",
    color: "teal",
    actionLabel: "Open Tool"
  },

  {
    id: "QR-001",
    name: "QR Code Generator",
    description: "Generate high-res QR codes instantly for URLs, text, and contact info.",
    icon: QrCode,
    path: "/tools/qr-code-generator",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "AGE-001",
    name: "Age Calculator",
    description: "Calculate your exact age in years, months, days, and seconds.",
    icon: Calculator,
    path: "/tools/age-calculator",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "POM-001",
    name: "Pomodoro Timer",
    description: "Boost productivity with our sleek customizable Pomodoro technique timer.",
    icon: Timer,
    path: "/tools/pomodoro-timer",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "UNI-001",
    name: "Unit Converter",
    description: "Convert length, weight, temperature, data, and more effortlessly.",
    icon: Scale,
    path: "/tools/unit-converter",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "COL-001",
    name: "Color Palette Gen",
    description: "Create beautiful trending color schemes for your UI/UX designs.",
    icon: Palette,
    path: "/tools/color-palette",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "CSS-001",
    name: "CSS Gradient Generator",
    description: "Visually create and export fluid CSS linear gradients instantly.",
    icon: Paintbrush,
    path: "/tools/css-gradient",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "LOR-001",
    name: "Lorem Ipsum Generator",
    description: "Generate customizable, high-quality placeholder dummy text.",
    icon: AlignLeft,
    path: "/tools/lorem-ipsum",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "MD-001",
    name: "Markdown to HTML",
    description: "Convert Markdown strings into clean, formatted HTML code instantly.",
    icon: Code,
    path: "/tools/markdown-to-html",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "PCT-001",
    name: "Percentage Calculator",
    description: "Calculate percentage changes, discounts, tips, and financial math safely.",
    icon: Percent,
    path: "/tools/percentage-calculator",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "YT-001",
    name: "YT Thumbnail Saver",
    description: "Fetch max-resolution YouTube video thumbnails directly to your device.",
    icon: Youtube,
    path: "/tools/yt-thumbnail",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "ASO-001",
    name: "ASO Screenshot Pro",
    description: "Create polished App Store and Play Store screenshots with customizable layouts, text, colors, and device sizes.",
    icon: Smartphone,
    path: "/tools/aso-screenshot",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "SEC-001",
    name: "Secure Password Generator",
    description: "Instantly create strong, random, and highly secure passwords with customizable parameters to keep data safe.",
    icon: Lock,
    path: "/tools/password-generator",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "DEV-001",
    name: "JSON Formatter",
    description: "Quickly format, validate, and beautify your raw JSON responses. Perfect for debugging messy API payloads.",
    icon: FileJson,
    path: "/tools/json-formatter",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "TXT-001",
    name: "Text Utilities",
    description: "A complete suite for your text: word count, character count, case switching, and Base64 encoding/decoding.",
    icon: Type,
    path: "/tools/text-utilities",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "IMG-001",
    name: "Bulk Image Resizer",
    description: "Batch resize multiple images at once instantly in your browser without uploading to any server.",
    icon: ImageIcon,
    path: "/tools/image-resizer",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "IMG-002",
    name: "Smart Image Compressor",
    description: "Compress JPEG, PNG, and WebP images locally with maximum size savings and zero visible quality loss.",
    icon: ImageIcon,
    path: "/tools/image-compressor",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "IMG-003",
    name: "Bulk Image Enhancer",
    description: "Edit bulk images quickly. Apply Brightness, Contrast, Saturation, and other real-time filters instantly to all your photos.",
    icon: Wand2,
    path: "/tools/bulk-image-enhancer",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "IMG-004",
    name: "AuraCut AI",
    description: "Instantly isolate backgrounds using our local neural engine. Features DP Makers, layer filters, and pro studio drop-shadows.",
    icon: Layers,
    path: "/tools/background-remover",
    status: "Trending",
    actionLabel: "Open Tool"
  },
  {
    id: "AUD-001",
    name: "Audio Merger Pro",
    description: "Merge multiple audio files (MP3, WAV, M4A) securely in your browser without uploading data to servers.",
    icon: Music,
    path: "/tools/audio-merger",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "PDF-001",
    name: "Secure PDF Merger",
    description: "Combine multiple PDF documents into a single file quickly, securely, and completely offline.",
    icon: FileBox,
    path: "/tools/pdf-merger",
    status: "Ready",
    actionLabel: "Open Tool"
  },
  {
    id: "EVT-001",
    name: "Event Slideshow",
    description: "Turn your event folders into a full-screen slideshow with crossfade transitions, slow zoom/pan on photos, background music, and title cards. Works for weddings, birthdays, or any occasion.",
    icon: Heart,
    path: "/tools/event-slideshow",
    status: "New",
    actionLabel: "Open Tool"
  }
];

export default function ToolsList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories from tools
  const categories = useMemo(() => {
    const cats = new Set<string>();
    tools.forEach(tool => {
      if (tool.name.includes('Image') || tool.name.includes('Compressor') || tool.name.includes('Resizer') || tool.name.includes('Enhancer') || tool.name.includes('GIF') || tool.name.includes('Video') || tool.name.includes('AuraCut') || tool.name.includes('Slideshow')) cats.add('Images & Media');
      else if (tool.name.includes('PDF') || tool.name.includes('Audio')) cats.add('Documents & Audio');
      else if (tool.name.includes('Color') || tool.name.includes('CSS') || tool.name.includes('Screenshot') || tool.name.includes('Gradient')) cats.add('Design');
      else if (tool.name.includes('JSON') || tool.name.includes('Code') || tool.name.includes('Markdown')) cats.add('Development');
      else if (tool.name.includes('Text') || tool.name.includes('Lorem')) cats.add('Text Tools');
      else if (tool.name.includes('Calculator') || tool.name.includes('Converter') || tool.name.includes('Percentage') || tool.name.includes('Age')) cats.add('Calculators');
      else if (tool.name.includes('QR') || tool.name.includes('Password') || tool.name.includes('Timer') || tool.name.includes('YouTube') || tool.name.includes('ASO')) cats.add('Utilities');
    });
    return Array.from(cats).sort();
  }, []);

  // Enhanced filtering with category support
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q) || tool.id.toLowerCase().includes(q);
      
      let matchesCategory = true;
      if (selectedCategory) {
        if (selectedCategory === 'Images & Media') matchesCategory = tool.name.includes('Image') || tool.name.includes('Compressor') || tool.name.includes('Resizer') || tool.name.includes('Enhancer') || tool.name.includes('GIF') || tool.name.includes('Video') || tool.name.includes('AuraCut') || tool.name.includes('Slideshow');
        else if (selectedCategory === 'Documents & Audio') matchesCategory = tool.name.includes('PDF') || tool.name.includes('Audio');
        else if (selectedCategory === 'Design') matchesCategory = tool.name.includes('Color') || tool.name.includes('CSS') || tool.name.includes('Screenshot') || tool.name.includes('Gradient');
        else if (selectedCategory === 'Development') matchesCategory = tool.name.includes('JSON') || tool.name.includes('Code') || tool.name.includes('Markdown');
        else if (selectedCategory === 'Text Tools') matchesCategory = tool.name.includes('Text') || tool.name.includes('Lorem');
        else if (selectedCategory === 'Calculators') matchesCategory = tool.name.includes('Calculator') || tool.name.includes('Converter') || tool.name.includes('Percentage') || tool.name.includes('Age');
        else if (selectedCategory === 'Utilities') matchesCategory = tool.name.includes('QR') || tool.name.includes('Password') || tool.name.includes('Timer') || tool.name.includes('YouTube') || tool.name.includes('ASO');
      }
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
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
      gsap.fromTo(".tool-card",
        { 
          y: 20, 
          opacity: 0 
        },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.6,
          stagger: 0.05,
          ease: "power3.out",
          clearProps: "all"
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [searchQuery, selectedCategory]);

  return (
    <div className="relative min-h-screen bg-white text-ink selection:bg-primary/20 overflow-x-hidden">
      <SEO
        title="Developer Tools | ShaadDev Studio"
        description="A collection of professional tools for developers, designers, and creators."
        url="https://shaaddev.studio/tools"
      />


      <Nav />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pt-32 pb-16 space-y-10" ref={containerRef}>
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint border border-primary/15 text-xs font-medium text-primary w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            {tools.length} free tools
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            All <span className="text-primary">tools.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#55605B] max-w-2xl leading-relaxed">
            A curated collection of fast, private, browser-based tools for developers, designers, and creators.
          </p>
        </div>

        {/* Search Bar with Enhanced UX */}
        <div className="space-y-3">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#8B958F]" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-white border border-black/10 rounded-xl py-3 pl-11 pr-14 text-sm text-ink placeholder-[#8B958F] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all shadow-sm shadow-black/[0.02]"
              placeholder="Search tools... (Cmd+K)"
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

          {/* Search Status Badge */}
          {(searchQuery || selectedCategory) && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-[#55605B]">
                Showing <span className="text-primary font-semibold">{filteredTools.length}</span> of <span className="font-semibold">{tools.length}</span> tools
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="text-xs px-2.5 py-1 rounded-full border border-black/10 hover:border-primary/40 bg-white hover:bg-mint text-[#55605B] hover:text-primary transition-all font-medium"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedCategory === category
                    ? 'border-primary/40 bg-mint text-primary'
                    : 'border-black/10 bg-white text-[#55605B] hover:border-primary/30 hover:bg-mint hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid or No Results State */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {filteredTools.map((tool) => (
              <Link
                to={tool.status === "Ready" || tool.status === "Trending" || tool.status === "New" ? tool.path : "#"}
                key={tool.id}
                className={`block tool-card group p-5 border rounded-2xl transition-all duration-300 relative overflow-hidden ${tool.status === 'Ready' || tool.status === 'Trending' || tool.status === 'New' ? 'border-black/10 bg-white hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 cursor-pointer' : 'border-black/10 bg-[#F6F8F7] cursor-not-allowed'}`}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg border border-primary/20 bg-mint flex items-center justify-center">
                      <tool.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className={`px-2.5 py-1 border rounded-full text-[10px] font-medium inline-flex items-center gap-1 ${tool.status === 'Ready' || tool.status === 'Trending' || tool.status === 'New' ? 'border-primary/30 text-primary bg-mint' : 'border-black/10 text-[#8B958F] bg-white'}`}>
                      {tool.status !== 'Ready' && tool.status !== 'Trending' && tool.status !== 'New' && <Clock3 className="w-2.5 h-2.5" />}
                      {tool.status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors">{tool.name}</h3>
                    <p className="text-[#55605B] text-xs leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/[0.06]">
                    {tool.status === 'Ready' || tool.status === 'Trending' || tool.status === 'New' ? (
                      <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs group-hover:gap-2 transition-all">
                        {tool.actionLabel} <ChevronRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#8B958F] font-semibold text-xs">
                        {tool.actionLabel}
                      </span>
                    )}
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
              <h3 className="text-lg font-semibold text-ink">No tools found</h3>
              <p className="text-[#55605B] max-w-md mx-auto text-xs">
                We couldn't find any tools matching "<span className="font-semibold text-ink">{searchQuery}</span>"{selectedCategory && ` in the ${selectedCategory} category`}. Try adjusting your search or filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint hover:bg-primary/20 border border-primary/30 text-primary font-semibold text-xs transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="p-4 border border-black/10 rounded-2xl bg-[#F6F8F7] text-xs text-[#55605B] leading-relaxed">
          More tools are being prepared and will appear here as they become available.
        </div>
        <Footer />
      </div>
    </div>
  );
}