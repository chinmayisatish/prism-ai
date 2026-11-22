import React, { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Shield, Target, Code, CheckCircle, Lock, Bug, Terminal } from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';

interface LandingPageProps {
  onStartReviewing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartReviewing }) => {
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <div className="min-h-screen bg-[#07070D] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background radiant glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <header className="px-8 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-bold tracking-tight text-white">PRISM</span>
            <span className="ml-1 text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#home" className="text-purple-400 border-b-2 border-purple-500 pb-1 font-semibold">Home</a>
          <a href="#features" className="hover:text-purple-300 transition-colors">Features</a>
          <button onClick={() => setShowLearnMore(true)} className="hover:text-purple-300 transition-colors">About</button>
        </nav>

        <button
          onClick={onStartReviewing}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-700/30 transition-all hover:scale-105 active:scale-95"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-8 w-full flex flex-col justify-center py-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Hero Content) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Next-Gen Autonomous Code Intelligence</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                PRISM <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-200">
                Your Intelligent AI Pull Request Reviewer
              </h2>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold tracking-wider uppercase text-purple-400">
                Analyze. Review. Improve.
              </p>
              <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                Let AI review your GitHub pull requests for bugs, security issues and code quality — in seconds.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartReviewing}
                className="flex items-center space-x-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-xl shadow-purple-900/40 hover:shadow-purple-700/50 transition-all hover:scale-105 active:scale-95"
              >
                <span>Start Reviewing</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowLearnMore(true)}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#131427] hover:bg-[#1C1E3A] border border-[#2A2C55] text-slate-200 font-medium transition-all hover:border-purple-500/40"
              >
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Learn More</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[#1C1E3A]">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#111225] border border-[#232545] text-xs font-medium text-slate-300">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Smart Analysis</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#111225] border border-[#232545] text-xs font-medium text-slate-300">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Security Focused</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#111225] border border-[#232545] text-xs font-medium text-slate-300">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>Actionable Suggestions</span>
              </div>
            </div>
          </div>

          {/* Right Column (Hero Graphic Visual Matching Design) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient radiant circle glow behind IDE */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-purple-600/30 to-indigo-600/20 blur-3xl pointer-events-none" />

            {/* Floating IDE Window */}
            <div className="w-full max-w-md bg-[#101124] rounded-2xl border border-[#2B2D54] p-5 shadow-2xl shadow-purple-950/50 relative z-10 transform hover:-translate-y-1 transition-transform">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#202242] mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">auth_middleware.py</div>
              </div>

              {/* Code lines visualization */}
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-600 select-none">01</span>
                  <div className="h-2.5 w-24 rounded bg-purple-500/40" />
                  <div className="h-2.5 w-16 rounded bg-blue-500/30" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-600 select-none">02</span>
                  <div className="h-2.5 w-36 rounded bg-slate-700/60" />
                </div>
                <div className="flex items-center space-x-2 bg-red-950/30 p-1 rounded border-l-2 border-red-500">
                  <span className="text-red-400 select-none">-23</span>
                  <span className="text-red-300 font-mono text-[11px]">user = req.body.user</span>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-950/30 p-1 rounded border-l-2 border-emerald-500">
                  <span className="text-emerald-400 select-none">+23</span>
                  <span className="text-emerald-300 font-mono text-[11px]">user = sanitize(req.body.user)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-600 select-none">24</span>
                  <div className="h-2.5 w-28 rounded bg-slate-700/50" />
                </div>
              </div>

              {/* Center Floating GitHub Cat Circular Badge from Design */}
              <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#3B82F6] flex items-center justify-center p-0.5 shadow-xl shadow-purple-900/50 ring-4 ring-[#07070D]">
                <div className="w-full h-full rounded-full bg-[#121327] flex items-center justify-center">
                  <GithubIcon className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Floating < / > Badge from Design */}
              <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono font-bold text-sm shadow-lg shadow-purple-900/50 flex items-center space-x-1.5 ring-4 ring-[#07070D]">
                <Code className="w-4 h-4" />
                <span>&lt; / &gt;</span>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Grid Section */}
        <section id="features" className="mt-24 pt-16 border-t border-[#1C1E3A]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Architected for Real Pull Requests
            </h3>
            <p className="text-slate-400 text-sm">
              Not just another generic LLM wrapper. PRISM AI orchestrates multi-tool static analysis, AST inspection, and grounded Gemini reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0F1022] border border-[#222444] hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4">
                <Bug className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Python AST & Static Analysis</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Detects dangerous functions (`eval`, `exec`, `pickle.loads`), mutable default arguments, and blocking event loops deterministically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1022] border border-[#222444] hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Prompt Injection Shield</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Neutralizes jailbreak attempts hidden in commit messages, comments, and PR descriptions before feeding into AI prompts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1022] border border-[#222444] hover:border-purple-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Grounded Line Verification</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Zero hallucinated lines. All findings are mathematically verified against the diff hunks of the target pull request.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Learn More Modal */}
      {showLearnMore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111226] border border-[#2A2C55] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>About PRISM AI</span>
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                <strong>PRISM AI</strong> is an autonomous code-review agent built for hackathons and production teams.
                It completes the entire review loop: ingesting real GitHub pull requests, executing AST analysis and security checks, and generating actionable line-by-line recommendations.
              </p>
              <div className="p-3 bg-[#0B0C18] rounded-xl border border-[#1E203C] space-y-2 text-xs">
                <div className="font-semibold text-purple-300">Tech Stack & Architecture:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>Frontend:</strong> React + TypeScript + Tailwind CSS</li>
                  <li><strong>Backend:</strong> Python + FastAPI + Uvicorn</li>
                  <li><strong>AI Engine:</strong> Google Gemini 1.5 Flash</li>
                  <li><strong>Tool Execution:</strong> Python AST visitor, Regex secret scanner, Unified diff parser</li>
                  <li><strong>Database:</strong> SQLite persistence with review history</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowLearnMore(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
