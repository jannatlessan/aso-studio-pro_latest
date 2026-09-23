import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, Send, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import Nav, { GRADIENT } from '../components/Nav';
import Footer from '../components/Footer';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    alert("Thank you for reaching out! We will get back to you shortly.");
  };

  return (
    <div className="min-h-screen bg-[#08080A] text-[#EDEDEF] selection:bg-primary/20">
      <SEO
        title="Contact Us | ShaadDev Studio"
        description="Get in touch with the ShaadDev Studio team. Whether you have a question, a feature request, or just want to say hello, we are here to help."
        url="https://shaaddev.studio/contact"
      />

      <Nav />

      {/* Header */}
      <header className="relative pt-40 pb-16 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Get In Touch
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
            Contact <span className="text-primary">ShaadDev Studio.</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            Have a project, custom feature request, or partnership inquiry? We would love to hear from you. Drop us a message below.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">

          {/* Contact Information */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-white">Contact Information</h2>
              <div className="space-y-4 text-white/65 text-sm leading-relaxed">
                <p>
                  At <strong className="text-white">ShaadDev Studio</strong>, open communication is essential. Whether you need custom mobile development, a tailored microSaaS solution, or support for our browser tools, our inbox is open.
                </p>
                <p>
                  We strive to respond to all inquiries within 24–48 business hours. Please provide detail in your message so we can route it directly to the right engineer.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <a href="mailto:rizwanrasheed046@gmail.com" className="flex items-start gap-4 p-5 border border-white/10 bg-white/[0.02] shadow-xl shadow-black/30 rounded-2xl hover:border-primary/40 hover:bg-white/[0.04] transition-all group">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Email Us</h3>
                  <p className="text-sm text-primary font-medium mt-0.5">rizwanrasheed046@gmail.com</p>
                </div>
              </a>

              <a href="https://wa.me/923126733459" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-5 border border-white/10 bg-white/[0.02] shadow-xl shadow-black/30 rounded-2xl hover:border-primary/40 hover:bg-white/[0.04] transition-all group">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">WhatsApp Support</h3>
                  <p className="text-sm text-primary font-medium mt-0.5">+92 (312) 673-3459</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-5 border border-white/10 bg-white/[0.02] shadow-xl shadow-black/30 rounded-2xl">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-white">Location</h3>
                  <p className="text-sm text-white/60 mt-0.5">Global / Remote First</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/[0.02] border border-white/10 shadow-2xl shadow-black/40 rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label htmlFor="name" className="text-xs font-semibold text-white/60 uppercase tracking-wide">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    required
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label htmlFor="email" className="text-xs font-semibold text-white/60 uppercase tracking-wide">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    required
                    className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-semibold text-white/60 uppercase tracking-wide">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="How can we help?"
                  required
                  className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold text-white/60 uppercase tracking-wide">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us about your project, feedback, or inquiry..."
                  required
                  className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all group"
                style={{ background: GRADIENT }}
              >
                Send Message
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}