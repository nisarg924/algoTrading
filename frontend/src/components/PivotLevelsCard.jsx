import React, { useState } from 'react';
import { Target, ArrowUp, ArrowDown } from 'lucide-react';

export default function PivotLevelsCard({ pivots, currentPrice }) {
  const [method, setMethod] = useState('classic'); // 'classic' or 'fibonacci'

  if (!pivots) return null;
  const currentPivots = pivots[method] || pivots.classic;

  const levels = [
    { label: 'Resistance 3 (R3)', value: currentPivots.r3, type: 'resistance', level: 3 },
    { label: 'Resistance 2 (R2)', value: currentPivots.r2, type: 'resistance', level: 2 },
    { label: 'Resistance 1 (R1)', value: currentPivots.r1, type: 'resistance', level: 1 },
    { label: 'Central Pivot (P)', value: currentPivots.pivot, type: 'pivot', level: 0 },
    { label: 'Support 1 (S1)', value: currentPivots.s1, type: 'support', level: 1 },
    { label: 'Support 2 (S2)', value: currentPivots.s2, type: 'support', level: 2 },
    { label: 'Support 3 (S3)', value: currentPivots.s3, type: 'support', level: 3 }
  ];

  return (
    <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          Support & Resistance Pivot Levels
        </h3>

        {/* Method Toggle */}
        <div className="flex bg-dark-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setMethod('classic')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              method === 'classic' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Classic Floor
          </button>
          <button
            onClick={() => setMethod('fibonacci')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              method === 'fibonacci' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fibonacci
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-2">Level</th>
              <th className="pb-2">Price Target</th>
              <th className="pb-2">Distance from CMP</th>
              <th className="pb-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {levels.map((lvl, idx) => {
              const diff = lvl.value - currentPrice;
              const diffPercent = ((diff / currentPrice) * 100).toFixed(2);
              const isAboveCMP = diff > 0;

              const textColor =
                lvl.type === 'resistance'
                  ? 'text-rose-400'
                  : lvl.type === 'support'
                  ? 'text-emerald-400'
                  : 'text-amber-400';

              return (
                <tr key={idx} className="hover:bg-dark-950/40 transition-colors">
                  <td className="py-2.5 font-bold text-slate-300 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      lvl.type === 'resistance' ? 'bg-rose-500' : lvl.type === 'support' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    {lvl.label}
                  </td>
                  <td className="py-2.5 font-bold text-white">
                    {lvl.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </td>
                  <td className={`py-2.5 font-medium ${isAboveCMP ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isAboveCMP ? '+' : ''}{diff.toFixed(1)} ({isAboveCMP ? '+' : ''}{diffPercent}%)
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      lvl.type === 'resistance'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                        : lvl.type === 'support'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                    }`}>
                      {lvl.type}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

