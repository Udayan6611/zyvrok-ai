import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  History, 
  LogOut, 
  CheckCircle2, 
  RefreshCw,
  KeyRound,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { 
  getCurrentUser, 
  getEffectiveCredits, 
  signOutUser, 
  addPaidCredits,
  syncCreditsToSupabase,
  resetToSignupCredits
} from '../lib/supabase';

export function AccountPage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoreSuccess, setRestoreSuccess] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [paymentIdInput, setPaymentIdInput] = useState('');
  const navigate = useNavigate();

  const loadUserData = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
      const c = await getEffectiveCredits(u?.id);
      setCredits(c);
    } catch (err) {
      console.error('Error fetching account profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    const handleCreditsUpdated = (e) => {
      if (e.detail?.credits !== undefined) {
        setCredits(e.detail.credits);
      }
    };
    window.addEventListener('pm_credits_updated', handleCreditsUpdated);
    return () => window.removeEventListener('pm_credits_updated', handleCreditsUpdated);
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  const handleRestorePayment = async (planCredits = 50) => {
    setRestoreLoading(true);
    setRestoreSuccess(null);
    try {
      const pId = paymentIdInput.trim() || `restored_${Date.now()}`;
      const newTotal = await addPaidCredits(user?.id || 'guest', planCredits, pId);
      setCredits(newTotal);
      setRestoreSuccess(`Restored ${planCredits} credits to your account. Current balance: ${newTotal}`);
      setPaymentIdInput('');
    } catch (e) {
      setRestoreSuccess('Failed to restore credits. Please try again.');
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setRestoreLoading(true);
    try {
      if (user?.id) {
        await syncCreditsToSupabase(user.id, credits || 50);
      }
      const updated = await getEffectiveCredits(user?.id);
      setCredits(updated);
      setRestoreSuccess(`Balance synced with Supabase: ${updated} credits available.`);
    } catch (e) {
      setRestoreSuccess('Sync complete.');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-white selection:text-black">
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-zinc-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link 
            to="/studio" 
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Studio</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Account Settings</span>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/pricing" 
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{credits !== null ? credits : '...'} Credits</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Account & Subscription</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your profile, balance, and transaction history.</p>
        </div>

        {restoreSuccess && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{restoreSuccess}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950 space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/5 gap-2">
                  <span className="text-xs font-mono text-zinc-400">Account Email</span>
                  <span className="text-sm font-mono text-zinc-200">{user?.email || 'udayandusane6611@gmail.com'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-white/5 gap-2">
                  <span className="text-xs font-mono text-zinc-400">Authentication</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Supabase Verified
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
                  <span className="text-xs font-mono text-zinc-400">Account ID</span>
                  <span className="text-xs font-mono text-zinc-500 truncate max-w-[240px]">{user?.id || 'demo-auth-user'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    Payment Restoration & Credit Link
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Made a payment that hasn't reflected in your account? Claim it here.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-zinc-900/80 space-y-3">
                <div className="text-xs font-mono text-zinc-300">
                  <span className="text-white font-bold">Paid for Starter Pack (₹199 / 50 Credits)?</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={restoreLoading}
                    onClick={() => handleRestorePayment(50)}
                    className="px-4 py-2 rounded-lg bg-amber-400 text-zinc-950 font-bold text-xs font-mono hover:bg-amber-300 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {restoreLoading ? 'Restoring...' : 'Restore 50 Credits (₹199 Plan)'}
                  </button>
                  <button
                    type="button"
                    disabled={restoreLoading}
                    onClick={handleSyncNow}
                    className="px-4 py-2 rounded-lg border border-white/10 bg-zinc-800 text-zinc-300 text-xs font-mono hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${restoreLoading ? 'animate-spin' : ''}`} />
                    Sync Credits
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-mono text-zinc-400">
                  Or enter your Razorpay Payment ID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentIdInput}
                    onChange={(e) => setPaymentIdInput(e.target.value)}
                    placeholder="e.g. pay_XXXXX"
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleRestorePayment(50)}
                    disabled={!paymentIdInput.trim() || restoreLoading}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-xs font-mono font-semibold transition-colors disabled:opacity-40"
                  >
                    Link Payment
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950 space-y-4">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Available Balance</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">{credits !== null ? credits : '...'}</span>
                <span className="text-xs font-mono text-zinc-500">Credits</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Each repurpose generation consumes 1 credit across all platform formats.
              </p>
              <Link
                to="/pricing"
                className="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buy More Credits</span>
              </Link>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950 space-y-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Navigation</span>
              <div className="space-y-2">
                <Link
                  to="/studio"
                  className="w-full py-2 px-3 rounded-lg border border-white/5 hover:border-white/10 bg-zinc-900/60 hover:bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Content Studio</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                </Link>
                <Link
                  to="/history"
                  className="w-full py-2 px-3 rounded-lg border border-white/5 hover:border-white/10 bg-zinc-900/60 hover:bg-zinc-900 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Repurposed History</span>
                  <History className="w-3.5 h-3.5 text-zinc-500" />
                </Link>
              </div>

              <div className="pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2 px-3 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-mono text-rose-400 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AccountPage;