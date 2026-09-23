import { motion } from 'motion/react';
import { Download, CheckCircle2, ChevronLeft, ExternalLink, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav, { GRADIENT } from '../../components/Nav';
import { getMicrosaasApp } from '../../data/microsaasApps';

const PLAY_STORE_ICON_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg';
const APP_STORE_ICON_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg';

export default function AppDetail() {
  const { slug } = useParams<{ slug: string }>();
  const app = slug ? getMicrosaasApp(slug) : undefined;

  if (!app) {
    return <Navigate to="/microsaas" replace />;
  }

  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title={`${app.name} - ${app.tagline} | ShaadDev Studio`}
        description={`${app.description} Download ${app.name} for ${app.platforms.join(' & ')}.`}
        url={`https://shaaddev.studio/apps/${app.slug}`}
        image={app.featureUrl || app.iconUrl}
        keywords={`${app.name}, ${app.tagline}, ${app.platforms.join(', ')} app, ShaadDev Studio`}
      />

      <Nav />

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-32 pb-20">
        <Link 
          to="/microsaas" 
          className="inline-flex items-center gap-2 text-xs font-medium text-white/50 hover:text-primary transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to MicroSaaS Apps
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-primary">
                MicroSaaS Application
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15 shadow-xl shadow-primary/20 shrink-0">
                    <img
                      src={app.iconUrl}
                      alt={`${app.name} app icon`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                      {app.name}
                    </h1>
                    <p className="text-primary font-semibold text-sm sm:text-base mt-1">
                      {app.tagline}
                    </p>
                  </div>
                </div>

                <p className="text-white/65 text-base sm:text-lg leading-relaxed pt-2">
                  {app.description}
                </p>
              </div>

              {/* Quick Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-white/10">
                {app.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-white/70">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                {app.playStore && (
                  <a
                    href={app.playStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                    style={{ background: GRADIENT }}
                  >
                    <img src={PLAY_STORE_ICON_URL} alt="" className="w-4 h-4 object-contain" />
                    Play Store ({app.playStoreLabel || 'Android'})
                    <ArrowUpRight className="w-4 h-4 opacity-70" />
                  </a>
                )}
                {app.appStore && (
                  <a
                    href={app.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-white text-sm font-semibold border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all"
                  >
                    <img src={APP_STORE_ICON_URL} alt="" className="w-4 h-4 object-contain rounded" />
                    App Store ({app.appStoreLabel || 'iOS'})
                    <ArrowUpRight className="w-4 h-4 opacity-70" />
                  </a>
                )}
              </div>
            </div>

            {/* App Icon / Preview Banner */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex justify-center"
            >
              <div className="relative rounded-3xl p-3 border border-white/15 bg-white/[0.03] shadow-2xl backdrop-blur-xl max-w-md w-full overflow-hidden">
                <img
                  src={app.featureUrl || app.iconUrl}
                  alt={`${app.name} graphic preview`}
                  className="w-full h-auto rounded-2xl object-cover border border-white/10"
                />
              </div>
            </motion.div>
          </div>

          {/* Download Cards Section */}
          <div className="border-t border-white/10 pt-16 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                Download {app.name}
              </h2>
              <p className="text-white/50 text-sm">
                Get {app.name} directly from official app stores for {app.platforms.join(' and ')}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {app.playStore && (
                <motion.a
                  href={app.playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6 group hover:border-primary/40 hover:bg-white/[0.04] transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2.5 flex items-center justify-center">
                        <img src={PLAY_STORE_ICON_URL} alt="Google Play" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Google Play Store</h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-0.5">
                          {app.playStoreLabel || 'Android Package'}
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm flex-grow">
                    Download {app.name} officially on Android devices via Google Play.
                  </p>
                  <div
                    className="text-sm font-semibold px-4 py-3 rounded-xl text-white w-full text-center shadow-lg shadow-primary/20 group-hover:shadow-primary/35 transition-all flex items-center justify-center gap-2"
                    style={{ background: GRADIENT }}
                  >
                    Download on Play Store <ExternalLink className="w-4 h-4" />
                  </div>
                </motion.a>
              )}

              {app.appStore && (
                <motion.a
                  href={app.appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6 group hover:border-primary/40 hover:bg-white/[0.04] transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-2.5 flex items-center justify-center">
                        <img src={APP_STORE_ICON_URL} alt="App Store" className="w-full h-full object-contain rounded" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">Apple App Store</h3>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mt-0.5">
                          {app.appStoreLabel || 'iOS & iPadOS'}
                        </p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-white/40 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-white/60 text-sm flex-grow">
                    Download {app.name} officially on iPhone and iPad via Apple App Store.
                  </p>
                  <div
                    className="text-sm font-semibold px-4 py-3 rounded-xl text-white w-full text-center shadow-lg shadow-primary/20 group-hover:shadow-primary/35 transition-all flex items-center justify-center gap-2"
                    style={{ background: GRADIENT }}
                  >
                    Download on App Store <ExternalLink className="w-4 h-4" />
                  </div>
                </motion.a>
              )}
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="border-t border-white/10 pt-16 space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {app.features.map((feature, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-start gap-3.5 hover:border-primary/30 hover:bg-white/[0.035] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Overview */}
          <div className="border-t border-white/10 pt-16 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Overview & Product Details
            </h2>
            <div className="space-y-4 text-white/65 text-base leading-relaxed max-w-4xl">
              {app.longDescription.map((para, idx) => (
                <p key={idx} className="rounded-xl border border-white/5 bg-white/[0.015] p-5">
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Legal & Support Links */}
          <div className="border-t border-white/10 pt-16">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-white">
                  Privacy & Legal Compliance
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to={`/apps/${app.slug}/privacy`}
                  className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/10 transition-all"
                >
                  <div className="text-sm font-bold text-primary mb-1 group-hover:underline">
                    Privacy Policy
                  </div>
                  <p className="text-xs text-white/50">
                    Read data protection and privacy policies
                  </p>
                </Link>
                
                <Link
                  to={`/apps/${app.slug}/terms`}
                  className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/10 transition-all"
                >
                  <div className="text-sm font-bold text-primary mb-1 group-hover:underline">
                    Terms of Service
                  </div>
                  <p className="text-xs text-white/50">
                    Read user terms and conditions
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
