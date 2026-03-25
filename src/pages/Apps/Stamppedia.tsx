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
          <img src="https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/app_icon.png" alt="Stamppedia Icon" className="w-8 h-8 rounded-lg" />
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
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl border border-primary/20">
                <img 
                  src="https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/app_icon.png" 
                  alt="Stamppedia - AI Stamp Identifier App Icon"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          {/* Main App Graphic */}
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl my-16">
            <img 
              src="https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/stamp_pedia_graphic_main.png" 
              alt="Stamppedia - The Ultimate AI Stamp Identifier and Digital Collection App Interface"
              className="w-full h-auto object-cover"
            />
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
                  href="https://play.google.com/store/apps/details?id=studio.shaaddev.stamppedia"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel p-8 space-y-6 group hover:border-primary/50 transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div className="h-14 flex items-center justify-start">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                          alt="Get it on Google Play" 
                          className="h-full w-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                          Google Play
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                          Android
                        </p>
                      </div>
                    </div>
                    <Download className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm flex-grow">
                    Download Stamppedia from Google Play Store and start cataloging your stamp collection today.
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-widest px-4 py-3 border border-primary bg-transparent hover:bg-primary hover:text-black transition-all w-full mt-auto">
                    Open on Play Store
                  </button>
                </motion.a>

                {/* Apple App Store */}
                <motion.a
                  href="https://apps.apple.com/app/id6761055547"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel p-8 space-y-6 group hover:border-primary/50 transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div className="h-14 flex items-center justify-start">
                        <img 
                          src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&amp;releaseDate=1276560000&h=7e7b68fad19738b5649a1bfb78ff46e9" 
                          alt="Download on the App Store" 
                          className="h-full w-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "https://developer.apple.com/app-store/marketing/guidelines/images/badge-example-preferred.png";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-1">
                          App Store
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                          iOS
                        </p>
                      </div>
                    </div>
                    <Download className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm flex-grow">
                    Download Stamppedia from the Apple App Store for iPhone and iPad.
                  </p>
                  <button className="text-[10px] font-black uppercase tracking-widest px-4 py-3 border border-primary bg-transparent hover:bg-primary hover:text-black transition-all w-full mt-auto">
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

          {/* SEO Content Section */}
          <div className="border-t border-white/5 pt-16">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-8">
                Unlock the Secrets of Your Stamp Collection with Stamp Pedia
              </h2>
              
              <div className="prose prose-invert max-w-none text-white/60 space-y-6">
                <p>
                  Are you a passionate philatelist or a collector who just stumbled upon an old album? Identifying rare and valuable stamps can be a daunting, time-consuming task. From deciphering tiny perforations to identifying obscure watermarks, the world of stamp collecting (philately) is as intricate as it is fascinating.
                </p>
                <p>
                  Enter <strong className="text-white">Stamp Pedia</strong>—the most advanced, high-tech AI stamp identification app designed to bring your collection into the digital age.
                </p>

                <h3 className="text-xl font-black text-white mt-8 mb-4 flex items-center gap-2">📸 Snap, Identify, and Value: All in Seconds</h3>
                <p>Stamp Pedia isn’t just another database; it’s your personal philatelist in your pocket. Using cutting-edge image recognition technology, the app allows you to simply point your camera and discover:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Instant Recognition:</strong> Identify stamps from virtually any country and era in seconds.</li>
                  <li><strong className="text-white">Detailed Philatelic Data:</strong> Get the technical specs you need—issue year, printing method, perforation type, and more.</li>
                  <li><strong className="text-white">Rarity Status:</strong> Is your find "common" or "one-of-a-kind"? Stamp Pedia tells you the truth about your discovery.</li>
                  <li><strong className="text-white">Market Insights:</strong> Access historical market data and current valuation ranges from global platforms like eBay to see what your collection is actually worth.</li>
                </ul>

                <h3 className="text-xl font-black text-white mt-8 mb-4 flex items-center gap-2">🗃️ Create Your Digital Stamp Album</h3>
                <p>Gone are the days of manually cataloging your stamps in paper ledgers. With Stamp Pedia, you can build a premium, high-resolution digital collection:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Save to Collection:</strong> Every identify scan can be saved to your permanent digital archive.</li>
                  <li><strong className="text-white">Pinch-to-Zoom Detail:</strong> Use the digital loupe to inspect every tiny detail of your stamp without needing a physical magnifying glass.</li>
                  <li><strong className="text-white">Track Your Worth:</strong> Monitor the total value of your collection as it grows.</li>
                </ul>

                <h3 className="text-xl font-black text-white mt-8 mb-4 flex items-center gap-2">🌟 Why Collectors Love Stamp Pedia</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">High Accuracy:</strong> Powered by specialized philatelic AI models.</li>
                  <li><strong className="text-white">Global Coverage:</strong> From classic Victora-era stamps to modern commemorative releases.</li>
                  <li><strong className="text-white">Seamless UX:</strong> Designed for collectors, by collectors. No ad-clutter—just your stamps.</li>
                  <li><strong className="text-white">Secure Archive:</strong> Your collection is saved locally and synced with your account for peace of mind.</li>
                </ul>

                <h3 className="text-xl font-black text-white mt-8 mb-4 flex items-center gap-2">🚀 Ready to Discover Your Rare Finds?</h3>
                <p>
                  Stop guessing and start identifying. Whether you're valuing a single stamp or an entire heritage collection, Stamp Pedia is the only tool you need.
                </p>

                <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl text-sm leading-relaxed">
                  <strong className="text-primary font-black uppercase tracking-widest text-[10px] block mb-2">Philatelic Keywords for Search Engines:</strong>
                  Stamp identifier app, how to value stamps, identify rare stamps, digital stamp collection, philately AI, stamp price guide, collector's archive, rare finds identification.
                </div>
              </div>
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
