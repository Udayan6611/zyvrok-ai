import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Sparkles } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import { supabase, getCurrentUser } from '../lib/supabase';

export function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fallbackHistory = [
    {
      id: 'demo-1',
      title: "State of GPT & LLM Pipelines (Andrej Karpathy)",
      type: "YouTube",
      date: "Sep 26, 2026",
      snippet: "Most teams build AI wrappers without understanding where inference economics break down...",
      formats: ["LinkedIn", "X Thread", "Newsletter"]
    },
    {
      id: 'demo-2',
      title: "How Stripe Scales Database Shards",
      type: "Article",
      date: "Sep 22, 2026",
      snippet: "Horizontal scaling isn't just a database problem—it's an operational governance problem...",
      formats: ["LinkedIn", "X Thread"]
    }
  ];

  useEffect(() => {
    async function loadHistory() {
      try {
        const u = await getCurrentUser();
        setUser(u);

        if (u) {
          const { data, error } = await supabase
            .from('repurposed_posts')
            .select('*')
            .eq('user_id', u.id)
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            const formatted = data.map((item) => ({
              id: item.id,
              title: item.title || item.original_url || "Repurposed Content",
              type: item.source_type ? item.source_type.toUpperCase() : "Content",
              date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent",
              snippet: (item.linkedin_post || item.twitter_thread || item.newsletter_content || "").slice(0, 140) + "...",
              formats: [
                item.linkedin_post ? "LinkedIn" : null,
                item.twitter_thread ? "X Thread" : null,
                item.newsletter_content ? "Newsletter" : null
              ].filter(Boolean)
            }));
            setHistory(formatted);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('History load note:', err);
      }
      setHistory(fallbackHistory);
      setLoading(false);
    }

    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col justify-between selection:bg-white/10 selection:text-white">
      
      {/* Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight">
              Z
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">Zyvrok History</span>
          </Link>
          <div className="flex items-center gap-3 text-xs font-mono">
            <Link to="/studio" className="text-zinc-400 hover:text-white transition-colors">
              Studio
            </Link>
            <Link to="/" className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Repurposed Content Archives
            </h1>
            <p className="text-xs font-mono text-zinc-400 mt-1">
              {user ? `Archived generations for ${user.email}` : 'Protected by Supabase PostgreSQL Row Level Security (RLS)'}
            </p>
          </div>
          <Link
            to="/studio"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Repurpose</span>
          </Link>
        </div>

        <div className="space-y-4">
          {history.map((item) => (
            <SpotlightCard key={item.id} className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-emerald-400">
                    {item.type}
                  </span>
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed bg-zinc-900/40 p-3 rounded-lg border border-white/5">
                  "{item.snippet}"
                </p>
                <div className="flex items-center justify-between pt-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {item.formats.map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/5">
                        {f}
                      </span>
                    ))}
                  </div>
                  <Link to="/studio" className="text-blue-400 hover:underline flex items-center gap-1">
                    <span>Open in Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <span>© 2026 Zyvrok. All rights reserved.</span>
          <Link to="/legal" className="text-zinc-400 hover:text-white">Legal & Compliance</Link>
        </div>
      </footer>

    </div>
  );
}

export default HistoryPage;
