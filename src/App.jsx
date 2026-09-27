import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Studio from "./components/Studio";
import Pricing from "./components/Pricing";
import History from "./components/History";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import { getCurrentUser, getEffectiveCredits, supabase } from "./lib/supabase";

export default function App() {
  const [activeTab, setActiveTab] = useState("landing");
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(10);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // 1. Check user and credits on mount
    async function initUser() {
      const u = await getCurrentUser();
      setUser(u);
      const c = await getEffectiveCredits(u?.id);
      setCredits(c);
    }
    initUser();

    // 2. Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const c = await getEffectiveCredits(session.user.id);
        setCredits(c);
      } else {
        setUser(null);
        const c = await getEffectiveCredits(null);
        setCredits(c);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    const c = await getEffectiveCredits(null);
    setCredits(c);
  };

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col font-sans selection:bg-primary-subtle selection:text-primary">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        credits={credits}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="flex-1">
        {activeTab === "landing" && (
          <Hero
            onStartStudio={() => setActiveTab("studio")}
            onOpenPricing={() => setActiveTab("pricing")}
          />
        )}

        {activeTab === "studio" && (
          <Studio
            user={user}
            credits={credits}
            onCreditsUpdated={(newCredits) => setCredits(newCredits)}
            onNeedUpgrade={() => setActiveTab("pricing")}
          />
        )}

        {activeTab === "pricing" && (
          <Pricing
            user={user}
            onCreditsUpdated={(newCredits) => setCredits(newCredits)}
          />
        )}

        {activeTab === "history" && (
          <History
            user={user}
            onSelectPost={(post) => setActiveTab("studio")}
          />
        )}
      </main>

      <Footer onNavigate={(tab) => setActiveTab(tab)} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={async (newUser) => {
          setUser(newUser);
          const c = await getEffectiveCredits(newUser.id);
          setCredits(c);
        }}
      />
    </div>
  );
}
