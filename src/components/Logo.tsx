import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = '', light = false }: LogoProps) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 shrink-0 select-none ${className}`}>
      {/* 3D Metallic App Logo Icon */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-300 border border-primary/40 bg-[#08080A]">
        <img 
          src="/assets/app_logo_icon.jpg?v=3" 
          alt="ShaadDev Studio Logo" 
          className="w-full h-full object-cover" 
        />
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
        <span className="text-primary font-mono text-xs ml-1.5 tracking-normal font-bold bg-primary/15 border border-primary/25 px-1.5 py-0.5 rounded-md">
          STUDIO
        </span>
      </div>
    </Link>
  );
}
