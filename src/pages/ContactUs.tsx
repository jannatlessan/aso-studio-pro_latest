import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, Send } from 'lucide-react';
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
    // In a real application, submit the form data to the server
    console.log(formData);
    alert("Thank you for reaching out! We will get back to you shortly.");
  };

  return (
    <div className="min-h-screen bg-white text-ink selection:bg-primary/20">
      <SEO
        title="Contact Us | ShaadDev Studio"
        description="Get in touch with the ShaadDev Studio team. Whether you have a question, a feature request, or just want to say hello, we are here to help."
        url="https://shaaddev.studio/contact"
      />


      <Nav />

      {/* Header */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint border border-primary/15 text-xs font-medium text-primary">
            Contact
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Get in <span className="text-primary">touch</span>
          </h1>
          <p className="text-xl text-[#55605B] leading-relaxed max-w-2xl mx-auto">
            Have a question, feedback, or a partnership inquiry? We would love to hear from you. Drop us a message below and our team will get back to you promptly.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">

          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Contact information</h2>
              <div className="prose text-[#55605B]">
                <p>
                  At <strong>ShaadDev Studio</strong>, community feedback is the lifeblood of our platform. As a developer tools platform dedicated to streamlining workflows for creators, engineers, and designers globally, we understand that robust support and open communication are absolutely essential.
                </p>
                <p>
                  Whether you have found a bug in one of our utilities, want to suggest an enhancement for the JSON formatter, need a custom integration, or simply want to chat about web development, our inbox is always open. We strive to respond to all inquiries within 24-48 business hours. Please provide as much detail as possible in your correspondence so we can direct your message to the right technical or support team member immediately.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <a href="mailto:rizwanrasheed046@gmail.com" className="flex items-start gap-4 p-4 border border-black/10 bg-white shadow-sm shadow-black/[0.02] rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all group">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-mint border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email us</h3>
                  <p className="text-[#55605B]">rizwanrasheed046@gmail.com</p>
                </div>
              </a>

              <a href="https://wa.me/923126733459" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 border border-black/10 bg-white shadow-sm shadow-black/[0.02] rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all group">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-mint border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">WhatsApp support</h3>
                  <p className="text-[#55605B]">+92 (312) 673-3459</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 border border-black/10 bg-white shadow-sm shadow-black/[0.02] rounded-2xl">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-mint border border-primary/20 text-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Location</h3>
                  <p className="text-[#55605B]">Global / remote first</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label htmlFor="name" className="text-xs font-semibold text-[#55605B] uppercase tracking-wide">Your name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    required
                    className="w-full bg-[#F6F8F7] border border-black/10 rounded-xl px-4 py-3 text-ink placeholder:text-[#8B958F] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label htmlFor="email" className="text-xs font-semibold text-[#55605B] uppercase tracking-wide">Email address</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    required
                    className="w-full bg-[#F6F8F7] border border-black/10 rounded-xl px-4 py-3 text-ink placeholder:text-[#8B958F] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-semibold text-[#55605B] uppercase tracking-wide">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="How can we help?"
                  required
                  className="w-full bg-[#F6F8F7] border border-black/10 rounded-xl px-4 py-3 text-ink placeholder:text-[#8B958F] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold text-[#55605B] uppercase tracking-wide">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us about your project, feedback, or inquiry..."
                  required
                  className="w-full bg-[#F6F8F7] border border-black/10 rounded-xl px-4 py-3 text-ink placeholder:text-[#8B958F] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all group"
                style={{ background: GRADIENT }}
              >
                Send message
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