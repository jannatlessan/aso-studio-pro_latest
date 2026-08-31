import React from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav, { GRADIENT } from '../../components/Nav';

export default function StamppediaPrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="Privacy Policy | Stamppedia"
        description="Privacy policy for Stamppedia app. We prioritize your data privacy and security."
        url="https://shaaddev.studio/apps/stamppedia/privacy"
      />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.12] blur-[120px]" style={{ background: GRADIENT }} />
      </div>

      <Nav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-20">
        <Link to="/apps/stamppedia" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-primary transition-colors mb-8">
          Stamppedia <span className="text-white/30">/</span> Privacy policy
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white/65">
              Legal · Stamppedia
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              Privacy <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>Policy.</span>
            </h1>
            <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
              Your stamp collection data is your property. Stamppedia is designed to protect and secure your information with industry-leading encryption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/[0.06]">
            {[
              { icon: Lock, label: "Encryption", desc: "End-to-end encrypted sync" },
              { icon: Eye, label: "Transparency", desc: "No hidden data collection" },
              { icon: FileText, label: "Control", desc: "You own your data" }
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
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 01. Introduction
              </h2>
              <p className="leading-relaxed">
                This privacy policy applies to the Stamppedia app (hereby referred to as "Application") for mobile devices that was created by ShaadDev Studio (hereby referred to as "Service Provider") as a Free service. This service is intended for use "AS IS".
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 02. Information Collection and Use
              </h2>
              <p className="leading-relaxed">
                The Application collects information when you download and use it. This information may include:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Device Internet Protocol address (IP address)</li>
                <li>Pages of the Application you visit and time spent on those pages</li>
                <li>Device's operating system and type</li>
                <li>Unique device identifiers</li>
                <li>Your stamp collection data (photos, descriptions, metadata)</li>
                <li>Usage patterns and app interaction data</li>
              </ul>
              <p className="leading-relaxed mt-4">
                The Service Provider does NOT collect precise location data. However, you may choose to add location information to individual stamp entries as part of your collection data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 03. Data Storage and Security
              </h2>
              <p className="leading-relaxed">
                Your collection data (photos and metadata) may be stored locally on your device and optionally synced to secure cloud servers using end-to-end encryption. All data transmissions use HTTPS/TLS protocol. We implement industry-standard security measures to protect your information from unauthorized access.
              </p>
              <p className="leading-relaxed mt-4">
                Even though we implement strong security measures, no method of data transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security of your data.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 04. Third Party Access
              </h2>
              <p className="leading-relaxed">
                Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their services. Your personal collection data is NOT shared with third parties.
              </p>
              <p className="leading-relaxed mt-4">
                The Service Provider may disclose User Provided and Automatically Collected Information:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>As required by law, such as to comply with a subpoena or legal process</li>
                <li>When disclosure is necessary to protect our rights and your safety</li>
                <li>To investigate fraud or respond to government requests</li>
                <li>With trusted service providers who work on our behalf</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 05. Opt-Out Rights
              </h2>
              <p className="leading-relaxed">
                You can stop all collection of information by the Application by uninstalling it. Use standard uninstall processes available on your mobile device or through the app marketplace.
              </p>
              <p className="leading-relaxed mt-4">
                You can also disable data syncing and cloud backup features within the Application settings to keep all data local to your device.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 06. Data Retention Policy
              </h2>
              <p className="leading-relaxed">
                The Service Provider will retain User Provided data for as long as you use the Application. Your collection data is stored on your device and can be deleted at any time through the Application settings.
              </p>
              <p className="leading-relaxed mt-4">
                If you'd like the Service Provider to delete your cloud backup data, please contact us at rizwanrasheed046@gmail.com and we will respond within 30 days.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 07. Children's Privacy
              </h2>
              <p className="leading-relaxed">
                The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13. We do not knowingly collect personally identifiable information from children.
              </p>
              <p className="leading-relaxed mt-4">
                If you have reason to believe that a child has provided information to the Service Provider through the Application, please contact us at rizwanrasheed046@gmail.com.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 08. Changes to This Privacy Policy
              </h2>
              <p className="leading-relaxed">
                This Privacy Policy may be updated from time to time. The Service Provider will notify you of changes by updating this page. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
              </p>
              <p className="text-white/40 text-sm mt-4">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 09. Your Consent
              </h2>
              <p className="leading-relaxed">
                By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 10. Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have any questions regarding privacy while using the Application, or have questions about our practices, please contact us:
              </p>
              <div className="rounded-xl bg-white/[0.02] p-4 mt-4 border border-white/10">
                <p className="text-sm"><strong>Email:</strong> rizwanrasheed046@gmail.com</p>
                <p className="text-sm mt-2"><strong>Support:</strong> rizwanrasheed046@gmail.com</p>
              </div>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
