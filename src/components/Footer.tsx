import React from 'react';
import { Link } from 'react-router-dom';
import {
  Github,
  Linkedin,
  MessageCircle,
  Mail,
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { icon: Github, href: "https://github.com/Rizwan884", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/rashidrizwan-connect/", label: "LinkedIn" },
    { icon: MessageCircle, href: "https://wa.me/923126733459", label: "WhatsApp" },
    { icon: Mail, href: "mailto:rizwanrasheed046@gmail.com", label: "Email" }
  ];

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "MicroSaaS", path: "/microsaas" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" }
  ];

  const popularTools = [
    { name: "Background Remover", path: "/tools/background-remover" },
    { name: "Video to GIF Maker", path: "/tools/video-to-gif" },
    { name: "ASO Screenshot Pro", path: "/tools/aso-screenshot" },
    { name: "Image Compressor", path: "/tools/image-compressor" },
    { name: "JSON Formatter", path: "/tools/json-formatter" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" }
  ];

  return (
    <footer className="relative z-10 bg-dark-gradient text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <span className="font-bold text-primary text-sm leading-none">R</span>
              </div>
              <span className="font-semibold text-sm leading-none text-white">ShaadDev Studio</span>
            </div>
            <p className="text-sm text-primary font-bold uppercase tracking-wider">Software, built to last.</p>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Mobile and web engineering, plus a growing suite of free browser-based tools. Based in Pakistan, working with clients worldwide.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-white/10 bg-white/[0.03] hover:border-primary/50 hover:bg-primary/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 text-white/60 hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Quick Links</h3>
            <div className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link key={link.name} to={link.path} className="text-sm text-white/65 hover:text-primary transition-colors w-fit">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Popular Tools</h3>
            <div className="flex flex-col gap-3">
              {popularTools.map((link) => (
                <Link key={link.name} to={link.path} className="text-sm text-white/65 hover:text-primary transition-colors w-fit">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Talk to Us</h3>
            <div className="flex flex-col gap-3">
              <a href="mailto:rizwanrasheed046@gmail.com" className="flex items-center gap-2 text-sm text-white/65 hover:text-primary transition-colors w-fit">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" /> rizwanrasheed046@gmail.com
              </a>
              <a href="https://wa.me/923126733459" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/65 hover:text-primary transition-colors w-fit">
                <MessageCircle className="w-3.5 h-3.5 text-primary shrink-0" /> Chat on WhatsApp
              </a>
              {legalLinks.map((link) => (
                <Link key={link.name} to={link.path} className="text-sm text-white/65 hover:text-primary transition-colors w-fit">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 gap-4">
          <div className="text-xs text-white/40 text-center md:text-left">
            © 2026 ShaadDev Studio. Built with care.
          </div>

          <div className="flex items-center gap-6 text-xs text-white/40">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Secure by design</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>Available worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
