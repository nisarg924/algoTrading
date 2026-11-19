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
        return doc.data;
      }
    } catch (e) {
      console.warn('MongoDB cache read warning:', e.message);
    }
  }
  return null;
}

async function setCachedMarketData(symbol, data) {
  if (getIsConnected()) {
    try {
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

