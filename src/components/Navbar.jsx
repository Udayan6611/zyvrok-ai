import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MagneticButton from './MagneticButton';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Monogram & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight transition-transform group-hover:scale-95 shadow-sm shadow-white/20">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16L7 20h13"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight leading-none text-white">Zyvrok</span>
            <span className="text-[10px] font-mono text-zinc-400 tracking-tight mt-0.5 lowercase">turn links into signal</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
          <a href="/#features" className="hover:text-white transition-colors">Features</a>
          <a href="/#preview" className="hover:text-white transition-colors">Studio Interface</a>
          <a href="/#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 transition-colors">
            Sign In
          </Link>
          <MagneticButton>
            <Link
              to="/studio"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors shadow-sm shadow-white/10"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
