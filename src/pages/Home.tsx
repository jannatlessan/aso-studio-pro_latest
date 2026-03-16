/// <reference types="vite/client" />

import { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  PerspectiveCamera, 
  Points, 
  PointMaterial, 
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Mail, 
  ChevronRight, 
  Smartphone, 
  Zap, 
  Code, 
  Target, 
  ExternalLink,
  Cpu,
  Globe,
  Monitor,
  Hexagon,
  Play,
  Star,
  Activity as ActivityIcon,
  ShieldCheck,
  AppWindow,
  LayoutGrid,
  Cloud,
  Box,
  Database,
  Terminal,
  Linkedin,
  MessageCircle,
  GraduationCap,
  Briefcase,
  Menu,
  ChevronLeft,
  X,
  Download,
  Layers,
  Sparkles,
  Copy,
  Clipboard,
  Check,
  Layout,
  Settings2,
  Tablet,
  Plus,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import gsap from 'gsap';
import Footer from '../components/Footer';

// Particle System for the 10/10 Experience
function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  const [sphere] = useState(() => {
    const arr = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5 + Math.random() * 20;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  });

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00F0FF"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

const profileData = {
  name: "Rizwan Rasheed",
  id: "STUDIO-PRO-01",
  role: "Lead Software Architect",
  summary: "Specializing in high-performance cross-platform applications and scalable backend systems. Turning complex ideas into digital gold with precision and passion.",
  status: "AVAILABLE FOR GIGS",
  expertise: ["Distributed Systems", "Mobile Engineering", "Computational Performance"],
  metrics: [
    { label: "Code Quality", value: "A+" },
    { label: "Reliability", value: "99.9%" },
    { label: "Architecture", value: "SOLID" }
  ],
  telemetry: [
    { label: "Years Experience", value: "5+", icon: ActivityIcon },
    { label: "Systems Scaled", value: "120+", icon: Cpu },
    { label: "Satisfied Clients", value: "45+", icon: Globe }
  ],
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
      name: "Software Full Stack Engineer",
      icon: Layers,
      stacks: ["End-to-End Architecture", "CI/CD", "Performance Tuning", "Scalable Deployments", "Monitoring", "Production Debugging"]
    },
    {
      name: "Cloud & Databases",
      icon: Database,
      stacks: ["AWS", "Docker", "PostgreSQL", "MongoDB", "Redis", "Storage & Caching"]
    },
    {
      name: "AI & Other Tools",
      icon: Settings2,
      stacks: ["OpenAI / LLMs", "LangChain", "FFmpeg", "GitHub Actions", "Postman", "Figma"]
    }
  ],
  employment: [
    {
      company: "Kairos Business Solutions Singapore",
      role: "Mobile Application Developer",
      period: "Jul 2023 - Present",
      desc: "Architecting high-performance mobile systems using Flutter and React Native. Implementing secure payment gateways (Stripe, Apple Pay) and CI/CD pipelines.",
      stack: ["Flutter", "React Native", "Laravel", "CI/CD", "AWS"]
    },
    {
      company: "Mercury Sols",
      role: "Mobile App Developer",
      period: "Apr 2020 - Aug 2023",
      desc: "Developed cross-platform applications with a focus on intuitive UI/UX and responsive architecture. Transformed complex requirements into high-fidelity products.",
      stack: ["Flutter", "Dart", "UI/UX"]
    }
  ],
  education: [
    {
      school: "Khawaja Fareed University of Engineering & Tech (KFUEIT)",
      degree: "BS Computer Science",
      period: "2017 - 2021",
      city: "Rahim Yar Khan"
    }
  ],
  testimonials: [
    {
      client: "Alex Rivera",
      id: "LOG-A24",
      service: "App Store Optimization",
      text: "Rizwan's ASO engine transformed our visibility. We saw a 300% increase in impressions within 48 hours. Absolute wizardry.",
      location: "San Francisco, USA"
    },
    {
      client: "Sarah Chen",
      id: "LOG-S09",
      service: "Scalable Architecture",
      text: "The computational pipelines he built are rock solid. We handle 50k concurrent users with zero latency spikes. Impeccable engineering.",
      location: "London, UK"
    },
    {
      client: "Markus Thulin",
      id: "LOG-M12",
      service: "Mobile Infrastructure",
      text: "Hands down the most proficient Flutter lead I've worked with. He doesn't just write code; he architected our entire mobile ecosystem.",
      location: "Stockholm, SE"
    }
  ],
  projects: [
    { 
      title: "ASO Studio v2", 
      id: "MODULE-ASO",
      desc: "Advanced visual synthesis engine for App Store prominence.", 
      path: "/tools/aso-screenshot",
      icon: Smartphone,
      color: "#00F0FF"
    },
    { 
      title: "Core Pipeline", 
      id: "MODULE-VID",
      desc: "Low-level FFmpeg automation for scale video processing.", 
      path: "#",
      icon: Zap,
      color: "#FF0055"
    }
  ]
};

const RIZWAN_ULTRA_IMAGE_URL = 'https://raw.githubusercontent.com/jannatlessan/pp270504/refs/heads/main/rizwan_ultra.png';

const TECH_ICON_MAP: Record<string, string> = {
  "Flutter": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
  "React Native": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "SwiftUI": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
  "KMP (Kotlin)": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
  "Dart": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg",
  "App Store Connect": "https://cdn.simpleicons.org/appstore/FFFFFF",
  "Google Play Console": "https://cdn.simpleicons.org/googleplay/FFFFFF",
  "React": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  "Next.js": "https://cdn.simpleicons.org/nextdotjs/FFFFFF",
  "TypeScript": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  "Tailwind CSS": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
  "Responsive UI": "https://cdn.simpleicons.org/css3/FFFFFF",
  "Motion / Animation": "https://cdn.simpleicons.org/framer/FFFFFF",
  "Node.js": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  "Go": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  "Laravel": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
  "REST APIs": "https://cdn.simpleicons.org/openapiinitiative/FFFFFF",
  "Authentication": "https://cdn.simpleicons.org/auth0/FFFFFF",
  "Payment Integrations": "https://cdn.simpleicons.org/stripe/FFFFFF",
  "End-to-End Architecture": "https://cdn.simpleicons.org/miro/FFFFFF",
  "CI/CD": "https://cdn.simpleicons.org/githubactions/FFFFFF",
  "Performance Tuning": "https://cdn.simpleicons.org/speedtest/FFFFFF",
  "Scalable Deployments": "https://cdn.simpleicons.org/kubernetes/FFFFFF",
  "Monitoring": "https://cdn.simpleicons.org/grafana/FFFFFF",
  "Production Debugging": "https://cdn.simpleicons.org/sentry/FFFFFF",
  "AWS": "https://cdn.simpleicons.org/amazonaws/FFFFFF",
  "Docker": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  "PostgreSQL": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  "MongoDB": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  "Redis": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
  "Storage & Caching": "https://cdn.simpleicons.org/cloudflare/FFFFFF",
  "OpenAI / LLMs": "https://cdn.simpleicons.org/openai/FFFFFF",
  "LangChain": "https://cdn.simpleicons.org/langchain/FFFFFF",
  "FFmpeg": "https://cdn.simpleicons.org/ffmpeg/FFFFFF",
  "GitHub Actions": "https://cdn.simpleicons.org/githubactions/FFFFFF",
  "Postman": "https://cdn.simpleicons.org/postman/FFFFFF",
  "Figma": "https://cdn.simpleicons.org/figma/FFFFFF"
};

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

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current && followerRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
        });
        gsap.to(followerRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.3,
        });
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <>
      <div ref={cursorRef} className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />
      <div ref={followerRef} className="fixed top-0 left-0 w-10 h-10 border border-primary/30 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="w-1 h-1 bg-primary/50 rounded-full animate-ping" />
      </div>
    </>
  );
};

export default function Home() {
  const [booting, setBooting] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('hasBooted');
    }
    return true;
  });
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});
  const [failedScreenshots, setFailedScreenshots] = useState<Record<string, boolean>>({});
  const [failedTechIcons, setFailedTechIcons] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const renderProjectIcon = (app: any, sizeClass = 'w-14 h-14') => {
    if (app.icon && !failedIcons[app.id]) {
      return (
        <img
          src={app.icon}
          alt={`${app.name} icon`}
          className={`${sizeClass} rounded-2xl border border-white/10 object-cover grayscale group-hover:grayscale-0 transition-all`}
          onError={() => markIconFailed(app.id)}
        />
      );
    }

    return (
      <div className={`${sizeClass} rounded-2xl border border-primary/30 bg-[radial-gradient(circle_at_20%_20%,rgba(0,240,255,0.45),rgba(0,0,0,0.95))] flex items-center justify-center font-black text-lg tracking-wider text-white shadow-lg shadow-primary/20`}>
        {getProjectInitials(app.name)}
      </div>
    );
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!booting) {
        gsap.from(".module-card", {
          opacity: 0,
          y: 30,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out"
        });
      }
    });
    return () => ctx.revert();
  }, [booting]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);
  useEffect(() => {
    if (!booting) return;

    const logs = [
      "INITIALIZING SYSTEM KERNEL...",
      "LOADING NEURAL LAYERS...",
      "ESTABLISHING SECURE PROTOCOL...",
      "MOUNTING MEMORY REPOSITORIES...",
      "OPTIMIZING RENDERING ENGINE...",
      "PROFILE: RIZWAN RASHEED LOADED.",
      "SYSTEM STABLE. REDIRECTING..."
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      setBootLogs(prev => [...prev, logs[i]]);
      i++;
      if (i === logs.length) {
        clearInterval(interval);
        setTimeout(() => {
          setBooting(false);
          sessionStorage.setItem('hasBooted', 'true');
        }, 800);
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, [booting]);

  return (
    <div className="relative min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/40 font-mono overflow-x-hidden cursor-none">
      <CustomCursor />
      
      {/* Boot Sequence */}
      <AnimatePresence>
        {booting && (
          <motion.div 
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-12"
          >
            <div className="w-full max-w-lg space-y-4">
              <div className="flex justify-between items-center text-primary text-xs font-black tracking-widest uppercase">
                <span>System Status: Booting</span>
                <span className="animate-pulse">Active</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-primary"
                />
              </div>
              <div className="space-y-1">
                {bootLogs.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] text-white/50 tracking-tighter"
                  >
                    <span className="text-primary mr-2">&gt;</span> {log}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background World */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Canvas>
          <Suspense fallback={null}>
            <ParticleField />
            <PerspectiveCamera makeDefault position={[0, 0, 15]} />
          </Suspense>
        </Canvas>
      </div>

      {/* Decorative Grid */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-8 bg-[#020202]/60 backdrop-blur-xl border-b border-white/5 sm:border-none">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-primary rotate-45 flex items-center justify-center bg-black">
              <span className="font-black text-primary text-xl -rotate-45 leading-none">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-[0.2em] text-lg uppercase leading-none">Shaad Dev</span>
              <span className="text-[9px] text-primary tracking-[0.5em] uppercase font-bold">Studio v3.0</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-8 border-l border-white/10 pl-8 font-black uppercase text-[10px] tracking-[0.3em]">
            <a href="#expertise" className="text-white/40 hover:text-primary transition-all">Expertise</a>
            <a href="#modules" className="text-white/40 hover:text-primary transition-all">Modules</a>
            <a href="#reviews" className="text-white/40 hover:text-primary transition-all">Reviews</a>
            <Link to="/tools" className="text-white/40 hover:text-primary transition-all">Laboratory</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/tools" className="hidden sm:flex btn-primary py-2 px-4 text-[10px]">
            INITIALIZE LAB
          </Link>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 border border-white/10 bg-white/5 rounded-lg active:scale-95 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-[72px] left-0 right-0 z-40 px-4 lg:hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl p-4 space-y-3 shadow-2xl shadow-black/60">
              <a href="#expertise" onClick={closeMobileMenu} className="block py-2 px-3 text-[11px] font-black uppercase tracking-[0.3em] text-white/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all">
                Expertise
              </a>
              <a href="#modules" onClick={closeMobileMenu} className="block py-2 px-3 text-[11px] font-black uppercase tracking-[0.3em] text-white/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all">
                Modules
              </a>
              <a href="#reviews" onClick={closeMobileMenu} className="block py-2 px-3 text-[11px] font-black uppercase tracking-[0.3em] text-white/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all">
                Reviews
              </a>
              <Link to="/tools" onClick={closeMobileMenu} className="block py-2 px-3 text-[11px] font-black uppercase tracking-[0.3em] text-white/70 hover:text-primary hover:bg-white/5 rounded-lg transition-all">
                Laboratory
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <main className="relative z-10 pt-20 sm:pt-0">
        <section className="min-h-screen flex items-center justify-center pt-8 sm:pt-20">
          <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            
            <div className="space-y-16">
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black tracking-widest uppercase rounded-sm"
                >
                  <Cpu className="w-3.5 h-3.5" /> ID: {profileData.id} — ARCHITECT
                </motion.div>
                
                <h1 className="text-5xl sm:text-7xl md:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase">
                  Digital<br />
                  <span className="text-primary italic">Synthesis.</span>
                </h1>
                <p className="max-w-xl text-white/50 text-xl leading-relaxed italic">
                  "{profileData.summary}"
                </p>

                {/* System Telemetry Bar */}
                <div className="flex flex-wrap gap-8 pt-6">
                  {profileData.telemetry.map(t => (
                    <div key={t.label} className="flex flex-col gap-1 border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center gap-2 text-white/30 text-[9px] font-black tracking-widest uppercase">
                        <t.icon className="w-3 h-3" /> {t.label}
                      </div>
                      <div className="text-2xl font-black text-white">{t.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-12 border-y border-white/10 py-12">
                {profileData.metrics.map(m => (
                  <div key={m.label} className="space-y-1">
                    <div className="text-[10px] text-white/20 font-black uppercase tracking-widest">{m.label}</div>
                    <div className="text-4xl font-black text-white">{m.value}</div>
                  </div>
                ))}
              </div>

                <div className="flex flex-wrap items-center gap-10">
                  <a href="#modules" className="group flex items-center gap-6 text-xs font-black tracking-[0.4em] uppercase text-primary">
                    ENTER ARCHIVES <div className="w-20 h-px bg-primary group-hover:w-40 transition-all" />
                  </a>
                  <div className="flex items-center gap-6">
                    <a href="https://github.com/Rizwan884" target="_blank" className="text-white/40 hover:text-primary transition-all">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href="https://www.linkedin.com/in/rashidrizwan-connect/" target="_blank" className="text-white/40 hover:text-primary transition-all">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="https://wa.me/923126733459" target="_blank" className="text-white/40 hover:text-primary transition-all">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                    <a href="mailto:rizwanrasheed046@gmail.com" className="text-white/40 hover:text-primary transition-all">
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="relative w-full aspect-[4/5] max-w-[600px] mx-auto">
                <div className="absolute inset-0 border-[20px] border-primary/5 -translate-x-6 -translate-y-6" />
                <div className="absolute inset-0 border border-primary/20" />
                <div className="relative z-10 w-full h-full overflow-hidden bg-[#050505]">
                  <img 
                    src={RIZWAN_ULTRA_IMAGE_URL}
                    alt="Rizwan Ultra Persona" 
                    className="w-full h-full object-cover mix-blend-screen brightness-125 hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  
                  {/* Persona HUD Overlay */}
                  <div className="absolute top-8 right-8 space-y-4">
                    <Hexagon className="w-8 h-8 text-primary animate-spin-slow" />
                    <div className="h-20 w-[1px] bg-primary/30 mx-auto" />
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                    <div className="space-y-2">
                      <div className="text-[8px] font-black text-primary tracking-[0.5em] uppercase">User Authorized</div>
                      <div className="text-2xl font-black uppercase tracking-tighter">Rizwan Rasheed</div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-1 h-8 bg-primary/20" style={{ height: `${20 + i * 10}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating Tech Badges */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-12 -right-12 p-8 bg-black border border-primary/40 shadow-2xl shadow-primary/20 z-20"
                >
                  <Globe className="w-8 h-8 text-primary mb-4" />
                  <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Network</div>
                  <div className="text-xl font-black">GLOBAL</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Modules Section */}
        <section id="modules" className="py-40 bg-black/50 scroll-mt-28 sm:scroll-mt-32">
          <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32">
              <div className="space-y-4">
                <div className="text-primary font-black text-[10px] tracking-[0.5em] uppercase">Deployment Repositories</div>
                <h2 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                  Core<br />Modules.
                </h2>
              </div>
              <p className="max-w-md text-white/30 text-lg font-medium leading-relaxed border-l border-white/10 pl-8">
                Proprietary systems designed for maximum computational efficiency and high-fidelity user interaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Internal Lab Tools First */}
              {profileData.projects.map((proj) => (
                <Link key={proj.title} to={proj.path} className="module-card group relative">
                  <div className="h-full p-10 border border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] hover:border-primary transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 text-primary/5 group-hover:text-primary/10 transition-colors">
                      <proj.icon className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="text-[9px] font-black text-primary tracking-[0.4em] uppercase px-2 py-1 bg-primary/10 border border-primary/20">
                          INTERNAL MODULE
                        </div>
                        <ExternalLink className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-3xl font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{proj.title}</h3>
                        <p className="text-white/40 text-sm leading-relaxed">{proj.desc}</p>
                      </div>
                      <div className="pt-4 flex items-center gap-3 text-[9px] font-black tracking-widest uppercase text-primary/40 group-hover:text-primary transition-colors">
                        ACTIVATE MODULE <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Scraped Portfolio Apps */}
              {apps.map((app) => (
                <div key={app.id} className="module-card group relative">
                  <div className="h-full p-10 border border-white/5 bg-white/[0.01] hover:bg-primary/[0.02] hover:border-primary/20 transition-all duration-500 overflow-hidden relative">
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="text-[9px] font-black text-white/30 tracking-[0.4em] uppercase">
                          {app.category}
                        </div>
                        <div className="flex gap-3">
                          {app.playStore && (
                            <a href={app.playStore} target="_blank" rel="noopener noreferrer" title="Play Store">
                              <Play className="w-4 h-4 text-white/20 hover:text-primary transition-colors" />
                            </a>
                          )}
                          {app.appStore && (
                            <a href={app.appStore} target="_blank" rel="noopener noreferrer" title="App Store">
                              <AppWindow className="w-4 h-4 text-white/20 hover:text-primary transition-colors" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-3xl font-black uppercase tracking-tighter group-hover:text-primary transition-colors">{app.name}</h3>
                        <p className="text-white/30 text-sm leading-relaxed line-clamp-2">{app.description}</p>
                      </div>
                      
                      {/* Store Screenshot Preview */}
                      {app.screenshot && !failedScreenshots[app.id] && (
                        <div className="relative mt-4 h-32 overflow-hidden rounded-lg border border-white/5 opacity-50 group-hover:opacity-100 group-hover:h-48 transition-all duration-700">
                          <img 
                            src={app.screenshot} 
                            alt={`${app.name} preview`} 
                            className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-1000"
                            onError={() => markScreenshotFailed(app.id)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>
                      )}
                      {(!app.screenshot || failedScreenshots[app.id]) && (
                        <div className="relative mt-4 h-32 overflow-hidden rounded-lg border border-primary/20 bg-[linear-gradient(145deg,rgba(0,240,255,0.2),rgba(0,0,0,0.9))] opacity-70 group-hover:opacity-100 group-hover:h-48 transition-all duration-700 flex items-center justify-center">
                          <div className="text-center px-4">
                            <div className="text-3xl font-black tracking-widest text-white">{getProjectInitials(app.name)}</div>
                            <div className="text-[9px] uppercase tracking-[0.35em] text-primary/80 mt-2">Preview</div>
                          </div>
                        </div>
                      )}
                      <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                        <div className="shrink-0">
                          {renderProjectIcon(app)}
                        </div>
                        <div className="flex flex-wrap justify-end gap-3">
                          {app.playStore ? (
                            <a href={app.playStore} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all inline-flex items-center gap-2">
                              <Play className="w-3 h-3" />
                              Play Store
                            </a>
                          ) : (
                            <span className="px-4 py-2 bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/30 inline-flex items-center gap-2 cursor-not-allowed">
                              <Play className="w-3 h-3" />
                              Play Store
                            </span>
                          )}
                          {app.appStore ? (
                            <a href={app.appStore} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all inline-flex items-center gap-2">
                              <AppWindow className="w-3 h-3" />
                              App Store
                            </a>
                          ) : (
                            <span className="px-4 py-2 bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/30 inline-flex items-center gap-2 cursor-not-allowed">
                              <AppWindow className="w-3 h-3" />
                              App Store
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Career & Education Archives */}
        <section id="archives" className="py-40 border-t border-white/5 bg-black/30 scroll-mt-28 sm:scroll-mt-32">
          <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              
              {/* Employment */}
              <div className="space-y-12">
                <div className="flex items-center gap-4">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Employment<br />History.</h3>
                </div>
                <div className="space-y-12 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/10 ml-3 pl-12">
                  {profileData.employment.map((job, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[53px] top-2 w-2.5 h-2.5 bg-primary border-4 border-black" />
                      <div className="space-y-2">
                        <div className="text-primary font-black text-[10px] tracking-widest uppercase">{job.period}</div>
                        <h4 className="text-2xl font-black uppercase">{job.role}</h4>
                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{job.company}</div>
                        <p className="text-white/30 text-sm leading-relaxed max-w-md">{job.desc}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {job.stack.map(s => (
                            <span key={s} className="px-2 py-1 bg-white/5 text-[8px] font-black uppercase tracking-widest text-white/20 select-none">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-12">
                <div className="flex items-center gap-4">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Academic<br />Archives.</h3>
                </div>
                <div className="space-y-12 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-white/10 ml-3 pl-12">
                  {profileData.education.map((edu, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[53px] top-2 w-2.5 h-2.5 bg-primary border-4 border-black" />
                      <div className="space-y-2">
                        <div className="text-primary font-black text-[10px] tracking-widest uppercase">{edu.period}</div>
                        <h4 className="text-2xl font-black uppercase">{edu.degree}</h4>
                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{edu.school}</div>
                        <div className="text-white/20 text-[10px] uppercase tracking-widest">{edu.city}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Archives / Expertise */}
        <section id="expertise" className="py-40 border-t border-white/5 scroll-mt-28 sm:scroll-mt-32">
          <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
              <div className="lg:col-span-1 space-y-8">
                <div className="w-12 h-12 border-2 border-primary flex items-center justify-center rotate-45">
                  <Monitor className="w-6 h-6 text-primary -rotate-45" />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter">System<br />Expertise.</h3>
                <div className="h-px w-20 bg-primary" />
                <p className="text-white/30 text-sm leading-relaxed">
                  Engineered for maximum scale. These are the core stack components currently synchronized with the system.
                </p>
              </div>
              
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                {profileData.techCategories.map((category) => (
                  <div key={category.name} className="group p-8 border border-white/5 bg-white/[0.01] hover:bg-primary/[0.05] hover:border-primary/40 transition-all space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 border border-primary/30 bg-primary/10 rounded-xl flex items-center justify-center">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-sm font-black uppercase tracking-[0.2em] text-white/90">{category.name}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {category.stacks.map((stack) => {
                        const iconUrl = TECH_ICON_MAP[stack];
                        const isFailed = failedTechIcons[stack];

                        return (
                          <div key={`${category.name}-${stack}`} className="px-3 py-3 border border-white/10 bg-black/30 text-white/80 group-hover:border-primary/30 transition-colors rounded-lg flex flex-col items-center justify-center text-center gap-2 min-h-[102px]">
                            {iconUrl && !isFailed ? (
                              <img
                                src={iconUrl}
                                alt={`${stack} icon`}
                                loading="lazy"
                                className="w-8 h-8 object-contain"
                                onError={() => markTechIconFailed(stack)}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center text-[10px] font-black tracking-wider text-primary">
                                {getProjectInitials(stack).slice(0, 2)}
                              </div>
                            )}
                            <div className="text-[9px] font-black uppercase tracking-[0.12em] leading-tight">{stack}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="h-1 w-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        className="h-full bg-primary/40"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Validated Mission Reports (Testimonials) */}
        <section id="reviews" className="py-40 bg-black/40 overflow-hidden border-y border-white/5 scroll-mt-28 sm:scroll-mt-32">
          <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 mb-20">
            <div className="text-primary font-black text-[10px] tracking-[0.5em] uppercase mb-4">Social Proof Handshake</div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">
              Mission<br />Reports.
            </h2>
          </div>
          
          <div className="flex gap-8 px-5 sm:px-8 lg:px-12 animate-scroll">
            <div className="flex gap-8 min-w-full">
              {[...profileData.testimonials, ...profileData.testimonials].map((t, i) => (
                <div key={i} className="min-w-[400px] p-10 bg-white/[0.02] border border-white/5 space-y-8 relative group">
                  <div className="absolute top-0 right-0 p-6">
                    <Hexagon className="w-8 h-8 text-white/5 group-hover:text-primary/20 transition-all" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-primary tracking-widest">{t.id}</div>
                      <div className="text-[9px] text-white/30 uppercase">{t.location}</div>
                    </div>
                    <div className="flex gap-1 text-primary">
                      {[1, 2, 3, 4, 5].map(s => <Zap key={s} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed text-white/60 italic font-medium">
                    "{t.text}"
                  </p>
                  <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-lg sm:text-xl font-black uppercase tracking-tighter">{t.client}</div>
                      <div className="text-[9px] font-black text-primary uppercase tracking-widest">{t.service}</div>
                    </div>
                    <div className="px-3 py-1 bg-primary text-black text-[9px] font-black uppercase tracking-widest">VALIDATED</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        
        body {
          font-family: 'JetBrains Mono', monospace;
        }

        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        .shadow-3xl {
          box-shadow: 0 40px 100px -20px rgba(0, 240, 255, 0.4);
        }

        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #020202;
        }
        ::-webkit-scrollbar-thumb {
          background: #1a1a1a;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00F0FF;
        }
      `}</style>
    </div>
  );
}
