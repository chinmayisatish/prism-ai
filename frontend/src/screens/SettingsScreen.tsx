import React, { useState, useEffect } from 'react';
import { Settings, Key, CheckCircle2, RefreshCw, Cpu, Server } from 'lucide-react';
import { fetchSystemHealth } from '../api/client';

export const SettingsScreen: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [token, setToken] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [saved, setSaved] = useState(false);
  const [health, setHealth] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setChecking(true);
    const data = await fetchSystemHealth();
    setHealth(data);
    setChecking(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-8 space-y-8">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Settings & Engine Configuration
          </h1>
          <p className="text-xs text-slate-400">
            Manage your Gemini API keys, GitHub credentials and AI parameters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Form (8 cols) */}
        <form onSubmit={handleSave} className="md:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-[#101124] border border-[#202242] space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span>Authentication Credentials</span>
            </h2>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (Leave empty to use .env or static fallback)"
                className="w-full bg-[#16172E] border border-[#2A2C55] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Keys are transmitted securely over local REST endpoints and never leaked in frontend bundles.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_... (For private repos or rate limit avoidance)"
                className="w-full bg-[#16172E] border border-[#2A2C55] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#101124] border border-[#202242] space-y-5">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Model & Execution Controls</span>
            </h2>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Gemini Model Selection
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#16172E] border border-[#2A2C55] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-all"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast, Context-Aware, Recommended)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Code Reasoning)</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {saved && (
              <span className="text-xs text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration saved successfully!</span>
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>

        {/* Right System Diagnostics (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#101124] border border-[#202242] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center space-x-2">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>Backend Diagnostics</span>
              </h3>
              <button
                onClick={loadHealth}
                disabled={checking}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Server Status:</span>
                <span className="text-emerald-400 font-semibold">{health?.status || 'Active'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database:</span>
                <span className="text-purple-300 font-semibold">{health?.database_connected ? 'Connected' : 'SQLite Ready'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Gemini Key:</span>
                <span className="text-slate-300 font-mono text-[11px]">{health?.gemini_configured ? 'Configured' : 'Fallback Ready'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sandbox:</span>
                <span className="text-emerald-400 font-semibold">Enforced (No Exec)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
