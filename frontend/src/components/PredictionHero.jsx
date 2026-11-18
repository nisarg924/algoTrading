import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Compass,
  CheckCircle2,
  Percent,
  Layers
} from 'lucide-react';

export default function PredictionHero({ assetData }) {
  if (!assetData || !assetData.prediction) return null;

  const { meta, prediction, indicators } = assetData;
  const isPositive = meta.change >= 0;
  const isBullish = prediction.trendDirection === 'BULLISH';
  const isBearish = prediction.trendDirection === 'BEARISH';

  // Dynamic Theme Colors based on sentiment
  const themeClasses = isBullish
    ? {
        border: 'border-emerald-500/40',
        bg: 'from-emerald-950/30 to-dark-900',
        glow: 'glow-bullish',
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        bar: 'bg-emerald-500',
        accentText: 'text-emerald-400'
      }
    : isBearish
    ? {
        border: 'border-rose-500/40',
        bg: 'from-rose-950/30 to-dark-900',
        glow: 'glow-bearish',
        badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        bar: 'bg-rose-500',
        accentText: 'text-rose-400'
      }
    : {
        border: 'border-amber-500/40',
        bg: 'from-amber-950/30 to-dark-900',
        glow: 'glow-accent',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        bar: 'bg-amber-500',
        accentText: 'text-amber-400'
      };

  return (
    <div className="space-y-4">
      {/* Asset Header Info Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-blue-400 font-mono font-bold text-lg">
            {meta.symbol.replace('^', '').replace('.NS', '')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {meta.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {meta.currency}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Symbol: <span className="text-slate-300">{meta.symbol}</span> • Last Updated:{' '}
              {new Date(meta.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Live Price & Range Stats */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {Number(meta.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div
              className={`flex items-center justify-end gap-1 text-sm font-semibold font-mono ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {isPositive ? '+' : ''}{meta.change.toFixed(2)} ({isPositive ? '+' : ''}{meta.changePercent}%)
            </div>
          </div>

          <div className="hidden sm:block pl-6 border-l border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-400">
              Day High: <span className="text-slate-200 font-semibold">{meta.dayHigh.toFixed(2)}</span>
            </div>
            <div className="text-slate-400">
              Day Low: <span className="text-slate-200 font-semibold">{meta.dayLow.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tomorrow Opening Prediction Card */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${themeClasses.bg} border ${themeClasses.border} p-6 shadow-2xl ${themeClasses.glow}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Big Forecast Verdict */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>ALGORITHMIC FORECAST FOR TOMORROW OPENING</span>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-slate-400 font-medium">Predicted Opening Sentiment:</div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl sm:text-3xl font-black tracking-wide px-4 py-1.5 rounded-xl border ${themeClasses.badge}`}>
                  {prediction.predictedTrend}
                </span>
              </div>
            </div>

            {/* Probability Gauge Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Bullish Open: {prediction.confidenceScore}%
                </span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Bearish Open: {prediction.bearishProbability}%
                </span>
              </div>

              {/* Dual-color Progress Bar */}
              <div className="w-full h-3 bg-dark-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-700"
                  style={{ width: `${prediction.confidenceScore}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-700"
                  style={{ width: `${prediction.bearishProbability}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Confidence Score: <strong className="text-slate-200">{prediction.confidenceScore}%</strong></span>
                <span>Algorithm Score: <strong className="text-slate-200">{prediction.compositeScore} / 15</strong></span>
              </div>
            </div>
          </div>

          {/* Middle Column: Expected Gap Projection & Target Opening Range */}
          <div className="lg:col-span-3 p-4 rounded-xl bg-dark-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>TOMORROW GAP PROJECTION</span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Expected Open Bias:</div>
              <div className={`text-base font-bold font-mono ${themeClasses.accentText}`}>
                {prediction.gapProjection.gapType}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Projected Opening Range:</div>
              <div className="text-sm font-bold font-mono text-white bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
                {prediction.gapProjection.expectedOpenRange}
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
              <span>Expected ATR Volatility:</span>
              <span className="font-mono text-slate-200 font-bold">±{prediction.gapProjection.expectedPointsMove} pts</span>
            </div>
          </div>

          {/* Right Column: Key Pivot Triggers */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-dark-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>KEY OPENING TRIGGER LEVELS</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Floor Pivots</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40">
                <div className="text-rose-400 text-[10px] font-bold">RESISTANCE (R1)</div>
                <div className="text-white font-bold mt-0.5">{indicators.pivots.classic.r1.toFixed(1)}</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40">
                <div className="text-amber-400 text-[10px] font-bold">PIVOT (P)</div>
                <div className="text-white font-bold mt-0.5">{indicators.pivots.classic.pivot.toFixed(1)}</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/40">
                <div className="text-emerald-400 text-[10px] font-bold">SUPPORT (S1)</div>
                <div className="text-white font-bold mt-0.5">{indicators.pivots.classic.s1.toFixed(1)}</div>
              </div>
            </div>

            {/* Strategic Trading Action Note */}
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Algo Action: </strong>
                {prediction.tradingPlan.recommendedAction}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Expandable Trading Plan Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Long Plan */}
          <div className="p-3 rounded-xl bg-dark-950/50 border border-emerald-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between font-bold text-emerald-400 mb-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> LONG BREAKOUT SETUP
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                R:R {prediction.tradingPlan.bullishSetup.riskRewardRatio}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">ENTRY:</span>
                <span className="text-white font-semibold">{prediction.tradingPlan.bullishSetup.entryTrigger}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TARGET 1:</span>
                <span className="text-emerald-300 font-semibold">{prediction.tradingPlan.bullishSetup.target1}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TARGET 2:</span>
                <span className="text-emerald-300 font-semibold">{prediction.tradingPlan.bullishSetup.target2}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">STOP LOSS:</span>
                <span className="text-rose-400 font-semibold">{prediction.tradingPlan.bullishSetup.stopLoss}</span>
              </div>
            </div>
          </div>

          {/* Short Plan */}
          <div className="p-3 rounded-xl bg-dark-950/50 border border-rose-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between font-bold text-rose-400 mb-2">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" /> SHORT BREAKDOWN SETUP
              </span>
              <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                R:R {prediction.tradingPlan.bearishSetup.riskRewardRatio}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">ENTRY:</span>
                <span className="text-white font-semibold">{prediction.tradingPlan.bearishSetup.entryTrigger}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TARGET 1:</span>
                <span className="text-rose-300 font-semibold">{prediction.tradingPlan.bearishSetup.target1}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TARGET 2:</span>
                <span className="text-rose-300 font-semibold">{prediction.tradingPlan.bearishSetup.target2}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">STOP LOSS:</span>
                <span className="text-emerald-400 font-semibold">{prediction.tradingPlan.bearishSetup.stopLoss}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

