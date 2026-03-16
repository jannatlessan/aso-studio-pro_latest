import React from 'react';
import { motion } from 'motion/react';
import { FileText, ChevronLeft, Scale, AlertCircle, Zap, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] font-mono selection:bg-primary/30">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-[#020202]/60 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border border-primary rotate-45 flex items-center justify-center bg-black group-hover:bg-primary transition-all">
            <ChevronLeft className="w-5 h-5 text-primary group-hover:text-black -rotate-45" />
          </div>
          <span className="font-black tracking-[0.2em] text-sm uppercase">Return to Base</span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
          <FileText className="w-4 h-4 text-primary" />
          <span>Protocol: Terms of Engagement</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              LGL-SEC-02 // SERVICE_PROTOCOL
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none">
              Terms of<br />
              <span className="text-primary italic">Service.</span>
            </h1>
            <p className="text-white/40 text-lg italic max-w-2xl">
              "By initializing our systems, you enter a mutual agreement of digital integrity and professional usage protocols."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
            {[
              { icon: Scale, label: "Compliance", desc: "Fair use policy enforced" },
              { icon: ShieldAlert, label: "Safety", desc: "No malicious sub-routines" },
              { icon: Zap, label: "Performance", desc: "Uptime and response targets" }
            ].map((item, idx) => (
              <div key={idx} className="glass-panel p-6 space-y-4">
                <item.icon className="w-6 h-6 text-primary" />
                <div>
                  <div className="text-[10px] font-black uppercase border-b border-primary/20 pb-2 mb-2 tracking-widest">
                    {item.label}
                  </div>
                  <div className="text-xs text-white/40">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Content */}
          <div className="prose prose-invert max-w-none space-y-12 text-white/60">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 01. Authorization of Usage
              </h2>
              <p className="leading-relaxed">
                Shaad Dev Studio grants you a non-exclusive, non-transferable authorization to utilize our suite of laboratory modules for professional, development, or commercial purposes. Use of our internal logic for reverse-engineering or unauthorized data mining is strictly prohibited.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 02. Intellectual Property Rights
              </h2>
              <p className="leading-relaxed">
                While you retain ownership of the data you input, the underlying system patterns, UI/UX configurations, and the "Cyber-Pro" design system remain the exclusive property of Shaad Dev Studio. No extraction of core modular code is permitted.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 03. Liability & Performance
              </h2>
              <p className="leading-relaxed">
                All Shaad Dev Studio modules are provided "AS IS" with a target uptime protocol of 99.9%. We are not liable for external service interruptions or data variances resulting from user-side browser environment limitations.
              </p>
            </section>

            <section className="space-y-4 flex items-start gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Termination Clause</h3>
                <p className="text-xs leading-relaxed">
                  Violation of any security protocol or unauthorized usage of the lab tools will result in immediate termination of service and permanent blacklisting of your digital signature.
                </p>
              </div>
            </section>
          </div>

        </motion.div>
      </main>

      <Footer />

      <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .glass-panel:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: #00F0FF;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
        }
        .btn-primary {
          background: #00F0FF;
          color: black;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          border: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-primary:hover {
          background: white;
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
