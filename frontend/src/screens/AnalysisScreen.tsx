import React, { useState } from 'react';
import { Sparkles, Check, Loader2, Terminal } from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import type { AgentStep } from '../types';

interface AnalysisScreenProps {
  currentStepIndex: number; // 0, 1, 2, 3
  agentSteps: AgentStep[];
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  currentStepIndex,
  agentSteps,
}) => {
  const [showToolLogs, setShowToolLogs] = useState(false);

  const stepsList = [
    { title: 'Fetching PR Details', desc: 'Connecting to GitHub API & loading diffs' },
    { title: 'Analyzing Code', desc: 'Running AST parser & security scans' },
    { title: 'Generating Review', desc: 'Contextual analysis with Gemini AI' },
    { title: 'Finalizing', desc: 'Grounding findings against diffs' },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-8 flex flex-col items-center justify-center min-h-[75vh] space-y-10 relative">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Center Animated GitHub Avatar with Glowing Orbit from Visual Reference */}
      <div className="relative flex items-center justify-center z-10">
        {/* Crown Sparkle Icon at Top of Avatar */}
        <div className="absolute -top-6 text-purple-400 animate-bounce">
          <Sparkles className="w-6 h-6 fill-purple-400/20" />
        </div>

        {/* Orbiting Neon Ring */}
        <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-purple-500/50 animate-spin-slow" />
        <div className="absolute w-32 h-32 rounded-full border border-purple-400/30 animate-pulse-slow" />

        {/* Main Glowing Circle */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 p-1 shadow-2xl shadow-purple-600/50 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#0D0E1F] flex items-center justify-center">
            <GithubIcon className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Text Titles from Design */}
      <div className="text-center space-y-2 z-10">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Analyzing your Pull Request...
        </h2>
        <p className="text-sm text-slate-400">
          Fetching files &bull; Running static analysis &bull; Generating AI review
        </p>
      </div>

      {/* 4-Step Connected Horizontal Timeline Progress Bar Matching Design */}
      <div className="w-full max-w-2xl px-4 z-10">
        <div className="relative flex items-center justify-between">
          {/* Background Track Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#1F2140]" />
          
          {/* Active Colored Fill Line */}
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${Math.min(100, (currentStepIndex / (stepsList.length - 1)) * 90)}%` }}
          />

          {/* 4 Nodes */}
          {stepsList.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={idx} className="relative flex flex-col items-center group">
                {/* Node Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                    isCompleted
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-4 ring-[#07070D]'
                      : isCurrent
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50 ring-4 ring-purple-900/50 animate-pulse'
                      : 'bg-[#15162D] text-slate-500 border border-[#2A2C55] ring-4 ring-[#07070D]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Node Title Below */}
                <div className="absolute -bottom-8 whitespace-nowrap text-center">
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isCompleted || isCurrent ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Pill Matching Visual Reference */}
      <div className="pt-6 z-10">
        <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#131429] border border-[#2A2C55] text-xs font-medium text-slate-300 shadow-lg">
          <span>This won't take long...</span>
          <span className="text-purple-400">✨</span>
        </div>
      </div>

      {/* Real-time Agent Tool Logs Toggle */}
      <div className="w-full max-w-xl pt-4 z-10">
        <button
          onClick={() => setShowToolLogs(!showToolLogs)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0F1022] hover:bg-[#14152E] border border-[#1F2140] text-xs text-slate-400 transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Agent Orchestration Logs ({agentSteps.length} steps recorded)</span>
          </span>
          <span className="text-purple-400 font-mono">{showToolLogs ? 'Hide ▲' : 'Show ▼'}</span>
        </button>

        {showToolLogs && (
          <div className="mt-2 p-4 rounded-xl bg-[#090A17] border border-[#1A1C36] font-mono text-xs text-slate-400 max-h-48 overflow-y-auto space-y-2">
            {agentSteps.length === 0 ? (
              <div className="text-slate-600 italic">Initializing agent tool execution pipeline...</div>
            ) : (
              agentSteps.map((step) => (
                <div key={step.step_number} className="flex items-start space-x-2 pb-1 border-b border-[#14152A] last:border-0">
                  <span className="text-purple-400 shrink-0">[{step.tool_called || 'agent'}]:</span>
                  <span className="text-slate-300">{step.details}</span>
                  {step.execution_time_ms && (
                    <span className="text-slate-600 shrink-0 text-[10px]">({step.execution_time_ms}ms)</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
