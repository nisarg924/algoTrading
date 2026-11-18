/**
 * Predictive Trend & Next-Day Market Opening Algorithmic Engine
 * Synthesizes Multi-Indicator & Candlestick Signals to Forecast Tomorrow's Opening
 */

function generateMarketPrediction({
  symbol,
  currentPrice,
  bars,
  rsi,
  macd,
  vwap,
  bollinger,
  atr,
  volume,
  pivots,
  candlestickPatterns,
  emas
}) {
  const lastBar = bars[bars.length - 1];
  const votes = [];
  let compositeScore = 0;

  // 1. EMA Trend Analysis
  const ema9 = emas.find(e => e.period === 9)?.value || currentPrice;
  const ema21 = emas.find(e => e.period === 21)?.value || currentPrice;
  const ema50 = emas.find(e => e.period === 50)?.value || currentPrice;
  const ema200 = emas.find(e => e.period === 200)?.value || currentPrice;

  let emaVote = 'NEUTRAL';
  let emaWeight = 0;
  if (currentPrice > ema9 && ema9 > ema21) {
    if (ema21 > ema50 && ema50 > ema200) {
      emaVote = 'STRONG_BULLISH';
      emaWeight = 3.0;
    } else {
      emaVote = 'BULLISH';
      emaWeight = 1.8;
    }
  } else if (currentPrice < ema9 && ema9 < ema21) {
    if (ema21 < ema50 && ema50 < ema200) {
      emaVote = 'STRONG_BEARISH';
      emaWeight = -3.0;
    } else {
      emaVote = 'BEARISH';
      emaWeight = -1.8;
    }
  } else if (currentPrice > ema21) {
    emaVote = 'MILD_BULLISH';
    emaWeight = 0.8;
  } else {
    emaVote = 'MILD_BEARISH';
    emaWeight = -0.8;
  }

  compositeScore += emaWeight;
  votes.push({
    name: 'Moving Averages (EMA 9, 21, 50, 200)',
    vote: emaVote.includes('BULLISH') ? 'BULLISH' : emaVote.includes('BEARISH') ? 'BEARISH' : 'NEUTRAL',
    detail: `Price (${currentPrice}) vs EMA 9 (${ema9.toFixed(1)}) & EMA 21 (${ema21.toFixed(1)})`,
    weight: emaWeight
  });

  // 2. RSI (14) Momentum
  let rsiVote = 'NEUTRAL';
  let rsiWeight = 0;
  if (rsi.current >= 75) {
    rsiVote = 'OVERBOUGHT_CAUTION';
    rsiWeight = 0.5; // Still bullish momentum, but caution on gap-up chase
  } else if (rsi.current >= 60) {
    rsiVote = 'BULLISH';
    rsiWeight = 2.0;
  } else if (rsi.current >= 50) {
    rsiVote = 'MILD_BULLISH';
    rsiWeight = 1.0;
  } else if (rsi.current <= 25) {
    rsiVote = 'OVERSOLD_BOUNCE';
    rsiWeight = 1.0; // High probability of mean-reversion gap-up
  } else if (rsi.current <= 40) {
    rsiVote = 'BEARISH';
    rsiWeight = -2.0;
  } else {
    rsiVote = 'MILD_BEARISH';
    rsiWeight = -1.0;
  }

  compositeScore += rsiWeight;
  votes.push({
    name: `RSI (14) - ${rsi.current}`,
    vote: rsiVote.includes('BULLISH') || rsiVote === 'OVERSOLD_BOUNCE' ? 'BULLISH' : rsiVote.includes('BEARISH') ? 'BEARISH' : 'NEUTRAL',
    detail: `RSI is ${rsi.current} indicating ${rsi.status} momentum.`,
    weight: rsiWeight
  });

  // 3. MACD Momentum
  let macdVote = 'NEUTRAL';
  let macdWeight = 0;
  if (macd.status === 'BULLISH_CROSSOVER') {
    macdVote = 'BULLISH';
    macdWeight = 2.5;
  } else if (macd.status === 'BEARISH_CROSSOVER') {
    macdVote = 'BEARISH';
    macdWeight = -2.5;
  } else if (macd.status === 'STRONG_BULLISH') {
    macdVote = 'BULLISH';
    macdWeight = 1.8;
  } else if (macd.status === 'STRONG_BEARISH') {
    macdVote = 'BEARISH';
    macdWeight = -1.8;
  } else if (macd.histogram > 0) {
    macdVote = 'BULLISH';
    macdWeight = 1.0;
  } else {
    macdVote = 'BEARISH';
    macdWeight = -1.0;
  }

  compositeScore += macdWeight;
  votes.push({
    name: 'MACD (12, 26, 9)',
    vote: macdVote,
    detail: `Histogram: ${macd.histogram > 0 ? '+' : ''}${macd.histogram} (${macd.status})`,
    weight: macdWeight
  });

  // 4. VWAP Positioning
  let vwapVote = 'NEUTRAL';
  let vwapWeight = 0;
  if (vwap.diffPercent > 0.3) {
    vwapVote = 'BULLISH';
    vwapWeight = 1.5;
  } else if (vwap.diffPercent < -0.3) {
    vwapVote = 'BEARISH';
    vwapWeight = -1.5;
  } else {
    vwapVote = 'NEUTRAL';
    vwapWeight = 0;
  }

  compositeScore += vwapWeight;
  votes.push({
    name: `VWAP (${vwap.current})`,
    vote: vwapVote,
    detail: `Price is ${vwap.diffPercent >= 0 ? '+' : ''}${vwap.diffPercent}% relative to VWAP benchmark.`,
    weight: vwapWeight
  });

  // 5. Day Close vs Day High/Low (Intraday Close Strength)
  const dayRange = lastBar.high - lastBar.low;
  let closeStrengthWeight = 0;
  let closeStrengthVote = 'NEUTRAL';
  if (dayRange > 0) {
    const closeLocation = (lastBar.close - lastBar.low) / dayRange; // 0 to 1
    if (closeLocation >= 0.8) {
      closeStrengthVote = 'BULLISH';
      closeStrengthWeight = 2.0; // Closed near the high -> Strong follow-through overnight
    } else if (closeLocation <= 0.2) {
      closeStrengthVote = 'BEARISH';
      closeStrengthWeight = -2.0; // Closed near the low -> Weakness into close
    } else if (closeLocation >= 0.55) {
      closeStrengthVote = 'BULLISH';
      closeStrengthWeight = 0.8;
    } else {
      closeStrengthVote = 'BEARISH';
      closeStrengthWeight = -0.8;
    }
  }

  compositeScore += closeStrengthWeight;
  votes.push({
    name: 'Intraday Close Strength',
    vote: closeStrengthVote,
    detail: `Closing price finished at ${(
      ((lastBar.close - lastBar.low) / (dayRange || 1)) * 100
    ).toFixed(0)}% of the daily high-low range.`,
    weight: closeStrengthWeight
  });

  // 6. Volume Dynamics
  let volumeWeight = 0;
  let volumeVote = 'NEUTRAL';
  const isUpDay = lastBar.close > lastBar.open;
  if (volume.isHighVolume && isUpDay) {
    volumeVote = 'BULLISH';
    volumeWeight = 2.0;
  } else if (volume.isHighVolume && !isUpDay) {
    volumeVote = 'BEARISH';
    volumeWeight = -2.0;
  } else if (isUpDay) {
    volumeVote = 'BULLISH';
    volumeWeight = 0.5;
  } else {
    volumeVote = 'BEARISH';
    volumeWeight = -0.5;
  }

  compositeScore += volumeWeight;
  votes.push({
    name: 'Volume & Institutional Flow',
    vote: volumeVote,
    detail: `${volume.surgeFactor}x 20-day average volume with ${volume.buyerSellerBias}.`,
    weight: volumeWeight
  });

  // 7. Candlestick Pattern Weight
  let patternWeight = 0;
  let patternSummary = 'No dominant pattern';
  if (candlestickPatterns && candlestickPatterns.length > 0) {
    for (const pat of candlestickPatterns) {
      patternWeight += pat.weight || 0;
    }
    patternSummary = candlestickPatterns.map(p => p.name).join(', ');
  }

  compositeScore += patternWeight;
  votes.push({
    name: 'Candlestick Pattern Formation',
    vote: patternWeight > 0.5 ? 'BULLISH' : patternWeight < -0.5 ? 'BEARISH' : 'NEUTRAL',
    detail: `Detected: ${patternSummary}`,
    weight: patternWeight
  });

  // 8. Pivot Level Bias
  const pivotPoint = pivots.classic.pivot;
  let pivotWeight = 0;
  let pivotVote = 'NEUTRAL';
  if (currentPrice > pivotPoint) {
    pivotVote = 'BULLISH';
    pivotWeight = 1.0;
  } else {
    pivotVote = 'BEARISH';
    pivotWeight = -1.0;
  }

  compositeScore += pivotWeight;
  votes.push({
    name: `Floor Pivot (${pivotPoint})`,
    vote: pivotVote,
    detail: `Trading ${currentPrice > pivotPoint ? 'above' : 'below'} standard daily pivot.`,
    weight: pivotWeight
  });

  // 9. Synthesize Tomorrow's Opening Prediction
  // Maximum possible score is approx +/- 17
  const normalizedScore = Math.max(-10, Math.min(10, (compositeScore / 15) * 10));
  const bullishProbability = Math.round(
    Math.max(10, Math.min(95, 50 + normalizedScore * 4.5))
  );

  let predictedTrend = 'RANGEBOUND / NEUTRAL';
  let trendDirection = 'NEUTRAL';
  let badgeColor = 'amber';
  let sentimentTag = 'NEUTRAL';

  if (normalizedScore >= 4.5) {
    predictedTrend = 'STRONG BULLISH 🚀';
    trendDirection = 'BULLISH';
    badgeColor = 'emerald';
    sentimentTag = 'STRONG_BULLISH';
  } else if (normalizedScore >= 1.5) {
    predictedTrend = 'MILD BULLISH 📈';
    trendDirection = 'BULLISH';
    badgeColor = 'green';
    sentimentTag = 'MILD_BULLISH';
  } else if (normalizedScore <= -4.5) {
    predictedTrend = 'STRONG BEARISH 🔻';
    trendDirection = 'BEARISH';
    badgeColor = 'rose';
    sentimentTag = 'STRONG_BEARISH';
  } else if (normalizedScore <= -1.5) {
    predictedTrend = 'MILD BEARISH 📉';
    trendDirection = 'BEARISH';
    badgeColor = 'orange';
    sentimentTag = 'MILD_BEARISH';
  }

  // 10. Gap Projection for Tomorrow Opening
  const expectedPointsMove = Math.round(atr * (0.25 + Math.abs(normalizedScore) * 0.05));
  const expectedPercentMove = Number(((expectedPointsMove / currentPrice) * 100).toFixed(2));

  let gapType = 'FLAT / CHOPPY';
  let expectedOpenRange = '';
  if (trendDirection === 'BULLISH') {
    gapType = normalizedScore >= 4.5 ? 'GAP-UP (STRONG)' : 'MILD GAP-UP';
    const lowProj = currentPrice + expectedPointsMove * 0.4;
    const highProj = currentPrice + expectedPointsMove * 1.1;
    expectedOpenRange = `${lowProj.toFixed(1)} – ${highProj.toFixed(1)} (+${expectedPercentMove}%)`;
  } else if (trendDirection === 'BEARISH') {
    gapType = normalizedScore <= -4.5 ? 'GAP-DOWN (STRONG)' : 'MILD GAP-DOWN';
    const lowProj = currentPrice - expectedPointsMove * 1.1;
    const highProj = currentPrice - expectedPointsMove * 0.4;
    expectedOpenRange = `${lowProj.toFixed(1)} – ${highProj.toFixed(1)} (-${expectedPercentMove}%)`;
  } else {
    gapType = 'FLAT / RANGEBOUND';
    const lowProj = currentPrice - expectedPointsMove * 0.3;
    const highProj = currentPrice + expectedPointsMove * 0.3;
    expectedOpenRange = `${lowProj.toFixed(1)} – ${highProj.toFixed(1)} (±0.25%)`;
  }

  // 11. Tomorrow's Action Trading Plan (Setup)
  const plan = {
    bullishSetup: {
      entryTrigger: `Above ${pivots.classic.r1.toFixed(1)} or opening gap-up sustain`,
      target1: pivots.classic.r2.toFixed(1),
      target2: pivots.classic.r3.toFixed(1),
      stopLoss: (currentPrice - (atr * 0.65)).toFixed(1),
      riskRewardRatio: '1 : 2.2'
    },
    bearishSetup: {
      entryTrigger: `Below ${pivots.classic.s1.toFixed(1)} or rejection at Pivot`,
      target1: pivots.classic.s2.toFixed(1),
      target2: pivots.classic.s3.toFixed(1),
      stopLoss: (currentPrice + (atr * 0.65)).toFixed(1),
      riskRewardRatio: '1 : 2.1'
    },
    recommendedAction: trendDirection === 'BULLISH'
      ? 'Buy on dips near VWAP/Pivot with tight stop-loss. Watch for early morning breakout above R1.'
      : trendDirection === 'BEARISH'
      ? 'Sell on pullbacks towards Pivot/R1 resistance. Watch for breakdown below S1.'
      : 'Wait for initial 15-minute range breakout before committing. Avoid taking aggressive overnight positions.'
  };

  // 12. Consensus Summary
  const bullishCount = votes.filter(v => v.vote === 'BULLISH').length;
  const bearishCount = votes.filter(v => v.vote === 'BEARISH').length;
  const neutralCount = votes.filter(v => v.vote === 'NEUTRAL').length;

  return {
    symbol,
    predictedTrend,
    trendDirection,
    sentimentTag,
    confidenceScore: bullishProbability,
    bearishProbability: 100 - bullishProbability,
    badgeColor,
    compositeScore: Number(compositeScore.toFixed(2)),
    normalizedScore: Number(normalizedScore.toFixed(2)),
    gapProjection: {
      gapType,
      expectedOpenRange,
      expectedPointsMove,
      expectedPercentMove
    },
    tradingPlan: plan,
    consensus: {
      bullishCount,
      bearishCount,
      neutralCount,
      totalIndicators: votes.length,
      bullishPercent: Math.round((bullishCount / votes.length) * 100)
    },
    votes
  };
}

module.exports = {
  generateMarketPrediction
};

