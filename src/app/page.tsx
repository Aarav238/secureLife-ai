import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes orb-drift-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(0.95); }
          66% { transform: translate(20px, -20px) scale(1.05); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-line {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .animate-orb { animation: orb-drift 8s ease-in-out infinite; }
        .animate-orb-reverse { animation: orb-drift-reverse 10s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.7s ease-out both; }
        .animate-fade-in-up-d1 { animation: fade-in-up 0.7s ease-out 0.1s both; }
        .animate-fade-in-up-d2 { animation: fade-in-up 0.7s ease-out 0.2s both; }
        .animate-fade-in-up-d3 { animation: fade-in-up 0.7s ease-out 0.3s both; }
        .animate-fade-in-up-d4 { animation: fade-in-up 0.7s ease-out 0.4s both; }
        .animate-fade-in-up-d5 { animation: fade-in-up 0.7s ease-out 0.5s both; }
        .animate-pulse-line { animation: pulse-line 2s ease-in-out infinite; }
      `}</style>

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">SecureLife AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="hidden sm:inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              AI Chat
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-orb absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="animate-orb-reverse absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/15 blur-[100px]" />
          <div className="animate-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-indigo-400/10 blur-[80px]" />
        </div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Insurance Lead Intelligence Platform
          </div>

          <h1 className="animate-fade-in-up-d1 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            AI-Powered Lead Management{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              for Insurance Brokers
            </span>
          </h1>

          <p className="animate-fade-in-up-d2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            Qualify leads through intelligent conversation, extract policy data from documents automatically, and deliver comprehensive coverage analysis — all in one platform.
          </p>

          <div className="animate-fade-in-up-d3 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/20 transition-all hover:shadow-2xl hover:shadow-indigo-500/30 hover:brightness-110"
            >
              Open Dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-7 py-3.5 text-base font-semibold text-slate-200 backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Try AI Chat
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="relative px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Core Capabilities
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to convert leads
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1: Chatbot Qualification */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-slate-700 hover:bg-slate-900/80">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M16 10h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chatbot Qualification</h3>
              <p className="text-slate-400 leading-relaxed">
                An AI-driven conversational flow that captures prospect details, assesses insurance needs, and qualifies leads in real time — no forms, no friction.
              </p>
            </div>

            {/* Feature 2: Document Intelligence */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-slate-700 hover:bg-slate-900/80">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Intelligence</h3>
              <p className="text-slate-400 leading-relaxed">
                Upload existing policies and let AI extract coverage details, limits, deductibles, and renewal dates. Structured data in seconds, not hours.
              </p>
            </div>

            {/* Feature 3: Smart Analysis */}
            <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:border-slate-700 hover:bg-slate-900/80">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
              <p className="text-slate-400 leading-relaxed">
                Get AI-generated coverage gap analysis, risk assessments, and personalized recommendations for each lead — ready for your next client conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative px-6 py-28 bg-slate-900/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Workflow
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From first contact to full analysis
            </h2>
          </div>

          <div className="relative grid gap-12 md:grid-cols-4 md:gap-0">
            {/* Connecting line (desktop only) */}
            <div className="absolute top-8 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] hidden h-px md:block">
              <div className="h-full w-full bg-gradient-to-r from-indigo-500/40 via-indigo-400/60 to-cyan-400/40 animate-pulse-line" />
            </div>

            {[
              {
                step: "01",
                title: "Start Chat",
                desc: "A prospect starts a conversation with your AI assistant on any channel.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Qualify Lead",
                desc: "AI gathers personal details, insurance needs, and budget through natural dialogue.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Upload Documents",
                desc: "Existing policies are uploaded and parsed automatically for key data extraction.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                ),
              },
              {
                step: "04",
                title: "Get Analysis",
                desc: "Receive a complete lead profile with coverage gaps, risk scores, and next steps.",
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center md:px-4">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-indigo-400 shadow-lg shadow-slate-950/50">
                  {item.icon}
                </div>
                <span className="mt-4 text-xs font-bold uppercase tracking-widest text-indigo-400/70">
                  Step {item.step}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats / Social Proof ── */}
      <section className="relative px-6 py-28">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 p-10 sm:p-16">
            <div className="mb-14 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400 mb-3">
                Why SecureLife AI
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for modern insurance brokers
              </h2>
              <p className="mt-4 text-lg text-slate-400 leading-relaxed">
                Every feature is designed to reduce manual work and help you close more policies, faster.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div className="border-l-2 border-indigo-500/40 pl-6">
                <p className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  95%
                </p>
                <p className="mt-1 text-sm font-medium text-slate-300">
                  Faster qualification
                </p>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Reduce lead qualification time from hours of phone calls to minutes of AI-guided chat.
                </p>
              </div>
              <div className="border-l-2 border-indigo-500/40 pl-6">
                <p className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  AI-Extracted
                </p>
                <p className="mt-1 text-sm font-medium text-slate-300">
                  Policy data parsing
                </p>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Automatically pull coverage types, limits, deductibles, and terms from uploaded policy documents.
                </p>
              </div>
              <div className="border-l-2 border-indigo-500/40 pl-6">
                <p className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Smart
                </p>
                <p className="mt-1 text-sm font-medium text-slate-300">
                  Coverage analysis
                </p>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Identify gaps, redundancies, and opportunities across a prospect&apos;s entire insurance portfolio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative px-6 py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animate-orb-reverse absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/15 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Ready to transform your{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              lead management
            </span>
            ?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400 leading-relaxed">
            Start qualifying leads smarter, parsing documents faster, and closing more policies today.
          </p>
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/20 transition-all hover:shadow-2xl hover:shadow-indigo-500/30 hover:brightness-110"
            >
              Get Started
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 px-6 py-10">
        <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-300">
              SecureLife Insurance Brokers
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
}
