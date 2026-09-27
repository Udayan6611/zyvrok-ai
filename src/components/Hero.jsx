import React, { useState } from "react";
import MagneticButton from "./ui/MagneticButton";
import SpotlightCard from "./ui/SpotlightCard";
import ShimmerBadge from "./ui/ShimmerBadge";

export default function Hero({ onStartStudio, onOpenPricing }) {
  const [activePreviewTab, setActivePreviewTab] = useState("linkedin");

  return (
    <div className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-400/10 via-emerald-400/5 to-purple-400/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Tagline / Pill */}
        <div className="text-center mb-6">
          <ShimmerBadge>
            Zyvrok Engine v2.4 • Powered by Groq Llama 3.3
          </ShimmerBadge>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
            Turn Any URL or Video Into{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Platform-Native Viral Content
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Stop manually summarizing articles and YouTube videos. Zyvrok distills high-signal takeaways into viral LinkedIn posts, punchy X/Twitter threads, and executive newsletter blurbs in 3 seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              onClick={onStartStudio}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container shadow-lg shadow-blue-500/25 gap-2"
            >
              <span>Start Repurposing Free</span>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </MagneticButton>

            <MagneticButton
              onClick={onOpenPricing}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-border-crisp text-text-primary font-semibold text-sm hover:bg-subtle shadow-xs"
            >
              View Credit Packs (From ₹199)
            </MagneticButton>
          </div>
        </div>

        {/* Interactive Feature Demo / Preview Showcase */}
        <div className="max-w-5xl mx-auto mt-12">
          <SpotlightCard className="p-4 sm:p-6 bg-white/90 backdrop-blur-sm border-border-crisp shadow-xl">
            <div className="flex items-center justify-between border-b border-border-crisp pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                <span className="ml-2 text-xs font-mono text-text-muted">Live Output Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-subtle p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActivePreviewTab("linkedin")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activePreviewTab === "linkedin"
                      ? "bg-white text-text-primary font-semibold shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => setActivePreviewTab("twitter")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activePreviewTab === "twitter"
                      ? "bg-white text-text-primary font-semibold shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Twitter / X Thread
                </button>
                <button
                  onClick={() => setActivePreviewTab("newsletter")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activePreviewTab === "newsletter"
                      ? "bg-white text-text-primary font-semibold shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Newsletter Blurb
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-base rounded-xl border border-border-crisp font-sans text-sm leading-relaxed text-text-primary">
              {activePreviewTab === "linkedin" && (
                <div className="space-y-3">
                  <p className="font-semibold text-text-primary">
                    Most teams think speed and quality are trade-offs in AI engineering.
                  </p>
                  <p className="text-text-secondary">
                    They aren't. What slows teams down is unstructured prompt loops and lack of deterministic schema validation.
                  </p>
                  <p className="text-text-secondary">
                    Here are the 3 architectural rules we used to scale throughput 10x without hallucinations:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-text-secondary text-xs sm:text-sm">
                    <li>Enforce strict JSON schema validation at the inference gateway.</li>
                    <li>Decouple retrieval orchestration from generation agents.</li>
                    <li>Cache structural context at the edge using lightweight vectors.</li>
                  </ul>
                  <p className="text-xs font-mono text-primary pt-2">
                    #MachineLearning #SoftwareArchitecture #Productivity
                  </p>
                </div>
              )}

              {activePreviewTab === "twitter" && (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-border-crisp shadow-2xs">
                    <span className="text-[10px] font-mono text-primary font-bold block mb-1">1/4</span>
                    <p className="text-xs sm:text-sm text-text-primary">
                      90% of content repurposing tools fail because they produce robotic summaries that smell like ChatGPT. Here is the modern blueprint founders use to build authentic leverage: 🧵
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-border-crisp shadow-2xs">
                    <span className="text-[10px] font-mono text-primary font-bold block mb-1">2/4</span>
                    <p className="text-xs sm:text-sm text-text-primary">
                      Rule 1: Hook with tension. Never start with "In this video, I learned...". Start with the contrarian realization that contradicts standard wisdom.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-border-crisp shadow-2xs">
                    <span className="text-[10px] font-mono text-primary font-bold block mb-1">3/4</span>
                    <p className="text-xs sm:text-sm text-text-primary">
                      Rule 2: Strip all filler adverbs. Transform 1,000 words into 3 concrete heuristics. High density = high engagement.
                    </p>
                  </div>
                </div>
              )}

              {activePreviewTab === "newsletter" && (
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider block">
                    TL;DR Executive Summary
                  </span>
                  <p className="text-sm font-semibold text-text-primary">
                    The Shift Toward Modular Agent Architectures in 2026
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    Engineering teams are abandoning monolithic LLM wrappers in favor of specialized, task-specific worker pipelines. By pairing deterministic tool runners with low-latency inference like Groq, operational costs drop by 65% while output reliability doubles.
                  </p>
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>

        {/* Feature Grid with Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          <SpotlightCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold mb-4 border border-blue-100">
              ⚡
            </div>
            <h3 className="font-bold text-base text-text-primary mb-2">Groq Llama 3.3 Speed</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Sub-second content generation powered by Groq LPUs. No waiting 15 seconds for OpenAI token streams.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-accent flex items-center justify-center font-bold mb-4 border border-emerald-100">
              🎯
            </div>
            <h3 className="font-bold text-base text-text-primary mb-2">Platform-Native Tone</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Formatted specifically for LinkedIn formatting, Twitter linebreaks, and newsletter executive briefs without markdown noise.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4 border border-purple-100">
              💳
            </div>
            <h3 className="font-bold text-base text-text-primary mb-2">Transparent Credit Packs</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              No sneaky recurring subscriptions. Buy affordable credit bundles starting at ₹199 for 50 repurpose cycles.
            </p>
          </SpotlightCard>
        </div>

      </div>
    </div>
  );
}
