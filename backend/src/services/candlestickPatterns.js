/**
 * Candlestick Pattern Detection Engine
 * Scans recent OHLCV bars for classic reversal and continuation candlestick formations
 */

function detectCandlestickPatterns(bars) {
  if (!bars || bars.length < 3) return [];

  const patterns = [];
  const curr = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const prev2 = bars[bars.length - 3];

  const currBody = Math.abs(curr.close - curr.open);
  const currRange = curr.high - curr.low;
  const isCurrBullish = curr.close > curr.open;
  const isCurrBearish = curr.close < curr.open;

  const prevBody = Math.abs(prev.close - prev.open);
  const prevRange = prev.high - prev.low;
  const isPrevBullish = prev.close > prev.open;
  const isPrevBearish = prev.close < prev.open;

  const currUpperShadow = curr.high - Math.max(curr.open, curr.close);
  const currLowerShadow = Math.min(curr.open, curr.close) - curr.low;

  // 1. Doji Pattern
  if (currRange > 0 && currBody / currRange < 0.1) {
    if (currLowerShadow > currRange * 0.65) {
      patterns.push({
        name: 'Dragonfly Doji',
        type: 'BULLISH_REVERSAL',
        significance: 'HIGH',
        description: 'Strong rejection of lower prices by buyers. Often marks a market bottom.',
        sentiment: 'BULLISH',
        weight: 1.5
      });
    } else if (currUpperShadow > currRange * 0.65) {
      patterns.push({
        name: 'Gravestone Doji',
        type: 'BEARISH_REVERSAL',
        significance: 'HIGH',
        description: 'Strong rejection of higher prices by sellers. Often marks a market top.',
        sentiment: 'BEARISH',
        weight: -1.5
      });
    } else {
      patterns.push({
        name: 'Doji',
        type: 'INDECISION',
        significance: 'MEDIUM',
        description: 'Tug of war between buyers and sellers ending in a draw. Potential trend reversal impending.',
        sentiment: 'NEUTRAL',
        weight: 0
      });
    }
  }

  // 2. Hammer & Inverted Hammer (Occurring after a downtrend or down day)
  if (currRange > 0 && currLowerShadow >= 2 * currBody && currUpperShadow <= 0.15 * currRange) {
    patterns.push({
      name: isPrevBearish ? 'Bullish Hammer' : 'Hanging Man',
      type: isPrevBearish ? 'BULLISH_REVERSAL' : 'BEARISH_WARNING',
      significance: 'HIGH',
      description: isPrevBearish
        ? 'Buyers stepped in forcefully pushing prices back up from intraday lows.'
        : 'Signs of intraday selling pressure emerging in an uptrend.',
      sentiment: isPrevBearish ? 'BULLISH' : 'BEARISH',
      weight: isPrevBearish ? 2.0 : -1.2
    });
  }

  // 3. Shooting Star & Inverted Hammer
  if (currRange > 0 && currUpperShadow >= 2 * currBody && currLowerShadow <= 0.15 * currRange) {
    patterns.push({
      name: isPrevBullish ? 'Shooting Star' : 'Inverted Hammer',
      type: isPrevBullish ? 'BEARISH_REVERSAL' : 'BULLISH_REVERSAL',
      significance: 'HIGH',
      description: isPrevBullish
        ? 'Bulls attempted to rally but aggressive sellers took control and forced prices down.'
        : 'Buyers showed initial willingness to rally; watch for tomorrow upside confirmation.',
      sentiment: isPrevBullish ? 'BEARISH' : 'BULLISH',
      weight: isPrevBullish ? -2.0 : 1.2
    });
  }

  // 4. Bullish Engulfing
  if (isPrevBearish && isCurrBullish && curr.open <= prev.close && curr.close >= prev.open && currBody > prevBody) {
    patterns.push({
      name: 'Bullish Engulfing',
      type: 'BULLISH_REVERSAL',
      significance: 'VERY_HIGH',
      description: 'Green candle completely engulfs the previous red candle body. Major bullish momentum surge.',
      sentiment: 'BULLISH',
      weight: 2.5
    });
  }

  // 5. Bearish Engulfing
  if (isPrevBullish && isCurrBearish && curr.open >= prev.close && curr.close <= prev.open && currBody > prevBody) {
    patterns.push({
      name: 'Bearish Engulfing',
      type: 'BEARISH_REVERSAL',
      significance: 'VERY_HIGH',
      description: 'Red candle completely engulfs the prior green candle body. Strong selling pressure overtaking buyers.',
      sentiment: 'BEARISH',
      weight: -2.5
    });
  }

  // 6. Morning Star (3-Candle Reversal)
  if (prev2.close < prev2.open && prevBody < (prev2.high - prev2.low) * 0.4 && isCurrBullish && curr.close > (prev2.open + prev2.close) / 2) {
    patterns.push({
      name: 'Morning Star',
      type: 'BULLISH_REVERSAL',
      significance: 'VERY_HIGH',
      description: 'Three-candle bottom reversal: deep red bar, small body consolidation, and decisive green expansion.',
      sentiment: 'BULLISH',
      weight: 3.0
    });
  }

  // 7. Evening Star (3-Candle Reversal)
  if (prev2.close > prev2.open && prevBody < (prev2.high - prev2.low) * 0.4 && isCurrBearish && curr.close < (prev2.open + prev2.close) / 2) {
    patterns.push({
      name: 'Evening Star',
      type: 'BEARISH_REVERSAL',
      significance: 'VERY_HIGH',
      description: 'Three-candle top reversal: big green bar, exhaustion doji/spinning top, followed by strong red breakdown.',
      sentiment: 'BEARISH',
      weight: -3.0
    });
  }

  // 8. Marubozu (Clean trend with minimal wicks)
  if (currRange > 0 && currBody / currRange > 0.85) {
    if (isCurrBullish) {
      patterns.push({
        name: 'Bullish Marubozu',
        type: 'BULLISH_CONTINUATION',
        significance: 'HIGH',
        description: 'Bulls were in complete control from open to close without significant pullbacks.',
        sentiment: 'BULLISH',
        weight: 2.0
      });
    } else {
      patterns.push({
        name: 'Bearish Marubozu',
        type: 'BEARISH_CONTINUATION',
        significance: 'HIGH',
        description: 'Bears held relentless dominance from open to close with heavy liquidation.',
        sentiment: 'BEARISH',
        weight: -2.0
      });
    }
  }

  // 9. Bullish / Bearish Harami (Inside bar)
  if (currBody < prevBody && curr.high < prev.high && curr.low > prev.low) {
    const sentiment = isPrevBearish ? 'BULLISH' : 'BEARISH';
    patterns.push({
      name: isPrevBearish ? 'Bullish Harami (Inside Bar)' : 'Bearish Harami (Inside Bar)',
      type: 'POTENTIAL_REVERSAL',
      significance: 'MEDIUM',
      description: 'Market consolidation within previous candle range. Price compression typically precedes volatility expansion.',
      sentiment,
      weight: isPrevBearish ? 1.0 : -1.0
    });
  }

  // Default if no specific pattern found
  if (patterns.length === 0) {
    patterns.push({
      name: isCurrBullish ? 'Normal Bullish Candle' : 'Normal Bearish Candle',
      type: 'STANDARD',
      significance: 'LOW',
      description: isCurrBullish
        ? 'Price closed higher than open with balanced price action.'
        : 'Price closed lower than open with routine trading activity.',
      sentiment: isCurrBullish ? 'MILD_BULLISH' : 'MILD_BEARISH',
      weight: isCurrBullish ? 0.5 : -0.5
    });
  }

  return patterns;
}

module.exports = {
  detectCandlestickPatterns
};

