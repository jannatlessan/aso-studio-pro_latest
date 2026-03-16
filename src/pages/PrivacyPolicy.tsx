import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ChevronLeft, Lock, Eye, FileText, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] font-mono selection:bg-primary/30Selection">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-[#020202]/60 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border border-primary rotate-45 flex items-center justify-center bg-black group-hover:bg-primary transition-all">
            <ChevronLeft className="w-5 h-5 text-primary group-hover:text-black -rotate-45" />
          </div>
          <span className="font-black tracking-[0.2em] text-sm uppercase">Return to Base</span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Protocol: Privacy Secure</span>
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
              LGL-SEC-01 // PRIVACY_ENCRYPTION
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none">
              Privacy<br />
              <span className="text-primary italic">Protocol.</span>
            </h1>
            <p className="text-white/40 text-lg italic max-w-2xl">
              "Your data is your property. Shaad Dev Studio is designed to respect and protect your digital footprint with maximum encryption standards."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
            {[
              { icon: Lock, label: "Encryption", desc: "Military grade data handling" },
              { icon: Eye, label: "Transparency", desc: "No hidden tracking layers" },
              { icon: Globe, label: "GDPR Sync", desc: "Global standards compliant" }
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
                <div className="w-2 h-2 bg-primary" /> 01. Data Collection Initialization
              </h2>
              <p className="leading-relaxed">
                Shaad Dev Studio initializes data collection only when necessary for core module functionality. We collect minimal technical metadata including browser type, operating system version, and session telemetry to optimize the rendering engine and computational performance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 02. Computational Security
              </h2>
              <p className="leading-relaxed">
                When you utilize our laboratory modules, assets and data are processed locally in your browser kernel whenever possible. Any server-side operations are conducted over encrypted TLS 1.3 channels, and session-specific data is purged immediately after the execution cycle completes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 03. Storage Protocol
              </h2>
              <p className="leading-relaxed">
                We do not maintain long-term storage of your proprietary application assets. Your design configurations (colors, fonts, text) may be saved in local storage to preserve your session state, giving you full control over local clearance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 04. Third-Party Uplinks
              </h2>
              <p className="leading-relaxed">
                Our modules may integrate with essential third-party services (e.g., Google Fonts, Firebase) for typography and system health monitoring. No proprietary information is exposed to external intelligence layers without explicit authorization protocols.
              </p>
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
