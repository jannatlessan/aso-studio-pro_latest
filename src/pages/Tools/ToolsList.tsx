import { useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Film,
  Smartphone, 
  ChevronRight, 
  Terminal, 
  ChevronLeft,
  LayoutGrid,
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
  FileText,
  Search,
  Wand2,
  Layers
} from 'lucide-react';
import gsap from 'gsap';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

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
      if (tool.name.includes('Image') || tool.name.includes('Compressor') || tool.name.includes('Resizer') || tool.name.includes('Enhancer') || tool.name.includes('GIF') || tool.name.includes('Video') || tool.name.includes('AuraCut')) cats.add('Images & Media');
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
        if (selectedCategory === 'Images & Media') matchesCategory = tool.name.includes('Image') || tool.name.includes('Compressor') || tool.name.includes('Resizer') || tool.name.includes('Enhancer') || tool.name.includes('GIF') || tool.name.includes('Video') || tool.name.includes('AuraCut');
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
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] p-4 sm:p-6 md:p-10 font-mono selection:bg-primary/30 transform-gpu overflow-x-hidden">
      <SEO 
        title="Developer Tools | ShaadDev Studio"
        description="A collection of professional tools for developers, designers, and creators."
        url="https://shaaddev.studio/tools"
      />
      
      <div className="max-w-6xl mx-auto space-y-10" ref={containerRef}>
        {/* Header */}
        <div className="space-y-3 mt-2">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-primary transition-colors font-semibold"
          >
            <ChevronLeft className="w-3 h-3" />
            Back to Home
          </Link>
          
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest w-fit">
                <Terminal className="w-2.5 h-2.5" />
                Workspace
              </div>
              <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-0.5 h-0.5 bg-white/20 rounded-full"></div>
                Last Updated: March 25, 2026 • 12:55 PM
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-wider relative inline-block">
              All Tools
              <div className="absolute -bottom-1 left-0 w-1/3 h-0.5 sm:h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed mt-2">
              A curated collection of hyper-optimized developer tools designed for speed, privacy, and flawless performance.
            </p>
          </div>
        </div>

        {/* Search Bar with Enhanced UX */}
        <div className="space-y-3">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-white/40" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-11 pr-14 text-sm text-white placeholder-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all font-mono"
              placeholder="Search tools... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white/60 transition-colors font-bold text-sm"
                title="Clear search (ESC)"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Search Status Badge */}
          {(searchQuery || selectedCategory) && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-white/50 font-mono">
                Showing <span className="text-primary font-bold">{filteredTools.length}</span> of <span className="font-bold">{tools.length}</span> tools
              </div>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full border border-white/10 hover:border-primary/40 bg-white/5 hover:bg-primary/10 text-white/60 hover:text-primary transition-all font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all border ${
                  selectedCategory === category
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-primary/30 hover:bg-white/10 hover:text-white/80'
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
                className={`block tool-card group p-4 sm:p-5 border rounded-lg transition-all duration-300 relative overflow-hidden ${tool.status === 'Ready' || tool.status === 'Trending' || tool.status === 'New' ? 'border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] cursor-pointer' : 'border-white/10 bg-white/[0.02] cursor-not-allowed'}`}
              >
                <div className="absolute top-0 right-0 p-3 text-white/5">
                  <tool.icon className="w-16 h-16 -mr-6 -mt-6" />
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-white/10 bg-black/30">
                        <tool.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-[9px] font-bold text-primary/90 tracking-wide">{tool.id}</div>
                    </div>
                    <div className={`px-2 py-1 border rounded-full text-[8px] font-semibold uppercase tracking-widest inline-flex items-center gap-1 ${tool.status === 'Ready' || tool.status === 'Trending' || tool.status === 'New' ? 'border-primary/40 text-primary bg-primary/10' : 'border-white/20 text-white/60 bg-white/5'}`}>
                      {tool.status !== 'Ready' && tool.status !== 'Trending' && tool.status !== 'New' && <Clock3 className="w-2 h-2" />}
                      {tool.status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{tool.name}</h3>
                    <p className="text-white/75 text-xs leading-relaxed max-w-md line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    {tool.status === 'Ready' || tool.status === 'Trending' || tool.status === 'New' ? (
                      <span className="inline-flex items-center gap-1.5 text-primary font-bold text-xs group-hover:gap-2 transition-all">
                        {tool.actionLabel} <ChevronRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-white/55 font-bold text-xs">
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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10">
              <Search className="w-6 h-6 text-white/30" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">No tools found</h3>
              <p className="text-white/50 max-w-md mx-auto text-xs">
                We couldn't find any tools matching "<span className="font-semibold text-white/70">{searchQuery}</span>"{selectedCategory && ` in the ${selectedCategory} category`}. Try adjusting your search or filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary font-bold text-xs transition-all"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="p-3 sm:p-4 border border-white/10 rounded-lg bg-white/[0.02] text-xs text-white/70 leading-relaxed">
          More tools are being prepared and will appear here as they become available.
        </div>
        <Footer />
      </div>
    </div>
  );
}