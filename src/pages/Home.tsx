/// <reference types="vite/client" />

import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Github,
  Mail,
  ArrowRight,
  ArrowUpRight,
  Smartphone,
  Star,
  Cpu,
  Globe,
  Activity as ActivityIcon,
  Linkedin,
  MessageCircle,
  GraduationCap,
  Briefcase,
  Layout,
  Terminal,
  Layers,
  Database,
  Settings2,
  Quote,
  ChevronDown,
  Zap,
  ShieldCheck,
  Clock3,
  CheckCircle2
} from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Nav, { GRADIENT } from '../components/Nav';

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const profileData = {
  name: "Rizwan Rasheed",
  role: "Software Engineer",
  summary: "I build clear, reliable mobile and web products with strong performance, maintainable code, and practical business outcomes.",
  status: "Available for new projects",
  telemetry: [
    { label: "Years experience", value: "5+", icon: ActivityIcon },
    { label: "Systems shipped", value: "120+", icon: Cpu },
    { label: "Clients served", value: "45+", icon: Globe }
  ],
  trustRow: [
    { label: "Fast, clean delivery", icon: Zap },
    { label: "Secure & maintainable", icon: ShieldCheck },
    { label: "Direct communication", icon: Clock3 }
  ],
  featuredServices: [
    {
      name: "Mobile App Development",
      icon: Smartphone,
      description: "Production-grade cross-platform apps engineered for performance, stability, and clean store submissions.",
      bullets: ["Flutter & React Native builds", "SwiftUI & Kotlin Multiplatform", "App Store / Play Store releases", "CI/CD release pipelines"]
    },
    {
      name: "Frontend Engineering",
      icon: Layout,
      description: "Fast, responsive interfaces that feel considered — built with modern React tooling and real attention to detail.",
      bullets: ["React & Next.js", "TypeScript throughout", "Tailwind CSS design systems", "Motion & micro-interactions"]
    },
    {
      name: "Backend & Architecture",
      icon: Terminal,
      description: "Scalable APIs and infrastructure that stay simple to reason about as the product grows.",
      bullets: ["Node.js, Go & Laravel", "REST API design", "Auth & payment integrations", "Cloud deployment & monitoring"]
    }
  ],
  alsoDo: ["AWS & Docker", "PostgreSQL & MongoDB", "Redis caching", "OpenAI / LLM integrations", "LangChain pipelines", "FFmpeg processing", "GitHub Actions CI/CD", "Figma to code", "Performance tuning", "Production debugging"],
  techCategories: [
    {
      name: "Mobile App Development",
      icon: Smartphone,
      stacks: ["Flutter", "React Native", "SwiftUI", "KMP (Kotlin)", "Dart", "App Store Connect", "Google Play Console"]
    },
    {
      name: "Frontend Engineering",
      icon: Layout,
      stacks: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Responsive UI", "Motion / Animation"]
    },
    {
      name: "Backend Engineering",
      icon: Terminal,
      stacks: ["Node.js", "Go", "Laravel", "REST APIs", "Authentication", "Payment Integrations"]
    },
    {
      name: "Full-Stack Architecture",
      icon: Layers,
      stacks: ["End-to-End Architecture", "CI/CD", "Performance Tuning", "Scalable Deployments", "Monitoring", "Production Debugging"]
    },
    {
      name: "Cloud & Databases",
      icon: Database,
      stacks: ["AWS", "Docker", "PostgreSQL", "MongoDB", "Redis", "Storage & Caching"]
    },
    {
      name: "AI & Tooling",
      icon: Settings2,
      stacks: ["OpenAI / LLMs", "LangChain", "FFmpeg", "GitHub Actions", "Postman", "Figma"]
    }
  ],
  employment: [
    {
      company: "Kairos Business Solutions Singapore",
      role: "Mobile Application Developer",
      period: "Jul 2023 – Present",
      desc: "Building production mobile apps using Flutter and React Native, including payment integrations and CI/CD pipelines for stable releases.",
      stack: ["Flutter", "React Native", "Laravel", "CI/CD", "AWS"]
    },
    {
      company: "Mercury Sols",
      role: "Mobile App Developer",
      period: "Apr 2020 – Aug 2023",
      desc: "Developed cross-platform applications focused on clear UX, reliable architecture, and shipping features aligned with client goals.",
      stack: ["Flutter", "Dart", "UI/UX"]
    }
  ],
  education: [
    {
      school: "Khawaja Fareed University of Engineering & Technology (KFUEIT)",
      degree: "BS Computer Science",
      period: "2017 – 2021",
      city: "Rahim Yar Khan, Pakistan"
    }
  ],
  testimonials: [
    {
      client: "Lukas Vanecek",
      service: "App Store Optimization",
      text: "Rizwan improved our app listing assets and copy. Our store visibility and conversion rate both improved within the first release cycle.",
      location: "Prague, Czech Republic"
    },
    {
      client: "Soraya Al-Mansoor",
      service: "Scalable Architecture",
      text: "The architecture is stable and easier for our team to maintain. We saw fewer production issues and faster delivery.",
      location: "Dubai, UAE"
    },
    {
      client: "Henrik Lindqvist",
      service: "Mobile Infrastructure",
      text: "Great communication and clean implementation. He helped us improve app performance and delivery quality significantly.",
      location: "Gothenburg, Sweden"
    }
  ]
};

const RIZWAN_ULTRA_IMAGE_URL = '/assets/profile/rizwan-portrait.jpg';
const PLAY_STORE_ICON_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg';
const APP_STORE_ICON_URL = 'https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg';

const TECH_ICON_MAP: Record<string, string> = {
  "Flutter": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
  "React Native": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "SwiftUI": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  "KMP (Kotlin)": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  "Dart": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg",
  "App Store Connect": APP_STORE_ICON_URL,
  "Google Play Console": PLAY_STORE_ICON_URL,
  "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "Next.js": "https://cdn.simpleicons.org/nextdotjs",
  "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
  "Responsive UI": "https://cdn.jsdelivr.net/npm/simple-icons/icons/css3.svg",
  "Motion / Animation": "https://cdn.simpleicons.org/framer",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "Go": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  "Laravel": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
  "REST APIs": "https://cdn.simpleicons.org/openapiinitiative",
  "Authentication": "https://cdn.simpleicons.org/auth0",
  "Payment Integrations": "https://cdn.simpleicons.org/stripe",
  "End-to-End Architecture": "https://cdn.simpleicons.org/miro",
  "CI/CD": "https://cdn.simpleicons.org/githubactions",
  "Performance Tuning": "https://cdn.simpleicons.org/speedtest",
  "Scalable Deployments": "https://cdn.simpleicons.org/kubernetes",
  "Monitoring": "https://cdn.simpleicons.org/grafana",
  "Production Debugging": "https://cdn.simpleicons.org/sentry",
  "AWS": "https://cdn.jsdelivr.net/npm/simple-icons/icons/amazonwebservices.svg",
  "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
  "Storage & Caching": "https://cdn.simpleicons.org/cloudflare",
  "OpenAI / LLMs": "https://cdn.jsdelivr.net/npm/simple-icons/icons/openai.svg",
  "LangChain": "https://cdn.simpleicons.org/langchain",
  "FFmpeg": "https://cdn.simpleicons.org/ffmpeg",
  "GitHub Actions": "https://cdn.simpleicons.org/githubactions",
  "Postman": "https://cdn.simpleicons.org/postman",
  "Figma": "https://cdn.simpleicons.org/figma"
};

const MARQUEE_TECH = [
  "Flutter", "React", "TypeScript", "Next.js", "Node.js", "AWS", "Docker",
  "PostgreSQL", "Tailwind CSS", "Go", "MongoDB", "Redis", "GitHub Actions", "Figma"
];

const getProjectInitials = (name?: string) => {
  if (!name) return 'NA';
  const words = name
    .split(/[^A-Za-z0-9]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 3);

  return words.map((word) => word[0]?.toUpperCase() ?? '').join('') || 'NA';
};

const resolveMediaUrl = (value?: string) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${import.meta.env.BASE_URL}${value.replace(/^\/+/, '')}`;
};

export default function Home() {
  const [apps, setApps] = useState<any[]>([]);
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});
  const [failedScreenshots, setFailedScreenshots] = useState<Record<string, boolean>>({});
  const [failedTechIcons, setFailedTechIcons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}projects.json`)
      .then(res => res.json())
      .then(data => {
        const normalized = Array.isArray(data)
          ? data.map((app) => ({
              ...app,
              icon: resolveMediaUrl(app.icon),
              screenshot: resolveMediaUrl(app.screenshot)
            }))
          : [];
        setApps(normalized);
      })
      .catch(err => console.error("Error loading projects:", err));
  }, []);

  const markIconFailed = (id: string) => {
    setFailedIcons((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const markScreenshotFailed = (id: string) => {
    setFailedScreenshots((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const markTechIconFailed = (name: string) => {
    setFailedTechIcons((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
  };

  const renderProjectIcon = (app: any, sizeClass = 'w-12 h-12') => {
    if (app.icon && !failedIcons[app.id]) {
      return (
        <img
          src={app.icon}
          alt={`${app.name} icon`}
          className={`${sizeClass} rounded-xl border border-black/10 object-cover`}
          onError={() => markIconFailed(app.id)}
        />
      );
    }

    return (
      <div className={`${sizeClass} rounded-xl border border-primary/20 bg-primary/10 flex items-center justify-center font-semibold text-sm tracking-wide text-primary`}>
        {getProjectInitials(app.name)}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-white text-ink selection:bg-primary/20 antialiased overflow-x-clip">
      <SEO
        title={`${profileData.name} — ${profileData.role}`}
        description={profileData.summary}
        url="https://shaaddev.studio"
      />

      <Nav />

      <main className="relative z-10">
        {/* Hero — dark, textured, TechzQuad-style */}
        <section className="relative pt-32 pb-20 sm:pt-44 sm:pb-28 bg-dark-gradient overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-16 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold uppercase tracking-widest text-primary-light"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-light" />
                </span>
                {profileData.status}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-[2.75rem] sm:text-7xl lg:text-[5rem] font-bold tracking-tight leading-[1.02] text-white"
              >
                Software
                engineering,{' '}
                <br className="hidden sm:block" />
                built to{' '}
                <span className="text-primary-light">
                  last.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-xl text-lg text-white/55 leading-relaxed"
              >
                {profileData.summary}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap items-center gap-4"
              >
                <a
                  href="#work"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                  style={{ background: GRADIENT }}
                >
                  See my work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <a
                  href="mailto:rizwanrasheed046@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-sm font-semibold text-white/80 hover:border-white/30 hover:text-white transition-all"
                >
                  Send inquiry
                </a>
                <div className="flex items-center gap-5 pl-2">
                  <a href="https://github.com/Rizwan884" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="GitHub">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/rashidrizwan-connect/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="https://wa.me/923126733459" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" aria-label="WhatsApp">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>

              <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                {profileData.trustRow.map((t) => (
                  <div key={t.label} className="flex items-center gap-2 text-sm text-white/55 font-medium">
                    <t.icon className="w-4 h-4 text-primary-light" /> {t.label}
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative mx-auto w-full max-w-[480px]"
            >
              {/* Stage panel — everything lives inside one contained card, like a product mockup frame */}
              <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5 shadow-2xl shadow-black/50 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

                <div className="relative flex items-start justify-between gap-3 mb-3">
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="rounded-2xl border border-white/10 bg-[#141814] px-4 py-3 shadow-lg shadow-black/30"
                  >
                    <div className="text-lg font-bold text-primary-light leading-none">120+</div>
                    <div className="text-[11px] font-semibold text-white/70 mt-1 whitespace-nowrap">Systems shipped</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="rounded-2xl border border-white/10 bg-[#141814] px-4 py-3 shadow-lg shadow-black/30"
                  >
                    <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-2.5 h-2.5 fill-current" />)}
                    </div>
                    <div className="text-[11px] font-semibold text-white/80 whitespace-nowrap">45+ happy clients</div>
                  </motion.div>
                </div>

                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-[#0F1210]">
                  <img
                    src={RIZWAN_ULTRA_IMAGE_URL}
                    alt={`${profileData.name} portrait`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute top-4 right-4 space-y-2 hidden sm:block">
                    {['Mobile Apps', 'Web Platforms', 'AI Tooling'].map((label, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.75 + i * 0.1, duration: 0.5 }}
                        className="rounded-full border border-white/10 bg-[#141814]/95 backdrop-blur-sm px-3.5 py-1.5 shadow-lg shadow-black/30 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-light shrink-0" />
                        <span className="text-[11px] font-semibold text-white/80 whitespace-nowrap">{label}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.5 }}
                    className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-[#141814]/95 backdrop-blur-sm px-5 py-4 shadow-lg shadow-black/30"
                  >
                    <div className="text-sm font-semibold text-white">{profileData.name}</div>
                    <div className="text-xs text-white/50 mt-0.5">{profileData.role}</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="relative hidden sm:flex justify-center mt-20"
          >
            <ChevronDown className="w-5 h-5 text-white/25 animate-bounce" />
          </motion.div>
        </section>

        {/* Tech marquee */}
        <Reveal className="py-10 border-b border-black/[0.06] bg-[#F6F8F7]">
          <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F6F8F7] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F6F8F7] to-transparent z-10 pointer-events-none" />
            <div className="flex w-max marquee-track">
              {[...MARQUEE_TECH, ...MARQUEE_TECH].map((stack, i) => {
                const iconUrl = TECH_ICON_MAP[stack];
                return (
                  <div key={`${stack}-${i}`} className="flex items-center gap-3 px-8 shrink-0">
                    {iconUrl ? (
                      <div className="w-6 h-6 rounded bg-white p-1 flex items-center justify-center shrink-0 border border-black/5">
                        <img src={iconUrl} alt="" className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    ) : null}
                    <span className="text-sm font-medium text-[#55605B] whitespace-nowrap">{stack}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* About / Welcome — light, stats + quote callout */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-16 items-start">
              <Reveal className="space-y-6">
                <div className="eyebrow">Welcome</div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  A software engineer focused on <span className="text-primary">shipping things that last</span>
                </h2>
                <p className="text-[#55605B] text-lg leading-relaxed max-w-xl">
                  I design, build, and support mobile and web products end to end — from architecture decisions to the small interaction details users actually notice. Based in Pakistan, working with startups and teams worldwide, I care about code that's still easy to maintain a year after ship day.
                </p>
                <a href="mailto:rizwanrasheed046@gmail.com" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
                  Book a call <ArrowRight className="w-4 h-4" />
                </a>
              </Reveal>

              <Reveal delay={0.1} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {profileData.telemetry.map((t) => (
                    <div key={t.label} className="rounded-2xl border border-black/10 bg-white shadow-sm shadow-black/[0.02] p-5 text-center space-y-1">
                      <div className="text-3xl font-bold text-primary">{t.value}</div>
                      <div className="text-[11px] text-[#55605B] font-medium leading-tight">{t.label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-dark-gradient-soft overflow-hidden text-white p-6 space-y-3">
                  <div className="text-lg font-semibold">"Built to last."</div>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Ready to help with mobile apps, web platforms, or free browser-based tools — for solo founders and international teams alike.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* What I do — services */}
        <section className="py-24 sm:py-32 bg-[#F6F8F7] border-y border-black/[0.06]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-14">
            <Reveal className="text-center max-w-2xl mx-auto space-y-4">
              <div className="eyebrow justify-center">What I do</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Work built around your product.</h2>
              <p className="text-[#55605B] text-base leading-relaxed">
                From mobile apps to full-stack platforms. One engineer for the whole stack, working directly with founders and product teams.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileData.featuredServices.map((service, i) => (
                <Reveal key={service.name} delay={Math.min(i * 0.08, 0.24)}>
                  <div className="h-full bg-white rounded-3xl border border-black/10 p-7 space-y-5 hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-mint border border-primary/15 flex items-center justify-center">
                      <service.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">{service.name}</h3>
                    <p className="text-sm text-[#55605B] leading-relaxed">{service.description}</p>
                    <div className="space-y-2.5 pt-2 border-t border-black/[0.06]">
                      {service.bullets.map((b) => (
                        <div key={b} className="flex items-center gap-2 text-sm text-[#55605B]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /> {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1} className="rounded-3xl bg-dark-gradient-soft p-8 sm:p-10">
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-5">Also comfortable with</div>
              <div className="flex flex-wrap gap-3">
                {profileData.alsoDo.map((item) => (
                  <span key={item} className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-sm text-white/70 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Featured Work */}
        <section id="work" className="py-24 sm:py-32 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 sm:mb-16">
              <div className="space-y-3">
                <div className="eyebrow">Portfolio</div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Selected work.</h2>
              </div>
              <p className="max-w-md text-[#55605B] text-base leading-relaxed">
                Shipped apps and client products, with direct links to their live App Store and Play Store listings.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:auto-rows-[minmax(0,1fr)]">
              {apps.map((app, idx) => {
                const featured = idx === 0;
                return (
                  <Reveal key={app.id} delay={Math.min(idx * 0.06, 0.3)} className={featured ? 'lg:col-span-2 lg:row-span-2' : ''}>
                    <div
                      className={`group h-full rounded-2xl border border-black/10 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 flex flex-col ${featured ? 'p-8 sm:p-10' : 'p-7'}`}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className="text-[11px] font-medium text-[#8B958F] tracking-wide">{app.category}</div>
                        <div className="flex gap-2.5 items-center">
                          {app.webLink && (
                            <a href={app.webLink} target="_blank" rel="noopener noreferrer" title="Live Website">
                              <Globe className="w-3.5 h-3.5 opacity-60 hover:opacity-100 hover:text-primary transition-opacity text-[#55605B]" />
                            </a>
                          )}
                          {app.playStore && (
                            <a href={app.playStore} target="_blank" rel="noopener noreferrer" title="Play Store">
                              <img src={PLAY_STORE_ICON_URL} alt="Play Store" className="w-3.5 h-3.5 object-contain opacity-60 hover:opacity-100 transition-opacity" loading="lazy" />
                            </a>
                          )}
                          {app.appStore && (
                            <a href={app.appStore} target="_blank" rel="noopener noreferrer" title="App Store">
                              <img src={APP_STORE_ICON_URL} alt="App Store" className="w-3.5 h-3.5 object-contain rounded opacity-60 hover:opacity-100 transition-opacity" loading="lazy" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        {renderProjectIcon(app, featured ? 'w-14 h-14' : 'w-12 h-12')}
                        <h3 className={`font-semibold tracking-tight group-hover:text-primary transition-colors ${featured ? 'text-2xl' : 'text-lg'}`}>{app.name}</h3>
                      </div>
                      <p className={`text-[#55605B] leading-relaxed mb-5 ${featured ? 'text-base max-w-lg' : 'text-sm'}`}>{app.description}</p>

                      {app.screenshot && !failedScreenshots[app.id] ? (
                        <div className={`relative overflow-hidden rounded-xl border border-black/5 mt-auto ${featured ? 'h-56' : 'h-32'}`}>
                          <img
                            src={app.screenshot}
                            alt={`${app.name} preview`}
                            className="w-full h-full object-cover object-top"
                            onError={() => markScreenshotFailed(app.id)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                      ) : (
                        <div className={`rounded-xl border border-black/5 bg-[#F6F8F7] flex items-center justify-center mt-auto ${featured ? 'h-56' : 'h-32'}`}>
                          <span className="text-xs text-[#8B958F]">No preview available</span>
                        </div>
                      )}

                      <div className="pt-5 mt-5 border-t border-black/[0.06] flex flex-wrap gap-2">
                        {app.webLink ? (
                          <a href={app.webLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/20 transition-all">
                            Live Website <ArrowUpRight className="w-3 h-3" />
                          </a>
                        ) : null}
                        {app.playStore ? (
                          <a href={app.playStore} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F8F7] border border-black/10 text-xs font-medium text-[#55605B] hover:border-primary/40 hover:text-ink transition-all">
                            Play Store <ArrowUpRight className="w-3 h-3" />
                          </a>
                        ) : null}
                        {app.appStore ? (
                          <a href={app.appStore} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F8F7] border border-black/10 text-xs font-medium text-[#55605B] hover:border-primary/40 hover:text-ink transition-all">
                            App Store <ArrowUpRight className="w-3 h-3" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Experience & Education */}
        <section className="py-24 sm:py-32 bg-[#F6F8F7] border-y border-black/[0.06]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              <Reveal className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-mint border border-primary/20 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Experience</h3>
                </div>
                <div className="space-y-10 relative pl-8">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'linear-gradient(to bottom, var(--color-primary), transparent)' }} />
                  {profileData.employment.map((job, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[33px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#F6F8F7] shadow-[0_0_12px_rgba(14,157,82,0.5)]" style={{ background: GRADIENT }} />
                      <div className="space-y-2">
                        <div className="text-primary text-xs font-medium tracking-wide">{job.period}</div>
                        <h4 className="text-lg font-semibold">{job.role}</h4>
                        <div className="text-[#55605B] text-sm font-medium">{job.company}</div>
                        <p className="text-[#55605B] text-sm leading-relaxed max-w-md">{job.desc}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {job.stack.map(s => (
                            <span key={s} className="px-2.5 py-1 rounded-full bg-white border border-black/10 text-[11px] font-medium text-[#55605B]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.1} className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-mint border border-primary/20 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Education</h3>
                </div>
                <div className="space-y-10 relative pl-8">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'linear-gradient(to bottom, var(--color-primary), transparent)' }} />
                  {profileData.education.map((edu, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[33px] top-1 w-3.5 h-3.5 rounded-full border-2 border-[#F6F8F7] shadow-[0_0_12px_rgba(14,157,82,0.5)]" style={{ background: GRADIENT }} />
                      <div className="space-y-2">
                        <div className="text-primary text-xs font-medium tracking-wide">{edu.period}</div>
                        <h4 className="text-lg font-semibold">{edu.degree}</h4>
                        <div className="text-[#55605B] text-sm font-medium">{edu.school}</div>
                        <div className="text-[#8B958F] text-sm">{edu.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Skills grid */}
        <section id="skills" className="py-24 sm:py-32 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-12">
              <Reveal className="lg:col-span-1 space-y-5">
                <div className="eyebrow">Capabilities</div>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">Technical skills.</h3>
                <p className="text-[#55605B] text-sm leading-relaxed max-w-sm">
                  Technologies I use across mobile, frontend, backend, cloud, and AI-assisted tooling.
                </p>
              </Reveal>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {profileData.techCategories.map((category, ci) => (
                  <Reveal key={category.name} delay={Math.min(ci * 0.05, 0.25)}>
                    <div className="relative rounded-2xl border border-black/10 bg-white p-6 space-y-5 hover:border-primary/25 hover:shadow-lg hover:shadow-black/5 transition-all overflow-hidden h-full">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-mint border border-primary/20 flex items-center justify-center">
                          <category.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm font-semibold text-ink">{category.name}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5">
                        {category.stacks.map((stack) => {
                          const iconUrl = TECH_ICON_MAP[stack];
                          const isFailed = failedTechIcons[stack];
                          return (
                            <div key={`${category.name}-${stack}`} className="px-2 py-3 rounded-lg border border-black/[0.06] bg-[#F6F8F7] flex flex-col items-center justify-center text-center gap-1.5 min-h-[86px]">
                              {iconUrl && !isFailed ? (
                                <div className="w-8 h-8 rounded-md bg-white border border-black/5 p-1.5 flex items-center justify-center">
                                  <img
                                    src={iconUrl}
                                    alt={`${stack} icon`}
                                    loading="lazy"
                                    className="w-full h-full object-contain"
                                    onError={() => markTechIconFailed(stack)}
                                  />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-md bg-mint border border-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                                  {getProjectInitials(stack).slice(0, 2)}
                                </div>
                              )}
                              <div className="text-[10px] font-medium text-[#55605B] leading-tight">{stack}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="py-24 sm:py-32 bg-[#F6F8F7] border-y border-black/[0.06] scroll-mt-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <Reveal className="space-y-3 mb-14 text-center">
              <div className="eyebrow justify-center">Client feedback</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">What clients say.</h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileData.testimonials.map((t, i) => (
                <Reveal key={i} delay={Math.min(i * 0.08, 0.24)}>
                  <div className="relative h-full rounded-2xl border border-primary/15 bg-mint p-7 space-y-6 flex flex-col overflow-hidden">
                    <Quote className="absolute -top-2 -right-2 w-20 h-20 text-primary/10" fill="currentColor" />
                    <div className="flex items-center gap-1 text-amber-500 relative">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-current" />)}
                    </div>
                    <p className="text-[#3D453F] text-sm leading-relaxed flex-1 relative">"{t.text}"</p>
                    <div className="pt-5 border-t border-primary/15 flex items-center gap-3 relative">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: GRADIENT }}>
                        {getProjectInitials(t.client)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink">{t.client}</div>
                        <div className="text-xs text-[#55605B] mt-0.5">{t.service} · {t.location}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 sm:py-32 bg-dark-gradient">
          <div className="max-w-5xl mx-auto px-5 sm:px-8">
            <Reveal>
              <div className="relative rounded-[2rem] border border-white/10 bg-dark-gradient-soft px-8 py-16 sm:px-16 sm:py-20 text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(45deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="relative space-y-6">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                      Have a project in mind?
                    </h2>
                    <p className="text-white/55 text-lg max-w-xl mx-auto">
                      I'm currently taking on new mobile and web engineering work. Let's talk about what you're building.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                      <a
                        href="mailto:rizwanrasheed046@gmail.com"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                        style={{ background: GRADIENT }}
                      >
                        <Mail className="w-4 h-4" /> Start a conversation
                      </a>
                      <Link
                        to="/tools"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-sm font-semibold text-white/80 hover:border-white/30 hover:text-white transition-all"
                      >
                        Explore free tools
                      </Link>
                    </div>
                  </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
