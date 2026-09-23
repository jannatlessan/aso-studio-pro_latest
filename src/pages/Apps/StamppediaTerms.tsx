import React from 'react';
import { motion } from 'motion/react';
import { Scale, AlertCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav, { GRADIENT } from '../../components/Nav';

export default function StamppediaTerms() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="Terms of Service | Stamppedia"
        description="Terms of service and user agreements for Stamppedia app."
        url="https://shaaddev.studio/apps/stamppedia/terms"
      />

      <Nav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-20">
        <Link to="/apps/stamppedia" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-primary transition-colors mb-8">
          Stamppedia <span className="text-white/20">/</span> Terms of Service
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-primary">
              Legal · Stamppedia
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
              Terms of <span className="text-primary">Service.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
              By using Stamppedia, you enter a mutual agreement to use our service responsibly and respect the rights of others.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { icon: Scale, label: "Fair Use", desc: "Licensed for personal collection usage" },
              { icon: AlertCircle, label: "Responsibility", desc: "Use service appropriately" },
              { icon: ShieldAlert, label: "Liability", desc: "Provided \"as is\" without warranty" }
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:border-primary/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white mb-1">{item.label}</div>
                  <div className="text-xs text-white/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Content */}
          <div className="space-y-10 text-white/70">
            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 01. Agreement to Terms
              </h2>
              <p className="leading-relaxed text-sm">
                By downloading, installing, and using Stamppedia, you agree to be bound by these Terms of Service. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 02. License to Use
              </h2>
              <p className="leading-relaxed text-sm">
                ShaadDev Studio grants you a limited, non-exclusive, non-transferable license to use the Application for personal, non-commercial purposes.
              </p>
            </section>

            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 03. Contact Information
              </h2>
              <p className="leading-relaxed text-sm">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="rounded-xl bg-white/5 p-4 mt-4 border border-white/10 text-xs text-white">
                <strong>Email:</strong> rizwanrasheed046@gmail.com
              </div>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
