import React from 'react';
import { motion } from 'motion/react';
import { Download, QrCode, Star, Shield, Zap, MapPin, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

export default function Stamppedia() {
  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] font-mono selection:bg-primary/30">
      <SEO 
        title="Stamppedia - Scan & Identify Stamps | ShaadDev Studio" 
        description="Stamppedia: Advanced stamp identification and cataloging app using AI image recognition. Download for iOS and Android." 
        url="https://shaaddev.studio/apps/stamppedia" 
      />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-[#020202]/60 backdrop-blur-xl border-b border-white/5">
        <Link to="/microsaas" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border border-primary rotate-45 flex items-center justify-center bg-black group-hover:bg-primary transition-all">
            <ChevronLeft className="w-5 h-5 text-primary group-hover:text-black -rotate-45" />
          </div>
          <span className="font-black tracking-[0.2em] text-sm uppercase">Back to Apps</span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
          <span className="text-2xl">📮</span>
          <span>Stamppedia</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                APP-001 // STAMPPEDIA
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none">
                  Stamppedia<br />
                  <span className="text-primary italic">Scan & Identify</span>
                </h1>
                <p className="text-white/40 text-lg italic max-w-2xl">
                  "Your personal stamp collection intelligence system. Identify, catalog, and learn about stamps using advanced AI recognition technology."
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                {[
                  { icon: Zap, text: 'AI-Powered Recognition' },
                  { icon: Shield, text: 'Secure Storage' },
                  { icon: MapPin, text: 'Location Tagging' },
                  { icon: Star, text: 'Rarity Ratings' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-white/60">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* App Icon / Visual */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center border border-primary/20">
                <span className="text-9xl">📮</span>
              </div>
            </motion.div>
          </div>

          {/* Download Section */}
          <div className="border-t border-white/5 pt-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
                  Download Now
                </h2>
                <p className="text-white/40">
                  Available on both iOS and Android platforms
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Google Play Store */}
                <motion.a
                  href="https://play.google.com/store/apps/details?id=com.your-package-name"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel p-8 space-y-6 group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-4xl">🤖</div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">
                        Google Play
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Android
                      </p>
                    </div>
                    <Download className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm">
                    Download Stamppedia from Google Play Store and start cataloging your stamp collection today.
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-widest px-4 py-3 border border-primary bg-transparent hover:bg-primary hover:text-black transition-all w-full">
                    Open on Play Store
                  </button>
                </motion.a>

                {/* Apple App Store */}
                <motion.a
                  href="https://apps.apple.com/app/stamppedia/id123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel p-8 space-y-6 group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-4xl">🍎</div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">
                        App Store
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        iOS
                      </p>
                    </div>
                    <Download className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm">
                    Download Stamppedia from the Apple App Store for iPhone and iPad.
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-widest px-4 py-3 border border-primary bg-transparent hover:bg-primary hover:text-black transition-all w-full">
                    Open on App Store
                  </button>
                </motion.a>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="border-t border-white/5 pt-16">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-8">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Smart Recognition',
                  description: 'AI-powered image recognition to identify stamps instantly',
                },
                {
                  title: 'Collection Management',
                  description: 'Organize and manage your entire stamp collection in one place',
                },
                {
                  title: 'Historical Data',
                  description: 'Access detailed historical information about each stamp',
                },
                {
                  title: 'Value Estimation',
                  description: 'Get approximate values based on condition and rarity',
                },
                {
                  title: 'Export & Share',
                  description: 'Share your collection or export data for backup',
                },
                {
                  title: 'Offline Access',
                  description: 'View your collection even without internet connection',
                },
              ].map((feature, idx) => (
                <div key={idx} className="glass-panel p-6 space-y-3 hover:border-primary/50 transition-all">
                  <h4 className="text-sm font-black uppercase tracking-tight text-white border-b border-primary/20 pb-2">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-white/40">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-white/5 pt-16">
            <div className="bg-white/5 rounded-lg p-8 space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Legal & Support
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/apps/stamppedia/privacy"
                  className="group p-4 border border-white/10 hover:border-primary/50 transition-all"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 group-hover:text-primary">
                    Privacy Policy
                  </div>
                  <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    View our privacy and data protection policies
                  </p>
                </Link>
                <Link
                  to="/apps/stamppedia/terms"
                  className="group p-4 border border-white/10 hover:border-primary/50 transition-all"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 group-hover:text-primary">
                    Terms of Service
                  </div>
                  <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    Read our terms and conditions
                  </p>
                </Link>
                <a
                  href="mailto:rizwanrasheed046@gmail.com"
                  className="group p-4 border border-white/10 hover:border-primary/50 transition-all"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 group-hover:text-primary">
                    Support
                  </div>
                  <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    Get help and support
                  </p>
                </a>
                <Link
                  to="/contact"
                  className="group p-4 border border-white/10 hover:border-primary/50 transition-all"
                >
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 group-hover:text-primary">
                    Contact
                  </div>
                  <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                    Get in touch with us
                  </p>
                </Link>
              </div>
            </div>
          </div>

          {/* Ratings Section */}
          <div className="border-t border-white/5 pt-16">
            <div className="glass-panel p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⭐</div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-white">
                    Highly Rated
                  </h3>
                  <p className="text-sm text-white/40">
                    Trusted by stamp enthusiasts worldwide
                  </p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Stamppedia is trusted by collectors and philatelists around the world. Our AI-powered identification system is continuously improving to provide the most accurate stamp information.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
