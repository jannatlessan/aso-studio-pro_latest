import React from 'react';
import { ShieldCheck, Target, Heart, Code } from 'lucide-react';
import SEO from '../components/SEO';
import Footer from '../components/Footer';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <SEO 
        title="About Us | ShaadDev Studio"
        description="Learn more about ShaadDev Studio, our mission, and our dedication to providing high-quality developer tools for creators worldwide."
      />

      {/* Header */}
      <header className="relative pt-32 pb-20 px-6 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,240,255,0.1)_0%,_transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            About <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">ShaadDev Studio</span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed font-light">
            Empowering developers, designers, and digital creators with modern, fast, and secure tools.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-20 md:py-32 space-y-24">
        
        {/* The Mission */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-bold uppercase tracking-widest">
            <Target className="w-4 h-4" />
            Our Mission
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Building a Better Web, Together.</h2>
          <div className="prose prose-invert prose-lg text-white/70">
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
            <h2 className="text-3xl md:text-4xl font-bold">Our Core Values</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Every tool we build is governed by these foundational principles.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl space-y-4 hover:border-primary/30 transition-colors">
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Privacy First</h3>
              <p className="text-white/60 leading-relaxed font-light">
                We prioritize your data security. Whenever possible, our tools process files directly in your browser, ensuring that sensitive information never leaves your device.
              </p>
            </div>
            <div className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl space-y-4 hover:border-primary/30 transition-colors">
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Performance</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Time is invaluable. We obsess over performance optimization, leveraging modern web technologies like React and WebAssembly to deliver instant results.
              </p>
            </div>
            <div className="p-8 border border-white/5 bg-white/[0.02] rounded-2xl space-y-4 hover:border-primary/30 transition-colors">
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">User-Centric Design</h3>
              <p className="text-white/60 leading-relaxed font-light">
                Powerful tools should not be hard to use. We strip away the unnecessary, focusing on clean, intuitive interfaces that let you execute tasks with minimal clicks.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="p-12 border border-white/5 bg-gradient-to-br from-white/[0.02] to-primary/[0.02] rounded-3xl text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Join Us on Our Journey</h2>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            ShaadDev Studio is more than just a collection of tools; it is a continuously growing platform shaped by the needs of its users. We invite you to explore our suite of utilities, share your feedback, and become a part of our builder community. Whether you are debugging code late at night or putting the finishing touches on a marketing campaign, we are here to ensure your workflow runs seamlessly.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}