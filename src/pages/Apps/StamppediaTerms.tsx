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

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.12] blur-[120px]" style={{ background: GRADIENT }} />
      </div>

      <Nav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-20">
        <Link to="/apps/stamppedia" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-primary transition-colors mb-8">
          Stamppedia <span className="text-white/30">/</span> Terms of service
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
              Terms of <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>Service.</span>
            </h1>
            <p className="text-white/55 text-lg max-w-2xl leading-relaxed">
              By using Stamppedia, you enter a mutual agreement to use our service responsibly and respect the rights of others.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/[0.06]">
            {[
              { icon: Scale, label: "Fair use", desc: "Respect intellectual property" },
              { icon: AlertCircle, label: "Responsibility", desc: "Use service appropriately" },
              { icon: ShieldAlert, label: "Liability", desc: "Provided \"as is\"" }
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
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 01. Agreement to Terms
              </h2>
              <p className="leading-relaxed">
                By downloading, installing, and using Stamppedia (the "Application"), you agree to be bound by these Terms of Service. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 02. License to Use
              </h2>
              <p className="leading-relaxed">
                ShaadDev Studio grants you a limited, non-exclusive, non-transferable license to use the Application for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or lease any part of the Application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 03. Restrictions
              </h2>
              <p className="leading-relaxed">
                You agree not to:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Reverse engineer or decompile the Application</li>
                <li>Attempt to gain unauthorized access to any portion of the Application</li>
                <li>Use the Application for any illegal purpose or in violation of any laws</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload or transmit malicious code or viruses</li>
                <li>Remove or alter any proprietary notices or labels</li>
                <li>Commercially exploit the Application without permission</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 04. User Content
              </h2>
              <p className="leading-relaxed">
                You retain all rights to your stamp collection data and photos. By using the Application, you grant ShaadDev Studio a non-exclusive, worldwide, royalty-free license to use, process, and analyze your collection data to:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>Provide and improve the Application service</li>
                <li>Train AI models (using anonymized data only)</li>
                <li>Provide analytics and insights</li>
              </ul>
              <p className="leading-relaxed mt-4">
                You can request deletion of any or all your data at any time by contacting rizwanrasheed046@gmail.com.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 05. Disclaimer of Warranties
              </h2>
              <p className="leading-relaxed">
                THE APPLICATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. SHAADDEV STUDIO DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="leading-relaxed mt-4">
                We do not warrant that:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li>The Application will be uninterrupted or error-free</li>
                <li>Any defects in the Application will be corrected</li>
                <li>The Application will be compatible with all devices</li>
                <li>Stamp identification will be 100% accurate</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 06. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                IN NO EVENT SHALL SHAADDEV STUDIO BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE APPLICATION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="leading-relaxed mt-4">
                Our total liability for any claim arising from this agreement shall not exceed the amount you paid for the Application (if any).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 07. Third-Party Services
              </h2>
              <p className="leading-relaxed">
                The Application may include links to third-party services and content. ShaadDev Studio is not responsible for the accuracy, legality, or content of third-party services. Your use of third-party services is governed by their terms and privacy policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 08. Termination
              </h2>
              <p className="leading-relaxed">
                ShaadDev Studio may terminate your license to use the Application at any time if you violate these Terms of Service. Upon termination, you must cease all use of the Application and delete all copies from your devices.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 09. Modifications to Terms
              </h2>
              <p className="leading-relaxed">
                ShaadDev Studio may modify these Terms of Service at any time. Modifications will be effective immediately upon posting. Your continued use of the Application after modifications constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 10. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms of Service are governed by and construed in accordance with applicable laws. Any legal action or proceeding related to these terms shall be conducted personally by the parties and shall not be brought as a class action.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 11. Entire Agreement
              </h2>
              <p className="leading-relaxed">
                These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and ShaadDev Studio regarding the Application and supersede all prior and contemporaneous agreements and understandings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> 12. Contact Information
              </h2>
              <p className="leading-relaxed">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="rounded-xl bg-white/[0.02] p-4 mt-4 border border-white/10">
                <p className="text-sm"><strong>Email:</strong> rizwanrasheed046@gmail.com</p>
                <p className="text-sm mt-2"><strong>Support:</strong> rizwanrasheed046@gmail.com</p>
              </div>
              <p className="text-white/40 text-sm mt-4">
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
