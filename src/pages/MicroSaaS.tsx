import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, ShieldCheck, FileText, Sparkles, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Nav, { GRADIENT } from '../components/Nav';
import { microsaasApps } from '../data/microsaasApps';

interface AppEntry {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconUrl: string;
  featureUrl?: string;
  route: string;
  platforms: string[];
}

export default function MicroSaaS() {
  const apps: AppEntry[] = [
    {
      id: 'stamppedia',
      name: 'Stamppedia',
      subtitle: 'Scan & identify',
      description: 'Identify and catalog stamps with advanced AI image recognition technology.',
      iconUrl: 'https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/app_icon.png',
      featureUrl: 'https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/stamp_pedia_graphic_main.png',
      route: '/apps/stamppedia',
      platforms: ['iOS', 'Android'],
    },
    ...microsaasApps.map((app): AppEntry => ({
      id: app.slug,
      name: app.name,
      subtitle: app.tagline,
      description: app.description,
      iconUrl: app.iconUrl,
      featureUrl: app.featureUrl,
      route: `/apps/${app.slug}`,
      platforms: app.platforms,
    })),
  ];

  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="MicroSaaS Apps & Mobile Software | ShaadDev Studio"
        description="Explore our suite of focused, lightweight microSaaS applications for iOS and Android built by ShaadDev Studio."
        url="https://shaaddev.studio/microsaas"
        keywords="MicroSaaS apps, iOS apps, Android apps, Flutter apps, ShaadDev Studio"
      />

      <Nav />

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-36 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              App Suite & Personal MicroSaaS
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
              MicroSaaS <span className="text-primary">Applications.</span>
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl leading-relaxed">
              Lightweight, focused mobile and web applications engineered to solve specific productivity and utility problems with high performance.
            </p>
          </div>

          {/* Featured Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {apps.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              >
                <Link to={app.route} className="group block h-full">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] h-full flex flex-col overflow-hidden hover:border-primary/40 hover:bg-white/[0.04] transition-all duration-300 shadow-xl shadow-black/20">
                    {app.featureUrl && (
                      <div className="aspect-[16/9] w-full overflow-hidden border-b border-white/10 bg-[#0A0C0B] flex items-center justify-center">
                        <img 
                          src={app.featureUrl} 
                          alt={`${app.name} official feature banner`} 
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy" 
                        />
                      </div>
                    )}
                    <div className="p-7 space-y-6 flex flex-col flex-1">
                      {/* App Icon and Title */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-white/15 shrink-0 bg-[#08080A]">
                            <img src={app.iconUrl} alt={`${app.name} icon`} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                              {app.name}
                            </h3>
                            <p className="text-primary text-xs font-semibold uppercase tracking-wider mt-0.5">
                              {app.subtitle}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
                      </div>

                      {/* Description */}
                      <p className="text-white/60 text-sm leading-relaxed flex-grow">
                        {app.description}
                      </p>

                      {/* Platforms */}
                      <div className="flex gap-2 pt-4 border-t border-white/10">
                        {app.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div
                        className="text-xs font-semibold px-4 py-3 rounded-xl text-white mt-auto w-full text-center shadow-lg shadow-primary/20 group-hover:shadow-primary/35 transition-all flex items-center justify-center gap-1.5"
                        style={{ background: GRADIENT }}
                      >
                        View App Details <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/10">
            {[
              {
                title: 'Privacy & Data Security',
                description: 'Every application adheres to strict data protection standards and zero telemetry selling.',
                icon: ShieldCheck,
              },
              {
                title: 'Transparent Terms',
                description: 'Clear, concise terms of service and dedicated support channels for all products.',
                icon: FileText,
              },
            ].map((card, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {card.title}
                  </h4>
                  <p className="text-xs text-white/50">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
