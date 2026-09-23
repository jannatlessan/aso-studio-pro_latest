import React from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Nav from '../components/Nav';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="Privacy Policy | ShaadDev Studio"
        description="Privacy policy and data protection guidelines for ShaadDev Studio."
        url="https://shaaddev.studio/privacy"
      />

      <Nav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-primary transition-colors mb-8">
          Home <span className="text-white/20">/</span> Privacy Policy
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-primary">
              Legal Documentation
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
              Privacy <span className="text-primary">Policy.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
              Your privacy is respected. ShaadDev Studio is built to protect and secure your data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { icon: Lock, label: "Encryption", desc: "Data transmitted over encrypted connections" },
              { icon: Eye, label: "Transparency", desc: "No hidden tracking or telemetry selling" },
              { icon: FileText, label: "Control", desc: "You retain full control over your data" }
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

          {/* Privacy Content */}
          <div className="space-y-8 text-white/70">
            <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 1. Overview
              </h2>
              <p className="leading-relaxed text-sm">
                ShaadDev Studio ("we", "our", or "us") operates the website and suite of applications. We process data with privacy as a priority.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 2. Data Processing & Security
              </h2>
              <p className="leading-relaxed text-sm">
                Browser tools process data locally on your device where possible. Personal data is never sold to third-party advertisers.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 3. Contact Us
              </h2>
              <p className="leading-relaxed text-sm">
                If you have questions regarding data privacy:
              </p>
              <div className="rounded-xl bg-white/5 p-4 mt-3 border border-white/10 text-xs text-white">
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
