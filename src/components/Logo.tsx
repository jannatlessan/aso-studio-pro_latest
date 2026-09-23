import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = '', light = false }: LogoProps) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-3 shrink-0 select-none ${className}`}>
      {/* Crisp Vector Monogram Emblem */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#18241E] via-[#0E1511] to-[#08080A] border border-emerald-500/30 p-2 shadow-lg shadow-emerald-950/40 group-hover:border-emerald-400/60 group-hover:shadow-emerald-500/25 group-hover:scale-105 transition-all duration-300">
        <svg viewBox="0 0 512 512" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sGradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#0E9D52" />
              <stop offset="100%" stopColor="#054D26" />
            </linearGradient>
          </defs>
          <path 
            d="M360 215 C360 150, 310 110, 248 110 C170 110, 142 165, 142 210 C142 295, 360 260, 360 338 C360 395, 305 418, 240 418 C160 418, 136 360, 136 312" 
            fill="none" 
            stroke="url(#sGradLogo)" 
            strokeWidth="56" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border-2 border-[#08080A]" />
        </span>
      </div>

      {/* Perfect Text Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-display text-lg sm:text-xl font-extrabold tracking-tight ${light ? 'text-ink' : 'text-white'} group-hover:text-emerald-400 transition-colors`}>
            ShaadDev
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-sm">
            STUDIO
          </span>
        </div>
        <span className="text-[10px] font-medium text-white/40 tracking-wider uppercase mt-1">
          Software & Mobile Apps
        </span>
      </div>
    </Link>
  );
}
