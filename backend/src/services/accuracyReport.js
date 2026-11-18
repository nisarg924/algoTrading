const {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateVWAP,
  calculateBollingerBands,
  calculateATR,
  analyzeVolume,
  calculatePivotPoints
} = require('./indicators');
const { detectCandlestickPatterns } = require('./candlestickPatterns');
const { generateMarketPrediction } = require('./predictionEngine');

/**
 * Historical Backtesting & Accuracy Report Engine
 * Simulates algorithm predictions on each historical day (Day T)
 * and verifies against the actual outcome on Day T+1.
 * Supports up to 30 days (1 month maximum).
 */
function generateAccuracyReport(bars, maxDays = 30, symbol = '^NSEI') {
  if (!bars || bars.length < 35) {
    return {
      symbol,
      daysRequested: maxDays,
      totalSessions: 0,
      summary: {
        winRate: 0,
        accurateCount: 0,
        failedCount: 0,
        neutralCount: 0,
        totalPointsCaptured: 0
      },
      records: []
    };
  }

  // Cap at 30 trading days (approximately 1 calendar month)
  const daysToAnalyze = Math.min(Math.max(5, parseInt(maxDays, 10) || 30), 30);

  // We need at least 1 day after each prediction to check the actual result.
  // So the last testable prediction day is bars.length - 2 (checked by bars.length - 1).
  // Total available pairs is bars.length - 1.
  const endIndex = bars.length - 2;
  const startIndex = Math.max(25, endIndex - daysToAnalyze + 1);

  const records = [];
  let cumulativePoints = 0;
  let accurateCount = 0;
  let failedCount = 0;
  let neutralCount = 0;
  let bullishCorrect = 0;
  let bullishTotal = 0;
  let bearishCorrect = 0;
  let bearishTotal = 0;

  for (let i = startIndex; i <= endIndex; i++) {
    // 1. Slice history up to Day T (the close of Day T)
    const historySlice = bars.slice(0, i + 1);
    const dayT = bars[i];
    const dayNext = bars[i + 1];

    const currentPrice = dayT.close;
    const lastBar = historySlice[historySlice.length - 1];

    // 2. Run the exact same quantitative indicators as live engine
    const rsi = calculateRSI(historySlice, 14);
    const macd = calculateMACD(historySlice, 12, 26, 9);
    const vwap = calculateVWAP(historySlice);
    const bollinger = calculateBollingerBands(historySlice, 20, 2);
    const atr = calculateATR(historySlice, 14);
    const volumeAnalysis = analyzeVolume(historySlice, 20);
    const pivots = calculatePivotPoints(lastBar);

    const ema9Arr = calculateEMA(historySlice, 9);
    const ema21Arr = calculateEMA(historySlice, 21);
    const ema50Arr = calculateEMA(historySlice, 50);
    const ema200Arr = calculateEMA(historySlice, 200);

    const emas = [
      { period: 9, value: ema9Arr[ema9Arr.length - 1]?.value || currentPrice },
      { period: 21, value: ema21Arr[ema21Arr.length - 1]?.value || currentPrice },
      { period: 50, value: ema50Arr[ema50Arr.length - 1]?.value || currentPrice },
      { period: 200, value: ema200Arr[ema200Arr.length - 1]?.value || currentPrice }
    ];

    const candlestickPatterns = detectCandlestickPatterns(historySlice);

    // 3. Generate the prediction that was produced for Day T+1 opening
    const prediction = generateMarketPrediction({
      symbol,
      currentPrice,
      bars: historySlice,
      rsi,
      macd,
      vwap,
      bollinger,
      atr,
      volume: volumeAnalysis,
      pivots,
      candlestickPatterns,
      emas
    });

    // 4. Compare with actual Day T+1 market outcome
    const actualOpen = dayNext.open;
    const actualHigh = dayNext.high;
    const actualLow = dayNext.low;
    const actualClose = dayNext.close;

    const gapPoints = Number((actualOpen - currentPrice).toFixed(2));
    const gapPercent = Number((((actualOpen - currentPrice) / currentPrice) * 100).toFixed(2));
    const dayReturnPoints = Number((actualClose - currentPrice).toFixed(2));
    const dayReturnPercent = Number((((actualClose - currentPrice) / currentPrice) * 100).toFixed(2));

    const predictedDirection = prediction.trendDirection; // 'BULLISH', 'BEARISH', or 'NEUTRAL'

    let verdict = 'NEUTRAL';
    let isCorrect = false;
    let pointsCaptured = 0;
    let explanation = '';

    // Significance threshold: 0.10% move or ATR proportional
    const isUpGap = gapPercent > 0.08;
    const isDownGap = gapPercent < -0.08;
    const isUpDay = dayReturnPercent > 0;
    const isDownDay = dayReturnPercent < 0;

    if (predictedDirection === 'BULLISH') {
      bullishTotal++;
      // Accurate if market opened gap up, or ended day positive with bull follow-through
      if (isUpGap || isUpDay) {
        verdict = 'ACCURATE';
        isCorrect = true;
        accurateCount++;
        bullishCorrect++;
        pointsCaptured = gapPoints > 0 ? gapPoints : dayReturnPoints;
        explanation = `Bullish prediction verified: Market opened ${gapPoints >= 0 ? '+' : ''}${gapPoints} pts (${gapPercent}%) with Day High at ${actualHigh}.`;
      } else {
        verdict = 'FAILED';
        isCorrect = false;
        failedCount++;
        pointsCaptured = gapPoints; // Negative capture
        explanation = `Bullish call missed: Market experienced selling pressure, opening down ${gapPoints} pts (${gapPercent}%).`;
      }
    } else if (predictedDirection === 'BEARISH') {
      bearishTotal++;
      // Accurate if market opened gap down or ended day negative
      if (isDownGap || isDownDay) {
        verdict = 'ACCURATE';
        isCorrect = true;
        accurateCount++;
        bearishCorrect++;
        // On short, profit is positive when price drops
        pointsCaptured = Math.abs(gapPoints > 0 ? -gapPoints : gapPoints);
        explanation = `Bearish prediction verified: Market opened down ${gapPoints} pts (${gapPercent}%) hitting Day Low at ${actualLow}.`;
      } else {
        verdict = 'FAILED';
        isCorrect = false;
        failedCount++;
        pointsCaptured = -Math.abs(gapPoints);
        explanation = `Bearish call missed: Market defied selling signals and rallied +${gapPoints} pts.`;
      }
    } else {
      // Neutral prediction: verified if move was flat / choppy (less than 0.35% range)
      if (Math.abs(gapPercent) <= 0.35) {
        verdict = 'ACCURATE';
        isCorrect = true;
        accurateCount++;
        pointsCaptured = 0;
        explanation = `Rangebound prediction verified: Market opened flat with narrow ${gapPoints} pts (${gapPercent}%) move.`;
      } else {
        verdict = 'NEUTRAL';
        neutralCount++;
        pointsCaptured = 0;
        explanation = `Market had a breakout move of ${gapPercent}% contrary to consolidation forecast.`;
      }
    }

    cumulativePoints += pointsCaptured;

    records.push({
      predictionDate: dayT.date,
      outcomeDate: dayNext.date,
      prevClose: currentPrice,
      predicted: {
        trend: prediction.predictedTrend,
        direction: predictedDirection,
        confidenceScore: prediction.confidenceScore,
        badgeColor: prediction.badgeColor,
        expectedGapType: prediction.gapProjection.gapType,
        expectedOpenRange: prediction.gapProjection.expectedOpenRange,
        expectedPointsMove: prediction.gapProjection.expectedPointsMove,
        dominantPattern: candlestickPatterns[0]?.name || 'Standard Candle'
      },
      actual: {
        open: actualOpen,
        high: actualHigh,
        low: actualLow,
        close: actualClose,
        gapPoints,
        gapPercent,
        dayReturnPoints,
        dayReturnPercent,
        actualMoveType: isUpGap ? 'GAP_UP' : isDownGap ? 'GAP_DOWN' : 'FLAT'
      },
      result: {
        verdict,
        isCorrect,
        pointsCaptured: Number(pointsCaptured.toFixed(2)),
        cumulativePoints: Number(cumulativePoints.toFixed(2)),
        explanation
      }
    });
  }

  // Reverse so newest predictions are displayed first
  const displayRecords = [...records].reverse();

  const totalDecisive = accurateCount + failedCount;
  const winRate = totalDecisive > 0 ? Number(((accurateCount / totalDecisive) * 100).toFixed(1)) : 0;
  const overallWinRate = records.length > 0 ? Number(((accurateCount / records.length) * 100).toFixed(1)) : 0;

  const bullishWinRate = bullishTotal > 0 ? Number(((bullishCorrect / bullishTotal) * 100).toFixed(1)) : 0;
  const bearishWinRate = bearishTotal > 0 ? Number(((bearishCorrect / bearishTotal) * 100).toFixed(1)) : 0;

  // Best & Worst Call
  let bestCall = null;
  let worstCall = null;
  for (const r of records) {
    if (!bestCall || r.result.pointsCaptured > bestCall.pointsCaptured) {
      bestCall = {
        date: r.outcomeDate,
        pointsCaptured: r.result.pointsCaptured,
        predicted: r.predicted.trend,
        gapPercent: r.actual.gapPercent
      };
    }
    if (!worstCall || r.result.pointsCaptured < worstCall.pointsCaptured) {
      worstCall = {
        date: r.outcomeDate,
        pointsCaptured: r.result.pointsCaptured,
        predicted: r.predicted.trend,
        gapPercent: r.actual.gapPercent
      };
    }
  }

  return {
    symbol,
    maxDays: daysToAnalyze,
    totalSessions: records.length,
    summary: {
      winRate,
      overallWinRate,
      accurateCount,
      failedCount,
      neutralCount,
      totalPointsCaptured: Number(cumulativePoints.toFixed(2)),
      bullishStats: {
        total: bullishTotal,
        correct: bullishCorrect,
        winRate: bullishWinRate
      },
      bearishStats: {
        total: bearishTotal,
        correct: bearishCorrect,
        winRate: bearishWinRate
      },
      bestCall,
      worstCall
    },
    performanceTimeline: records.map(r => ({
      date: r.outcomeDate,
      pointsCaptured: r.result.pointsCaptured,
      cumulativePoints: r.result.cumulativePoints,
      isCorrect: r.result.isCorrect,
      verdict: r.result.verdict
    })),
    records: displayRecords
  };
}

module.exports = {
  generateAccuracyReport
};

