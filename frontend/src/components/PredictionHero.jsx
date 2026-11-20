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
  Activity,
  Layers,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function PredictionHero({ assetData }) {
  if (!assetData || !assetData.prediction) return null;

  const { meta, prediction, indicators } = assetData;
  const isPositive = meta.change >= 0;
  const isBullish = prediction.trendDirection === 'BULLISH';
  const isBearish = prediction.trendDirection === 'BEARISH';

  // Calculate position within day's high-low range
  const price = Number(meta?.price) || 0;
  const dayHigh = Number(meta?.dayHigh) || price;
  const dayLow = Number(meta?.dayLow) || price;
  const dayRange = (dayHigh - dayLow) || 1;
  const rangePosition = dayRange > 0 ? Math.min(100, Math.max(0, ((price - dayLow) / dayRange) * 100)) : 50;

  // Safe VWAP extraction (indicators.vwap is an object { current, status, diffPercent })
  const vwapValue = typeof indicators?.vwap === 'object' && indicators.vwap !== null
    ? indicators.vwap.current
    : (typeof indicators?.vwap === 'number' ? indicators.vwap : null);

  // Dynamic Theme Colors based on sentiment
  const themeClasses = isBullish
    ? {
        border: 'border-emerald-500/40',
        bg: 'from-emerald-950/40 to-dark-900',
        glow: 'glow-bullish',
        badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        bar: 'bg-emerald-500',
        accentText: 'text-emerald-400'
      }
    : isBearish
    ? {
        border: 'border-rose-500/40',
        bg: 'from-rose-950/40 to-dark-900',
        glow: 'glow-bearish',
        badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        bar: 'bg-rose-500',
        accentText: 'text-rose-400'
      }
    : {
        border: 'border-amber-500/40',
        bg: 'from-amber-950/40 to-dark-900',
        glow: 'glow-accent',
        badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        bar: 'bg-amber-500',
        accentText: 'text-amber-400'
      };

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 🟢 CARD 1: LIVE REAL-TIME MARKET SNAPSHOT (TODAY)         */}
      {/* ======================================================== */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
        {/* Top Header Label */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase font-mono">
              LIVE REAL-TIME MARKET STATUS (TODAY)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Updated: {new Date(meta.lastUpdated).toLocaleTimeString()}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Upstox Official NSE Feed
            </span>
          </div>
        </div>

        {/* Live Asset & Price Big Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Asset Identity */}
          <div className="lg:col-span-5 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-blue-400 font-mono font-black text-xl tracking-tight shadow-md">
              {meta.symbol.replace('^', '').replace('.NS', '')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {meta.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold border border-slate-700">
                  {meta.currency}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Symbol: <span className="text-blue-400 font-semibold">{meta.symbol}</span> • Exchange: NSE
              </div>
            </div>
          </div>

          {/* Big Live Price */}
          <div className="lg:col-span-3">
            <div className="text-xs text-slate-400 font-medium font-mono uppercase tracking-wider mb-0.5">
              Current Live Price:
            </div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight flex items-baseline gap-2">
              <span>₹{Number(meta.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div
              className={`flex items-center gap-1.5 text-sm font-bold font-mono mt-0.5 ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{meta.change.toFixed(2)}</span>
              <span>({isPositive ? '+' : ''}{meta.changePercent}%)</span>
              <span className="text-[10px] text-slate-500 font-normal ml-1">Today</span>
            </div>
          </div>

          {/* Intraday Range Slider & Stats */}
          <div className="lg:col-span-4 p-3 rounded-xl bg-dark-950/80 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Day Low: <strong className="text-slate-200">{meta?.dayLow != null ? `₹${Number(meta.dayLow).toFixed(2)}` : '—'}</strong></span>
              <span className="text-slate-400">Day High: <strong className="text-slate-200">{meta?.dayHigh != null ? `₹${Number(meta.dayHigh).toFixed(2)}` : '—'}</strong></span>
            </div>

            {/* Range Bar with Indicator Dot */}
            <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                style={{ width: `${rangePosition}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
              <span>VWAP: <strong className="text-slate-300">{vwapValue != null ? `₹${Number(vwapValue).toFixed(2)}` : '—'}</strong></span>
              <span>Position: <strong className="text-blue-400">{!isNaN(rangePosition) ? `${rangePosition.toFixed(0)}% of Range` : '50%'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🚀 CARD 2: NEXT-DAY OPENING & TREND PREDICTOR             */}
      {/* ======================================================== */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${themeClasses.bg} border ${themeClasses.border} p-6 shadow-2xl ${themeClasses.glow}`}
      >
        {/* Header Label for Forecast */}
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800/80">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold tracking-wider text-amber-300 uppercase font-mono">
            NEXT-DAY OPENING PREDICTOR (ALGORITHMIC FORECAST)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Big Forecast Verdict */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-1.5">
              <div className="text-xs text-slate-400 font-medium">Tomorrow's Predicted Opening Sentiment:</div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl sm:text-3xl font-black tracking-wide px-4 py-2 rounded-xl border ${themeClasses.badge} shadow-lg`}>
                  {prediction.predictedTrend}
                </span>
              </div>
            </div>

            {/* Probability Gauge Bar */}
            <div className="space-y-2 pt-1">
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
          <div className="lg:col-span-3 p-4 rounded-xl bg-dark-950/80 border border-slate-800/80 space-y-3 shadow-inner">
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
          <div className="lg:col-span-4 p-4 rounded-xl bg-dark-950/80 border border-slate-800/80 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>KEY OPENING TRIGGER LEVELS</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Floor Pivots</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-900/50">
                <div className="text-rose-400 text-[10px] font-bold">RESISTANCE (R1)</div>
                <div className="text-white font-bold mt-0.5">{indicators?.pivots?.classic?.r1 != null ? Number(indicators.pivots.classic.r1).toFixed(1) : '—'}</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-900/50">
                <div className="text-amber-400 text-[10px] font-bold">PIVOT (P)</div>
                <div className="text-white font-bold mt-0.5">{indicators?.pivots?.classic?.pivot != null ? Number(indicators.pivots.classic.pivot).toFixed(1) : '—'}</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50">
                <div className="text-emerald-400 text-[10px] font-bold">SUPPORT (S1)</div>
                <div className="text-white font-bold mt-0.5">{indicators?.pivots?.classic?.s1 != null ? Number(indicators.pivots.classic.s1).toFixed(1) : '—'}</div>
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

        {/* Bottom Trading Execution Setups */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Long Plan */}
          <div className="p-3.5 rounded-xl bg-dark-950/60 border border-emerald-500/20 flex flex-col justify-between">
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
          <div className="p-3.5 rounded-xl bg-dark-950/60 border border-rose-500/20 flex flex-col justify-between">
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


