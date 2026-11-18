import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Filter,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { fetchAccuracyReport } from '../services/api';

export default function AccuracyReport({ selectedSymbol, assetName }) {
  const [days, setDays] = useState(30);
  const [filterVerdict, setFilterVerdict] = useState('ALL'); // 'ALL', 'ACCURATE', 'FAILED', 'NEUTRAL'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAccuracyReport(selectedSymbol, days);
        if (isMounted && res && res.data) {
          setReportData(res.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load accuracy report:', err);
          setError(err.response?.data?.error || err.message || 'Failed to generate accuracy report');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReport();
    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, days]);

  const report = reportData?.report;
  const summary = report?.summary;
  const records = report?.records || [];

  // Filter records
  const filteredRecords = useMemo(() => {
    if (filterVerdict === 'ALL') return records;
    return records.filter(r => r.result.verdict === filterVerdict);
  }, [records, filterVerdict]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!records.length) return;

    const headers = [
      'Prediction Date',
      'Outcome Date',
      'Prev Close',
      'Predicted Trend',
      'Predicted Direction',
      'Confidence %',
      'Expected Range',
      'Actual Open',
      'Actual High',
      'Actual Low',
      'Actual Close',
      'Actual Gap Points',
      'Actual Gap %',
      'Day Return %',
      'Verdict',
      'Points Captured',
      'Explanation'
    ];

    const rows = records.map(r => [
      r.predictionDate,
      r.outcomeDate,
      r.prevClose,
      `"${r.predicted.trend}"`,
      r.predicted.direction,
      `${r.predicted.confidenceScore}%`,
      `"${r.predicted.expectedOpenRange}"`,
      r.actual.open,
      r.actual.high,
      r.actual.low,
      r.actual.close,
      r.actual.gapPoints,
      `${r.actual.gapPercent}%`,
      `${r.actual.dayReturnPercent}%`,
      r.result.verdict,
      r.result.pointsCaptured,
      `"${r.result.explanation.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedSymbol}_Algo_Accuracy_Report_${days}Days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Predictions vs Actual Outcomes Audit
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
                1-MONTH MAX
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Backtesting report comparing our algorithm's forecast against what actually happened on market open for{' '}
              <span className="text-slate-200 font-bold">{assetName || selectedSymbol}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Days Selector */}
          <div className="flex items-center bg-dark-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                days === 7 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDays(14)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                days === 14 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                days === 30 ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days (1 Month)
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={!records.length}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-slate-700/80 text-slate-200 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="Download CSV Spreadsheet Report"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading && !reportData ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm text-slate-400 font-mono">
            Backtesting {days} historical sessions for <span className="text-white font-bold">{selectedSymbol}</span>...
          </div>
          <div className="text-xs text-slate-500">
            Evaluating historical RSI, MACD, EMAs, Volume, and Candlestick accuracy against actual outcomes
          </div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <>
          {/* Executive Performance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Overall Win Rate */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-dark-900 to-dark-850 border border-slate-800 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Algorithm Win Rate
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
                  {summary.winRate}%
                </div>
                <div className="text-xs text-slate-400">Accuracy</div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-dark-950 h-2.5 rounded-full overflow-hidden border border-slate-800 flex">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  style={{ width: `${summary.winRate}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  Accurate: <strong className="text-emerald-400">{summary.accurateCount}</strong>
                </span>
                <span>
                  Missed: <strong className="text-rose-400">{summary.failedCount}</strong>
                </span>
                <span>
                  Neutral: <strong className="text-amber-400">{summary.neutralCount}</strong>
                </span>
              </div>
            </div>

            {/* 2. Net Points Captured */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-dark-900 to-dark-850 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Net Points Captured
                </span>
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <div
                  className={`text-3xl sm:text-4xl font-extrabold font-mono ${
                    summary.totalPointsCaptured >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {summary.totalPointsCaptured >= 0 ? '+' : ''}
                  {summary.totalPointsCaptured.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </div>
                <div className="text-xs text-slate-400">pts</div>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Cumulative points gain achieved by positioning with the algorithm's forecasted opening direction.
              </p>
            </div>

            {/* 3. Bullish vs Bearish Accuracy */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-dark-900 to-dark-850 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Directional Split
                </span>
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <BarChart2 className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Bull Calls:
                  </span>
                  <span className="text-white font-bold">
                    {summary.bullishStats.winRate}%{' '}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({summary.bullishStats.correct}/{summary.bullishStats.total})
                    </span>
                  </span>
                </div>
                <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${summary.bullishStats.winRate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Bear Calls:
                  </span>
                  <span className="text-white font-bold">
                    {summary.bearishStats.winRate}%{' '}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({summary.bearishStats.correct}/{summary.bearishStats.total})
                    </span>
                  </span>
                </div>
                <div className="w-full bg-dark-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${summary.bearishStats.winRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 4. Best & Worst Call */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-dark-900 to-dark-850 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Highlight Extremes
                </span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Target className="w-4 h-4" />
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {summary.bestCall && (
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold block">BEST CALL</span>
                      <span className="text-white font-mono text-[11px]">{summary.bestCall.date}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      +{summary.bestCall.pointsCaptured} pts
                    </span>
                  </div>
                )}
                {summary.worstCall && (
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-rose-400 font-bold block">WORST MISS</span>
                      <span className="text-white font-mono text-[11px]">{summary.worstCall.date}</span>
                    </div>
                    <span className="font-mono text-rose-400 font-bold text-sm">
                      {summary.worstCall.pointsCaptured} pts
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visual Performance Growth Chart Bar */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  Cumulative Performance & Points Captured Timeline
                </h3>
                <p className="text-xs text-slate-400">
                  Session-by-session points progression over the {report.totalSessions} analyzed trading days
                </p>
              </div>

              {/* Table Filter Tabs */}
              <div className="flex items-center bg-dark-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setFilterVerdict('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterVerdict === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({records.length})
                </button>
                <button
                  onClick={() => setFilterVerdict('ACCURATE')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterVerdict === 'ACCURATE' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Accurate ({summary.accurateCount})
                </button>
                <button
                  onClick={() => setFilterVerdict('FAILED')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterVerdict === 'FAILED' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Failed ({summary.failedCount})
                </button>
              </div>
            </div>

            {/* Visual Timeline Bars */}
            <div className="pt-2">
              <div className="h-28 flex items-end gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                {report.performanceTimeline.map((item, idx) => {
                  const isPositive = item.pointsCaptured >= 0;
                  const maxCap = Math.max(...report.performanceTimeline.map(t => Math.abs(t.pointsCaptured)), 100);
                  const barHeight = Math.max(12, Math.min(100, (Math.abs(item.pointsCaptured) / maxCap) * 100));

                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-[24px] flex flex-col items-center justify-end group relative cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-dark-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono text-white whitespace-nowrap shadow-xl pointer-events-none">
                        <div>{item.date}</div>
                        <div className={isPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {item.pointsCaptured > 0 ? '+' : ''}{item.pointsCaptured} pts
                        </div>
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full rounded-t transition-all group-hover:opacity-80 ${
                          item.verdict === 'ACCURATE'
                            ? 'bg-emerald-500'
                            : item.verdict === 'FAILED'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ height: `${barHeight}%` }}
                      />
                      <span className="text-[9px] text-slate-500 font-mono mt-1 block truncate w-full text-center">
                        {item.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Audit Table */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Day-by-Day Prediction vs Actual Outcome Log
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Displaying {filteredRecords.length} of {records.length} sessions
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-3 pl-2">Session Dates</th>
                    <th className="pb-3">Prev Close</th>
                    <th className="pb-3">Our Algorithm Prediction</th>
                    <th className="pb-3">Actual Market Outcome</th>
                    <th className="pb-3 text-center">Verdict</th>
                    <th className="pb-3 text-right pr-2">Points Captured</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRecords.map((rec, idx) => {
                    const isBullish = rec.predicted.direction === 'BULLISH';
                    const isBearish = rec.predicted.direction === 'BEARISH';
                    const isHit = rec.result.verdict === 'ACCURATE';
                    const isMiss = rec.result.verdict === 'FAILED';
                    const isPositiveMove = rec.actual.gapPoints >= 0;

                    return (
                      <tr key={idx} className="hover:bg-dark-950/50 transition-colors group">
                        {/* Dates */}
                        <td className="py-3 pl-2">
                          <div className="font-bold text-white">{rec.outcomeDate}</div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            Pred: {rec.predictionDate}
                          </div>
                        </td>

                        {/* Prev Close */}
                        <td className="py-3 text-slate-300 font-semibold">
                          {rec.prevClose.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                        </td>

                        {/* Algorithm Prediction */}
                        <td className="py-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                isBullish
                                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                                  : isBearish
                                  ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                                  : 'bg-amber-950/80 text-amber-400 border-amber-800'
                              }`}
                            >
                              {rec.predicted.trend}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans">
                              {rec.predicted.confidenceScore}% conf
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            Proj Open: <span className="text-slate-300">{rec.predicted.expectedOpenRange}</span>
                          </div>
                        </td>

                        {/* Actual Outcome */}
                        <td className="py-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">
                              Open: {rec.actual.open.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                            </span>
                            <span
                              className={`flex items-center gap-0.5 font-bold ${
                                isPositiveMove ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isPositiveMove ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {isPositiveMove ? '+' : ''}{rec.actual.gapPoints} ({isPositiveMove ? '+' : ''}{rec.actual.gapPercent}%)
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            Range: H {rec.actual.high.toFixed(1)} / L {rec.actual.low.toFixed(1)} • Day Close: {rec.actual.close.toFixed(1)}
                          </div>
                        </td>

                        {/* Verdict Badge */}
                        <td className="py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                              isHit
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isMiss
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isHit ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> ACCURATE
                              </>
                            ) : isMiss ? (
                              <>
                                <XCircle className="w-3 h-3" /> FAILED
                              </>
                            ) : (
                              <>
                                <HelpCircle className="w-3 h-3" /> NEUTRAL
                              </>
                            )}
                          </span>
                        </td>

                        {/* Points Captured */}
                        <td className="py-3 text-right pr-2">
                          <div
                            className={`font-extrabold text-sm ${
                              rec.result.pointsCaptured > 0
                                ? 'text-emerald-400'
                                : rec.result.pointsCaptured < 0
                                ? 'text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {rec.result.pointsCaptured > 0 ? '+' : ''}
                            {rec.result.pointsCaptured} pts
                          </div>
                          <div className="text-[9px] text-slate-500 font-sans mt-0.5">
                            Cumul: {rec.result.cumulativePoints > 0 ? '+' : ''}{rec.result.cumulativePoints} pts
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

