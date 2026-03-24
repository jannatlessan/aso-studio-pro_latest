import React from 'react';
import { motion } from 'motion/react';
import { FileText, ChevronLeft, Scale, AlertCircle, Zap, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

export default function StamppediaTerms() {
  return (
    <div className="min-h-screen bg-[#020002] text-[#E0E0E0] font-mono selection:bg-primary/30">
      <SEO 
        title="Terms of Service | Stamppedia" 
        description="Terms of service and user agreements for Stamppedia app." 
        url="https://shaaddev.studio/apps/stamppedia/terms" 
      />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-[#020202]/60 backdrop-blur-xl border-b border-white/5">
        <Link to="/apps/stamppedia" className="flex items-center gap-3 group">
          <div className="w-8 h-8 border border-primary rotate-45 flex items-center justify-center bg-black group-hover:bg-primary transition-all">
            <ChevronLeft className="w-5 h-5 text-primary group-hover:text-black -rotate-45" />
          </div>
          <span className="font-black tracking-[0.2em] text-sm uppercase">Back to App</span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
          <FileText className="w-4 h-4 text-primary" />
          <span>Terms of Service</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              STAMPPEDIA-02 // TERMS_OF_SERVICE
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-none">
              Terms of<br />
              <span className="text-primary italic">Service</span>
            </h1>
            <p className="text-white/40 text-lg italic max-w-2xl">
              "By using Stamppedia, you enter a mutual agreement to use our service responsibly and respect the rights of others."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
            {[
              { icon: Scale, label: "Fair Use", desc: "Respect intellectual property" },
              { icon: AlertCircle, label: "Responsibility", desc: "Use service appropriately" },
              { icon: ShieldAlert, label: "Liability", desc: "Service AS IS disclaimer" }
            ].map((item, idx) => (
              <div key={idx} className="glass-panel p-6 space-y-4">
                <item.icon className="w-6 h-6 text-primary" />
                <div>
                  <div className="text-[10px] font-black uppercase border-b border-primary/20 pb-2 mb-2 tracking-widest">
                    {item.label}
                  </div>
                  <div className="text-xs text-white/40">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Content */}
          <div className="prose prose-invert max-w-none space-y-12 text-white/60">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 01. Agreement to Terms
              </h2>
              <p className="leading-relaxed">
                By downloading, installing, and using Stamppedia (the "Application"), you agree to be bound by these Terms of Service. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 02. License to Use
              </h2>
              <p className="leading-relaxed">
                ShaadDev Studio grants you a limited, non-exclusive, non-transferable license to use the Application for personal, non-commercial purposes. You may not copy, modify, distribute, sell, or lease any part of the Application.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 03. Restrictions
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
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 04. User Content
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
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 05. Disclaimer of Warranties
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
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 06. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                IN NO EVENT SHALL SHAADDEV STUDIO BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE APPLICATION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p className="leading-relaxed mt-4">
                Our total liability for any claim arising from this agreement shall not exceed the amount you paid for the Application (if any).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 07. Third-Party Services
              </h2>
              <p className="leading-relaxed">
                The Application may include links to third-party services and content. ShaadDev Studio is not responsible for the accuracy, legality, or content of third-party services. Your use of third-party services is governed by their terms and privacy policies.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 08. Termination
              </h2>
              <p className="leading-relaxed">
                ShaadDev Studio may terminate your license to use the Application at any time if you violate these Terms of Service. Upon termination, you must cease all use of the Application and delete all copies from your devices.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 09. Modifications to Terms
              </h2>
              <p className="leading-relaxed">
                ShaadDev Studio may modify these Terms of Service at any time. Modifications will be effective immediately upon posting. Your continued use of the Application after modifications constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 10. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms of Service are governed by and construed in accordance with applicable laws. Any legal action or proceeding related to these terms shall be conducted personally by the parties and shall not be brought as a class action.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 11. Entire Agreement
              </h2>
              <p className="leading-relaxed">
                These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and ShaadDev Studio regarding the Application and supersede all prior and contemporaneous agreements and understandings.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-primary" /> 12. Contact Information
              </h2>
              <p className="leading-relaxed">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-white/5 p-4 mt-4 border border-white/10">
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
