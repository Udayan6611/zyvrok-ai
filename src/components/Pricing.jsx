import React, { useState } from "react";
import MagneticButton from "./ui/MagneticButton";
import SpotlightCard from "./ui/SpotlightCard";
import ShimmerBadge from "./ui/ShimmerBadge";
import { supabase } from "../lib/supabase";

export default function Pricing({ user, onCreditsUpdated }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const handlePurchase = async (planType) => {
    setLoadingPlan(planType);
    setPaymentSuccess(null);

    const isPro = planType === "pro";
    const amount = isPro ? 49900 : 19900;
    const credits = isPro ? 150 : 50;
    const userId = user?.id || "guest";

    try {
      // 1. Call Vercel serverless order creation API
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          userId,
          credits
        })
      });

      const orderData = await res.json();

      if (window.Razorpay) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_TZSKiYI4f4GyW8",
          amount: orderData.amount || amount,
          currency: "INR",
          name: "Zyvrok AI",
          description: `${credits} Credits Pack`,
          order_id: orderData.id,
          handler: async function (response) {
            // Update credits in Supabase if logged in
            if (user?.id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("credits")
                .eq("id", user.id)
                .single();
              
              const newTotal = (profile?.credits || 0) + credits;
              await supabase
                .from("profiles")
                .update({ credits: newTotal })
                .eq("id", user.id);

              onCreditsUpdated(newTotal);
            } else {
              const currentLocal = parseInt(localStorage.getItem("pm_guest_credits") || "10", 10);
              const newLocal = currentLocal + credits;
              localStorage.setItem("pm_guest_credits", String(newLocal));
              onCreditsUpdated(newLocal);
            }

            setPaymentSuccess(`Payment successful! ${credits} credits added to your balance.`);
          },
          prefill: {
            email: user?.email || ""
          },
          theme: {
            color: "#2563EB"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback for environment testing if Razorpay script isn't loaded
        const currentLocal = parseInt(localStorage.getItem("pm_guest_credits") || "10", 10);
        const newLocal = currentLocal + credits;
        localStorage.setItem("pm_guest_credits", String(newLocal));
        onCreditsUpdated(newLocal);
        setPaymentSuccess(`Simulated Sandbox: ${credits} credits added.`);
      }
    } catch (err) {
      console.error("Order error:", err);
      // Fallback sandbox test credit update
      const currentLocal = parseInt(localStorage.getItem("pm_guest_credits") || "10", 10);
      const newLocal = currentLocal + credits;
      localStorage.setItem("pm_guest_credits", String(newLocal));
      onCreditsUpdated(newLocal);
      setPaymentSuccess(`Sandbox Mode: ${credits} credits added to balance.`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-16">
        <ShimmerBadge className="mb-4">
          Transparent Pricing • Pay As You Go
        </ShimmerBadge>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
          Simple, Transparent Credit Packs
        </h2>
        <p className="mt-4 text-base text-text-secondary max-w-xl mx-auto">
          No mandatory monthly subscriptions. Buy credits when you need them. 1 credit = 1 full repurpose cycle (LinkedIn post + Twitter thread + Newsletter blurb).
        </p>

        {paymentSuccess && (
          <div className="mt-6 max-w-md mx-auto p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2">
            <span>✓</span> {paymentSuccess}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Starter Pack */}
        <SpotlightCard className="p-8 flex flex-col justify-between border-border-crisp">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
                Starter Pack
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-subtle text-text-secondary">
                ₹3.98 / repurpose
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold text-text-primary tracking-tight">₹199</span>
              <span className="text-xs text-text-muted font-mono">one-time</span>
            </div>

            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              Ideal for solo builders, freelancers, and engineers who repurpose 2-3 pieces of content each week.
            </p>

            <ul className="space-y-3 text-xs text-text-secondary mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> 50 Full Content Repurposes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> LinkedIn + X Thread + Newsletter Output
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> All Tones (Thought Leader, Contrarian, Technical)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Generation History Storage
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Credits Never Expire
              </li>
            </ul>
          </div>

          <MagneticButton
            onClick={() => handlePurchase("starter")}
            disabled={loadingPlan === "starter"}
            className="w-full py-3 rounded-xl bg-text-primary text-white font-semibold text-sm hover:bg-text-primary/90 shadow-xs"
          >
            {loadingPlan === "starter" ? "Initiating..." : "Get Starter Pack (₹199)"}
          </MagneticButton>
        </SpotlightCard>

        {/* Creator Pro Pack */}
        <SpotlightCard className="p-8 flex flex-col justify-between border-2 border-primary/40 relative bg-blue-50/20 shadow-lg">
          <div className="absolute -top-3 right-6 px-3 py-1 bg-primary text-white font-mono text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
            Most Popular
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                Creator Pro Pack
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold">
                ₹3.32 / repurpose
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold text-text-primary tracking-tight">₹499</span>
              <span className="text-xs text-text-muted font-mono">one-time</span>
            </div>

            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
              Designed for agency operators, active tech founders, and frequent content publishers.
            </p>

            <ul className="space-y-3 text-xs text-text-secondary mb-8">
              <li className="flex items-center gap-2 font-medium text-text-primary">
                <span className="text-emerald-500 font-bold">✓</span> 150 Full Content Repurposes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Priority Groq LPU Inference Queue
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Multi-Channel Output Engine
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Custom Formatting Rules
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Unlimited History Storage
              </li>
              <li className="flex items-center gap-2 font-medium text-primary">
                <span className="text-emerald-500 font-bold">✓</span> Save 17% Compared to Starter Pack
              </li>
            </ul>
          </div>

          <MagneticButton
            onClick={() => handlePurchase("pro")}
            disabled={loadingPlan === "pro"}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container shadow-md shadow-blue-500/25"
          >
            {loadingPlan === "pro" ? "Initiating..." : "Get Creator Pro (₹499)"}
          </MagneticButton>
        </SpotlightCard>

      </div>
    </div>
  );
}
