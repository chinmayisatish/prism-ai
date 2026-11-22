import React, { useState } from 'react';
import { 
  ArrowLeft, Copy, Check, Shield, AlertTriangle, 
  CheckCircle2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import type { CodeFinding, Severity } from '../types';

interface DetailedFindingScreenProps {
  finding: CodeFinding;
  allFindings: CodeFinding[];
  onBack: () => void;
  onSelectFinding: (finding: CodeFinding) => void;
}

export const DetailedFindingScreen: React.FC<DetailedFindingScreenProps> = ({
  finding,
  allFindings,
  onBack,
  onSelectFinding,
}) => {
  const [copied, setCopied] = useState(false);

  const currentIndex = allFindings.findIndex((f) => f.id === finding.id);
  const prevFinding = currentIndex > 0 ? allFindings[currentIndex - 1] : null;
  const nextFinding = currentIndex < allFindings.length - 1 ? allFindings[currentIndex + 1] : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.suggested_fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadgeClass = (severity: Severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Render suggested fix code lines cleanly with diff coloring
  const renderDiffLines = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, idx) => {
      const isRemoval = line.startsWith('-');
      const isAddition = line.startsWith('+');

      return (
        <div
          key={idx}
          className={`px-4 py-1 flex items-start font-mono text-xs ${
            isRemoval
              ? 'bg-red-950/40 text-red-300 border-l-2 border-red-500'
              : isAddition
              ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
              : 'text-slate-300'
          }`}
        >
          <span className="w-8 shrink-0 text-slate-600 select-none text-[11px]">{idx + 1}</span>
          <span className="whitespace-pre-wrap">{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#14152A] hover:bg-[#1D1F3C] border border-[#27294A] text-slate-300 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review Results</span>
        </button>

        {/* Prev / Next controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => prevFinding && onSelectFinding(prevFinding)}
            disabled={!prevFinding}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#14152A] hover:bg-[#1D1F3C] border border-[#27294A] text-slate-300 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <span className="text-xs text-slate-500">
            {currentIndex + 1} of {allFindings.length}
          </span>
          <button
            onClick={() => nextFinding && onSelectFinding(nextFinding)}
            disabled={!nextFinding}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#14152A] hover:bg-[#1D1F3C] border border-[#27294A] text-slate-300 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Finding Card Matching Visual Reference */}
      <div className="bg-[#101124] rounded-2xl border border-[#202242] overflow-hidden shadow-2xl">
        {/* Top Banner Row from Design */}
        <div className="p-6 border-b border-[#1C1E3A] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121327]/80">
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getSeverityBadgeClass(finding.severity)}`}>
              {finding.severity}
            </span>
            <h2 className="text-base md:text-lg font-bold text-white">
              {finding.title}
            </h2>
          </div>

          <div className="text-xs text-slate-400 font-mono bg-[#181935] px-3.5 py-1.5 rounded-lg border border-[#27294C]">
            <span>File: <strong className="text-purple-300">{finding.file_path}</strong></span>
            <span className="mx-2">&bull;</span>
            <span>Line: <strong className="text-purple-300">{finding.line_number || 'N/A'}</strong></span>
          </div>
        </div>

        {/* Content Body: Two Columns */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Explanation Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Explanation
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-[#131429] p-4 rounded-xl border border-[#202242]">
                {finding.explanation}
              </p>
            </div>

            {/* Why it matters Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Why it matters
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-[#131429] p-4 rounded-xl border border-[#202242]">
                {finding.why_it_matters}
              </p>
            </div>

            {/* Suggested Fix Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Suggested Fix
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 text-xs text-purple-400 hover:text-purple-300 bg-[#171933] px-3 py-1 rounded-lg border border-[#2B2D55] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Fix'}</span>
                </button>
              </div>

              {/* Code diff block with red/green lines matching visual reference */}
              <div className="bg-[#0A0A16] border border-[#202242] rounded-xl overflow-hidden py-2 font-mono">
                {renderDiffLines(finding.suggested_fix)}
              </div>
            </div>
          </div>

          {/* Right Metadata Column (4 cols) Matching Design */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-[#131429] border border-[#202242] space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Severity</span>
                <div className="flex items-center space-x-2 text-sm font-bold text-red-400">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>{finding.severity}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1C1E3A]">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Category</span>
                <div className="flex items-center space-x-2 text-sm font-medium text-slate-200">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>{finding.category}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1C1E3A]">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Verification Status</span>
                <div className="flex items-center space-x-2 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Against PR Diff</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1C1E3A]">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Source</span>
                <span className="text-xs font-mono text-purple-300">
                  {finding.source}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
