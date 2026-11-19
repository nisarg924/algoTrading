import React from 'react';
import { Search, RefreshCw, TrendingUp, TrendingDown, Activity, Clock, ShieldCheck, BarChart3, Award } from 'lucide-react';

export default function Header({
  indices = [],
  selectedSymbol,
  onSelectSymbol,
  onOpenSearch,
  onRefresh,
  loading,
  lastUpdated,
  activeTab = 'predictor',
  onChangeTab
}) {
  return (
    <header className="border-b border-slate-800/80 bg-dark-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Real-time Indices Ticker Bar */}
      <div className="border-b border-slate-800/50 bg-dark-950/70 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-6 scrollbar-none">
          <div className="flex items-center gap-6 min-w-max">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              MARKET PULSE:
            </span>
            {indices.map(idx => {
              const isPositive = idx.changePercent >= 0;
              const isSelected = selectedSymbol === idx.symbol;
              return (
                <button
                  key={idx.symbol}
                  onClick={() => onSelectSymbol(idx.symbol)}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <span className="font-semibold">{idx.name || idx.symbol}</span>
                  <span className="font-mono text-slate-200">
                    {idx.price ? Number(idx.price).toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '—'}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 font-mono font-medium ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{idx.changePercent}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-slate-400 min-w-max text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              NSE / BSE Real-time
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              Algo Engine Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectSymbol('^NSEI')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                mid<span className="text-blue-400">Trade</span>
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                PRO ALGO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Next-Day Market Opening & Trend Predictive Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Live Predictor vs Accuracy Report) */}
        <div className="hidden lg:flex items-center bg-dark-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => onChangeTab('predictor')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'predictor'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Live Predictor</span>
          </button>
          <button
            onClick={() => onChangeTab('report')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Accuracy & Outcomes Report</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
              1-MO
            </span>
          </button>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-xs xl:max-w-sm hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-dark-950/80 border border-slate-700/60 hover:border-blue-500/50 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span>Search stocks / index...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-slate-800 border border-slate-700 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-lg bg-dark-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800/80 hover:bg-dark-700 border border-slate-700/80 text-slate-200 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            title="Refresh latest market data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-t border-slate-800/80 bg-dark-950/90 px-4 py-1.5 gap-2 text-xs">
        <button
          onClick={() => onChangeTab('predictor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg transition-all ${
            activeTab === 'predictor' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Live Predictor</span>
        </button>
        <button
          onClick={() => onChangeTab('report')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg transition-all ${
            activeTab === 'report' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Accuracy Report (1-Mo)</span>
        </button>
      </div>
    </header>
  );
}
