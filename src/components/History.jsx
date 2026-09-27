import React, { useEffect, useState } from "react";
import SpotlightCard from "./ui/SpotlightCard";
import MagneticButton from "./ui/MagneticButton";
import { supabase } from "../lib/supabase";

export default function History({ user, onSelectPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        if (user?.id) {
          const { data, error } = await supabase
            .from("repurposed_posts")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && data) {
            setPosts(data);
          }
        } else {
          // Local fallback from localStorage
          const local = localStorage.getItem("pm_recent_history");
          if (local) {
            setPosts(JSON.parse(local));
          }
        }
      } catch (e) {
        console.error("Error loading history:", e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="border-b border-border-crisp pb-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Generation History</h2>
          <p className="text-xs text-text-secondary mt-1">
            Review past repurpose cycles and copy formatted copy.
          </p>
        </div>
        <span className="text-xs font-mono text-text-muted">
          {posts.length} {posts.length === 1 ? "record" : "records"}
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-text-muted">
          Loading history records...
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 rounded-2xl bg-subtle flex items-center justify-center text-text-muted mx-auto mb-3">
            📂
          </div>
          <h4 className="text-sm font-semibold text-text-primary mb-1">No saved generations yet</h4>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Once you morph content in the Studio, your LinkedIn posts, tweets, and summaries will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <SpotlightCard key={post.id} className="p-5 border-border-crisp">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-mono text-primary font-semibold uppercase">
                  {post.input_type || "text"} • {post.tone || "standard"}
                </span>
                <span className="text-text-muted font-mono text-[11px]">
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : "Recent"}
                </span>
              </div>

              <p className="text-xs text-text-secondary font-mono mb-4 line-clamp-2 bg-subtle/50 p-2.5 rounded-lg border border-border-crisp/60">
                "{post.original_snippet || "Content"}"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-base rounded-lg border border-border-crisp">
                  <span className="font-bold text-text-primary block mb-1">LinkedIn</span>
                  <p className="text-text-secondary line-clamp-3 leading-relaxed">
                    {post.linkedin_post || "—"}
                  </p>
                </div>

                <div className="p-3 bg-base rounded-lg border border-border-crisp">
                  <span className="font-bold text-text-primary block mb-1">Twitter Thread</span>
                  <p className="text-text-secondary line-clamp-3 leading-relaxed">
                    {Array.isArray(post.twitter_thread) ? post.twitter_thread[0] : post.twitter_thread || "—"}
                  </p>
                </div>

                <div className="p-3 bg-base rounded-lg border border-border-crisp">
                  <span className="font-bold text-text-primary block mb-1">Newsletter</span>
                  <p className="text-text-secondary line-clamp-3 leading-relaxed">
                    {post.newsletter_blurb || "—"}
                  </p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
}
