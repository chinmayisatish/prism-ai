import React, { useState } from 'react';
import { 
  ArrowLeft, Download, FileText, AlertTriangle, AlertOctagon, 
  Lightbulb, Info, ChevronRight, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import type { ReviewReport, CodeFinding, Severity } from '../types';

interface ReviewResultsScreenProps {
  report: ReviewReport;
  onBack: () => void;
  onSelectFinding: (finding: CodeFinding) => void;
}

export const ReviewResultsScreen: React.FC<ReviewResultsScreenProps> = ({
  report,
  onBack,
  onSelectFinding,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | Severity>('All');

  const filteredFindings = report.findings.filter((f) => {
    if (activeFilter === 'All') return true;
    return f.severity === activeFilter;
  });

  const handleDownload = (format: 'json' | 'markdown') => {
    let content = '';
    let filename = `prism-review-${report.pr_details.repo_name}-pr${report.pr_details.pr_number}`;

    if (format === 'json') {
      content = JSON.stringify(report, null, 2);
      filename += '.json';
    } else {
      content = `# PRISM AI Review Report
**Repository:** ${report.pr_details.repo_owner}/${report.pr_details.repo_name}
**Pull Request:** #${report.pr_details.pr_number} - ${report.pr_details.title}
**Verdict:** ${report.verdict}
**Health Score:** ${report.health_score}/100
**Date:** ${report.created_at}

## Executive Summary
${report.executive_summary}

## Severity Breakdown
- Critical: ${report.critical_count}
- High: ${report.high_count}
- Medium: ${report.medium_count}
- Low: ${report.low_count}

## Findings
${report.findings.map((f, i) => `### ${i+1}. [${f.severity}] ${f.title}
- **File:** \`${f.file_path}\` (Line: ${f.line_number || 'N/A'})
- **Category:** ${f.category}
- **Explanation:** ${f.explanation}
- **Why it matters:** ${f.why_it_matters}
- **Suggested Fix:**
\`\`\`
${f.suggested_fix}
\`\`\`
`).join('\n')}
`;
      filename += '.md';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-8 space-y-8">
      {/* Top Header Row Matching Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#14152A] hover:bg-[#1D1F3C] border border-[#27294A] text-slate-300 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Review Results
            </h1>
            <p className="text-xs text-slate-400">
              Here's your comprehensive PR review
            </p>
          </div>
        </div>

        {/* Download Report Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDownload('markdown')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#14152B] hover:bg-[#1E2040] border border-[#2A2C55] text-xs font-medium text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Download Report (.md)</span>
          </button>
          <button
            onClick={() => handleDownload('json')}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#14152B] hover:bg-[#1E2040] border border-[#2A2C55] text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards Matching Design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Findings */}
        <div className="p-4 rounded-2xl bg-[#101124] border border-[#202242] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Total Findings</p>
            <p className="text-2xl font-bold text-white mt-1">{report.findings_count}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Critical */}
        <div className="p-4 rounded-2xl bg-[#101124] border border-[#202242] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Critical</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{report.critical_count}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        {/* High */}
        <div className="p-4 rounded-2xl bg-[#101124] border border-[#202242] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-medium text-slate-400">High</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{report.high_count}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Medium */}
        <div className="p-4 rounded-2xl bg-[#101124] border border-[#202242] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Medium</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{report.medium_count}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
        </div>

        {/* Low */}
        <div className="p-4 rounded-2xl bg-[#101124] border border-[#202242] flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Low</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{report.low_count}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Info className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Review Section: Left Column (PR Info & Summary), Right Column (Findings List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* PR Identifier Card */}
          <div className="p-6 rounded-2xl bg-[#101124] border border-[#202242] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#181935] flex items-center justify-center">
                  <GithubIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {report.pr_details.repo_owner} / {report.pr_details.repo_name}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {report.pr_details.state.toUpperCase()}
              </span>
            </div>

            <div className="text-sm font-medium text-slate-200">
              #{report.pr_details.pr_number} {report.pr_details.title}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#1C1E3A]">
              <span>Author: <strong className="text-slate-300">@{report.pr_details.author}</strong></span>
              <span className="text-purple-400">
                +{report.pr_details.additions} / -{report.pr_details.deletions} lines
              </span>
            </div>

            {report.is_mock && (
              <div className="px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center justify-between">
                <span>Demo Scenario</span>
                <span className="font-mono text-[10px]">VERIFIED_SAMPLE</span>
              </div>
            )}
          </div>

          {/* Review Summary Card */}
          <div className="p-6 rounded-2xl bg-[#101124] border border-[#202242] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Review Summary</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-600/30 text-purple-300 border border-purple-500/30">
                  Health: {report.health_score}/100
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  report.verdict === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : report.verdict === 'REQUEST_CHANGES'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {report.verdict}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {report.executive_summary}
            </p>

            {/* Security Audit Badge */}
            <div className="pt-2 border-t border-[#1C1E3A] flex items-center space-x-2 text-xs">
              {report.security_audit.prompt_injection_detected ? (
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Prompt Injection Blocked</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security Sanitized & Sandboxed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Severity Filters & Findings List */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Severity Filter Tabs from Design */}
          <div className="flex items-center space-x-2 p-1.5 bg-[#101124] rounded-xl border border-[#202242] overflow-x-auto">
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === tab
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-[#161730]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            {filteredFindings.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#101124] border border-[#202242] text-slate-400 text-xs">
                No findings match the selected filter '{activeFilter}'.
              </div>
            ) : (
              filteredFindings.map((finding) => (
                <div
                  key={finding.id}
                  onClick={() => onSelectFinding(finding)}
                  className="p-4 rounded-2xl bg-[#101124] hover:bg-[#151733] border border-[#202242] hover:border-purple-500/40 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadgeClass(finding.severity)}`}>
                        {finding.severity}
                      </span>
                      <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {finding.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
                      <span>{finding.file_path}</span>
                      <span>&bull;</span>
                      <span>Line {finding.line_number || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
