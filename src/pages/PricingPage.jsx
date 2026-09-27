import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MagneticButton from '../components/MagneticButton';

export function PricingPage() {
  const [loadingTier, setLoadingTier] = useState(null);

  const handleCheckout = async (packType, amount) => {
    setLoadingTier(packType);
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packType, amount })
      });

      if (!res.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await res.json();
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_test",
        amount: orderData.amount,
        currency: "INR",
        name: "Zyvrok",
        description: `${packType === 'starter' ? '50 Credits' : '150 Credits'} Content Pack`,
        order_id: orderData.id,
        handler: function (response) {
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          window.location.href = '/studio';
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
      console.warn("Direct checkout simulation or API response:", err);
      alert(`Initializing Razorpay checkout for ₹${amount} (${packType}). Verify your environment keys in production.`);
    } finally {
      setLoadingTier(null);
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
          <Link to="/" className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex-1 w-full space-y-12">
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
              <p className="text-xs font-mono text-emerald-400 mb-6 font-semibold">₹3.98 per repurposed link</p>
              
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
                  onClick={() => handleCheckout('starter', 199)}
                  className="w-full py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-md shadow-white/10"
                >
                  {loadingTier === 'starter' ? 'Connecting to Razorpay...' : 'Pay ₹199 via Razorpay'}
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
              <p className="text-xs font-mono text-emerald-400 mb-6 font-semibold">₹3.32 per repurposed link</p>
              
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
                  onClick={() => handleCheckout('pro', 499)}
                  className="w-full py-3.5 rounded-xl border border-white/10 bg-zinc-900 font-semibold text-xs text-white hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  {loadingTier === 'pro' ? 'Connecting to Razorpay...' : 'Pay ₹499 via Razorpay'}
                </button>
              </MagneticButton>
            </div>
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
