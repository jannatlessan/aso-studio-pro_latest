import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, ShieldCheck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Nav, { GRADIENT } from '../components/Nav';

const PLAY_STORE_ICON_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg';
const APP_STORE_ICON_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg';

interface AppEntry {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconUrl: string;
  featureUrl?: string;
  route?: string;
  playStore?: string;
  playStoreLabel?: string;
  appStore?: string;
  appStoreLabel?: string;
  platforms: string[];
}

export default function MicroSaaS() {
  const apps: AppEntry[] = [
    {
      id: 'stamppedia',
      name: 'Stamppedia',
      subtitle: 'Scan & identify',
      description: 'Identify and catalog stamps with advanced image recognition technology.',
      iconUrl: 'https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/app_icon.png',
      featureUrl: 'https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/stamp_pedia_graphic_main.png',
      route: '/apps/stamppedia',
      platforms: ['iOS', 'Android'],
    },
    {
      id: 'shad-audio',
      name: 'Shad Audio',
      subtitle: 'AI voice clone & TTS',
      description: 'Clone any voice from a short recording and generate natural-sounding speech, or choose from a library of AI voices.',
      iconUrl: '/assets/microsaas/shad-audio/icon.png',
      featureUrl: '/assets/microsaas/shad-audio/feature.webp',
      playStore: 'https://play.google.com/store/apps/details?id=com.fishaudio.studio',
      appStore: 'https://apps.apple.com/pk/app/fish-audio-ai-voice-clone-tts/id6775396336',
      platforms: ['iOS', 'Android'],
    },
    {
      id: 'cardvault',
      name: 'CardVault',
      subtitle: 'Sports card scanner',
      description: "Point your camera at any sports or trading card to instantly identify it, check its market value, and manage your collection.",
      iconUrl: '/assets/microsaas/cardvault/icon.png',
      featureUrl: '/assets/microsaas/cardvault/feature.webp',
      playStore: 'https://play.google.com/store/apps/details?id=studio.shaaddev.sport_card_scanner',
      appStore: 'https://apps.apple.com/pk/app/cardvault-sports-card-scanner/id6762130458',
      platforms: ['iOS', 'Android'],
    },
    {
      id: 'incomemap',
      name: 'IncomeMap',
      subtitle: 'Expense tracker',
      description: 'A secure, lightweight money manager for tracking income and expenses and building a real budget.',
      iconUrl: '/assets/microsaas/incomemap/icon.jpg',
      featureUrl: '/assets/microsaas/incomemap/feature.webp',
      playStore: 'https://play.google.com/store/apps/details?id=com.incomemap.budgettracker',
      appStore: 'https://apps.apple.com/pk/app/incomemap-income-expenses/id6763291145',
      platforms: ['iOS', 'Android'],
    },
    {
      id: 'promptgenius',
      name: 'PromptGenius',
      subtitle: 'AI prompt engineering',
      description: 'A prompt engineering tool for professionals, students, and hobbyists who want better output from their favorite AI models.',
      iconUrl: '/assets/microsaas/promptgenius/icon.png',
      featureUrl: '/assets/microsaas/promptgenius/feature.webp',
      playStore: 'https://play.google.com/store/apps/details?id=com.sds.promptgenius',
      appStore: 'https://apps.apple.com/pk/app/promptgenius-ai-prompts/id6760140851',
      platforms: ['iOS', 'Android'],
    },
    {
      id: 'bdvibes',
      name: 'BDVibes',
      subtitle: 'Birthday reminders',
      description: 'Never miss a birthday again — smart reminders that help you celebrate the people who matter most.',
      iconUrl: '/assets/microsaas/bdvibes/icon.png',
      featureUrl: '/assets/microsaas/bdvibes/feature.webp',
      playStore: 'https://play.google.com/store/apps/details?id=com.bdayvibes.app',
      appStore: 'https://apps.apple.com/pk/app/bdvibes-birthday-reminders/id6760343022',
      platforms: ['iOS', 'Android'],
    },
    {
      id: 'voice-cloning',
      name: 'AI Voice Cloning',
      subtitle: 'Clone & generate speech',
      description: 'Turn any script into natural speech in a cloned voice, a celebrity-style voice, or one of hundreds of AI voices.',
      iconUrl: '/assets/microsaas/voice-cloning/icon.png',
      featureUrl: '/assets/microsaas/voice-cloning/feature.webp',
      playStore: 'https://play.google.com/store/apps/details?id=com.fishaudio.ai.tts.clone',
      playStoreLabel: 'Persona Voices',
      appStore: 'https://apps.apple.com/pk/app/voicetwin-ai-voice-cloning/id6766869439',
      appStoreLabel: 'VoiceTwin AI',
      platforms: ['iOS', 'Android'],
    },
    {
      id: 'volume-lock',
      name: 'Volume Lock',
      subtitle: 'Lock & limit volume',
      description: "Lock your device's volume to a safe maximum and prevent accidental changes — built-in parental controls included.",
      iconUrl: '/assets/microsaas/volume-lock/icon.jpg',
      featureUrl: '/assets/microsaas/volume-lock/feature.webp',
      playStore: 'https://play.google.com/store/apps/details?id=com.vblock.volumebrightnesslock',
      playStoreLabel: 'Volume locker',
      appStore: 'https://apps.apple.com/pk/app/volume-lock-parental-control/id6760347207',
      appStoreLabel: 'Volume Lock: Parental Control',
      platforms: ['iOS', 'Android'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="MicroSaaS Apps | ShaadDev Studio"
        description="Explore our collection of lightweight, focused microSaaS applications designed for specific productivity needs."
        url="https://shaaddev.studio/microsaas"
      />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.12] blur-[120px]" style={{ background: GRADIENT }} />
      </div>

      <Nav />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white/65">
              App suite
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              MicroSaaS <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>Applications.</span>
            </h1>
            <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
              Lightweight, focused applications designed to solve specific problems with precision and elegance.
            </p>
          </div>

          {/* Featured Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-white/[0.06]">
            {apps.map((app, idx) => {
              const CardInner = (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] h-full flex flex-col overflow-hidden hover:border-primary/30 hover:bg-white/[0.035] transition-all duration-300">
                  {app.featureUrl && (
                    <div className="h-36 overflow-hidden border-b border-white/[0.06]">
                      <img src={app.featureUrl} alt={`${app.name} preview`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-8 space-y-6 flex flex-col flex-1">
                    {/* App Icon and Title */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-4 w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                          <img src={app.iconUrl} alt={`${app.name} icon`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-primary text-xs font-semibold uppercase tracking-wide mt-1">
                          {app.subtitle}
                        </p>
                      </div>
                      {app.route && <ExternalLink className="w-5 h-5 text-white/25 group-hover:text-primary transition-colors" />}
                    </div>

                    {/* Description */}
                    <p className="text-white/55 text-sm leading-relaxed flex-grow">
                      {app.description}
                    </p>

                    {/* Platforms */}
                    <div className="flex gap-2 pt-4 border-t border-white/[0.06]">
                      {app.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    {app.route ? (
                      <button
                        className="text-sm font-semibold px-4 py-3 rounded-xl text-white mt-auto w-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/35 transition-all"
                        style={{ background: GRADIENT }}
                      >
                        View app
                      </button>
                    ) : (
                      <div className="mt-auto flex flex-col gap-2">
                        {app.playStore && (
                          <a
                            href={app.playStore}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-primary/40 transition-all text-sm font-medium text-white/80"
                          >
                            <span className="flex items-center gap-2">
                              <img src={PLAY_STORE_ICON_URL} alt="" className="w-4 h-4 object-contain" loading="lazy" />
                              Play Store
                            </span>
                            {app.playStoreLabel && <span className="text-xs text-white/40">{app.playStoreLabel}</span>}
                          </a>
                        )}
                        {app.appStore && (
                          <a
                            href={app.appStore}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-primary/40 transition-all text-sm font-medium text-white/80"
                          >
                            <span className="flex items-center gap-2">
                              <img src={APP_STORE_ICON_URL} alt="" className="w-4 h-4 object-contain rounded" loading="lazy" />
                              App Store
                            </span>
                            {app.appStoreLabel && <span className="text-xs text-white/40">{app.appStoreLabel}</span>}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.06, 0.3) }}
                >
                  {app.route ? (
                    <Link to={app.route} className="group block h-full">
                      {CardInner}
                    </Link>
                  ) : (
                    <div className="group block h-full">
                      {CardInner}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-white/[0.06]">
            {[
              {
                title: 'Privacy & security',
                description: 'Each app includes comprehensive privacy policies and security measures.',
                icon: ShieldCheck,
              },
              {
                title: 'Terms & conditions',
                description: 'Clear, transparent terms of service for every application.',
                icon: FileText,
              },
            ].map((card, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:border-primary/25 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {card.title}
                  </h4>
                  <p className="text-xs text-white/50">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon */}
          <div className="border-t border-white/[0.06] pt-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-4">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary w-fit">
                Coming soon
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white">
                More apps in development
              </h3>
              <p className="text-white/50 text-sm">
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
