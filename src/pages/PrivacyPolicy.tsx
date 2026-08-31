import React from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, Globe } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Nav, { GRADIENT } from '../components/Nav';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="Privacy Policy | ShaadDev Studio"
        description="Privacy policy for ShaadDev Studio tools. We prioritize privacy, performance, and transparency."
        url="https://shaaddev.studio/privacy"
      />


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
              Privacy <span className="text-primary">Policy.</span>
            </h1>
            <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
              Your data is your property. ShaadDev Studio is built to respect and protect it, with clear limits on what we collect and how it's used.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/[0.06]">
            {[
              { icon: Lock, label: "Encryption", desc: "TLS-encrypted connections throughout" },
              { icon: Eye, label: "Transparency", desc: "No hidden tracking or dark patterns" },
              { icon: Globe, label: "GDPR aligned", desc: "Built around global privacy standards" }
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
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 1. Data we collect
              </h2>
              <p className="leading-relaxed">
                We collect the minimum technical data needed to operate the site — things like browser type, device category, and basic usage analytics — to keep our tools fast and reliable. We do not collect more than we need.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 2. How your files are processed
              </h2>
              <p className="leading-relaxed">
                Wherever possible, our tools process your files entirely in your browser — images, audio, and documents never leave your device. Where a server-side step is required, it runs over encrypted TLS connections and any temporary data is discarded immediately after processing.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 3. Local storage
              </h2>
              <p className="leading-relaxed">
                We don't keep long-term copies of your files or project data on our servers. Some tool preferences (like colors, fonts, or recent settings) may be saved in your browser's local storage purely to preserve your session — you can clear this at any time from your browser settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 4. Third-party services
              </h2>
              <p className="leading-relaxed">
                Some pages rely on trusted third-party services — for example Google Fonts for typography, or analytics for understanding site usage. We don't sell or share your personal information with third parties for marketing purposes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 5. Contact
              </h2>
              <p className="leading-relaxed">
                Questions about this policy? Reach out any time at{' '}
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
