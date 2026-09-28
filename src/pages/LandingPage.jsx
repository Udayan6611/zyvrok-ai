import React, { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Copy, 
  Sparkles, 
  Layers, 
  Zap, 
  Cpu, 
  Share2, 
  FileText, 
  Terminal, 
  Youtube, 
  Sliders, 
  ShieldCheck, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card3D from '../components/Card3D';
import MagneticButton from '../components/MagneticButton';
import ShimmerBadge from '../components/ShimmerBadge';
// Real 3D hero scene (React Three Fiber) — lazy so it never blocks first paint.
const HeroScene = lazy(() => import('../three/HeroScene'));

// Curated high-signal sample datasets for instant 3D interactive preview
const DEMO_SAMPLES = {
  naval: {
    id: 'naval',
    label: 'Naval Ravikant',
    topic: 'Specific Knowledge & Leverage',
    sourceUrl: 'https://youtube.com/watch?v=1-TZqOsVCN8',
    transcriptSnippet: "Specific knowledge cannot be taught, but it can be learned. If society can train you, it can train someone else and replace you. You get specific knowledge by following your genuine curiosity and passion rather than whatever is hot right now. Combine that with judgment and leverage...",
    bundle: {
      linkedin: `Most people mistake hard work for high output.\n\nWorking 80 hours a week on commoditized labor doesn't create wealth—it creates exhaustion.\n\nWealth is created by combining three principles:\n\n1. Specific Knowledge\nSkills that cannot be taught in a standard curriculum. Found at the intersection of your genuine obsessions and technological inflection points.\n\n2. High Judgment\nJudgment has 100x more leverage than effort. In an age of infinite leverage, one correct decision outweighs a thousand hours of undirected work.\n\n3. Scalable Leverage (Code & Media)\nPermissionless leverage. When you build software or publish ideas, they work for you while you sleep without asking anyone for permission.\n\nStop competing in zero-sum games. Build specific knowledge, apply leverage, and compound privately.`,
      x: `1/5 Most people confuse effort with leverage.\n\nGrinding 80 hours a week on replaceable tasks won't make you wealthy.\n\nHere is the real framework for asymmetrical returns 🧵👇\n\n2/5 Specific Knowledge:\nIf society can train you, it can replace you.\nYour specific knowledge is found at the intersection of your genuine curiosity and technological shifts.\n\n3/5 Judgment > Effort:\nIn an automated world, direction matters infinitely more than velocity.\nOne correct decision beats 1,000 hours of misdirected hustle.\n\n4/5 The New Leverage:\nLabor and capital require permission.\nCode and content do not. A single script or essay compounds 24/7 without marginal cost.\n\n5/5 The playbook is simple:\nBe authentic, find leverage, exercise high judgment, and ignore zero-sum prestige games.`,
      newsletter: `EXECUTIVE BRIEF: The Asymmetrical Leverage Formula\n\nKey Takeaways:\n• Commoditized skills yield commoditized returns. If an institution can train you systematically, an LLM or offshore team can replace you.\n• Direction > Velocity. Judgment scales exponentially with automation, making strategic decisions exponentially more valuable than linear execution hours.\n• Permissionless Distribution. Modern founders win by publishing media and deploying software that function as autonomous distribution engines.\n\nActionable Implementation:\nAudit your current weekly commitments. Identify which 20% of activities generate non-fungible specific knowledge vs. 80% that are replaceable operational overhead.`
    }
  },
  karpathy: {
    id: 'karpathy',
    label: 'Andrej Karpathy',
    topic: 'Software 2.0 & LLM OS',
    sourceUrl: 'https://youtube.com/watch?v=zjkBMFhNj_g',
    transcriptSnippet: "We are moving from Software 1.0, where humans write explicit logic in Python or C++, to Software 2.0, where parameters are optimized via neural network weights. Now with LLMs, we are watching an entirely new operating system emerge where the LLM is the CPU, memory is the context window...",
    bundle: {
      linkedin: `Software engineering is undergoing the largest paradigm shift in 50 years.\n\nIn Software 1.0, engineers wrote explicit algorithms line by line.\nIn Software 2.0, we curated datasets and optimized weights.\n\nToday, we are witnessing the LLM Operating System:\n\n• LLM = The Central Processing Unit (CPU)\n• Context Window = Working RAM\n• Vector Stores & Tooling = Disk & Peripheral I/O\n• Natural Language = The New Assembly Language\n\nWhat does this mean for technical teams?\n\nThe bottleneck is no longer syntax or code generation. The bottleneck is context architecture, evaluation benchmarks, and deterministic guardrails.\n\nEngineers who master system orchestration will build 10-person companies with 1,000-person outputs.`,
      x: `1/4 Software is being rewritten from the ground up.\n\nWe moved from explicit code (1.0) to neural network weights (2.0).\n\nNow we have arrived at the LLM OS 🧵\n\n2/4 The Architecture:\n• LLM = The Central Processor\n• Context Window = Working RAM\n• Embeddings & Tools = Secondary Disk Storage & I/O\n\n3/4 Syntax is commoditized.\nThe new engineering moat is context management, benchmark evaluations, and multi-agent coordination.\n\n4/4 If you are still writing boilerplate CRUD apps by hand, you are operating on borrowed time. Learn to orchestrate intelligent pipelines.`,
      newsletter: `TECHNICAL DIGEST: The LLM Operating System Architecture\n\nCore Thesis:\nLarge Language Models are transitioning from conversational chatbots into central orchestrators of distributed computation.\n\nSystem Components:\n1. Execution Core: Transformer weights acting as runtime reasoning kernels.\n2. Volatile Memory: Dynamic context windows handling short-term working state.\n3. External Tool Interop: Function calling and schema validation serving as hardware-independent device drivers.\n\nStrategic Takeaway:\nPrioritize context curation over raw model parameter count. A 7B parameter model with deterministic context pipelines routinely beats a 70B model with noisy prompts.`
    }
  },
  altman: {
    id: 'altman',
    label: 'Y Combinator',
    topic: 'Building What People Want',
    sourceUrl: 'https://youtube.com/watch?v=0lJKucu6HJc',
    transcriptSnippet: "The number one cause of startup failure is building something nobody wants. Founders spend six months polishing code and arguing over architecture without talking to five real users. If you build something that a tiny group of people desperately loves, you can expand. But if nobody cares...",
    bundle: {
      linkedin: `90% of early-stage startups don't die from competition.\n\nThey die from building things nobody actually cares about.\n\nFounders consistently fall into the same trap:\n\n• Polishing architecture before validating demand.\n• Confusing polite compliments with willingness to pay.\n• Solving fake problems because the code is fun to write.\n\nThe litmus test is binary:\n\nDoes a small group of users use your product every single day even when it is broken and ugly?\n\nIf yes, you have a foundation you can scale.\nIf no, no amount of marketing, redesigns, or AI features will save you.\n\nTalk to users, build the narrowest slice of value, and measure retention, not signups.`,
      x: `1/5 Startups don't die from competitors.\n\nThey die from building software that nobody wants.\n\nHere is how to avoid the startup graveyard 🧵👇\n\n2/5 The Polishing Trap:\nSpending 3 months refactoring clean code before talking to 5 real customers is procrastination disguised as engineering.\n\n3/5 The True Metric:\nIt is better to build something that 100 people desperately love than something 10,000 people casually like.\n\n4/5 Willingness to Pay:\nCompliments are free. Subscriptions and workflow dependencies are real signal.\n\n5/5 If users aren't screaming when your product goes down, you haven't found product-market fit yet. Go back to first principles.`,
      newsletter: `FOUNDER PLAYBOOK: The Anti-Graveyard Discipline\n\nExecutive Summary:\nPremature optimization of code and infrastructure is the most common form of founder escapism. High-velocity discovery requires direct user collision.\n\nThree Critical Filters:\n1. The Hair-on-Fire Test: Is the target problem active and painful enough that users will tolerate a primitive v1?\n2. The Dollar Metric: Does the product create demonstrable ROI or save measurable hours immediately upon onboarding?\n3. High Retention Core: Identify your top 5% power users and reverse-engineer why they cannot operate without your solution.`
    }
  }
};

export function LandingPage() {
  const [activeTab, setActiveTab] = useState('linkedin');
  const [selectedSample, setSelectedSample] = useState('naval');
  const [copied, setCopied] = useState(false);

  const sampleData = DEMO_SAMPLES[selectedSample];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#09090b] text-[#fafafa] selection:bg-white/10 selection:text-white overflow-x-hidden">
      
      {/* 3D Ambient Mesh & Floating Light Beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-blue-500/15 to-transparent blur-[140px] rounded-full animate-pulse" />
        <div className="absolute top-[200px] left-[15%] w-[450px] h-[250px] bg-purple-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Grid Pattern with Radial Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-24 pb-20 border-b border-white/10 relative z-10">
        {/* Real 3D background — morphing distortion core + orbiting fragments + particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Suspense fallback={<div className="absolute inset-0" />}>
            <HeroScene />
          </Suspense>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 45%, rgba(9,9,11,0.15), rgba(9,9,11,0.78) 70%, rgba(9,9,11,0.95))' }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          
          {/* Shimmer Status Badge */}
          <div className="mb-6 flex justify-center">
            <ShimmerBadge text="Zyvrok 3D Content Repurposing Studio" />
          </div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
          >
            Turn raw transcripts into <br />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              high-signal distribution bundles.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Zero robotic AI slop. Zyvrok extracts core arguments and synthesizes platform-native LinkedIn posts, X threads, and newsletter briefs in seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <MagneticButton>
              <Link
                to="/studio"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
              >
                <span>Launch Studio Free (50 Credits)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </MagneticButton>

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white font-mono text-xs transition-colors"
            >
              <span>Explore 3D Simulator</span>
              <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </motion.div>
        </div>

        {/* 3D Interactive Repurposing Simulator */}
        <div id="interactive-demo" className="max-w-5xl mx-auto px-4 sm:px-6 mt-16">
          
          {/* Sample Topic Switcher (Emil Kowalski spring physics) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-xs font-mono text-zinc-500 mr-2 uppercase tracking-wider hidden sm:inline">
              Select Sample Source:
            </span>
            {Object.values(DEMO_SAMPLES).map((sample) => (
              <button
                key={sample.id}
                onClick={() => setSelectedSample(sample.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  selectedSample === sample.id
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/40 border border-white/5 hover:border-white/10'
                }`}
              >
                {selectedSample === sample.id && (
                  <motion.div
                    layoutId="activeSampleTab"
                    className="absolute inset-0 bg-white/10 border border-white/20 rounded-lg -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span>{sample.label}</span>
                <span className="text-[10px] text-zinc-500 ml-1.5 hidden md:inline">({sample.topic})</span>
              </button>
            ))}
          </div>

          {/* Meng To 3D Tilt Card */}
          <Card3D depth={40} className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Input Source Stream */}
              <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0 lg:pr-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                      Raw Source Stream
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                    YouTube Transcript
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/5 font-mono text-xs text-zinc-400 space-y-2">
                  <div className="text-zinc-200 font-bold flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>{sampleData.topic}</span>
                  </div>
                  <p className="line-clamp-4 text-[11px] leading-relaxed italic text-zinc-400">
                    "{sampleData.transcriptSnippet}"
                  </p>
                </div>

                {/* 3D Distillation Pipeline Graphic */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Distillation Pipeline</span>
                    <span className="text-emerald-400 font-semibold">Pass 1 & 2 Active</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Strips conversational filler & rhetoric</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Extracts core thesis & empirical points</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Synthesizes 3 platform-native formats</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/studio"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Repurpose Your Own Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: High-Signal Output Bundle */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Platform Tab Navigation (Emil Kowalski layoutId slide) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-white/10">
                    {[
                      { id: 'linkedin', label: 'LinkedIn Post' },
                      { id: 'x', label: 'X Thread' },
                      { id: 'newsletter', label: 'Newsletter' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                          activeTab === tab.id ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activePlatformTab"
                            className="absolute inset-0 bg-white/10 rounded-lg border border-white/20 -z-10"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(sampleData.bundle[activeTab])}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Generated Content Body */}
                <div className="relative p-5 rounded-2xl bg-zinc-900/60 border border-white/10 min-h-[300px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedSample}-${activeTab}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed select-text"
                    >
                      {sampleData.bundle[activeTab]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </Card3D>
        </div>
      </section>

      {/* Feature Bento Grid (Conard Li / Linear Recipe) */}
      <section className="py-24 border-b border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-2">
              Architecture & Features
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Engineered for density, not fluff.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1 */}
            <Card3D depth={25} className="p-7 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Two-Pass Distillation</h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Separates argument extraction from styling. Strips rhetorical tropes before formatting for maximum engagement.
              </p>
            </Card3D>

            {/* Bento Card 2 */}
            <Card3D depth={25} className="p-7 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">3-Part Distribution Bundle</h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                One click generates a complete marketing stack: Long-form LinkedIn authority post, punchy X thread, and executive newsletter summary.
              </p>
            </Card3D>

            {/* Bento Card 3 */}
            <Card3D depth={25} className="p-7 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Zero-Emoji Filter</h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Strict negative prompting bans rockets, fire emojis, and cliché transitions. Reads like a human founder authored it.
              </p>
            </Card3D>

          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 border-b border-white/10 relative z-10 bg-zinc-950/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            50 Free Credits on Signup. Top up anytime.
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto font-mono">
            Starter Pack: ₹199 for 50 credits (₹3.98/generation). Creator Pro: ₹499 for 150 credits. No recurring subscriptions required.
          </p>
          <div className="pt-2">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs font-mono hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <span>View Packages & Pricing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final Action Hero */}
      <section className="py-20 relative z-10">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Ready to convert raw ideas into distribution?
          </h2>
          <p className="text-xs font-mono text-zinc-400">
            Test the live studio interface right now. No credit card required.
          </p>
          <MagneticButton>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-zinc-950 font-bold text-xs font-mono hover:bg-zinc-200 transition-colors shadow-lg"
            >
              <span>Open Content Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </MagneticButton>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
