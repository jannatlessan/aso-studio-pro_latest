import { motion } from 'motion/react';
import { Lock, Eye, FileText, Scale, AlertCircle, ShieldAlert, ChevronLeft } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import Nav from '../../components/Nav';
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
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title={`${title} | ${app.name} - ShaadDev Studio`}
        description={`${title} and legal terms for the ${app.name} mobile application by ShaadDev Studio.`}
        url={`https://shaaddev.studio/apps/${app.slug}/${type}`}
      />

      <Nav />

      <main className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 pt-32 pb-20">
        <Link 
          to={`/apps/${app.slug}`} 
          className="inline-flex items-center gap-2 text-xs font-medium text-white/50 hover:text-primary transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to {app.name}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-primary">
              Legal Documentation · {app.name}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              {isPrivacy ? (
                <>Privacy <span className="text-primary">Policy.</span></>
              ) : (
                <>Terms of <span className="text-primary">Service.</span></>
              )}
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl leading-relaxed">
              {isPrivacy
                ? `Your privacy is respected. ${app.name} is built to protect and secure your data.`
                : `By using ${app.name}, you agree to the terms below. Written simply and clearly.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {isPrivacy ? (
              <>
                <InfoCard icon={Lock} label="Encryption" desc="Data transmitted over encrypted connections" />
                <InfoCard icon={Eye} label="Transparency" desc="No hidden data collection or tracking" />
                <InfoCard icon={FileText} label="Control" desc="You retain full control of your data" />
              </>
            ) : (
              <>
                <InfoCard icon={Scale} label="Fair Use" desc="Licensed for personal and commercial usage" />
                <InfoCard icon={ShieldAlert} label="Safety" desc="No malicious code or hidden telemetry" />
                <InfoCard icon={AlertCircle} label="Reliability" desc="Engineered for performance and uptime" />
              </>
            )}
          </div>

          <div className="prose prose-invert max-w-none space-y-10 text-white/70">
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4 hover:border-primary/30 transition-all">
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white mb-1">{label}</div>
        <div className="text-xs text-white/50">{desc}</div>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-white flex items-center gap-3">
      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {children}
    </h2>
  );
}

function PrivacyContent({ appName }: { appName: string }) {
  return (
    <>
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>1. Introduction</SectionHeading>
        <p className="leading-relaxed text-sm">
          This privacy policy applies to the {appName} mobile application ("Application"), created by ShaadDev Studio ("Service Provider"). This service is provided for use "as is".
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>2. Information Collection & Use</SectionHeading>
        <p className="leading-relaxed text-sm">
          The Application collects information required to perform its core functionality. This may include operating system version, device type, and content you process within the app (such as photos, text, or audio).
        </p>
        <p className="leading-relaxed text-sm mt-3">
          The Service Provider does not collect precise background location data unless explicitly required by a feature and granted by you.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>3. Data Storage & Security</SectionHeading>
        <p className="leading-relaxed text-sm">
          Your data is processed locally on your device where possible, and synced over HTTPS encrypted connections when cloud services are utilized. Industry standard encryption measures are enforced.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>4. Third-Party Access</SectionHeading>
        <p className="leading-relaxed text-sm">
          Aggregated, anonymized analytics are periodically evaluated to improve application stability. Personal data is never sold to third-party advertisers.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>5. Contact Information</SectionHeading>
        <p className="leading-relaxed text-sm">
          For questions regarding privacy practices, contact us directly:
        </p>
        <div className="rounded-xl bg-white/5 p-4 mt-3 border border-white/10 text-xs text-white">
          <strong>Email:</strong> rizwanrasheed046@gmail.com
        </div>
      </section>
    </>
  );
}

function TermsContent({ appName }: { appName: string }) {
  return (
    <>
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>1. Agreement to Terms</SectionHeading>
        <p className="leading-relaxed text-sm">
          By installing and using {appName} ("the Application"), you agree to these Terms of Service.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>2. License to Use</SectionHeading>
        <p className="leading-relaxed text-sm">
          ShaadDev Studio grants you a limited, non-exclusive license to use the Application on authorized devices for personal or commercial purposes.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>3. Restrictions</SectionHeading>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Do not reverse engineer or decompile the Application code</li>
          <li>Do not use the Application for unlawful activities</li>
          <li>Do not distribute modified binaries of the Application</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-6">
        <SectionHeading>4. Support & Inquiries</SectionHeading>
        <p className="leading-relaxed text-sm">
          For support or inquiries regarding these terms:
        </p>
        <div className="rounded-xl bg-white/5 p-4 mt-3 border border-white/10 text-xs text-white">
          <strong>Email:</strong> rizwanrasheed046@gmail.com
        </div>
      </section>
    </>
  );
}
