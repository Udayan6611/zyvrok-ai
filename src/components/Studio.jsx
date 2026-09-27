import React, { useState } from "react";
import MagneticButton from "./ui/MagneticButton";
import SpotlightCard from "./ui/SpotlightCard";
import ShimmerBadge from "./ui/ShimmerBadge";
import { repurposeContent } from "../lib/aiService";

export default function Studio({ user, credits, onCreditsUpdated, onNeedUpgrade }) {
  const [inputType, setInputType] = useState("text");
  const [content, setContent] = useState("");
  const [tone, setTone] = useState("thought_leader");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [outputTab, setOutputTab] = useState("linkedin");
  const [result, setResult] = useState(null);

  const handleMorph = async () => {
    if (!content.trim()) {
      setErrorMsg("Please enter text, an article link, or a YouTube URL.");
      return;
    }

    if (credits <= 0) {
      onNeedUpgrade();
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await repurposeContent({
        userId: user?.id || null,
        content: content.trim(),
        inputType,
        tone
      });

      setResult(res);
      if (typeof res.remainingCredits === "number") {
        onCreditsUpdated(res.remainingCredits);
      }
    } catch (err) {
      console.error("Repurposing failed:", err);
      if (err.message && err.message.toLowerCase().includes("credit")) {
        onNeedUpgrade();
      } else {
        setErrorMsg(err.message || "Failed to repurpose content. Please verify your Groq API key.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    let textToCopy = "";
    if (outputTab === "linkedin") {
      textToCopy = result.linkedin_post || "";
    } else if (outputTab === "twitter") {
      textToCopy = Array.isArray(result.twitter_thread) 
        ? result.twitter_thread.join("\n\n") 
        : result.twitter_thread || "";
    } else if (outputTab === "newsletter") {
      textToCopy = result.newsletter_blurb || "";
    }

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  const getWordCount = () => {
    if (!result) return 0;
    if (outputTab === "linkedin") {
      return (result.linkedin_post || "").trim().split(/\s+/).filter(Boolean).length;
    }
    if (outputTab === "twitter") {
      const text = Array.isArray(result.twitter_thread) ? result.twitter_thread.join(" ") : result.twitter_thread || "";
      return text.trim().split(/\s+/).filter(Boolean).length;
    }
    if (outputTab === "newsletter") {
      return (result.newsletter_blurb || "").trim().split(/\s+/).filter(Boolean).length;
    }
    return 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-border-crisp gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Repurpose Studio</h2>
            <ShimmerBadge>Llama 3.3 Active</ShimmerBadge>
          </div>
          <p className="text-xs text-text-secondary">
            Convert long-form thinking into multi-channel social distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-text-muted uppercase block">Available Balance</span>
            <span className="text-sm font-mono font-bold text-primary">{credits} credits</span>
          </div>
          <MagneticButton
            onClick={onNeedUpgrade}
            className="text-xs px-3 py-1.5 rounded-lg border border-border-crisp hover:bg-subtle text-text-secondary"
          >
            + Top Up
          </MagneticButton>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-red-500 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main 2-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <SpotlightCard className="p-5 border-border-crisp bg-white">
            
            {/* Input Type Selector */}
            <div className="flex items-center justify-between border-b border-border-crisp pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-text-muted uppercase">Source Format</span>
              <div className="flex items-center gap-1 bg-subtle p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setInputType("text")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    inputType === "text" ? "bg-white text-text-primary font-semibold shadow-xs" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Raw Notes
                </button>
                <button
                  type="button"
                  onClick={() => setInputType("url")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    inputType === "url" ? "bg-white text-text-primary font-semibold shadow-xs" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Article Link
                </button>
                <button
                  type="button"
                  onClick={() => setInputType("youtube")}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    inputType === "youtube" ? "bg-white text-text-primary font-semibold shadow-xs" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  YouTube URL
                </button>
              </div>
            </div>

            {/* Content Input Area */}
            <div className="mb-4">
              <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
                {inputType === "text" ? "Paste Article, Transcript, or Rough Draft" : "Paste Public URL"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  inputType === "text"
                    ? "Paste your rough ideas, draft outline, or full blog post here..."
                    : inputType === "youtube"
                    ? "https://www.youtube.com/watch?v=..."
                    : "https://yourblog.com/post-name"
                }
                rows={inputType === "text" ? 8 : 3}
                className="w-full p-3 rounded-xl border border-border-crisp bg-subtle/40 text-text-primary text-xs leading-relaxed focus:bg-white focus:border-primary focus:outline-none transition-colors resize-y font-mono"
              />
            </div>

            {/* Tone Selector */}
            <div className="mb-6">
              <label className="block text-xs font-mono text-text-secondary uppercase mb-1.5">
                Target Voice Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "thought_leader", label: "Thought Leader", icon: "💡" },
                  { id: "contrarian", label: "Contrarian / Spicy", icon: "🌶️" },
                  { id: "technical", label: "Technical Breakdown", icon: "⚙️" },
                  { id: "casual", label: "Casual & Punchy", icon: "💬" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                      tone === t.id
                        ? "border-primary bg-primary-subtle text-primary font-semibold shadow-xs"
                        : "border-border-crisp bg-white text-text-secondary hover:bg-subtle/60"
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <MagneticButton
              onClick={handleMorph}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-xs tracking-wide hover:bg-primary-container shadow-md shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Repurposing with Groq...</span>
                </>
              ) : (
                <>
                  <span>Morph Content (1 Credit)</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </MagneticButton>

          </SpotlightCard>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-7 space-y-4">
          <SpotlightCard className="p-5 border-border-crisp bg-white min-h-[460px] flex flex-col justify-between">
            
            {/* Top Toolbar */}
            <div>
              <div className="flex flex-wrap items-center justify-between border-b border-border-crisp pb-3 mb-4 gap-3">
                <div className="flex items-center gap-1 bg-subtle p-0.5 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setOutputTab("linkedin")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      outputTab === "linkedin"
                        ? "bg-white text-text-primary font-semibold shadow-xs"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    LinkedIn Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputTab("twitter")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      outputTab === "twitter"
                        ? "bg-white text-text-primary font-semibold shadow-xs"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Twitter / X Thread
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputTab("newsletter")}
                    className={`px-3 py-1 rounded-md transition-all ${
                      outputTab === "newsletter"
                        ? "bg-white text-text-primary font-semibold shadow-xs"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Newsletter Blurb
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-text-muted">
                    {result ? `${getWordCount()} words` : "Waiting for input"}
                  </span>
                  <MagneticButton
                    onClick={handleCopy}
                    disabled={!result}
                    className="text-xs px-3 py-1 rounded-md bg-subtle hover:bg-subtle-hover text-text-primary border border-border-crisp disabled:opacity-40"
                  >
                    {copied ? "Copied! ✓" : "Copy Output"}
                  </MagneticButton>
                </div>
              </div>

              {/* Output Content */}
              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-subtle flex items-center justify-center text-text-muted mb-3">
                    ✍️
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    Ready to generate
                  </h4>
                  <p className="text-xs text-text-secondary max-w-sm">
                    Enter your text or link on the left and click Morph Content to generate clean, platform-native formats.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-xs font-mono text-text-secondary animate-pulse">
                    Synthesizing hooks and platform nuances...
                  </p>
                </div>
              )}

              {result && !loading && (
                <div className="bg-base rounded-xl p-4 sm:p-5 border border-border-crisp text-xs sm:text-sm leading-relaxed text-text-primary overflow-y-auto max-h-[500px]">
                  {outputTab === "linkedin" && (
                    <div className="whitespace-pre-wrap font-sans">
                      {result.linkedin_post}
                    </div>
                  )}

                  {outputTab === "twitter" && (
                    <div className="space-y-3 font-sans">
                      {Array.isArray(result.twitter_thread) ? (
                        result.twitter_thread.map((tweet, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-lg border border-border-crisp shadow-2xs">
                            <span className="text-[10px] font-mono text-primary font-bold block mb-1">
                              Tweet {idx + 1}
                            </span>
                            <p className="whitespace-pre-wrap">{tweet}</p>
                          </div>
                        ))
                      ) : (
                        <div className="whitespace-pre-wrap">{result.twitter_thread}</div>
                      )}
                    </div>
                  )}

                  {outputTab === "newsletter" && (
                    <div className="space-y-3 font-sans">
                      <div className="whitespace-pre-wrap">
                        {result.newsletter_blurb}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Note */}
            <div className="border-t border-border-crisp pt-3 mt-4 flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>Plain text format • No markdown asterisks</span>
              <span>Saved automatically to History</span>
            </div>

          </SpotlightCard>
        </div>

      </div>

    </div>
  );
}
