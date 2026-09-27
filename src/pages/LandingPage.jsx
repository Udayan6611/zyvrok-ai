import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MagneticButton from '../components/MagneticButton';
import ShimmerBadge from '../components/ShimmerBadge';

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('linkedin');

  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b] text-[#fafafa] selection:bg-white/10 selection:text-white overflow-x-hidden">
      
      {/* Ambient Background Lighting Beam */}
      <div className="ambient-beam" />

      {/* Hero Section */}
      <section className="pt-24 pb-20 border-b border-white/10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          
          {/* Shimmer Status Pill */}
          <div className="mb-8">
            <ShimmerBadge text="High-Density Content Repurposing Studio" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Turn raw video and text into ready-to-publish social copy.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Extract transcripts from YouTube or blog URLs. Zyvrok formats them into a 3-part distribution bundle: LinkedIn post, X thread, and newsletter summary.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <MagneticButton>
              <Link
                to="/studio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
              >
                <span>Start in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <a
                href="#pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-zinc-900/80 border border-white/10 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
              >
                View Pricing (from ₹199)
              </a>
            </MagneticButton>
          </div>

          {/* Real Metrics Strip */}
          <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-white font-bold">5</span>
              <span>Free trial credits</span>
            </div>
            <span className="text-white/20 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">3</span>
              <span>Platform outputs in 1 click</span>
            </div>
            <span className="text-white/20 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">₹0</span>
              <span>Recurring subscription fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Window Frame (Real Studio Representation) */}
      <section id="preview" className="py-20 border-b border-white/10 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Studio Interface</span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">One input. Three publication-ready drafts.</h2>
            </div>
            <Link to="/studio" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
              <span>Open live studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Studio Window Container Frame using SpotlightCard */}
          <SpotlightCard className="p-0 overflow-hidden shadow-2xl border-white/10">
            {/* Window Chrome */}
            <div className="bg-[#14141a] px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 font-mono text-[11px] text-zinc-400">zyvrok-ai.vercel.app/studio</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Workspace Ready</span>
                </span>
              </div>
            </div>

            {/* Studio Mockup Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10 text-left">
              
              {/* Left Config Panel */}
              <div className="lg:col-span-5 p-6 space-y-5 bg-[#0f0f14]">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-400 mb-2">Input Source</label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-xl border border-white/10 text-center text-xs font-medium">
                    <span className="py-1.5 text-zinc-400">Text</span>
                    <span className="py-1.5 text-zinc-400">Article</span>
                    <span className="py-1.5 bg-white text-zinc-950 font-bold rounded-lg shadow-sm">YouTube</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-400 mb-2">Source URL</label>
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-300 break-all">
                    https://youtube.com/watch?v=kCc8FmEb1nY
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono mt-1.5">Andrej Karpathy: State of GPT & LLM Pipelines (Transcript extracted)</p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-400 mb-2">Framework & Tone</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                    <span className="p-2.5 rounded-xl border border-white/20 bg-white/5 text-white font-semibold flex items-center justify-between">
                      <span>Thought Leader</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    </span>
                    <span className="p-2.5 rounded-xl border border-white/10 text-zinc-400 bg-zinc-900/40">Contrarian</span>
                    <span className="p-2.5 rounded-xl border border-white/10 text-zinc-400 bg-zinc-900/40">Technical</span>
                    <span className="p-2.5 rounded-xl border border-white/10 text-zinc-400 bg-zinc-900/40">Storytelling</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">Cost: 1 Credit</span>
                  <MagneticButton>
                    <Link
                      to="/studio"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors shadow-sm"
                    >
                      <span>Morph Content</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </MagneticButton>
                </div>
              </div>

              {/* Right Output Draft Editor */}
              <div className="lg:col-span-7 p-6 space-y-4 bg-[#0d0d12] flex flex-col justify-between">
                <div>
                  {/* Tabs */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setActiveTab('linkedin')}
                        className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                          activeTab === 'linkedin'
                            ? 'bg-white text-zinc-950 font-bold shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        LinkedIn Post
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('twitter')}
                        className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                          activeTab === 'twitter'
                            ? 'bg-white text-zinc-950 font-bold shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        X Thread (5)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('newsletter')}
                        className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                          activeTab === 'newsletter'
                            ? 'bg-white text-zinc-950 font-bold shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Newsletter
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {activeTab === 'linkedin' && '184 words · 1,142 chars'}
                      {activeTab === 'twitter' && '5 tweets · 142 words'}
                      {activeTab === 'newsletter' && '122 words · 790 chars'}
                    </span>
                  </div>

                  {/* Refine Action Bar (Clean tags, NO tacky emojis) */}
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 pb-3 mb-4 border-b border-white/10 overflow-x-auto">
                    <span className="text-zinc-400 font-medium">Refine:</span>
                    <span className="px-2.5 py-1 rounded-md border border-white/10 bg-zinc-900/60 text-zinc-300">Condense</span>
                    <span className="px-2.5 py-1 rounded-md border border-white/10 bg-zinc-900/60 text-zinc-300">Sharpen Hook</span>
                    <span className="px-2.5 py-1 rounded-md border border-white/10 bg-zinc-900/60 text-zinc-300">Contrarian Lens</span>
                  </div>

                  {/* Tab Contents */}
                  {activeTab === 'linkedin' && (
                    <div className="text-xs text-zinc-200 font-sans leading-relaxed space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-white/10">
                      <p className="font-bold text-white">
                        Most teams build AI wrappers without understanding where inference economics break down.
                      </p>
                      <p className="text-zinc-400">
                        In Karpathy's architecture review, three operational constraints determine whether a generative application survives production scale:
                      </p>
                      <div className="space-y-1.5 pl-3 border-l-2 border-white/20 font-mono text-[11px] text-zinc-300">
                        <p>1. Pretraining teaches world models; fine-tuning only adjusts the conversational format.</p>
                        <p>2. Reinforcement learning from human feedback introduces alignment tax and hallucinations.</p>
                        <p>3. Context window retrieval is not memory—it is working scratchpad space.</p>
                      </div>
                      <p className="text-zinc-400">
                        Optimize your pipeline for context precision rather than model parameter scale. The real edge is retrieval density.
                      </p>
                    </div>
                  )}

                  {activeTab === 'twitter' && (
                    <div className="text-xs text-zinc-200 font-sans leading-relaxed space-y-2.5 bg-zinc-900/40 p-4 rounded-xl border border-white/10">
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">1/5</span>
                        <p>Most teams build AI wrappers without understanding where inference economics break down.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">2/5</span>
                        <p>Rule 1: Pretraining teaches world models; fine-tuning only adjusts conversational format.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1">3/5</span>
                        <p>Rule 2: Context window retrieval is not memory—it is scratchpad memory. Keep retrieval dense.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'newsletter' && (
                    <div className="text-xs text-zinc-200 font-sans leading-relaxed space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-white/10">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider block">Executive Brief</span>
                      <p className="font-bold text-white">The Real Economics of Edge vs Cloud Inference</p>
                      <p className="text-zinc-400">
                        Karpathy highlights that teams prioritizing raw model size over contextual density end up with unsustainable operational expenditure. Decoupling the retrieval pipeline from generation yields 3x faster response times with negligible hallucination drift.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer of Preview */}
                <div className="pt-4 flex items-center justify-between border-t border-white/10 text-xs">
                  <span className="text-[11px] font-mono text-zinc-400">Interactive draft editor active</span>
                  <Link
                    to="/studio"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900 font-semibold text-white text-xs hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    <span>Open in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Core Features / Bento Grid */}
      <section id="features" className="py-24 border-b border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Engine Capabilities</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
              Designed for high-signal publishing across multiple channels.
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Generic AI tools output surface-level summaries. Zyvrok isolates the underlying argument and reconstructs it using native platform psychology.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 (Span 2) */}
            <SpotlightCard className="md:col-span-2 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">01 · Multi-Platform Atomization</span>
                  <span className="text-[11px] font-mono text-zinc-400">Single Extraction Pipeline</span>
                </div>
                <h3 className="text-2xl font-bold text-white">One URL yields three distinct, platform-native deliverables.</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Paste a public YouTube link or blog article URL. Zyvrok parses the core text or transcript and generates:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-1">
                    <span className="font-bold text-white block">LinkedIn Post</span>
                    <span className="text-zinc-400 text-[11px]">2-line scroll-stopping hook, friction analysis, actionable bullets.</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-1">
                    <span className="font-bold text-white block">X / Twitter Thread</span>
                    <span className="text-zinc-400 text-[11px]">5 to 6 standalone tweets with narrative pacing and bookmark incentives.</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 space-y-1">
                    <span className="font-bold text-white block">Newsletter Brief</span>
                    <span className="text-zinc-400 text-[11px]">Executive summary for Substack, Beehiiv, or internal team briefings.</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* Card 2 (Span 1) */}
            <SpotlightCard className="p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">02 · Ghostwriting Frameworks</span>
                <h3 className="text-xl font-bold text-white">No robotic AI clichés.</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Our prompt pipeline strictly bans generic language like "game changer", "delve into", or empty filler. Tone presets include Thought Leader, Contrarian, Technical, Casual, and Storytelling.
                </p>
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/10 text-[11px] font-mono text-zinc-400">
                  0 markdown asterisks in social text, clean spacing, and clear arguments.
                </div>
              </div>
            </SpotlightCard>

            {/* Card 3 (Span 1) */}
            <SpotlightCard className="p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">03 · In-App Draft Editor</span>
                <h3 className="text-xl font-bold text-white">Refine copy before copying.</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Edit text directly in the output pane. Use 1-click refinement buttons to shorten copy, strengthen the opening hook, or reframe the thesis with a contrarian perspective.
                </p>
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono text-zinc-300">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-white/10">Condense</span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-white/10">Sharpen Hook</span>
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-white/10">Contrarian</span>
                </div>
              </div>
            </SpotlightCard>

            {/* Card 4 (Span 2) */}
            <SpotlightCard className="md:col-span-2 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">04 · Cloud History & Database</span>
                  <span className="text-[11px] font-mono text-zinc-400">Supabase PostgreSQL Backing</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Every generation is safely archived and searchable.</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Never lose an idea. Every morphed draft is stored in your private history. Search previous outputs, re-copy snippets, and maintain a centralized library across desktop and mobile devices.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">• Row Level Security (RLS) protected</span>
                  <span>• 1-Click Clipboard snippet copy</span>
                  <span>• Device cross-sync</span>
                </div>
              </div>
            </SpotlightCard>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-b border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Predictable Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">Pay only for what you repurpose.</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">No recurring subscriptions or hidden cancellation terms. Credits never expire.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Tier 1: Free Trial */}
            <SpotlightCard className="p-7 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Free Trial</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-400">No card needed</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-3xl font-extrabold text-white">₹0</span>
                  <span className="text-xs text-zinc-400 font-mono">one-time</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  Test out the extraction pipeline and tone engine on your own video or article drafts.
                </p>
                <ul className="space-y-3 text-xs text-zinc-400 mb-8 border-t border-white/10 pt-5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> 5 Full Repurpose Cycles
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> LinkedIn + X Thread + Newsletter
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Access to Thought Leader Tone
                  </li>
                </ul>
              </div>
              <div className="pt-4">
                <MagneticButton className="w-full">
                  <Link
                    to="/login"
                    className="w-full block text-center py-2.5 rounded-xl border border-white/10 bg-zinc-900 font-semibold text-xs text-white hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    Sign Up Free
                  </Link>
                </MagneticButton>
              </div>
            </SpotlightCard>

            {/* Tier 2: Starter Pack (FEATURED HERO CARD) */}
            <SpotlightCard
              spotlightColor="rgba(59, 130, 246, 0.15)"
              className="p-7 sm:p-8 flex flex-col justify-between border-2 border-blue-500/50 bg-[#13131c] shadow-2xl relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Starter Pack</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                    Most Popular
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-3xl font-extrabold text-white">₹199</span>
                  <span className="text-xs text-zinc-400 font-mono">one-time payment</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  For active founders, tech creators, and ghostwriters building organic audience distribution.
                </p>
                <ul className="space-y-3 text-xs text-zinc-300 mb-8 border-t border-white/10 pt-5">
                  <li className="flex items-center gap-2 font-medium text-white">
                    <Check className="w-4 h-4 text-emerald-400" /> 50 Credits (₹3.98 / repurpose)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> All 5 Ghostwriting Tone Presets
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Instant In-App Draft Refinements
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Generation History Storage
                  </li>
                  <li className="flex items-center gap-2 font-medium text-white">
                    <Check className="w-4 h-4 text-emerald-400" /> Credits Never Expire
                  </li>
                </ul>
              </div>
              <div className="pt-4">
                <MagneticButton className="w-full">
                  <Link
                    to="/pricing"
                    className="w-full block text-center py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-md shadow-white/10"
                  >
                    Get 50 Credits (₹199)
                  </Link>
                </MagneticButton>
              </div>
            </SpotlightCard>

            {/* Tier 3: Creator Pro */}
            <SpotlightCard className="p-7 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Creator Pro</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-400">Best Value</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-3xl font-extrabold text-white">₹499</span>
                  <span className="text-xs text-zinc-400 font-mono">one-time payment</span>
                </div>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                  High-volume content engines for agencies, growth consultants, and active newsletter writers.
                </p>
                <ul className="space-y-3 text-xs text-zinc-400 mb-8 border-t border-white/10 pt-5">
                  <li className="flex items-center gap-2 font-medium text-white">
                    <Check className="w-4 h-4 text-emerald-400" /> 150 Credits (₹3.32 / repurpose)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Priority Generation Pipeline
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Unlimited History Archives
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> Multi-Format Copy Extraction
                  </li>
                </ul>
              </div>
              <div className="pt-4">
                <MagneticButton className="w-full">
                  <Link
                    to="/pricing"
                    className="w-full block text-center py-2.5 rounded-xl border border-white/10 bg-zinc-900 font-semibold text-xs text-white hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    Get 150 Credits (₹499)
                  </Link>
                </MagneticButton>
              </div>
            </SpotlightCard>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 border-b border-white/10 relative z-10 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to turn your reading and watching into leverage?
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            No setup fees, no recurring credit cards. Start with 5 free credits right now.
          </p>
          <div className="pt-2">
            <MagneticButton>
              <Link
                to="/studio"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
              >
                <span>Open Repurpose Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
