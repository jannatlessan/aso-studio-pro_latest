import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  ChevronRight, 
  Terminal, 
  ChevronLeft,
  LayoutGrid,
  Clock3
} from 'lucide-react';
import gsap from 'gsap';
import Footer from '../../components/Footer';

const tools = [
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
    id: "CODE-002",
    name: "Logic Beautifier",
    description: "A planned utility for improving code readability and structure with guided formatting suggestions.",
    icon: Terminal,
    path: "#",
    status: "Coming Soon",
    actionLabel: "Not Available"
  }
];

export default function ToolsList() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".tool-card", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all"
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#020202] text-[#E0E0E0] p-5 sm:p-8 md:p-12 selection:bg-primary/30 font-mono">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-5 border-b border-white/10 pb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary/90 flex items-center justify-center shrink-0">
              <LayoutGrid className="text-black w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">Tools</h1>
              <p className="text-white/75 text-sm sm:text-base max-w-2xl leading-relaxed">
                Simple utilities to support app marketing and product workflows. Choose a tool below to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`tool-card group p-6 sm:p-8 border rounded-xl transition-all duration-300 relative overflow-hidden ${tool.status === 'Ready' ? 'border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-white/[0.06]' : 'border-white/10 bg-white/[0.02]'}`}
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
                  <div className={`px-3 py-1.5 border rounded-full text-[10px] font-semibold uppercase tracking-wide ${tool.status === 'Ready' ? 'border-primary/40 text-primary bg-primary/10' : 'border-white/20 text-white/60 bg-white/5 inline-flex items-center gap-1.5'}`}>
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
                  {tool.status === 'Ready' ? (
                    <Link to={tool.path} className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
                      {tool.actionLabel} <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-white/55 font-semibold text-sm">
                      {tool.actionLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
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
