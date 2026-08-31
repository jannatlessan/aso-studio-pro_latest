import React from 'react';
import { ShieldCheck, Target, Heart, Code } from 'lucide-react';
import SEO from '../components/SEO';
import Nav, { GRADIENT } from '../components/Nav';
import Footer from '../components/Footer';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#08080A] text-white selection:bg-primary/20">
      <SEO
        title="About Us | ShaadDev Studio"
        description="Learn more about ShaadDev Studio, our mission, and our dedication to providing high-quality developer tools for creators worldwide."
        url="https://shaaddev.studio/about"
      />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.14] blur-[120px]" style={{ background: GRADIENT }} />
      </div>

      <Nav />

      {/* Header */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white/65">
            About us
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            About <span className="bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }}>ShaadDev Studio</span>
          </h1>
          <p className="text-xl text-white/55 leading-relaxed max-w-2xl mx-auto">
            Empowering developers, designers, and digital creators with modern, fast, and secure tools.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-24">

        {/* The Mission */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-wide uppercase">
            <Target className="w-3.5 h-3.5" />
            Our mission
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Building a better web, together.</h2>
          <div className="prose prose-invert prose-lg text-white/60">
            <p>
              At <strong>ShaadDev Studio</strong>, our mission is simple: to provide digital creators, developers, designers, and marketers with an exceptional suite of online tools that simplify their daily workflows. We believe that top-tier utility software should be accessible, lightning-fast, and entirely secure, effectively removing the friction from modern digital asset management.
            </p>
            <p>
              The internet is filled with cluttered, ad-heavy, or overly complex utility sites. We set out to change that narrative by building a streamlined, performance-driven developer tools platform. Whether you are resizing multiple images for a client presentation, generating highly secure passwords to protect sensitive databases, or formatting complex JSON objects, ShaadDev Studio is built to handle it effortlessly. We process data efficiently locally in your browser wherever possible to guarantee maximum privacy and unparalleled speed.
            </p>
            <p>
              We firmly believe that software development and design is a community-driven effort. By offering high-quality utilities at no cost, we aim to give back to the community that has helped us grow. ShaadDev Studio is continuously evolving, and we are committed to adding new features, responding to user feedback, and refining the tools you rely on every single day.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our core values</h2>
            <p className="text-white/55 max-w-2xl mx-auto">
              Every tool we build is governed by these foundational principles.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 border border-white/10 bg-white/[0.02] rounded-2xl space-y-4 hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Privacy first</h3>
              <p className="text-white/55 leading-relaxed">
                We prioritize your data security. Whenever possible, our tools process files directly in your browser, ensuring that sensitive information never leaves your device.
              </p>
            </div>
            <div className="p-8 border border-white/10 bg-white/[0.02] rounded-2xl space-y-4 hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Performance</h3>
              <p className="text-white/55 leading-relaxed">
                Time is invaluable. We obsess over performance optimization, leveraging modern web technologies like React and WebAssembly to deliver instant results.
              </p>
            </div>
            <div className="p-8 border border-white/10 bg-white/[0.02] rounded-2xl space-y-4 hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">User-centric design</h3>
              <p className="text-white/55 leading-relaxed">
                Powerful tools should not be hard to use. We strip away the unnecessary, focusing on clean, intuitive interfaces that let you execute tasks with minimal clicks.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="relative rounded-[2rem] p-[1px] overflow-hidden" style={{ background: GRADIENT }}>
          <div className="relative rounded-[2rem] bg-[#0B0B0E] p-12 text-center space-y-6 overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[240px] rounded-full opacity-20 blur-[100px]" style={{ background: GRADIENT }} />
            <h2 className="relative text-2xl md:text-3xl font-bold tracking-tight">Join us on our journey</h2>
            <p className="relative text-white/55 max-w-2xl mx-auto leading-relaxed">
              ShaadDev Studio is more than just a collection of tools; it is a continuously growing platform shaped by the needs of its users. We invite you to explore our suite of utilities, share your feedback, and become a part of our builder community.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}