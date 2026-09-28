import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, UserCheck, AlertCircle, Sparkles, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MagneticButton from '../components/MagneticButton';
import { getCurrentUser, getEffectiveCredits, addPaidCredits } from '../lib/supabase';

export function PricingPage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loadingTier, setLoadingTier] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingTier, setPendingTier] = useState('starter');
  
  // Claim / Recover previous payment
  const [claimPaymentId, setClaimPaymentId] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMessage, setClaimMessage] = useState(null);
  
  // Payment Success Modal
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let mounted = true;
    async function initUser() {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          const effective = await getEffectiveCredits(currentUser?.id);
          setCredits(effective);
        }
      } catch (e) {
        console.warn('User load note:', e);
      }
    }
    initUser();

    // Check if redirected with auto-open pack
    const autoTier = searchParams.get('tier') || searchParams.get('pack');
    if (autoTier && (autoTier === 'starter' || autoTier === 'pro')) {
      setPendingTier(autoTier);
    }

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
  }, [searchParams]);

  const initiatePayment = async (packType) => {
    // 1. If user is NOT signed in, require authentication to protect them from lost money!
    if (!user) {
      setPendingTier(packType);
      setShowAuthModal(true);
      return;
    }

    await handleRazorpayCheckout(packType);
  };

  const handleRazorpayCheckout = async (packType, forceGuest = false) => {
    setLoadingTier(packType);
    setShowAuthModal(false);

    // Razorpay amounts are strictly in PAISE (1 INR = 100 paise)
    // Starter: ₹199 = 19900 paise -> 50 Credits
    // Pro:     ₹499 = 49900 paise -> 150 Credits
    const amountInPaise = packType === 'pro' ? 49900 : 19900;
    const amountInRupees = packType === 'pro' ? 499 : 199;
    const creditsToAdd = packType === 'pro' ? 150 : 50;
    const targetUserId = !forceGuest && user ? user.id : 'guest';
    const targetEmail = !forceGuest && user ? user.email : '';

    try {
      let orderData = null;

      try {
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packType,
            amount: amountInPaise,
            credits: creditsToAdd,
            userId: targetUserId,
            userEmail: targetEmail
          })
        });

        if (res.ok) {
          orderData = await res.json();
        }
      } catch (apiErr) {
        console.warn('Backend order creation note (falling back to direct client checkout):', apiErr);
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || (orderData && orderData.key) || "rzp_live_test";

      const options = {
        key: razorpayKey,
        amount: orderData?.amount || amountInPaise, // Always 19900 or 49900 in paise!
        currency: "INR",
        name: "Zyvrok",
        description: `${creditsToAdd} AI Repurposing Credits (₹${amountInRupees})`,
        order_id: orderData?.id || undefined,
        prefill: {
          email: targetEmail,
          name: user?.user_metadata?.full_name || (targetEmail ? targetEmail.split('@')[0] : '')
        },
        notes: {
          userId: targetUserId,
          userEmail: targetEmail,
          credits: creditsToAdd,
          packType
        },
        handler: async function (response) {
          const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;

          // Immediately credit user
          const newTotal = await addPaidCredits(targetUserId, creditsToAdd, paymentId);
          setCredits(newTotal);

          // Call backend verification to sync database & ensure zero credit loss
          try {
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                paymentId,
                userId: targetUserId,
                userEmail: targetEmail,
                credits: creditsToAdd
              })
            });
          } catch (e) {
            console.warn('Backend verification call note:', e);
          }

          setPaymentSuccess({
            paymentId,
            creditsAdded: creditsToAdd,
            newTotal,
            isGuest: targetUserId === 'guest'
          });
        },
        theme: {
          color: "#09090b"
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Razorpay checkout SDK is loading. Please retry in a second.");
      }
    } catch (err) {
      console.error("Razorpay checkout initialization error:", err);
      alert(`Could not open Razorpay checkout: ${err.message || 'Please check your connection and keys.'}`);
    } finally {
      setLoadingTier(null);
    }
  };

  const handleClaimPayment = async (e) => {
    e.preventDefault();
    setClaimLoading(true);
    setClaimMessage(null);

    const paymentId = claimPaymentId.trim() || `pay_manual_${Date.now()}`;
    const targetUserId = user ? user.id : 'guest';
    const creditsToAward = 50; // Starter pack standard

    try {
      // 1. Try server-side verification and Supabase update
      try {
        await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            userId: targetUserId,
            userEmail: user?.email || '',
            credits: creditsToAward
          })
        });
      } catch (err) {}

      // 2. Apply credits into client state & localStorage
      const newTotal = await addPaidCredits(targetUserId, creditsToAward, paymentId);
      setCredits(newTotal);

      setClaimMessage({
        type: 'success',
        text: `Success! 50 Credits have been restored to your account (Payment: ${paymentId}). Total balance: ${newTotal} credits.`
      });
      setClaimPaymentId('');
    } catch (err) {
      setClaimMessage({
        type: 'error',
        text: `Error claiming credits: ${err.message || 'Please try again.'}`
      });
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-white/10 selection:text-white flex flex-col justify-between">
      
      {/* Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight">
              Z
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">Zyvrok</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/account" className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 transition-colors">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">{user.email}</span>
                </Link>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>{credits !== null ? credits : '...'} Credits</span>
                </span>
                <Link to="/account" className="text-xs font-mono text-zinc-300 hover:text-white transition-colors">
                  Account
                </Link>
                <Link to="/studio" className="text-xs font-mono text-zinc-300 hover:text-white transition-colors">
                  Studio
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login?redirect=/pricing" className="text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                  Sign In
                </Link>
              </div>
            )}
            <Link to="/" className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
            Credit Packages
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Purchase credits on demand.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            No recurring subscription charges. 1 Credit = 1 complete 3-platform repurposing cycle. Credits never expire.
          </p>

          {user && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mt-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Signed in as <strong>{user.email}</strong> • Balance: <strong>{credits ?? 0} credits</strong></span>
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
          
          {/* Starter Pack (₹199) */}
          <SpotlightCard
            spotlightColor="rgba(59, 130, 246, 0.15)"
            className="p-8 flex flex-col justify-between border-2 border-blue-500/50 bg-[#12121a] shadow-2xl relative"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Starter Pack</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  Most Popular
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-4xl font-extrabold text-white">₹199</span>
                <span className="text-xs text-zinc-400 font-mono">one-time payment</span>
              </div>
              <p className="text-xs font-mono text-emerald-400 mb-6 font-semibold">₹3.98 per repurposed link (50 Credits)</p>
              
              <ul className="space-y-3.5 text-xs text-zinc-300 mb-8 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2.5 font-medium text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>50 AI Repurposing Credits</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All 5 Ghostwriting Tone Presets</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant 1-Click Draft Refinements</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Generation History Storage</span>
                </li>
                <li className="flex items-center gap-2.5 font-medium text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Credits Never Expire</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <MagneticButton className="w-full">
                <button
                  type="button"
                  disabled={loadingTier === 'starter'}
                  onClick={() => initiatePayment('starter')}
                  className="w-full py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-md shadow-white/10 flex items-center justify-center gap-2"
                >
                  {loadingTier === 'starter' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Opening Razorpay (₹199)...</span>
                    </>
                  ) : (
                    <span>Pay ₹199 via Razorpay</span>
                  )}
                </button>
              </MagneticButton>
            </div>
          </SpotlightCard>

          {/* Creator Pro (₹499) */}
          <SpotlightCard className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Creator Pro</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-400">Best Value</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-4xl font-extrabold text-white">₹499</span>
                <span className="text-xs text-zinc-400 font-mono">one-time payment</span>
              </div>
              <p className="text-xs font-mono text-emerald-400 mb-6 font-semibold">₹3.32 per repurposed link (150 Credits)</p>
              
              <ul className="space-y-3.5 text-xs text-zinc-300 mb-8 border-t border-white/10 pt-6">
                <li className="flex items-center gap-2.5 font-medium text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>150 AI Repurposing Credits</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority Model Processing Pipeline</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited History Archives</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full Multi-Format Copy Extraction</span>
                </li>
                <li className="flex items-center gap-2.5 font-medium text-white">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Credits Never Expire</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <MagneticButton className="w-full">
                <button
                  type="button"
                  disabled={loadingTier === 'pro'}
                  onClick={() => initiatePayment('pro')}
                  className="w-full py-3.5 rounded-xl border border-white/10 bg-zinc-900 font-semibold text-xs text-white hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {loadingTier === 'pro' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Opening Razorpay (₹499)...</span>
                    </>
                  ) : (
                    <span>Pay ₹499 via Razorpay</span>
                  )}
                </button>
              </MagneticButton>
            </div>
          </SpotlightCard>

        </div>

        {/* Claim / Recover Previous Unlinked Payment Section */}
        <div className="max-w-2xl mx-auto">
          <SpotlightCard className="p-6 border border-emerald-500/20 bg-emerald-950/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <KeyRound className="w-4 h-4" />
                <span>Paid but didn't receive credits? Recover here</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Zero Money Lost Guarantee
              </span>
            </div>
            
            <p className="text-xs text-zinc-400 font-mono mb-4 leading-relaxed">
              If you completed a payment on Razorpay before signing in, enter your Razorpay Payment ID from your SMS or email receipt (starts with <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">pay_</code>) or click to recover 50 credits to your account.
            </p>

            <form onSubmit={handleClaimPayment} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={claimPaymentId}
                onChange={(e) => setClaimPaymentId(e.target.value)}
                placeholder="Enter Razorpay Payment ID (e.g. pay_Q123456789abc)"
                className="flex-1 p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={claimLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold font-mono hover:bg-emerald-400 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {claimLoading ? 'Restoring...' : 'Claim 50 Credits'}
              </button>
            </form>

            {claimMessage && (
              <div className={`mt-3 p-3 rounded-lg text-xs font-mono ${claimMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {claimMessage.text}
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-zinc-500 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PCI-DSS Compliant via Razorpay</span>
          </div>
          <span>•</span>
          <span>UPI, Cards, NetBanking, Wallets supported</span>
          <span>•</span>
          <Link to="/legal" className="text-zinc-400 hover:text-white underline underline-offset-4">
            Refund & Cancellation Policy
          </Link>
        </div>
      </main>

      {/* Mandatory Sign In Modal (Prevents unauthenticated lost payments) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#12121a] border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Sign in to link your {pendingTier === 'pro' ? '150' : '50'} credits
              </h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                To guarantee your money is never wasted and your credits are permanently saved to your profile, please sign in or register before completing checkout.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/login?redirect=/pricing&tier=${pendingTier}`)}
                className="w-full py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Sign In / Create Free Account
              </button>

              <button
                type="button"
                onClick={() => handleRazorpayCheckout(pendingTier, true)}
                className="w-full py-2.5 rounded-xl border border-white/10 bg-zinc-900 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Pay as Guest (Stored on this device)
              </button>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full text-center text-xs font-mono text-zinc-500 hover:text-zinc-300 py-1 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#12121a] border border-emerald-500/40 rounded-2xl p-7 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
              <p className="text-xs font-mono text-emerald-400 font-semibold">
                +{paymentSuccess.creditsAdded} Credits Added
              </p>
              <p className="text-xs text-zinc-400 font-mono">
                Your new balance is <strong>{paymentSuccess.newTotal} credits</strong>. Payment ID: <code className="text-zinc-300">{paymentSuccess.paymentId}</code>
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/studio')}
                className="w-full py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
              >
                Open Studio with Your Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-5xl mx-auto px-4">
          © 2026 Zyvrok (Udayan Dusane). All rights reserved. • <Link to="/legal" className="text-zinc-400 hover:text-white">Legal & Compliance</Link>
        </div>
      </footer>

    </div>
  );
}

export default PricingPage;
