import { motion } from 'motion/react';
import { Download, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20">
      <SEO
        title={`${app.name} - ${app.tagline} | ShaadDev Studio`}
        description={app.description}
        url={`https://shaaddev.studio/apps/${app.slug}`}
      />


      <Nav />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-20">
        <Link to="/microsaas" className="inline-flex items-center gap-1.5 text-xs text-[#8B958F] hover:text-primary transition-colors mb-8">
          MicroSaaS <span className="text-black/20">/</span> {app.name}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint border border-primary/15 text-xs font-medium text-primary">
                MicroSaaS app
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
                  {app.name}<br />
                  <span className="text-primary">{app.tagline}</span>
                </h1>
                <p className="text-[#55605B] text-lg max-w-2xl leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-black/[0.06]">
                {app.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#55605B]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="flex justify-center"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl border border-black/10">
                <img
                  src={app.iconUrl}
                  alt={`${app.name} app icon`}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          {/* Feature graphic */}
          {app.featureUrl && (
            <div className="w-full rounded-2xl overflow-hidden border border-black/10 shadow-2xl">
              <img
                src={app.featureUrl}
                alt={`${app.name} preview`}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Download Section */}
          <div className="border-t border-black/[0.06] pt-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-ink mb-2">
                  Download now
                </h2>
                <p className="text-[#55605B]">
                  Available on {app.platforms.join(' and ')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {app.playStore && (
                  <motion.a
                    href={app.playStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-black/10 bg-white shadow-sm shadow-black/[0.02] p-8 space-y-6 group hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-lg bg-[#F6F8F7] border border-black/5 p-2 flex items-center justify-center">
                          <img src={PLAY_STORE_ICON_URL} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-ink mb-1">Google Play</h3>
                          <p className="text-xs font-medium uppercase tracking-wide text-primary">
                            {app.playStoreLabel || 'Android'}
                          </p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-[#8B958F] group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-[#55605B] text-sm flex-grow">
                      Download {app.name} from Google Play Store.
                    </p>
                    <div
                      className="text-sm font-semibold px-4 py-3 rounded-xl text-white w-full mt-auto text-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/35 transition-all"
                      style={{ background: GRADIENT }}
                    >
                      Open on Play Store
                    </div>
                  </motion.a>
                )}

                {app.appStore && (
                  <motion.a
                    href={app.appStore}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border border-black/10 bg-white shadow-sm shadow-black/[0.02] p-8 space-y-6 group hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all flex flex-col h-full"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-lg bg-[#F6F8F7] border border-black/5 p-2 flex items-center justify-center">
                          <img src={APP_STORE_ICON_URL} alt="" className="w-full h-full object-contain rounded" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-ink mb-1">App Store</h3>
                          <p className="text-xs font-medium uppercase tracking-wide text-primary">
                            {app.appStoreLabel || 'iOS'}
                          </p>
                        </div>
                      </div>
                      <Download className="w-5 h-5 text-[#8B958F] group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-[#55605B] text-sm flex-grow">
                      Download {app.name} from the Apple App Store.
                    </p>
                    <div
                      className="text-sm font-semibold px-4 py-3 rounded-xl text-white w-full mt-auto text-center shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/35 transition-all"
                      style={{ background: GRADIENT }}
                    >
                      Open on App Store
                    </div>
                  </motion.a>
                )}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="border-t border-black/[0.06] pt-16">
            <h2 className="text-3xl font-bold tracking-tight text-ink mb-8">
              Key features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {app.features.map((feature, idx) => (
                <div key={idx} className="rounded-2xl border border-black/10 bg-white shadow-sm shadow-black/[0.02] p-6 flex items-start gap-3 hover:border-primary/25 hover:shadow-lg hover:shadow-black/5 transition-all">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#55605B]">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="border-t border-black/[0.06] pt-16">
            <h2 className="text-3xl font-bold tracking-tight text-ink mb-8">
              About {app.name}
            </h2>
            <div className="prose max-w-none text-[#55605B] space-y-6">
              {app.longDescription.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="border-t border-black/[0.06] pt-16">
            <div className="rounded-2xl border border-black/10 bg-white shadow-sm shadow-black/[0.02] p-8 space-y-6">
              <h3 className="text-xl font-semibold text-ink">
                Legal & support
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to={`/apps/${app.slug}/privacy`}
                  className="group p-4 rounded-xl border border-black/10 hover:border-primary/30 hover:bg-mint/40 transition-all"
                >
                  <div className="text-sm font-semibold text-primary mb-2">
                    Privacy policy
                  </div>
                  <p className="text-xs text-[#55605B] group-hover:text-ink transition-colors">
                    View our privacy and data protection policies
                  </p>
                </Link>
                <Link
                  to={`/apps/${app.slug}/terms`}
                  className="group p-4 rounded-xl border border-black/10 hover:border-primary/30 hover:bg-mint/40 transition-all"
                >
                  <div className="text-sm font-semibold text-primary mb-2">
                    Terms of service
                  </div>
                  <p className="text-xs text-[#55605B] group-hover:text-ink transition-colors">
                    Read our terms and conditions
                  </p>
                </Link>
                <a
                  href="mailto:rizwanrasheed046@gmail.com"
                  className="group p-4 rounded-xl border border-black/10 hover:border-primary/30 hover:bg-mint/40 transition-all"
                >
                  <div className="text-sm font-semibold text-primary mb-2">
                    Support
                  </div>
                  <p className="text-xs text-[#55605B] group-hover:text-ink transition-colors">
                    Get help and support
                  </p>
                </a>
                <Link
                  to="/contact"
                  className="group p-4 rounded-xl border border-black/10 hover:border-primary/30 hover:bg-mint/40 transition-all"
                >
                  <div className="text-sm font-semibold text-primary mb-2">
                    Contact
                  </div>
                  <p className="text-xs text-[#55605B] group-hover:text-ink transition-colors">
                    Get in touch with us
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
