import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = '', light = false }: LogoProps) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}>
      {/* Icon Badge: Glowing Emerald Badge */}
      <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-primary-light via-primary to-primary-dark text-white font-extrabold text-sm shadow-md shadow-primary/25 group-hover:shadow-lg group-hover:shadow-primary/45 group-hover:scale-105 transition-all duration-300 border border-white/20">
        <span className="font-display font-black text-base leading-none tracking-tight">S</span>
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-[#08080A]" />
        </span>
      </div>

      {/* Typography */}
      <div className="flex items-baseline font-bold tracking-tight text-[17px] font-display">
        <span className={`${light ? 'text-ink' : 'text-white'} group-hover:text-primary transition-colors font-extrabold`}>
          ShaadDev
        </span>
        <span className="text-primary font-mono text-xs ml-1 tracking-normal font-semibold bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md">
          STUDIO
        </span>
      </div>
    </Link>
  );
}
