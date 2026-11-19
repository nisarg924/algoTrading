const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');

const MarketCacheSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, index: true },
  data: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now }
});

const MarketCacheModel = mongoose.model('MarketCache', MarketCacheSchema);

async function getCachedMarketData(symbol) {
  if (getIsConnected()) {
    try {
      const doc = await MarketCacheModel.findOne({ symbol });
      if (doc && doc.data && doc.data.bars && doc.data.bars.length > 0) {
        const price = doc.data.regularMarketPrice || doc.data.bars[doc.data.bars.length - 1]?.close || 0;

        // Auto-purge corrupted or synthetic index records from MongoDB
        if ((symbol === '^NSEI' || symbol.includes('NSEI')) && price < 18000) {
          console.warn(`[Cache] Purged corrupted cache for ${symbol} with invalid price: ${price}`);
          await MarketCacheModel.deleteOne({ symbol });
          return null;
        }
        if ((symbol === '^BSESN' || symbol.includes('BSESN')) && price < 60000) {
          console.warn(`[Cache] Purged corrupted cache for ${symbol} with invalid price: ${price}`);
          await MarketCacheModel.deleteOne({ symbol });
          return null;
        }
        if ((symbol === '^NSEBANK' || symbol.includes('NSEBANK')) && price < 35000) {
          console.warn(`[Cache] Purged corrupted cache for ${symbol} with invalid price: ${price}`);
          await MarketCacheModel.deleteOne({ symbol });
          return null;
        }

        return doc.data;
      }
    } catch (e) {
      console.warn('MongoDB cache read warning:', e.message);
    }
  }
  return null;
}

async function setCachedMarketData(symbol, data) {
  if (getIsConnected() && data && data.bars && data.bars.length > 0) {
    try {
      const price = data.regularMarketPrice || data.bars[data.bars.length - 1]?.close || 0;

      // Do NOT persist invalid or corrupted index prices to MongoDB
      if ((symbol === '^NSEI' || symbol.includes('NSEI')) && price < 18000) return;
      if ((symbol === '^BSESN' || symbol.includes('BSESN')) && price < 60000) return;
      if ((symbol === '^NSEBANK' || symbol.includes('NSEBANK')) && price < 35000) return;

      await MarketCacheModel.findOneAndUpdate(
        { symbol },
        { symbol, data, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('MongoDB cache write warning:', e.message);
    }
  }
}

module.exports = {
  getCachedMarketData,
  setCachedMarketData
};

