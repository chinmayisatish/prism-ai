import React, { useState } from 'react';
import { Link2, Hash, ArrowRight, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import type { DemoItem } from '../types';

interface NewReviewScreenProps {
  onStartAnalysis: (repoUrl: string, prNumber?: number, githubToken?: string, demoId?: string) => void;
  demoPresets: DemoItem[];
  isLoading: boolean;
}

export const NewReviewScreen: React.FC<NewReviewScreenProps> = ({
  onStartAnalysis,
  demoPresets,
  isLoading,
}) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/facebook/react');
  const [prNumber, setPrNumber] = useState('8123');
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!repoUrl.trim()) {
      setErrorMsg('Please enter a repository URL or identifier.');
      return;
    }

    let parsedPr: number | undefined = undefined;
    if (prNumber.trim()) {
      const num = parseInt(prNumber.trim(), 10);
      if (isNaN(num) || num <= 0) {
        setErrorMsg('PR number must be a valid positive integer.');
        return;
      }
      parsedPr = num;
    }

    onStartAnalysis(repoUrl.trim(), parsedPr, githubToken.trim() || undefined);
  };

  const handleSelectDemo = (demo: DemoItem) => {
    setErrorMsg(null);
    onStartAnalysis(demo.repo, demo.pr_number, undefined, demo.id);
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-8">
      {/* Header text from visual reference */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Start a New Review
        </h1>
        <p className="text-slate-400 text-sm">
          Enter your GitHub repository and pull request details below
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Glassmorphism Form Card Matching Visual Design */}
      <div className="bg-[#101124] rounded-3xl border border-[#232545] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow inside card */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Form (8 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
            
            {/* Repository URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wide text-slate-300">
                Repository URL
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Link2 className="w-4 h-4 text-purple-400" />
                </div>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full bg-[#16172E] border border-[#2A2C55] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Pull Request Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wide text-slate-300">
                Pull Request
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400">
                  <Hash className="w-4 h-4 text-purple-400" />
                </div>
                <input
                  type="text"
                  value={prNumber}
                  onChange={(e) => setPrNumber(e.target.value)}
                  placeholder="Enter PR number or paste the PR URL"
                  className="w-full bg-[#16172E] border border-[#2A2C55] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Optional GitHub Token Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showTokenInput ? 'Hide private token options' : '+ Add GitHub Token (optional, for private repos & higher rate limits)'}</span>
              </button>

              {showTokenInput && (
                <div className="mt-3">
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Stored locally in session only)"
                    className="w-full bg-[#16172E] border border-[#2A2C55] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Submit Button from Design */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2.5 px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <span>{isLoading ? 'Processing...' : 'Fetch Pull Request'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Visual Icon matching Design (4 cols) */}
          <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center relative">
            <div className="relative">
              {/* Outer Glowing Ring */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-1 shadow-2xl shadow-purple-900/60 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#121327] flex items-center justify-center">
                  <GithubIcon className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Floating < / > Purple Badge on Bottom-Right */}
              <div className="absolute -bottom-2 -right-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-mono font-bold text-xs shadow-lg ring-4 ring-[#101124]">
                &lt; / &gt;
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Demo Scenarios for 1-Click Hackathon Testing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant Demo Scenarios (No Token Required)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoPresets.map((demo) => (
            <button
              key={demo.id}
              onClick={() => handleSelectDemo(demo)}
              disabled={isLoading}
              className="text-left p-4 rounded-2xl bg-[#0F1022] hover:bg-[#151733] border border-[#202242] hover:border-purple-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {demo.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-500/30">
                    PR #{demo.pr_number}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {demo.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#1C1E3A] flex items-center justify-between text-[11px] text-slate-500 group-hover:text-purple-400">
                <span>{demo.repo}</span>
                <span className="flex items-center space-x-1 font-medium">
                  <span>Launch Review</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
