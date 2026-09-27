import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="py-12 bg-[#09090b] text-zinc-400 text-xs relative z-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Brand & Copyright */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-white text-zinc-950 flex items-center justify-center font-bold text-[10px]">
            Z
          </div>
          <span className="text-[11px] font-mono text-zinc-400">© 2026 Zyvrok (Udayan Dusane). All rights reserved.</span>
        </div>

        {/* Navigation & Legal Links */}
        <div className="flex items-center gap-6 text-[11px] font-medium text-zinc-400">
          <Link to="/studio" className="hover:text-white transition-colors">Studio</Link>
          <Link to="/history" className="hover:text-white transition-colors">History</Link>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          {/* Explicit Working Legal & Compliance Link */}
          <Link
            to="/legal"
            className="hover:text-white transition-colors font-semibold text-zinc-300 underline decoration-zinc-700 underline-offset-4"
          >
            Legal & Compliance
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
