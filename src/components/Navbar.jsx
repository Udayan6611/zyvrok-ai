import React from "react";
import MagneticButton from "./ui/MagneticButton";
import ShimmerBadge from "./ui/ShimmerBadge";

export default function Navbar({ activeTab, setActiveTab, user, credits, onOpenAuth, onSignOut }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-crisp transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => setActiveTab("landing")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm tracking-tight transition-transform group-hover:scale-95 shadow-sm shadow-blue-500/20">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16L7 20h13" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight leading-none text-text-primary">Zyvrok</span>
            <span className="text-[10px] font-mono text-text-muted tracking-tight mt-0.5 lowercase">repurpose studio</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-subtle p-1 rounded-xl border border-border-crisp/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "landing"
                ? "bg-white text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-white/50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("studio")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "studio"
                ? "bg-white text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-white/50"
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "pricing"
                ? "bg-white text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-white/50"
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "history"
                ? "bg-white text-text-primary shadow-xs font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-white/50"
            }`}
          >
            History
          </button>
        </nav>

        {/* Actions & User Info */}
        <div className="flex items-center gap-3">
          {/* Credits Counter */}
          <div 
            onClick={() => setActiveTab("pricing")}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200/80 rounded-lg text-xs font-mono text-primary cursor-pointer hover:bg-blue-100/70 transition-colors"
            title="Click to get more credits"
          >
            <span className="font-bold">{credits}</span>
            <span className="text-[11px] text-blue-600/80">credits</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-text-secondary font-mono max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                onClick={onSignOut}
                className="text-xs px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 border border-border-crisp transition-colors"
              >
                Log Out
              </button>
            </div>
          ) : (
            <MagneticButton
              onClick={onOpenAuth}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-text-primary text-white hover:bg-text-primary/90 shadow-xs"
            >
              Sign In
            </MagneticButton>
          )}

          <MagneticButton
            onClick={() => setActiveTab("studio")}
            className="text-xs px-3.5 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-container shadow-xs shadow-blue-500/20"
          >
            Launch Studio
          </MagneticButton>
        </div>

      </div>
    </header>
  );
}
