import React from 'react';
import { ShieldCheck, Target, Heart, Code, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="About Us | ShaadDev Studio"
        description="Learn more about ShaadDev Studio, our mission, and our dedication to providing high-quality developer tools for creators worldwide."
        url="https://shaaddev.studio/about"
      />

      <Nav />

      {/* Header */}
      <header className="relative pt-40 pb-16 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            About ShaadDev Studio
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
            Software, Built to <span className="text-primary">Last.</span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed max-w-2xl mx-auto">
            Empowering developers, founders, and digital creators with modern, high-performance mobile and web software.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pb-24 space-y-24">

        {/* The Mission */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/25 text-xs font-semibold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            Our Mission
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Building scalable products, together.</h2>
          <div className="space-y-4 text-white/65 text-base leading-relaxed">
            <p className="rounded-xl border border-white/5 bg-white/[0.015] p-5">
              At <strong className="text-white">ShaadDev Studio</strong>, our mission is simple: build mobile apps and web platforms that deliver clear business outcomes with maintainable code and performance.
            </p>
            <p className="rounded-xl border border-white/5 bg-white/[0.015] p-5">
              We process data securely and locally wherever possible. We set out to change the status quo by building streamlined, performance-driven software across iOS, Android, and Web platforms.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Our Core Values</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Every system and app we ship is governed by these foundational principles.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-8 border border-white/10 bg-white/[0.02] shadow-xl shadow-black/30 rounded-2xl space-y-4 hover:border-primary/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Privacy First</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                We prioritize user data security. Our tools and apps handle data with strict encryption and zero telemetry selling.
              </p>
            </div>
            <div className="p-8 border border-white/10 bg-white/[0.02] shadow-xl shadow-black/30 rounded-2xl space-y-4 hover:border-primary/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Performance</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                Time is invaluable. We build with modern tools like Flutter, React, and WebAssembly to deliver instant results.
              </p>
            </div>
            <div className="p-8 border border-white/10 bg-white/[0.02] shadow-xl shadow-black/30 rounded-2xl space-y-4 hover:border-primary/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">Clean Engineering</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                Powerful tools should feel natural. We focus on clear, maintainable architecture and intuitive UX.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="relative rounded-[2rem] border border-white/10 bg-white/[0.02] p-10 text-center space-y-6 overflow-hidden shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Work Built Around Your Product</h2>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed text-sm">
            ShaadDev Studio is built to take ideas from concept to live production. Explore our products, try our tools, or get in touch for custom engineering.
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}