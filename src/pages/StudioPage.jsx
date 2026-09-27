import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MagneticButton from '../components/MagneticButton';

export function StudioPage() {
  const [sourceType, setSourceType] = useState('youtube');
  const [url, setUrl] = useState('https://youtube.com/watch?v=kCc8FmEb1nY');
  const [rawText, setRawText] = useState('');
  const [selectedTone, setSelectedTone] = useState('thought-leader');
  const [activeTab, setActiveTab] = useState('linkedin');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [output, setOutput] = useState({
    linkedin: "Most teams build AI wrappers without understanding where inference economics break down.\n\nIn Karpathy's architecture review, three operational constraints determine whether a generative application survives production scale:\n\n1. Pretraining teaches world models; fine-tuning only adjusts the conversational format.\n2. Reinforcement learning from human feedback introduces alignment tax and hallucinations.\n3. Context window retrieval is not memory—it is working scratchpad space.\n\nOptimize your pipeline for context precision rather than model parameter scale. The real edge is retrieval density.",
    twitter: "1/5 Most teams build AI wrappers without understanding where inference economics break down.\n\n2/5 Rule 1: Pretraining teaches world models; fine-tuning only adjusts conversational format.\n\n3/5 Rule 2: Context window retrieval is not memory—it is scratchpad memory. Keep retrieval dense.\n\n4/5 Rule 3: High-latency loops kill retention. Decouple extraction from real-time generation.\n\n5/5 The competitive moat in 2026 isn't which base foundation model you call. It's how cleanly you synthesize context.",
    newsletter: "Executive Brief: The Real Economics of Edge vs Cloud Inference\n\nKey Takeaway:\nKarpathy highlights that teams prioritizing raw model size over contextual density end up with unsustainable operational expenditure. Decoupling the retrieval pipeline from generation yields 3x faster response times with negligible hallucination drift.\n\nActionable Implementation:\nAudit your retrieval latency before upgrading model parameter classes."
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(output[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefine = (instruction) => {
    if (instruction === 'condense') {
      setOutput(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].split('\n\n').slice(0, 3).join('\n\n')
      }));
    } else if (instruction === 'sharpen') {
      setOutput(prev => ({
        ...prev,
        [activeTab]: "[Sharpened Hook]: Stop burning cloud compute on unoptimized prompts.\n\n" + prev[activeTab]
      }));
    } else if (instruction === 'contrarian') {
      setOutput(prev => ({
        ...prev,
        [activeTab]: "[Contrarian Take]: Bigger LLM models aren't making your product smarter—they're making your infrastructure slower.\n\n" + prev[activeTab]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-white/10 selection:text-white">
      
      {/* Studio Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight">
              Z
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">Zyvrok Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                5 Credits
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <Link to="/pricing" className="text-zinc-400 hover:text-white transition-colors">
              Upgrade (₹199)
            </Link>
            <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Configuration Panel */}
          <div className="lg:col-span-5 space-y-6">
            <SpotlightCard className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-400 mb-2">
                  Input Source
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-xl border border-white/10 text-center text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setSourceType('text')}
                    className={`py-1.5 rounded-lg transition-colors ${sourceType === 'text' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Raw Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('article')}
                    className={`py-1.5 rounded-lg transition-colors ${sourceType === 'article' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Article URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('youtube')}
                    className={`py-1.5 rounded-lg transition-colors ${sourceType === 'youtube' ? 'bg-white text-zinc-950 font-bold shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                  >
                    YouTube URL
                  </button>
                </div>
              </div>

              {sourceType === 'text' ? (
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-400 mb-2">
                    Paste Raw Text / Transcript
                  </label>
                  <textarea
                    rows={5}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste notes, transcripts, or talking points..."
                    className="w-full p-3 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-400 mb-2">
                    {sourceType === 'youtube' ? 'YouTube Video URL' : 'Article or Blog URL'}
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-3 rounded-xl bg-zinc-900/80 border border-white/10 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono mt-1.5">
                    {sourceType === 'youtube' ? 'Captions and transcripts extracted automatically.' : 'Clean HTML reader mode extraction.'}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-zinc-400 mb-2">
                  Tone & Perspective
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  {[
                    { id: 'thought-leader', label: 'Thought Leader' },
                    { id: 'contrarian', label: 'Contrarian' },
                    { id: 'technical', label: 'Technical' },
                    { id: 'storytelling', label: 'Storytelling' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTone(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedTone === t.id
                          ? 'border-white/30 bg-white/10 text-white font-semibold shadow-sm'
                          : 'border-white/10 text-zinc-400 bg-zinc-900/40 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{t.label}</span>
                        {selectedTone === t.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400">Cost: 1 Credit</span>
                <MagneticButton>
                  <button
                    type="button"
                    onClick={() => {
                      setIsGenerating(true);
                      setTimeout(() => setIsGenerating(false), 1000);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGenerating ? 'Morphing...' : 'Morph Content'}</span>
                  </button>
                </MagneticButton>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Output Draft Editor Panel */}
          <div className="lg:col-span-7 space-y-6">
            <SpotlightCard className="p-6 space-y-5">
              
              {/* Output Tab Selection Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
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
                    Newsletter Brief
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900 text-xs font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Refinement Actions (Clean tags, NO tacky emojis) */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 pb-3 border-b border-white/10 overflow-x-auto">
                <span className="text-zinc-400 font-medium">Refine Draft:</span>
                <button
                  type="button"
                  onClick={() => handleRefine('condense')}
                  className="px-2.5 py-1 rounded-md border border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Condense
                </button>
                <button
                  type="button"
                  onClick={() => handleRefine('sharpen')}
                  className="px-2.5 py-1 rounded-md border border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Sharpen Hook
                </button>
                <button
                  type="button"
                  onClick={() => handleRefine('contrarian')}
                  className="px-2.5 py-1 rounded-md border border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Contrarian Lens
                </button>
              </div>

              {/* Editable Textarea Pane */}
              <div className="space-y-2">
                <textarea
                  rows={14}
                  value={output[activeTab]}
                  onChange={(e) => setOutput({ ...output, [activeTab]: e.target.value })}
                  className="w-full p-4 rounded-xl bg-zinc-900/50 border border-white/10 text-xs font-mono text-zinc-200 leading-relaxed focus:outline-none focus:border-white/30 resize-y"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
                  <span>{output[activeTab].split(/\s+/).filter(Boolean).length} words · {output[activeTab].length} characters</span>
                  <span>Draft saved locally</span>
                </div>
              </div>

            </SpotlightCard>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 Zyvrok. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/legal" className="hover:text-white transition-colors">Legal & Compliance</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default StudioPage;
