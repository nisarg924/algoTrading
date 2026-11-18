const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');

const WatchlistSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  exchange: { type: String, default: 'NSE' },
  addedAt: { type: Date, default: Date.now }
});

const WatchlistModel = mongoose.model('Watchlist', WatchlistSchema);

// Initial default symbols
const DEFAULT_WATCHLIST = [
  { symbol: '^NSEI', name: 'NIFTY 50 Index', exchange: 'NSE' },
  { symbol: '^BSESN', name: 'BSE SENSEX Index', exchange: 'BSE' },
  { symbol: '^NSEBANK', name: 'BANK NIFTY Index', exchange: 'NSE' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', exchange: 'NSE' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', exchange: 'NSE' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd.', exchange: 'NSE' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd.', exchange: 'NSE' }
];

let inMemoryWatchlist = [...DEFAULT_WATCHLIST];

async function getAllItems() {
  if (getIsConnected()) {
    try {
      let items = await WatchlistModel.find().sort({ addedAt: 1 });
      if (items.length === 0) {
        // Auto-seed initial stocks to MongoDB
        await WatchlistModel.insertMany(DEFAULT_WATCHLIST);
        items = await WatchlistModel.find().sort({ addedAt: 1 });
        console.log(`📦 Seeded ${items.length} initial assets into MongoDB.`);
      }
      return items;
    } catch (e) {
      console.warn('MongoDB query error, falling back to in-memory:', e.message);
    }
  }
  return inMemoryWatchlist;
}

async function addItem(symbol, name, exchange = 'NSE') {
  if (getIsConnected()) {
    try {
      const existing = await WatchlistModel.findOne({ symbol });
      if (existing) return existing;
      const created = await WatchlistModel.create({ symbol, name, exchange });
      console.log(`💾 Saved "${symbol}" to MongoDB.`);
      return created;
    } catch (e) {
      console.warn('MongoDB create error, using in-memory:', e.message);
    }
  }

  const existing = inMemoryWatchlist.find(i => i.symbol === symbol);
  if (existing) return existing;
  const newItem = { symbol, name, exchange, addedAt: new Date() };
  inMemoryWatchlist.push(newItem);
  return newItem;
}

async function removeItem(symbol) {
  if (getIsConnected()) {
    try {
      await WatchlistModel.deleteOne({ symbol });
      console.log(`🗑️ Removed "${symbol}" from MongoDB.`);
    } catch (e) {
      console.warn('MongoDB delete error:', e.message);
    }
  }
  inMemoryWatchlist = inMemoryWatchlist.filter(i => i.symbol !== symbol);
  return { success: true, symbol };
}

module.exports = {
  getAllItems,
  addItem,
  removeItem,
  WatchlistModel
};
