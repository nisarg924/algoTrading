/**
 * Technical Indicator Calculation Engine
 * Calculates mathematical indicators for market analysis
 */

// Exponential Moving Average (EMA)
function calculateEMA(data, period, key = 'close') {
  if (!data || data.length < period) return [];
  const k = 2 / (period + 1);
  const emaArray = [];

  // Initial SMA as starting point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i][key];
  }
  let prevEMA = sum / period;
  emaArray.push({ index: period - 1, value: prevEMA, date: data[period - 1].date });

  for (let i = period; i < data.length; i++) {
    const currentPrice = data[i][key];
    const currentEMA = currentPrice * k + prevEMA * (1 - k);
    emaArray.push({ index: i, value: currentEMA, date: data[i].date });
    prevEMA = currentEMA;
  }

  return emaArray;
}

// Relative Strength Index (RSI) - 14 Period
function calculateRSI(data, period = 14) {
  if (!data || data.length <= period) return { current: 50, history: [], status: 'NEUTRAL' };

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rsiHistory = [];
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  rsiHistory.push({ date: data[period].date, value: Number(rsi.toFixed(2)) });

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    rsiHistory.push({ date: data[i].date, value: Number(rsi.toFixed(2)) });
  }

  const currentRSI = rsiHistory[rsiHistory.length - 1]?.value || 50;
  let status = 'NEUTRAL';
  if (currentRSI >= 70) status = 'OVERBOUGHT';
  else if (currentRSI >= 60) status = 'BULLISH';
  else if (currentRSI <= 30) status = 'OVERSOLD';
  else if (currentRSI <= 40) status = 'BEARISH';

  return {
    current: currentRSI,
    history: rsiHistory,
    status
  };
}

// Moving Average Convergence Divergence (MACD 12, 26, 9)
function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!data || data.length < slowPeriod + signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0, status: 'NEUTRAL' };
  }

  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Align EMAs
  const macdLine = [];
  const offset = slowPeriod - fastPeriod;

  for (let i = 0; i < slowEMA.length; i++) {
    const fastIndex = i + offset;
    if (fastIndex < fastEMA.length) {
      macdLine.push({
        date: slowEMA[i].date,
        close: fastEMA[fastIndex].value - slowEMA[i].value
      });
    }
  }

  // Calculate Signal Line (9 EMA of MACD Line)
  const signalEMA = calculateEMA(macdLine, signalPeriod, 'close');

  const history = [];
  for (let i = 0; i < signalEMA.length; i++) {
    const mIdx = i + (signalPeriod - 1);
    const mVal = macdLine[mIdx].close;
    const sVal = signalEMA[i].value;
    const hist = mVal - sVal;
    history.push({
      date: signalEMA[i].date,
      macd: Number(mVal.toFixed(2)),
      signal: Number(sVal.toFixed(2)),
      histogram: Number(hist.toFixed(2))
    });
  }

  const latest = history[history.length - 1] || { macd: 0, signal: 0, histogram: 0 };
  const prev = history[history.length - 2] || latest;

  let status = 'NEUTRAL';
  if (latest.histogram > 0 && prev.histogram <= 0) {
    status = 'BULLISH_CROSSOVER';
  } else if (latest.histogram < 0 && prev.histogram >= 0) {
    status = 'BEARISH_CROSSOVER';
  } else if (latest.histogram > 0) {
    status = latest.histogram > prev.histogram ? 'STRONG_BULLISH' : 'MILD_BULLISH';
  } else if (latest.histogram < 0) {
    status = latest.histogram < prev.histogram ? 'STRONG_BEARISH' : 'MILD_BEARISH';
  }

  return {
    macd: latest.macd,
    signal: latest.signal,
    histogram: latest.histogram,
    status,
    history: history.slice(-50)
  };
}

// Volume Weighted Average Price (VWAP)
function calculateVWAP(data) {
  if (!data || data.length === 0) return { current: 0, status: 'NEUTRAL', diffPercent: 0 };

  // Calculate cumulative for the recent cycle or session
  let cumulativeTypicalPriceVolume = 0;
  let cumulativeVolume = 0;

  // Use the last 30 periods or day session
  const slice = data.slice(-30);
  for (const bar of slice) {
    const typicalPrice = (bar.high + bar.low + bar.close) / 3;
    const vol = bar.volume || 1;
    cumulativeTypicalPriceVolume += typicalPrice * vol;
    cumulativeVolume += vol;
  }

  const vwap = cumulativeVolume > 0 ? cumulativeTypicalPriceVolume / cumulativeVolume : slice[slice.length - 1].close;
  const currentPrice = data[data.length - 1].close;
  const diffPercent = Number((((currentPrice - vwap) / vwap) * 100).toFixed(2));

  let status = 'NEUTRAL';
  if (diffPercent > 0.5) status = 'BULLISH_ABOVE_VWAP';
  else if (diffPercent < -0.5) status = 'BEARISH_BELOW_VWAP';
  else status = 'AT_VWAP';

  return {
    current: Number(vwap.toFixed(2)),
    status,
    diffPercent
  };
}

// Bollinger Bands (20, 2)
function calculateBollingerBands(data, period = 20, multiplier = 2) {
  if (!data || data.length < period) {
    const c = data[data.length - 1]?.close || 0;
    return { middle: c, upper: c, lower: c, bandwidth: 0, percentB: 50 };
  }

  const slice = data.slice(-period);
  const sum = slice.reduce((acc, bar) => acc + bar.close, 0);
  const middle = sum / period;

  const variance = slice.reduce((acc, bar) => acc + Math.pow(bar.close - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = middle + multiplier * stdDev;
  const lower = middle - multiplier * stdDev;
  const currentPrice = data[data.length - 1].close;

  const bandwidth = Number((((upper - lower) / middle) * 100).toFixed(2));
  const percentB = upper !== lower ? Number((((currentPrice - lower) / (upper - lower)) * 100).toFixed(2)) : 50;

  let status = 'NORMAL';
  if (percentB >= 95) status = 'UPPER_BAND_TAG (Overextended)';
  else if (percentB <= 5) status = 'LOWER_BAND_TAG (Oversold)';
  else if (bandwidth < 3.5) status = 'SQUEEZE (Imminent Breakout)';

  return {
    middle: Number(middle.toFixed(2)),
    upper: Number(upper.toFixed(2)),
    lower: Number(lower.toFixed(2)),
    bandwidth,
    percentB,
    status
  };
}

// Average True Range (ATR 14) for volatility & target ranges
function calculateATR(data, period = 14) {
  if (!data || data.length < 2) return 0;

  const trs = [];
  for (let i = 1; i < data.length; i++) {
    const hl = data[i].high - data[i].low;
    const hc = Math.abs(data[i].high - data[i - 1].close);
    const lc = Math.abs(data[i].low - data[i - 1].close);
    trs.push(Math.max(hl, hc, lc));
  }

  if (trs.length < period) return trs.reduce((a, b) => a + b, 0) / trs.length;

  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }

  return Number(atr.toFixed(2));
}

// Volume Analysis
function analyzeVolume(data, period = 20) {
  if (!data || data.length < period) {
    return { surgeFactor: 1, isHighVolume: false, buyerSellerBias: 'BALANCED' };
  }

  const lastBar = data[data.length - 1];
  const slice = data.slice(-period);
  const avgVolume = slice.reduce((sum, b) => sum + (b.volume || 0), 0) / period;

  const currentVol = lastBar.volume || 1;
  const surgeFactor = avgVolume > 0 ? Number((currentVol / avgVolume).toFixed(2)) : 1;
  const isHighVolume = surgeFactor >= 1.35;

  const isUpClose = lastBar.close > lastBar.open;
  let buyerSellerBias = 'BALANCED';
  if (isUpClose && isHighVolume) buyerSellerBias = 'STRONG_ACCUMULATION (Heavy Buying)';
  else if (!isUpClose && isHighVolume) buyerSellerBias = 'STRONG_DISTRIBUTION (Heavy Selling)';
  else if (isUpClose) buyerSellerBias = 'MILD_BUYING';
  else buyerSellerBias = 'MILD_SELLING';

  return {
    currentVolume: currentVol,
    avgVolume: Math.round(avgVolume),
    surgeFactor,
    isHighVolume,
    buyerSellerBias
  };
}

// Pivot Points (Classic Floor & Fibonacci)
function calculatePivotPoints(lastBar) {
  const { high, low, close } = lastBar;
  const pivot = (high + low + close) / 3;

  // Classic Floor Pivots
  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;
  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);
  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  // Fibonacci Pivots
  const range = high - low;
  const fibR1 = pivot + 0.382 * range;
  const fibR2 = pivot + 0.618 * range;
  const fibR3 = pivot + 1.000 * range;
  const fibS1 = pivot - 0.382 * range;
  const fibS2 = pivot - 0.618 * range;
  const fibS3 = pivot - 1.000 * range;

  return {
    classic: {
      r3: Number(r3.toFixed(2)),
      r2: Number(r2.toFixed(2)),
      r1: Number(r1.toFixed(2)),
      pivot: Number(pivot.toFixed(2)),
      s1: Number(s1.toFixed(2)),
      s2: Number(s2.toFixed(2)),
      s3: Number(s3.toFixed(2))
    },
    fibonacci: {
      r3: Number(fibR3.toFixed(2)),
      r2: Number(fibR2.toFixed(2)),
      r1: Number(fibR1.toFixed(2)),
      pivot: Number(pivot.toFixed(2)),
      s1: Number(fibS1.toFixed(2)),
      s2: Number(fibS2.toFixed(2)),
      s3: Number(fibS3.toFixed(2))
    }
  };
}

module.exports = {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateVWAP,
  calculateBollingerBands,
  calculateATR,
  analyzeVolume,
  calculatePivotPoints
};

