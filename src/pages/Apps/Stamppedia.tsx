import React from 'react';
import { motion } from 'motion/react';
import { Download, Star, Shield, Zap, MapPin } from 'lucide-react';
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
          MicroSaaS <span className="text-white/30">/</span> Stamppedia
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white/65">
                MicroSaaS app
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
                  Stamppedia<br />
                  <span className="text-primary">Scan & identify</span>
                </h1>
                <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
                  Your personal stamp collection intelligence system. Identify, catalog, and learn about stamps using advanced AI recognition technology.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/[0.06]">
                {[
                  { icon: Zap, text: 'AI-powered recognition' },
                  { icon: Shield, text: 'Secure storage' },
                  { icon: MapPin, text: 'Location tagging' },
                  { icon: Star, text: 'Rarity ratings' },
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
          <div className="border-t border-white/[0.06] pt-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                  Download now
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
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6 group hover:border-primary/30 transition-all flex flex-col h-full"
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
                        <h3 className="text-xl font-semibold text-white mb-1">
                          Google Play
                        </h3>
                        <p className="text-xs font-medium uppercase tracking-wide text-primary">
                          Android
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-white/25 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/55 text-sm flex-grow">
                    Download Stamppedia from Google Play Store and start cataloging your stamp collection today.
                  </p>
                  <button
                    className="text-sm font-semibold px-4 py-3 rounded-xl text-white w-full mt-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/35 transition-all"
                    style={{ background: GRADIENT }}
                  >
                    Open on Play Store
                  </button>
                </motion.a>

                {/* Apple App Store */}
                <motion.a
                  href="https://apps.apple.com/app/id6761055547"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6 group hover:border-primary/30 transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div className="h-14 flex items-center justify-start">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                          alt="Download on the App Store"
                          className="h-full w-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "https://linkmaker.itunes.apple.com/images/badges/en-us/badge_appstore-lrg.svg";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          App Store
                        </h3>
                        <p className="text-xs font-medium uppercase tracking-wide text-primary">
                          iOS
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-white/25 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/55 text-sm flex-grow">
                    Download Stamppedia from the Apple App Store for iPhone and iPad.
                  </p>
                  <button
                    className="text-sm font-semibold px-4 py-3 rounded-xl text-white w-full mt-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/35 transition-all"
                    style={{ background: GRADIENT }}
                  >
                    Open on App Store
                  </button>
                </motion.a>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="border-t border-white/[0.06] pt-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-8">
              Key features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Smart recognition',
                  description: 'AI-powered image recognition to identify stamps instantly',
                },
                {
                  title: 'Collection management',
                  description: 'Organize and manage your entire stamp collection in one place',
                },
                {
                  title: 'Historical data',
                  description: 'Access detailed historical information about each stamp',
                },
                {
                  title: 'Value estimation',
                  description: 'Get approximate values based on condition and rarity',
                },
                {
                  title: 'Export & share',
                  description: 'Share your collection or export data for backup',
                },
                {
                  title: 'Offline access',
                  description: 'View your collection even without internet connection',
                },
              ].map((feature, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3 hover:border-primary/25 transition-all">
                  <h4 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-white/50">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Content Section */}
          <div className="border-t border-white/[0.06] pt-16">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-8">
                Unlock the secrets of your stamp collection with Stamppedia
              </h2>

              <div className="prose prose-invert max-w-none text-white/60 space-y-6">
                <p>
                  Are you a passionate philatelist or a collector who just stumbled upon an old album? Identifying rare and valuable stamps can be a daunting, time-consuming task. From deciphering tiny perforations to identifying obscure watermarks, the world of stamp collecting (philately) is as intricate as it is fascinating.
                </p>
                <p>
                  Enter <strong className="text-white">Stamppedia</strong> — an advanced AI stamp identification app designed to bring your collection into the digital age.
                </p>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">Snap, identify, and value — all in seconds</h3>
                <p>Stamppedia isn't just another database; it's your personal philatelist in your pocket. Using cutting-edge image recognition technology, the app allows you to simply point your camera and discover:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Instant recognition:</strong> Identify stamps from virtually any country and era in seconds.</li>
                  <li><strong className="text-white">Detailed philatelic data:</strong> Get the technical specs you need — issue year, printing method, perforation type, and more.</li>
                  <li><strong className="text-white">Rarity status:</strong> Is your find "common" or "one-of-a-kind"? Stamppedia tells you the truth about your discovery.</li>
                  <li><strong className="text-white">Market insights:</strong> Access historical market data and current valuation ranges from global platforms like eBay to see what your collection is actually worth.</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">Create your digital stamp album</h3>
                <p>Gone are the days of manually cataloging your stamps in paper ledgers. With Stamppedia, you can build a premium, high-resolution digital collection:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">Save to collection:</strong> Every identify scan can be saved to your permanent digital archive.</li>
                  <li><strong className="text-white">Pinch-to-zoom detail:</strong> Use the digital loupe to inspect every tiny detail of your stamp without needing a physical magnifying glass.</li>
                  <li><strong className="text-white">Track your worth:</strong> Monitor the total value of your collection as it grows.</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">Why collectors love Stamppedia</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong className="text-white">High accuracy:</strong> Powered by specialized philatelic AI models.</li>
                  <li><strong className="text-white">Global coverage:</strong> From classic Victorian-era stamps to modern commemorative releases.</li>
                  <li><strong className="text-white">Seamless UX:</strong> Designed for collectors, by collectors. No ad-clutter — just your stamps.</li>
                  <li><strong className="text-white">Secure archive:</strong> Your collection is saved locally and synced with your account for peace of mind.</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-8 mb-4">Ready to discover your rare finds?</h3>
                <p>
                  Stop guessing and start identifying. Whether you're valuing a single stamp or an entire heritage collection, Stamppedia is the only tool you need.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-white/[0.06] pt-16">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <h3 className="text-xl font-semibold text-white">
                Legal & support
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/apps/stamppedia/privacy"
                  className="group p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all"
                >
                  <div className="text-sm font-semibold text-primary mb-2">
                    Privacy policy
                  </div>
                  <p className="text-xs text-white/55 group-hover:text-white/75 transition-colors">
                    View our privacy and data protection policies
                  </p>
                </Link>
                <Link
                  to="/apps/stamppedia/terms"
                  className="group p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all"
                >
                  <div className="text-sm font-semibold text-primary mb-2">
                    Terms of service
                  </div>
                  <p className="text-xs text-white/55 group-hover:text-white/75 transition-colors">
                    Read our terms and conditions
                  </p>
                </Link>
                <a
                  href="mailto:rizwanrasheed046@gmail.com"
                  className="group p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all"
                >
                  <div className="text-sm font-semibold text-primary mb-2">
                    Support
                  </div>
                  <p className="text-xs text-white/55 group-hover:text-white/75 transition-colors">
                    Get help and support
                  </p>
                </a>
                <Link
                  to="/contact"
                  className="group p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all"
                >
                  <div className="text-sm font-semibold text-primary mb-2">
                    Contact
                  </div>
                  <p className="text-xs text-white/55 group-hover:text-white/75 transition-colors">
                    Get in touch with us
                  </p>
                </Link>
              </div>
            </div>
          </div>

          {/* Ratings Section */}
          <div className="border-t border-white/[0.06] pt-16">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary fill-current" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Highly rated
                  </h3>
                  <p className="text-sm text-white/50">
                    Trusted by stamp enthusiasts worldwide
                  </p>
                </div>
              </div>
              <p className="text-white/55 text-sm leading-relaxed">
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
