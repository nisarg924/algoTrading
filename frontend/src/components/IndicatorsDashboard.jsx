import React from 'react';
import {
  Activity,
  Layers,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Gauge,
  Waves,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function IndicatorsDashboard({ indicators, currentPrice }) {
  if (!indicators) return null;

  const { rsi, macd, vwap, bollinger, atr, volume, emas } = indicators;

  // RSI Color
  const rsiColor = rsi.current >= 70 ? 'text-amber-400' : rsi.current <= 30 ? 'text-emerald-400' : rsi.current >= 50 ? 'text-blue-400' : 'text-slate-400';
  const rsiBg = rsi.current >= 70 ? 'bg-amber-500' : rsi.current <= 30 ? 'bg-emerald-500' : rsi.current >= 50 ? 'bg-blue-500' : 'bg-slate-500';

  // MACD Color
  const isMacdBullish = macd.histogram > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Technical Indicators & Momentum Matrix
        </h3>
        <span className="text-xs text-slate-400 font-mono">10+ Quantitative Signals</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. RSI (14) Card */}
        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-blue-400" /> RSI (14 Period)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              rsi.status === 'OVERBOUGHT' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              rsi.status === 'OVERSOLD' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              rsi.status === 'BULLISH' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
              'bg-slate-800 text-slate-300'
            }`}>
              {rsi.status}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className={`text-3xl font-extrabold font-mono ${rsiColor}`}>
              {rsi.current}
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-right">
              <div>Overbought &gt; 70</div>
              <div>Oversold &lt; 30</div>
            </div>
          </div>

          {/* RSI Visual Bar */}
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
            <div
              className={`h-full ${rsiBg} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, rsi.current))}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {rsi.current >= 60 ? 'Strong upside bullish momentum continuing.' :
             rsi.current <= 40 ? 'Sellers exerting sustained downward pressure.' :
             'Neutral momentum; consolidating inside mid-range.'}
          </div>
        </div>

        {/* 2. MACD (12, 26, 9) Card */}
        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" /> MACD (12, 26, 9)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isMacdBullish ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {macd.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-dark-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">MACD Line</span>
              <span className="font-bold text-white">{macd.macd}</span>
            </div>
            <div className="p-2 rounded bg-dark-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Signal Line</span>
              <span className="font-bold text-white">{macd.signal}</span>
            </div>
            <div className="p-2 rounded bg-dark-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Histogram</span>
              <span className={`font-bold ${isMacdBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
                {macd.histogram > 0 ? '+' : ''}{macd.histogram}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Zap className={`w-3.5 h-3.5 ${isMacdBullish ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span>
              {isMacdBullish ? 'Histogram positive: Bulls in driver seat.' : 'Histogram negative: Bearish momentum active.'}
            </span>
          </div>
        </div>

        {/* 3. VWAP Card */}
        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-blue-400" /> VWAP Benchmark
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              vwap.diffPercent >= 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {vwap.status}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-extrabold font-mono text-white">
                {Number(vwap.current).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Volume Weighted Avg Price</div>
            </div>
            <div className={`text-base font-extrabold font-mono ${vwap.diffPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {vwap.diffPercent >= 0 ? '+' : ''}{vwap.diffPercent}%
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            {vwap.diffPercent >= 0
              ? 'Trading comfortably above institutional average price.'
              : 'Below VWAP; institutions are currently selling or holding back.'}
          </div>
        </div>

        {/* 4. Exponential Moving Averages (EMA Matrix) */}
        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" /> EMA Ribbon (9, 21, 50, 200)
            </span>
            <span className="text-[10px] font-mono text-blue-400">Multi-Timeframe</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {emas.map(e => {
              const isPriceAbove = currentPrice >= e.value;
              return (
                <div key={e.period} className="p-2 rounded bg-dark-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">EMA {e.period}:</span>
                  <div className="text-right">
                    <span className="text-white font-bold block">{e.value.toFixed(1)}</span>
                    <span className={`text-[10px] ${isPriceAbove ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPriceAbove ? '▲ Above' : '▼ Below'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400">
            {currentPrice > (emas[0]?.value || 0) && (emas[0]?.value || 0) > (emas[1]?.value || 0)
              ? 'Golden short-term alignment: 9 EMA > 21 EMA.'
              : 'Death short-term alignment: 9 EMA < 21 EMA.'}
          </div>
        </div>

        {/* 5. Volume & Institutional Flow */}
        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-400" /> Volume & Institutional Flow
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              volume.isHighVolume ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-300'
            }`}>
              {volume.isHighVolume ? 'HIGH VOLUME SURGE' : 'NORMAL VOLUME'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-extrabold font-mono text-white">
                {volume.surgeFactor}x
              </div>
              <div className="text-[10px] text-slate-400 font-mono">vs 20-Day SMA Volume</div>
            </div>
            <div className="text-right text-xs font-mono">
              <div className="text-slate-300 font-semibold">{Number(volume.currentVolume).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500">Avg: {Number(volume.avgVolume).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-300 font-medium bg-dark-950 p-2 rounded border border-slate-800/80">
            {volume.buyerSellerBias}
          </div>
        </div>

        {/* 6. Bollinger Bands & Volatility (ATR) */}
        <div className="p-4 rounded-xl bg-dark-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" /> Bollinger Bands & ATR
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ATR (14): <strong className="text-white">{atr} pts</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-dark-950 border border-slate-800">
              <span className="text-[10px] text-rose-400 block">Upper Band</span>
              <span className="font-bold text-white">{bollinger.upper}</span>
            </div>
            <div className="p-2 rounded bg-dark-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Middle (20)</span>
              <span className="font-bold text-white">{bollinger.middle}</span>
            </div>
            <div className="p-2 rounded bg-dark-950 border border-slate-800">
              <span className="text-[10px] text-emerald-400 block">Lower Band</span>
              <span className="font-bold text-white">{bollinger.lower}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Bandwidth: <strong className="text-white font-mono">{bollinger.bandwidth}%</strong></span>
            <span>%B Position: <strong className="text-white font-mono">{bollinger.percentB}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

