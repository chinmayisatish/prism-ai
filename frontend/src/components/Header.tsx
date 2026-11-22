import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="h-16 px-8 border-b border-[#1A1C33] flex items-center justify-between bg-[#080914]/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Agent Online</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>Gemini 1.5 Flash</span>
        </div>
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300">
          <ShieldCheck className="w-3 h-3 text-blue-400" />
          <span>Prompt Guard Active</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Profile Avatar "CS" from visual design */}
        <div 
          onClick={onOpenSettings}
          title="Account: Chinmayi Satish (CS)"
          className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#3B82F6] flex items-center justify-center font-bold text-xs text-white ring-2 ring-purple-500/40 hover:ring-purple-400 cursor-pointer shadow-lg shadow-purple-900/30 transition-all hover:scale-105"
        >
          CS
        </div>
      </div>
    </header>
  );
};
