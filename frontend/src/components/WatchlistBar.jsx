import React from 'react';
import { Plus, X, Bookmark } from 'lucide-react';

export default function WatchlistBar({
  watchlist = [],
  selectedSymbol,
  onSelectSymbol,
  onOpenSearch,
  onRemoveItem
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-4 bg-dark-900/60 border-b border-slate-800/60 scrollbar-none">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider pr-2 border-r border-slate-800">
        <Bookmark className="w-3.5 h-3.5 text-blue-400" />
        Watchlist:
      </div>

      <div className="flex items-center gap-2">
        {watchlist.map(item => {
          const isSelected = selectedSymbol === item.symbol;
          return (
            <div
              key={item.symbol}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                  : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border-slate-700/60 hover:border-slate-600'
              }`}
              onClick={() => onSelectSymbol(item.symbol)}
            >
              <span>{item.name || item.symbol}</span>
              {onRemoveItem && !['^NSEI', '^BSESN', '^NSEBANK'].includes(item.symbol) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.symbol);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity ml-1 p-0.5"
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
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-dashed border-slate-700 hover:border-blue-500/50 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Stock</span>
        </button>
      </div>
    </div>
  );
}

