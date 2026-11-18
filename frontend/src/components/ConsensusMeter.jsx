import React from 'react';
import { CheckCircle2, XCircle, MinusCircle, Layers } from 'lucide-react';

export default function ConsensusMeter({ consensus, votes = [] }) {
  if (!consensus) return null;

  return (
    <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          Technical Consensus & Indicator Voting
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {consensus.bullishCount} Bullish / {consensus.bearishCount} Bearish / {consensus.neutralCount} Neutral
        </span>
      </div>

      {/* Consensus Summary Bar */}
      <div className="space-y-2">
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(consensus.bullishCount / consensus.totalIndicators) * 100}%` }}
            title={`Bullish: ${consensus.bullishCount}`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${(consensus.neutralCount / consensus.totalIndicators) * 100}%` }}
            title={`Neutral: ${consensus.neutralCount}`}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-500"
            style={{ width: `${(consensus.bearishCount / consensus.totalIndicators) * 100}%` }}
            title={`Bearish: ${consensus.bearishCount}`}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Bullish: {consensus.bullishPercent}%
          </span>
          <span className="text-amber-400 flex items-center gap-1 font-semibold">
            <MinusCircle className="w-3.5 h-3.5" /> Neutral: {Math.round((consensus.neutralCount / consensus.totalIndicators) * 100)}%
          </span>
          <span className="text-rose-400 flex items-center gap-1 font-semibold">
            <XCircle className="w-3.5 h-3.5" /> Bearish: {Math.round((consensus.bearishCount / consensus.totalIndicators) * 100)}%
          </span>
        </div>
      </div>

      {/* Individual Factor Voting Rows */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="text-xs text-slate-400 font-medium">Individual Algorithm Signals:</div>
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {votes.map((vote, idx) => {
            const isBullish = vote.vote === 'BULLISH';
            const isBearish = vote.vote === 'BEARISH';

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-dark-950/70 border border-slate-800/60 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{vote.name}</div>
                  <div className="text-[11px] text-slate-400">{vote.detail}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isBullish
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : isBearish
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {vote.vote}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

