import React from 'react';
import { Sparkles, PlusCircle, History, Settings, Info, Heart } from 'lucide-react';
import type { ScreenType } from '../types';

interface SidebarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    {
      id: 'new-review' as ScreenType,
      label: 'New Review',
      icon: PlusCircle,
      isActive: currentScreen === 'new-review' || currentScreen === 'analysis' || currentScreen === 'results' || currentScreen === 'finding-detail',
    },
    {
      id: 'history' as ScreenType,
      label: 'History',
      icon: History,
      isActive: currentScreen === 'history',
    },
    {
      id: 'settings' as ScreenType,
      label: 'Settings',
      icon: Settings,
      isActive: currentScreen === 'settings',
    },
    {
      id: 'landing' as ScreenType,
      label: 'About',
      icon: Info,
      isActive: currentScreen === 'landing',
    },
  ];

  return (
    <aside className="w-64 bg-[#0A0A16] border-r border-[#1F213A] flex flex-col justify-between p-6 shrink-0 z-20 min-h-screen">
      <div>
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center space-x-3 cursor-pointer group mb-10"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              PRISM
            </span>
            <span className="ml-1 text-xl font-extrabold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AI
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  item.isActive
                    ? 'bg-[#5B21B6] text-white shadow-lg shadow-purple-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-[#14152A]'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-[#1C1E36]/60">
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-[#111225] px-3.5 py-2.5 rounded-xl border border-[#20223D]">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <span>for Developers</span>
        </div>
      </div>
    </aside>
  );
};
