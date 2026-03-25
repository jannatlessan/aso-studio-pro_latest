import React from 'react';
import { motion } from 'motion/react';
import { Grid3x3, ExternalLink, ShieldCheck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function MicroSaaS() {
  const apps = [
    {
      id: 'stamppedia',
      name: 'Stamppedia',
      subtitle: 'Scan & Identifier',
      description: 'Identify and catalog stamps with advanced image recognition technology.',
      iconUrl: 'https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/app_icon.png',
      route: '/apps/stamppedia',
      platforms: ['iOS', 'Android'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] font-mono selection:bg-primary/30">
      <SEO 
        title="MicroSaaS Apps | ShaadDev Studio" 
        description="Explore our collection of lightweight, focused microSaaS applications designed for specific productivity needs." 
        url="https://shaaddev.studio/microsaas" 
      />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-[#020202]/60 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border border-primary rotate-45 flex items-center justify-center bg-black group-hover:bg-primary transition-all">
            <span className="text-primary group-hover:text-black font-bold -rotate-45">←</span>
          </div>
          <span className="font-black tracking-[0.2em] text-sm uppercase">ShaadDev Studio</span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
          <Grid3x3 className="w-4 h-4 text-primary" />
          <span>MicroSaaS Suite</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              MSAAS-01 // APP_SUITE
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none">
              MicroSaaS<br />
              <span className="text-primary italic">Applications</span>
            </h1>
            <p className="text-white/40 text-lg italic max-w-3xl">
              "Lightweight, focused applications designed to solve specific problems with precision and elegance."
            </p>
          </div>

          {/* Featured Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12 border-t border-white/5">
            {apps.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={app.route} className="group">
                  <div className="glass-panel p-8 space-y-6 h-full flex flex-col hover:border-primary/50 transition-all duration-300 hover:bg-primary/5">
                    {/* App Icon and Title */}
                    <div className="flex items-start justify-between">
                      <div>
                        {app.iconUrl ? (
                          <div className="mb-4 w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                            <img src={app.iconUrl} alt={`${app.name} icon`} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="text-5xl mb-4">{(app as any).icon}</div>
                        )}
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                          {app.name}
                        </h3>
                        <p className="text-primary text-sm font-black uppercase tracking-widest mt-1">
                          {app.subtitle}
                        </p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />
                    </div>

                    {/* Description */}
                    <p className="text-white/60 text-sm leading-relaxed flex-grow">
                      {app.description}
                    </p>

                    {/* Platforms */}
                    <div className="flex gap-2 pt-4 border-t border-white/5">
                      {app.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-primary/10 border border-primary/20 text-primary"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button className="text-[10px] font-black uppercase tracking-widest px-4 py-3 border border-primary bg-transparent hover:bg-primary hover:text-black transition-all mt-auto w-full">
                      View App
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/5">
            {[
              {
                title: 'Privacy & Security',
                description: 'Each app includes comprehensive privacy policies and security measures.',
                icon: ShieldCheck,
              },
              {
                title: 'Terms & Conditions',
                description: 'Clear, transparent terms of service for every application.',
                icon: FileText,
              },
            ].map((card, idx) => (
              <div key={idx} className="glass-panel p-6 space-y-4">
                <card.icon className="w-6 h-6 text-primary" />
                <div>
                  <h4 className="text-[10px] font-black uppercase border-b border-primary/20 pb-2 mb-2 tracking-widest">
                    {card.title}
                  </h4>
                  <p className="text-xs text-white/40">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="border-t border-white/5 pt-12">
            <div className="glass-panel p-8 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 bg-primary/10 border border-primary/20 w-fit">
                Coming Soon
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                More Apps in Development
              </h3>
              <p className="text-white/40 text-sm">
                We're working on additional microSaaS applications to expand our suite. Sign up for updates to be notified when new apps launch.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
