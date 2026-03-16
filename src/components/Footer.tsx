import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  MessageCircle, 
  Mail, 
  ShieldCheck, 
  FileText, 
  Globe, 
  ChevronRight 
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
    { name: "Privacy", path: "/privacy" },
    { name: "Terms", path: "/terms" }
  ];

  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-md py-12 px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-12">
        {/* Top Section: Navigation & Social */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 w-full">
          {/* Brand Signature */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-primary rotate-45 flex items-center justify-center bg-black">
              <span className="font-black text-primary text-sm -rotate-45 leading-none">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-[0.2em] text-xs uppercase leading-none">Shaad Dev</span>
              <span className="text-[8px] text-primary tracking-[0.3em] uppercase font-bold">Mobile and Web Solutions</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="hover:text-primary transition-all flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-primary/40" />
                {link.name}
              </Link>
            ))}
          </div>

          {/* Social Uplinks */}
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <a 
                key={social.label} 
                href={social.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-2 border border-white/5 hover:border-primary/50 transition-all bg-white/[0.02]"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 text-white/30 group-hover:text-primary transition-all" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-black text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                  {social.label}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Section: Copyright & Legal Meta */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-6">
          <div className="text-[10px] font-bold text-white/55 text-center md:text-left">
            © 2026 Shaad Dev Studio. Built with care.
          </div>
          
          <div className="flex items-center gap-8 text-[9px] font-semibold text-white/45 uppercase tracking-wide">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <span>Secure Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-primary" />
              <span>Available Worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
