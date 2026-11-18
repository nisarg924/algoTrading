import React from 'react';
import { Flame, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function CandlestickSignals({ patterns = [] }) {
  if (!patterns || patterns.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          Candlestick Pattern Recognition
        </h3>
        <span className="text-xs text-slate-400 font-mono">Daily Price Action</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {patterns.map((pat, idx) => {
          const isBullish = pat.sentiment.includes('BULLISH');
          const isBearish = pat.sentiment.includes('BEARISH');

          const badgeClasses = isBullish
            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
            : isBearish
            ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
            : 'bg-amber-950/80 text-amber-400 border-amber-800/80';

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-dark-950/80 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>{pat.name}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeClasses}`}>
                  {pat.type.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {pat.description}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 text-slate-400">
                <span>Significance: <strong className="text-slate-200">{pat.significance}</strong></span>
                <span>Sentiment: <strong className={isBullish ? 'text-emerald-400' : isBearish ? 'text-rose-400' : 'text-amber-400'}>{pat.sentiment}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

