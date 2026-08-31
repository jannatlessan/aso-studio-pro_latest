import React from 'react';
import { motion } from 'motion/react';
import { Scale, AlertCircle, Zap, ShieldAlert } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Nav, { GRADIENT } from '../components/Nav';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="Terms of Service | ShaadDev Studio"
        description="Terms of service and user agreements for ShaadDev Studio tools and platforms."
        url="https://shaaddev.studio/terms"
      />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.12] blur-[120px]" style={{ background: GRADIENT }} />
      </div>

      <Nav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white/65">
              Legal · Last updated 2026
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Terms of <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>Service.</span>
            </h1>
            <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
              By using ShaadDev Studio, you agree to the terms below. We've kept them short and in plain language.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/[0.06]">
            {[
              { icon: Scale, label: "Fair use", desc: "Free for personal and commercial work" },
              { icon: ShieldAlert, label: "Safety", desc: "No malicious code or hidden behavior" },
              { icon: Zap, label: "Reliability", desc: "Built and maintained for consistent uptime" }
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:border-primary/25 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-1">{item.label}</div>
                  <div className="text-xs text-white/50">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Content */}
          <div className="prose prose-invert max-w-none space-y-10 text-white/60">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 1. Use of our tools
              </h2>
              <p className="leading-relaxed">
                ShaadDev Studio grants you a non-exclusive, non-transferable right to use our tools for personal, professional, or commercial purposes. Reverse-engineering our tools or scraping them for automated, unauthorized use is not permitted.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 2. Intellectual property
              </h2>
              <p className="leading-relaxed">
                You retain full ownership of any content or data you create using our tools. The underlying site, its design system, and source code remain the property of ShaadDev Studio and may not be copied or redistributed without permission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 3. Liability
              </h2>
              <p className="leading-relaxed">
                Our tools are provided "as is," without warranties of any kind. We aim for high reliability but are not liable for interruptions, data loss, or issues arising from your browser or device environment.
              </p>
            </section>

            <section className="space-y-3 flex items-start gap-4 p-6 bg-red-500/5 border border-red-500/15 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-red-400">Termination</h3>
                <p className="text-xs leading-relaxed text-white/60">
                  Abuse of our tools or violation of these terms may result in restricted access to the site.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 4. Contact
              </h2>
              <p className="leading-relaxed">
                Questions about these terms? Reach out at{' '}
                <a href="mailto:rizwanrasheed046@gmail.com" className="text-primary hover:underline">rizwanrasheed046@gmail.com</a>.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
