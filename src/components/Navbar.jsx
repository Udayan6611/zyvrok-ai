import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, LogOut, User } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { getCurrentUser, getEffectiveCredits, signOutUser } from '../lib/supabase';

export function Navbar() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const u = await getCurrentUser();
        if (mounted) {
          setUser(u);
          const c = await getEffectiveCredits(u?.id);
          setCredits(c);
        }
      } catch (e) {}
    }
    loadUser();

    const onCreditsUpdated = (e) => {
      if (e.detail?.credits !== undefined && mounted) {
        setCredits(e.detail.credits);
      }
    };
    window.addEventListener('pm_credits_updated', onCreditsUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('pm_credits_updated', onCreditsUpdated);
    };
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setCredits(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
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

        {/* Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
          <a href="/#features" className="hover:text-white transition-colors">Features</a>
          <a href="/#preview" className="hover:text-white transition-colors">Studio Interface</a>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          {user && (
            <>
              <Link to="/history" className="hover:text-white transition-colors">History</Link>
              <Link to="/account" className="hover:text-white transition-colors">Account</Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/pricing"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20 font-semibold hover:bg-emerald-500/20 transition-all"
              >
                <Sparkles className="w-3 h-3" />
                <span>{credits !== null ? credits : '...'} Credits</span>
              </Link>
              
              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              >
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Account</span>
              </Link>

              <Link
                to="/studio"
                className="text-xs font-mono bg-white text-zinc-950 font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Studio
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="text-zinc-500 hover:text-zinc-300 p-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;