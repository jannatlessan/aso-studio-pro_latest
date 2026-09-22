import { motion } from 'motion/react';
import { Lock, Eye, FileText, Scale, AlertCircle, ShieldAlert } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav, { GRADIENT } from '../../components/Nav';
import { getMicrosaasApp } from '../../data/microsaasApps';

export default function AppLegal({ type }: { type: 'privacy' | 'terms' }) {
  const { slug } = useParams<{ slug: string }>();
  const app = slug ? getMicrosaasApp(slug) : undefined;

  if (!app) {
    return <Navigate to="/microsaas" replace />;
  }

  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20">
      <SEO
        title={`${title} | ${app.name}`}
        description={`${title} for the ${app.name} app.`}
        url={`https://shaaddev.studio/apps/${app.slug}/${type}`}
      />


      <Nav />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-36 pb-20">
        <Link to={`/apps/${app.slug}`} className="inline-flex items-center gap-1.5 text-xs text-[#8B958F] hover:text-primary transition-colors mb-8">
          {app.name} <span className="text-black/20">/</span> {title}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint border border-primary/15 text-xs font-medium text-primary">
              Legal · {app.name}
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
              {isPrivacy ? (
                <>Privacy <span className="text-primary">Policy.</span></>
              ) : (
                <>Terms of <span className="text-primary">Service.</span></>
              )}
            </h1>
            <p className="text-[#55605B] text-lg max-w-2xl leading-relaxed">
              {isPrivacy
                ? `Your data is your property. ${app.name} is designed to protect and secure your information.`
                : `By using ${app.name}, you agree to the terms below. We've kept them short and in plain language.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-black/[0.06]">
            {isPrivacy ? (
              <>
                <InfoCard icon={Lock} label="Encryption" desc="Data transmitted over encrypted connections" />
                <InfoCard icon={Eye} label="Transparency" desc="No hidden data collection" />
                <InfoCard icon={FileText} label="Control" desc="You own your data" />
              </>
            ) : (
              <>
                <InfoCard icon={Scale} label="Fair use" desc="Free for personal and commercial work" />
                <InfoCard icon={ShieldAlert} label="Safety" desc="No malicious code or hidden behavior" />
                <InfoCard icon={AlertCircle} label="Reliability" desc="Built and maintained for consistent uptime" />
              </>
            )}
          </div>

          <div className="prose max-w-none space-y-10 text-[#55605B]">
            {isPrivacy ? <PrivacyContent appName={app.name} /> : <TermsContent appName={app.name} />}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function InfoCard({ icon: Icon, label, desc }: { icon: React.ComponentType<{ className?: string }>; label: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm shadow-black/[0.02] p-6 space-y-4 hover:border-primary/25 hover:shadow-lg hover:shadow-black/5 transition-all">
      <div className="w-10 h-10 rounded-lg bg-mint border border-primary/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-sm font-semibold text-ink mb-1">{label}</div>
        <div className="text-xs text-[#55605B]">{desc}</div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-ink flex items-center gap-3">
      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {children}
    </h2>
  );
}

function PrivacyContent({ appName }: { appName: string }) {
  return (
    <>
      <section className="space-y-3">
        <SectionHeading>1. Introduction</SectionHeading>
        <p className="leading-relaxed">
          This privacy policy applies to the {appName} app ("Application") for mobile devices, created by ShaadDev Studio ("Service Provider"). This service is intended for use "as is".
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>2. Information collection and use</SectionHeading>
        <p className="leading-relaxed">
          The Application collects information when you download and use it. This may include your device's IP address, pages visited within the Application, operating system and device type, and content you create within the app (such as photos, text, or audio you provide for processing).
        </p>
        <p className="leading-relaxed mt-4">
          The Service Provider does not collect precise location data unless a specific feature requires it and you grant permission.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>3. Data storage and security</SectionHeading>
        <p className="leading-relaxed">
          Your data may be stored locally on your device and, where a feature requires it, synced to secure servers using encrypted connections. We implement industry-standard security measures to protect your information, though no method of transmission over the internet is completely secure.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>4. Third-party access</SectionHeading>
        <p className="leading-relaxed">
          Only aggregated, anonymized data is periodically used to improve the Application. Your personal data is not sold to third parties. We may disclose information if required by law, to protect our rights, or with trusted service providers who work on our behalf.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>5. Opt-out rights</SectionHeading>
        <p className="leading-relaxed">
          You can stop all collection of information by the Application by uninstalling it, using the standard uninstall process available on your device or through the app marketplace.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>6. Children's privacy</SectionHeading>
        <p className="leading-relaxed">
          The Service Provider does not knowingly collect personally identifiable information from children under the age of 13.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>7. Changes to this policy</SectionHeading>
        <p className="leading-relaxed">
          This Privacy Policy may be updated from time to time. Continued use of the Application after changes are posted is deemed approval of those changes.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>8. Contact us</SectionHeading>
        <p className="leading-relaxed">
          If you have questions about this policy, please contact us:
        </p>
        <div className="rounded-xl bg-[#F6F8F7] p-4 mt-4 border border-black/10">
          <p className="text-sm text-ink"><strong>Email:</strong> rizwanrasheed046@gmail.com</p>
        </div>
      </section>
    </>
  );
}

function TermsContent({ appName }: { appName: string }) {
  return (
    <>
      <section className="space-y-3">
        <SectionHeading>1. Agreement to terms</SectionHeading>
        <p className="leading-relaxed">
          By downloading, installing, and using {appName} ("the Application"), you agree to be bound by these Terms of Service. If you do not agree, please do not use this service.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>2. License to use</SectionHeading>
        <p className="leading-relaxed">
          ShaadDev Studio grants you a limited, non-exclusive, non-transferable license to use the Application for personal or commercial purposes. You may not copy, modify, distribute, sell, or lease any part of the Application without permission.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>3. Restrictions</SectionHeading>
        <p className="leading-relaxed">You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Reverse engineer or decompile the Application</li>
          <li>Attempt to gain unauthorized access to any part of the Application</li>
          <li>Use the Application for any illegal purpose</li>
          <li>Upload or transmit malicious code</li>
          <li>Commercially exploit the Application without permission</li>
        </ul>
      </section>

      <section className="space-y-3">
        <SectionHeading>4. User content</SectionHeading>
        <p className="leading-relaxed">
          You retain all rights to content you create or provide within the Application. You can request deletion of your data at any time by contacting us.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>5. Disclaimer of warranties</SectionHeading>
        <p className="leading-relaxed">
          The Application is provided "as is" without warranty of any kind. We do not warrant that the Application will be uninterrupted, error-free, or compatible with all devices.
        </p>
      </section>

      <section className="space-y-3 flex items-start gap-4 p-6 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <h3 className="text-sm font-semibold text-red-600">Termination</h3>
          <p className="text-xs leading-relaxed text-[#55605B]">
            Violation of these terms may result in restricted access to the Application.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading>6. Changes to terms</SectionHeading>
        <p className="leading-relaxed">
          ShaadDev Studio may modify these terms at any time. Continued use of the Application after modifications constitutes acceptance of the modified terms.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHeading>7. Contact information</SectionHeading>
        <p className="leading-relaxed">
          If you have questions about these terms, please contact us:
        </p>
        <div className="rounded-xl bg-[#F6F8F7] p-4 mt-4 border border-black/10">
          <p className="text-sm text-ink"><strong>Email:</strong> rizwanrasheed046@gmail.com</p>
        </div>
      </section>
    </>
  );
}
