import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Sparkles, AlertCircle, LogOut, User, RefreshCw } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import MagneticButton from '../components/MagneticButton';
import { getCurrentUser, getEffectiveCredits, deductCredit, signOutUser } from '../lib/supabase';
import { repurposeContent } from '../lib/aiService';

export function StudioPage() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [sourceType, setSourceType] = useState('youtube');
  const [url, setUrl] = useState('https://youtube.com/watch?v=kCc8FmEb1nY');
  const [rawText, setRawText] = useState('');
  const [selectedTone, setSelectedTone] = useState('thought-leader');
  const [activeTab, setActiveTab] = useState('linkedin');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  const navigate = useNavigate();

  const [output, setOutput] = useState({
    linkedin: '',
    twitter: '',
    newsletter: ''
  });

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const u = await getCurrentUser();
        if (mounted) setUser(u);
        const creds = await getEffectiveCredits(u?.id);
        if (mounted) setCredits(creds);
      } catch (e) {
        console.warn('Studio load error:', e);
      }
    }
    loadData();

    const handleCreditUpdate = (e) => {
      if (e.detail?.credits !== undefined && mounted) {
        setCredits(e.detail.credits);
      }
    };
    window.addEventListener('pm_credits_updated', handleCreditUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('pm_credits_updated', handleCreditUpdate);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(output[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefine = (instruction) => {
    const currentText = output[activeTab];
    if (!currentText || !currentText.trim()) return;

    if (instruction === 'condense') {
      // Condenses text to core insights
      const paragraphs = currentText.split('\n\n').filter(p => p.trim());
      const condensed = paragraphs.slice(0, Math.max(2, Math.ceil(paragraphs.length / 2))).join('\n\n');
      setOutput(prev => ({ ...prev, [activeTab]: condensed }));
    } else if (instruction === 'sharpen') {
      // Sharpen the first line/hook dynamically based on the actual text
      const lines = currentText.split('\n');
      const firstLine = lines[0] || '';
      const remaining = lines.slice(1).join('\n');
      const tightenedHook = firstLine.replace(/^(Most people|In today's|Everyone|I think)\s+/i, '').trim();
      const sharpened = `${tightenedHook ? tightenedHook.charAt(0).toUpperCase() + tightenedHook.slice(1) : firstLine}\n${remaining}`;
      setOutput(prev => ({ ...prev, [activeTab]: sharpened.trim() }));
    } else if (instruction === 'contrarian') {
      // Reframes opening into a sharp contrarian lens
      const lines = currentText.split('\n');
      const firstLine = lines[0] || '';
      const remaining = lines.slice(1).join('\n');
      const contrarian = `The conventional playbook says one thing. Production reality proves the opposite:\n\n${firstLine}\n${remaining}`;
      setOutput(prev => ({ ...prev, [activeTab]: contrarian.trim() }));
    }
  };

  const handleGenerate = async () => {
    const contentToProcess = sourceType === 'text' ? rawText : url;
    if (!contentToProcess || !contentToProcess.trim()) {
      alert(sourceType === 'text' ? 'Please paste raw text or notes first.' : 'Please enter a valid URL.');
      return;
    }

    if (credits !== null && credits <= 0) {
      alert('You have 0 credits remaining. Please top up credits on the Pricing page to continue.');
      navigate('/pricing');
      return;
    }

    setIsGenerating(true);
    setGenError(null);

    try {
      const result = await repurposeContent({
        userId: user?.id,
        content: contentToProcess,
        inputType: sourceType,
        tone: selectedTone
      });

      if (result) {
        setOutput({
          linkedin: result.linkedin || output.linkedin,
          twitter: result.twitter || output.twitter,
          newsletter: result.newsletter || output.newsletter
        });

        // Deduct 1 credit
        const newCreds = await deductCredit(user?.id);
        setCredits(newCreds);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setGenError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    const guestCreds = await getEffectiveCredits();
    setCredits(guestCreds);
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
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold flex items-center gap-1 ${
                credits !== null && credits > 0 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                <Sparkles className="w-2.5 h-2.5" />
                <span>{credits !== null ? credits : '...'} Credits</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link to="/account" className="text-zinc-300 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5 transition-colors">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden md:inline truncate max-w-[140px]">{user.email}</span>
                </Link>
                <Link to="/pricing" className="text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 transition-all">
                  + Add Credits
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login?redirect=/studio" className="text-zinc-400 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-all">
                  Sign In
                </Link>
                <Link to="/pricing" className="text-emerald-400 hover:text-emerald-300 font-semibold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 transition-all">
                  + Get Credits
                </Link>
              </div>
            )}
            <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {genError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{genError}</span>
            </div>
            <button type="button" onClick={() => setGenError(null)} className="hover:underline">Dismiss</button>
          </div>
        )}

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
                    disabled={isGenerating}
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Morphing Content...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Morph Content</span>
                      </>
                    )}
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

              {/* Refinement Actions */}
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
                  value={output[activeTab] || ''}
                  onChange={(e) => setOutput({ ...output, [activeTab]: e.target.value })}
                  placeholder="Your generated distribution bundle will appear here once you click 'Morph Content'..."
                  className="w-full p-4 rounded-xl bg-zinc-900/50 border border-white/10 text-xs font-mono text-zinc-200 leading-relaxed focus:outline-none focus:border-white/30 resize-y placeholder-zinc-600"
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
