import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Building2 } from 'lucide-react';
import { searchSymbols } from '../services/api';

const POPULAR_SYMBOLS = [
  { symbol: '^NSEI', name: 'Nifty 50 Index', exchange: 'NSE' },
  { symbol: '^BSESN', name: 'BSE Sensex Index', exchange: 'BSE' },
  { symbol: '^NSEBANK', name: 'Bank Nifty Index', exchange: 'NSE' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', exchange: 'NSE' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', exchange: 'NSE' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd.', exchange: 'NSE' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.', exchange: 'NSE' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', exchange: 'NSE' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE' }
];

export default function SearchModal({ isOpen, onClose, onSelectSymbol }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchSymbols(query);
        setResults(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (symbol) => {
    onSelectSymbol(symbol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-dark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-blue-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type any Indian stock or index (e.g. RELIANCE, TCS, TATAMOTORS, SENSEX)..."
            className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
          >
            ESC
          </button>
        </div>

        {/* Content Box */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-2">
          {searching ? (
            <div className="p-8 text-center text-sm text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching market databases...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Search Results
              </div>
              {results.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-dark-950 border border-slate-800 text-blue-400 font-mono text-xs font-bold">
                      {item.symbol.replace('^', '').replace('.NS', '').replace('.BO', '')}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {item.name || item.symbol}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.symbol} • {item.exchange || 'NSE'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-mono group-hover:text-slate-300">
                    Select ↵
                  </span>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-6 text-center text-sm text-slate-400">
              No matching assets found for "{query}". You can also enter the exact ticker (e.g. <code>RELIANCE.NS</code>) directly.
              <div className="mt-3">
                <button
                  onClick={() => handleSelect(query.toUpperCase())}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  Analyze "{query.toUpperCase()}" Directly
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Popular Indices & Top Stocks
              </div>
              {POPULAR_SYMBOLS.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSelect(item.symbol)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-dark-950 border border-slate-800 text-blue-400 font-mono text-xs font-bold">
                      {item.symbol.replace('^', '').replace('.NS', '')}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.symbol} • {item.exchange}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-mono group-hover:text-slate-300">
                    Select ↵
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

