import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  ChevronRight, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  ChevronLeft,
  LayoutGrid
} from 'lucide-react';
import gsap from 'gsap';
import Footer from '../../components/Footer';

const tools = [
  {
    id: "ASO-001",
    name: "ASO Screenshot Pro",
    description: "High-performance asset synthesis for App Store domination. Optimized for conversion and scale.",
    icon: Smartphone,
    path: "/tools/aso-screenshot",
    status: "READY",
    version: "3.2.0"
  },
  {
    id: "CODE-002",
    name: "Logic Beautifier",
    description: "Architectural code refactoring and styling engine for clean, maintainable systems.",
    icon: Terminal,
    path: "#",
    status: "ENCRYPTED",
    version: "COMING SOON"
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
    <div ref={containerRef} className="min-h-screen bg-[#020202] text-[#E0E0E0] p-8 md:p-12 selection:bg-primary/30 font-mono">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-primary transition-colors mb-4">
              <ChevronLeft className="w-3 h-3" /> Return to Root
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary flex items-center justify-center">
                <LayoutGrid className="text-black w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">Modules.</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Lab Environment Active</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-12">
            <div className="space-y-1 text-right">
              <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">System Load</div>
              <div className="text-2xl font-black text-white">12%</div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">Active Latency</div>
              <div className="text-2xl font-black text-primary">1.2ms</div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {tools.map((tool) => (
            <Link 
              key={tool.id} 
              to={tool.path}
              className={`tool-card group p-10 border border-white/10 bg-white/[0.04] hover:border-primary/40 hover:bg-white/[0.08] transition-all duration-500 relative overflow-hidden ${tool.status === 'ENCRYPTED' ? 'cursor-not-allowed grayscale' : ''}`}
            >
              <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-primary/10 transition-colors">
                <tool.icon className="w-40 h-40 -mr-12 -mt-12 rotate-12" />
              </div>

              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-primary tracking-widest">{tool.id}</div>
                    <div className="text-xs font-black text-white/20 tracking-[0.3em]">{tool.version}</div>
                  </div>
                  <div className={`px-4 py-1.5 border ${tool.status === 'READY' ? 'border-primary/40 text-primary bg-primary/10' : 'border-white/10 text-white/20'} text-[10px] font-black uppercase tracking-widest`}>
                    {tool.status}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-4xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors leading-none">{tool.name}</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-4 h-4 text-white/20 group-hover:text-primary" />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Encrypted Session</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] group-hover:gap-4 transition-all">
                    Initialize Module <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* System Terminal Footer */}
        <div className="mt-20 p-8 border border-white/5 bg-black/40 rounded-sm">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live System Log</span>
          </div>
          <div className="space-y-2 font-mono text-[11px] text-white/30">
            <div><span className="text-primary mr-2">[13:44:12]</span> SECURE HANDSHAKE COMPLETED</div>
            <div><span className="text-primary mr-2">[13:44:13]</span> SYNCING REPOSITORY ASSETS...</div>
            <div className="animate-pulse"><span className="text-primary mr-2">[13:44:14]</span> LISTENING FOR COMMAND INPUT...<span className="inline-block w-2 h-4 bg-primary ml-1" /></div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
