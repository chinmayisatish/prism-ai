import React, { useState } from 'react';
import { ArrowRight, Filter, Clock } from 'lucide-react';
import { GithubIcon } from '../components/GithubIcon';
import type { HistoryItem } from '../types';

interface HistoryScreenProps {
  historyItems: HistoryItem[];
  onSelectReview: (reviewId: string) => void;
  onRefresh: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyItems,
  onSelectReview,
}) => {
  const [filterState, setFilterState] = useState<'All' | 'Completed' | 'In Progress'>('All');

  const filtered = historyItems.filter((item) => {
    if (filterState === 'All') return true;
    if (filterState === 'Completed') return item.verdict === 'APPROVED' || item.verdict === 'REQUEST_CHANGES';
    if (filterState === 'In Progress') return item.verdict === 'COMMENT';
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-8 space-y-8">
      {/* Top Header Matching Visual Reference */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Review History
            </h1>
            <p className="text-xs text-slate-400">
              Track your past PR reviews
            </p>
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 p-1 bg-[#101124] rounded-xl border border-[#202242]">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {(['All', 'Completed', 'In Progress'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterState(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterState === f
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Rows List Matching Visual Design */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#101124] border border-[#202242] text-slate-400 text-sm">
            No reviews found matching the current filter.
          </div>
        ) : (
          filtered.map((item) => {
            const isCompleted = item.verdict === 'APPROVED' || item.verdict === 'REQUEST_CHANGES';

            return (
              <div
                key={item.review_id}
                className="p-5 rounded-2xl bg-[#101124] hover:bg-[#14152E] border border-[#202242] hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left PR Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-[#181935] flex items-center justify-center shrink-0">
                    <GithubIcon className="w-5 h-5 text-white" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {item.repo_owner} / {item.repo_name}
                      </span>
                      <span className="text-xs text-purple-400 font-mono">
                        #{item.pr_number}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {item.title}
                    </p>
                  </div>
                </div>

                {/* Right Status, Timestamp, and View Details Button */}
                <div className="flex items-center space-x-4 self-end md:self-center">
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </span>

                  {/* Timestamp */}
                  <div className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </div>

                  {/* View Details Button from Visual Reference */}
                  <button
                    onClick={() => onSelectReview(item.review_id)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#171935] hover:bg-purple-600 border border-[#2A2C55] hover:border-purple-500 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-md group-hover:shadow-purple-900/40"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
