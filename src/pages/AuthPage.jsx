import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, RefreshCw, CheckCircle2, AlertCircle, Sparkles, LogOut } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MagneticButton from '../components/MagneticButton';
import { supabase, getCurrentUser, signOutUser, resetToSignupCredits, addPaidCredits, getEffectiveCredits } from '../lib/supabase';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [userCredits, setUserCredits] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';
  const pendingTier = searchParams.get('tier');

  useEffect(() => {
    async function checkActiveUser() {
      try {
        const u = await getCurrentUser();
        if (u) {
          setCurrentUser(u);
          const creds = await getEffectiveCredits(u.id);
          setUserCredits(creds);
        }
      } catch (e) {}
    }
    checkActiveUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // Sign Up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim()
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          // Grant initial 50 credits to new user
          await resetToSignupCredits(data.user.id, 50);

          // Check for any unclaimed payments on this device and link them to the new user!
          try {
            const unclaimed = localStorage.getItem('pm_last_unclaimed_payment');
            if (unclaimed) {
              const paymentObj = JSON.parse(unclaimed);
              if (paymentObj.paymentId && paymentObj.credits) {
                await addPaidCredits(data.user.id, paymentObj.credits, paymentObj.paymentId);
                localStorage.removeItem('pm_last_unclaimed_payment');
              }
            }
          } catch (e) {}

          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            navigate(redirectTarget);
          }, 800);
        } else {
          setSuccessMsg('Please check your email to confirm your account, then sign in.');
        }
      } else {
        // Sign In with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          // Check for any unclaimed payments on this device and link them to the user!
          try {
            const unclaimed = localStorage.getItem('pm_last_unclaimed_payment');
            if (unclaimed) {
              const paymentObj = JSON.parse(unclaimed);
              if (paymentObj.paymentId && paymentObj.credits) {
                await addPaidCredits(data.user.id, paymentObj.credits, paymentObj.paymentId);
                localStorage.removeItem('pm_last_unclaimed_payment');
              }
            }
          } catch (e) {}

          setSuccessMsg('Welcome back! Redirecting...');
          setTimeout(() => {
            navigate(redirectTarget);
          }, 600);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setUserCredits(null);
    setSuccessMsg('You have been signed out.');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-white/10 selection:text-white">
      
      {/* Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight">
              Z
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">Zyvrok</span>
          </Link>
          <Link to="/" className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex flex-col justify-center">
        <SpotlightCard className="p-8 space-y-6">
          
          {currentUser ? (
            <div className="text-center space-y-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">You are signed in</h1>
                <p className="text-xs font-mono text-zinc-400 mt-1">{currentUser.email}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20 mt-3 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>{userCredits !== null ? userCredits : '...'} Credits Available</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/account')}
                  className="w-full py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  Go to Account Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/studio')}
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Open Studio
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-xs text-zinc-400 font-mono">
                  {isSignUp ? '50 free credits loaded upon signup' : 'Sign in to access your saved generations and credits'}
                </p>
                {pendingTier && (
                  <div className="pt-1">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Step 1 of 2: Sign in to complete {pendingTier === 'pro' ? '₹499 (150 Credits)' : '₹199 (50 Credits)'} checkout
                    </span>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full p-3 pl-9 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full p-3 pl-9 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                  </div>
                </div>

                <MagneticButton className="w-full pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{isSignUp ? 'Create Free Account (50 Credits)' : 'Sign In'}</span>
                    )}
                  </button>
                </MagneticButton>
              </form>

              <div className="text-center pt-2 border-t border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up Free"}
                </button>
              </div>
            </>
          )}

        </SpotlightCard>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-zinc-500 font-mono">
        <Link to="/legal" className="text-zinc-400 hover:text-white">Legal & Compliance</Link>
      </footer>

    </div>
  );
}

export default AuthPage;
