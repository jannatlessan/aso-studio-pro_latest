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

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Privacy", path: "/privacy" },
    { name: "Terms", path: "/terms" }
  ];

  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-black/20 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <span className="font-bold text-primary text-sm leading-none">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-none">ShaadDev Studio</span>
              <span className="text-[11px] text-white/40 mt-1">Mobile and web solutions</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-white/50">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="hover:text-white transition-colors">
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-white/10 bg-white/[0.02] hover:border-primary/40 transition-all"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 text-white/45 hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.06] gap-4">
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
