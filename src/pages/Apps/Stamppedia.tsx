import React from 'react';
import { motion } from 'motion/react';
import { Download, Star, Shield, Zap, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav, { GRADIENT } from '../../components/Nav';

export default function Stamppedia() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="Stamppedia - Scan & Identify Stamps | ShaadDev Studio"
        description="Stamppedia: Advanced stamp identification and cataloging app using AI image recognition. Download for iOS and Android."
        url="https://shaaddev.studio/apps/stamppedia"
      />

      <Nav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-20">
        <Link to="/microsaas" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-primary transition-colors mb-8">
          MicroSaaS <span className="text-white/20">/</span> Stamppedia
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-primary">
                MicroSaaS Application
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
                  Stamppedia<br />
                  <span className="text-primary">Scan & Identify</span>
                </h1>
                <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
                  Your personal stamp collection intelligence system. Identify, catalog, and learn about stamps using advanced AI recognition technology.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/10">
                {[
                  { icon: Zap, text: 'AI-powered recognition' },
                  { icon: Shield, text: 'Secure storage' },
                  { icon: MapPin, text: 'Location tagging' },
                  { icon: Star, text: 'Rarity ratings' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-white/70">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* App Icon / Visual */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex justify-center"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-2 bg-white/[0.03]">
                <img
                  src="https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/app_icon.png"
                  alt="Stamppedia - AI Stamp Identifier App Icon"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </motion.div>
          </div>

          {/* Main App Graphic */}
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl my-16 bg-[#0A0C0B]">
            <img
              src="https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/stamp_pedia_graphic_main.png"
              alt="Stamppedia - The Ultimate AI Stamp Identifier and Digital Collection App Interface"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Download Section */}
          <div className="border-t border-white/10 pt-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                  Download Now
                </h2>
                <p className="text-white/50">
                  Available on both iOS and Android platforms
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Play Store */}
                <motion.a
                  href="https://play.google.com/store/apps/details?id=studio.shaaddev.stamppedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6 group hover:border-primary/40 hover:bg-white/[0.04] transition-all flex flex-col h-full shadow-xl shadow-black/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                          Google Play Store
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          Android Package
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm flex-grow">
                    Download Stamppedia from Google Play Store and start cataloging your stamp collection today.
                  </p>
                  <div
                    className="text-sm font-semibold px-4 py-3 rounded-xl text-white w-full mt-auto shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    style={{ background: GRADIENT }}
                  >
                    Open on Play Store <ArrowUpRight className="w-4 h-4" />
                  </div>
                </motion.a>

                {/* Apple App Store */}
                <motion.a
                  href="https://apps.apple.com/app/id6761055547"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6 group hover:border-primary/40 hover:bg-white/[0.04] transition-all flex flex-col h-full shadow-xl shadow-black/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                          Apple App Store
                        </h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                          iOS & iPadOS
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm flex-grow">
                    Download Stamppedia from the Apple App Store for iPhone and iPad.
                  </p>
                  <div
                    className="text-sm font-semibold px-4 py-3 rounded-xl text-white w-full mt-auto shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    style={{ background: GRADIENT }}
                  >
                    Open on App Store <ArrowUpRight className="w-4 h-4" />
                  </div>
                </motion.a>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="border-t border-white/10 pt-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-8">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Smart Recognition', description: 'AI-powered image recognition to identify stamps instantly' },
                { title: 'Collection Management', description: 'Organize and manage your entire stamp collection in one place' },
                { title: 'Historical Data', description: 'Access detailed historical information about each stamp' },
                { title: 'Value Estimation', description: 'Get approximate values based on condition and rarity' },
                { title: 'Export & Share', description: 'Share your collection or export data for backup' },
                { title: 'Offline Access', description: 'View your collection even without an internet connection' },
              ].map((feature, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3 hover:border-primary/30 transition-all">
                  <h4 className="text-sm font-bold text-white">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-white/50">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="border-t border-white/10 pt-16">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-8">
                Unlock the Secrets of Your Stamp Collection with Stamppedia
              </h2>

              <div className="space-y-6 text-white/65 text-base leading-relaxed">
                <p className="rounded-xl border border-white/5 bg-white/[0.015] p-5">
                  Are you a passionate philatelist or a collector who just stumbled upon an old album? Identifying rare and valuable stamps can be a daunting task. From deciphering tiny perforations to identifying obscure watermarks, the world of stamp collecting is as intricate as it is fascinating.
                </p>
                <p className="rounded-xl border border-white/5 bg-white/[0.015] p-5">
                  Enter <strong className="text-white">Stamppedia</strong> — an advanced AI stamp identification app designed to bring your collection into the digital age.
                </p>

                <h3 className="text-xl font-bold text-white mt-8 mb-4">Snap, Identify, and Value — All in Seconds</h3>
                <ul className="list-disc pl-5 space-y-2 rounded-xl border border-white/5 bg-white/[0.015] p-5 text-sm">
                  <li><strong className="text-white">Instant recognition:</strong> Identify stamps from virtually any country and era in seconds.</li>
                  <li><strong className="text-white">Detailed philatelic data:</strong> Get technical specs — issue year, printing method, perforation type, and more.</li>
                  <li><strong className="text-white">Rarity status:</strong> Discover whether your find is common or one-of-a-kind.</li>
                  <li><strong className="text-white">Market insights:</strong> Access historical market data and valuation ranges.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-white/10 pt-16">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <h3 className="text-xl font-bold text-white">
                Legal & Support
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/apps/stamppedia/privacy"
                  className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/10 transition-all"
                >
                  <div className="text-sm font-bold text-primary mb-1 group-hover:underline">
                    Privacy Policy
                  </div>
                  <p className="text-xs text-white/50">
                    View privacy and data protection policies
                  </p>
                </Link>
                <Link
                  to="/apps/stamppedia/terms"
                  className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/10 transition-all"
                >
                  <div className="text-sm font-bold text-primary mb-1 group-hover:underline">
                    Terms of Service
                  </div>
                  <p className="text-xs text-white/50">
                    Read terms and conditions
                  </p>
                </Link>
                <a
                  href="mailto:rizwanrasheed046@gmail.com"
                  className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/10 transition-all"
                >
                  <div className="text-sm font-bold text-primary mb-1 group-hover:underline">
                    Developer Support
                  </div>
                  <p className="text-xs text-white/50">
                    Contact developer for assistance
                  </p>
                </a>
                <Link
                  to="/contact"
                  className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/10 transition-all"
                >
                  <div className="text-sm font-bold text-primary mb-1 group-hover:underline">
                    Contact Studio
                  </div>
                  <p className="text-xs text-white/50">
                    Get in touch with ShaadDev Studio
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
