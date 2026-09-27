import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';

export function LegalPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-white/10 selection:text-white flex flex-col justify-between">
      
      {/* Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-14 flex-1 space-y-10 w-full">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-white/10 text-zinc-400 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compliance & Policies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Legal, Terms of Service & Refund Policy
          </h1>
          <p className="text-xs font-mono text-zinc-500 mt-2">
            Last updated: September 2026 • Registered in Pune, Maharashtra, India
          </p>
        </div>

        {/* Section 1: Merchant & Business Details */}
        <SpotlightCard className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2>1. Merchant & Business Details</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-zinc-300 pt-2">
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/10">
              <span className="text-zinc-500 block mb-1">Entity / Trade Name</span>
              <span className="font-bold text-white">Zyvrok</span>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/10">
              <span className="text-zinc-500 block mb-1">Operating Founder</span>
              <span className="font-bold text-white">Udayan Dusane</span>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/10">
              <span className="text-zinc-500 block mb-1">Operating Jurisdiction</span>
              <span className="font-bold text-white">Pune, Maharashtra, India</span>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/10">
              <span className="text-zinc-500 block mb-1">Official Support Desk</span>
              <a href="mailto:udayandusane9604@gmail.com" className="text-blue-400 hover:underline font-bold flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5 inline" />
                <span>udayandusane9604@gmail.com</span>
              </a>
            </div>
          </div>
        </SpotlightCard>

        {/* Section 2: Cancellation & Refund Policy */}
        <SpotlightCard className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <h2>2. Cancellation & Refund Policy</h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans pt-1">
            <p>
              At Zyvrok, we operate an instant digital credit delivery model. All credit packs purchased (including the ₹199 Starter Pack and ₹499 Creator Pro Pack) are immediately credited to the purchaser's authenticated profile balance upon successful transaction verification through Razorpay.
            </p>
            <p>
              <strong>Refund Eligibility:</strong> Because compute resources and language model inference fees are incurred upon content processing, credit packs that have been partially or fully utilized are non-refundable. However, if you experience a technical failure where credits were deducted without producing output, or if you were charged twice for an order, please email <a href="mailto:udayandusane9604@gmail.com" className="text-blue-400 hover:underline">udayandusane9604@gmail.com</a> with your Payment ID within 7 business days. We will investigate and process a full refund or credit restoration within 5-7 working days.
            </p>
          </div>
        </SpotlightCard>

        {/* Section 3: Terms of Service */}
        <SpotlightCard className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <h2>3. Terms of Service</h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans pt-1">
            <p>
              By accessing Zyvrok Studio, you agree to comply with our fair-use standards. You retain full commercial ownership of all output generated from your own original inputs or public videos you are legally authorized to review. You agree not to use the service to generate deceptive, hateful, or unlawful materials.
            </p>
            <p>
              Zyvrok does not guarantee specific social media reach or engagement metrics resulting from published copy. Service availability is maintained on best-effort production standards.
            </p>
          </div>
        </SpotlightCard>

        {/* Section 4: Privacy Policy */}
        <SpotlightCard className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2>4. Privacy Policy</h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans pt-1">
            <p>
              We do not sell, rent, or trade your personal data. User email addresses and generated content archives are securely stored in Supabase PostgreSQL databases protected by Row-Level Security (RLS) policies. Payment details are processed directly and securely via Razorpay's PCI-DSS compliant checkout and are never stored on our application servers.
            </p>
          </div>
        </SpotlightCard>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-4xl mx-auto px-4">
          © 2026 Zyvrok (Udayan Dusane). All rights reserved. • <Link to="/" className="text-zinc-400 hover:text-white">Return to Home</Link>
        </div>
      </footer>

    </div>
  );
}

export default LegalPage;
