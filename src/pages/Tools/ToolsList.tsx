import { useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const q = searchQuery.toLowerCase();
      return tool.name.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q);
    });
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
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] p-5 sm:p-8 md:p-12 font-mono selection:bg-primary/30 transform-gpu overflow-x-hidden">
      <SEO 
        title="Developer Tools | ShaadDev Studio"
        description="A collection of professional tools for developers, designers, and creators."
        url="https://shaaddev.studio/tools"
      />
      
      <div className="max-w-6xl mx-auto space-y-24" ref={containerRef}>
        {/* Header */}
        <div className="space-y-8 mt-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <Terminal className="w-4 h-4" />
              Workspace
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-wider relative inline-block">
              All Tools
              <div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            </h1>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl leading-relaxed mt-6">
              A curated collection of hyper-optimized developer tools designed for speed, privacy, and flawless performance.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-white/40" />
          </div>
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all font-mono"
            placeholder="Search tools... (e.g., QR, Image, Keyword)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {filteredTools.map((tool) => (
            <Link
              to={tool.status === "Ready" || tool.status === "Trending" ? tool.path : "#"}
              key={tool.id}
              className={`block tool-card group p-6 sm:p-8 border rounded-xl transition-all duration-300 relative overflow-hidden ${tool.status === 'Ready' || tool.status === 'Trending' ? 'border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06] cursor-pointer' : 'border-white/10 bg-white/[0.02] cursor-not-allowed'}`}
            >
              <div className="absolute top-0 right-0 p-6 text-white/5">
                <tool.icon className="w-28 h-28 -mr-10 -mt-10" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-black/30">
                      <tool.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-[11px] font-bold text-primary/90 tracking-wide">{tool.id}</div>
                  </div>
                  <div className={`px-3 py-1.5 border rounded-full text-[10px] font-semibold uppercase tracking-wide inline-flex items-center gap-1.5 ${tool.status === 'Ready' || tool.status === 'Trending' ? 'border-primary/40 text-primary bg-primary/10' : 'border-white/20 text-white/60 bg-white/5'}`}>
                    {tool.status !== 'Ready' && <Clock3 className="w-3 h-3" />}
                    {tool.status}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{tool.name}</h3>
                  <p className="text-white/75 text-sm leading-relaxed max-w-md">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  {tool.status === 'Ready' || tool.status === 'Trending' ? (
                    <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                      {tool.actionLabel} <ChevronRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-white/55 font-semibold text-sm">
                      {tool.actionLabel}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="p-5 sm:p-6 border border-white/10 rounded-xl bg-white/[0.02] text-sm text-white/70 leading-relaxed">
          More tools are being prepared and will appear here as they become available.
        </div>
        <Footer />
      </div>
    </div>
  );
}