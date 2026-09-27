import React from "react";

export default function Footer({ onNavigate }) {
  return (
    <footer className="border-t border-border-crisp bg-white py-12 text-xs text-text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs">
              Z
            </div>
            <span className="font-extrabold text-sm text-text-primary">Zyvrok</span>
          </div>
          <p className="text-text-muted font-mono text-[11px]">
            Content Repurposing Studio • Pune, Maharashtra, India
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 font-medium">
          <button onClick={() => onNavigate("landing")} className="hover:text-text-primary transition-colors">
            Overview
          </button>
          <button onClick={() => onNavigate("studio")} className="hover:text-text-primary transition-colors">
            Studio
          </button>
          <button onClick={() => onNavigate("pricing")} className="hover:text-text-primary transition-colors">
            Pricing
          </button>
          <a href="/legal.html" className="hover:text-text-primary transition-colors">
            Legal & Compliance
          </a>
        </div>

        {/* Copyright */}
        <div className="text-text-muted font-mono text-[11px] text-center md:text-right">
          © {new Date().getFullYear()} Zyvrok (Udayan Dusane). All rights reserved.
        </div>

      </div>
    </footer>
  );
}
