import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, Send, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
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
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      <SEO 
        title="Contact Us | ShaadDev Studio"
        description="Get in touch with the ShaadDev Studio team. Whether you have a question, a feature request, or just want to say hello, we are here to help."
      />

      {/* Header */}
      <header className="relative pt-32 pb-20 px-6 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(0,240,255,0.1)_0%,_transparent_50%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
            Get in <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">Touch</span>
          </h1>
          <p className="text-xl text-white/60 leading-relaxed font-light max-w-2xl mx-auto">
            Have a question, feedback, or a partnership inquiry? We would love to hear from you. Drop us a message below and our team will get back to you promptly.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Contact Information */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
              <div className="prose prose-invert text-white/60">
                <p>
                  At <strong>ShaadDev Studio</strong>, community feedback is the lifeblood of our platform. As a developer tools platform dedicated to streamlining workflows for creators, engineers, and designers globally, we understand that robust support and open communication are absolutely essential.
                </p>
                <p>
                  Whether you have found a bug in one of our utilities, want to suggest an enhancement for the JSON formatter, need a custom integration, or simply want to chat about web development, our inbox is always open. We strive to respond to all inquiries within 24-48 business hours. Please provide as much detail as possible in your correspondence so we can direct your message to the right technical or support team member immediately.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <a href="mailto:rizwanrasheed046@gmail.com" className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.02] rounded-2xl hover:border-primary/30 transition-colors group">
                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email Us</h3>
                  <p className="text-white/60 font-light">rizwanrasheed046@gmail.com</p>
                </div>
              </a>

              <a href="https://wa.me/923126733459" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.02] rounded-2xl hover:border-primary/30 transition-colors group">
                <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">WhatsApp Support</h3>
                  <p className="text-white/60 font-light">+92 (312) 673-3459</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 border border-white/5 bg-white/[0.02] rounded-2xl">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Location</h3>
                  <p className="text-white/60 font-light">Global / Remote First</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label htmlFor="name" className="text-sm font-semibold text-white/70 uppercase tracking-wider">Your Name</label>
                  <input 
                    type="text" 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label htmlFor="email" className="text-sm font-semibold text-white/70 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-semibold text-white/70 uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="How can we help?"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-white/70 uppercase tracking-wider">Message</label>
                <textarea 
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us about your project, feedback, or inquiry..."
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-sm resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-primary/90 transition-all group"
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