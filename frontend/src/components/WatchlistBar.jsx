import React from 'react';
import { Plus, X, Bookmark, TrendingUp, TrendingDown } from 'lucide-react';

export default function WatchlistBar({
  watchlist = [],
  selectedSymbol,
  onSelectSymbol,
  onOpenSearch,
  onRemoveItem
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-4 bg-dark-900/80 border-b border-slate-800/80 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider pr-2.5 border-r border-slate-800 min-w-max">
        <Bookmark className="w-3.5 h-3.5 text-blue-400" />
        <span>Watchlist:</span>
      </div>

      <div className="flex items-center gap-2">
        {watchlist.map(item => {
          const isSelected = selectedSymbol === item.symbol;
          const hasPrice = item.price != null;
          const isPositive = (item.changePercent || 0) >= 0;
          const isBullish = item.trendDirection === 'BULLISH';

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600/20 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">{item.name || item.symbol}</span>
                {hasPrice && (
                  <span className="font-mono text-slate-100 font-bold">
                    ₹{Number(item.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                )}
                {hasPrice && (
                  <span
                    className={`flex items-center text-[10px] font-mono font-semibold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}{item.changePercent}%
                  </span>
                )}
              </div>

              {/* Tomorrow Prediction Pill */}
              {item.predictedTrend && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    isBullish
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}
                  title={`Tomorrow Forecast: ${item.predictedTrend}`}
                >
                  {isBullish ? '▲ OPEN BULL' : '▼ OPEN BEAR'}
                </span>
              )}

              {onRemoveItem && !['^NSEI', '^BSESN', '^NSEBANK'].includes(item.symbol) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.symbol);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity ml-0.5 p-0.5"
                  title="Remove from watchlist"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-dashed border-slate-700 hover:border-blue-500/50 transition-all min-w-max"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Stock</span>
        </button>
      </div>
    </div>
  );
}

