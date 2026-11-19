const { analyzeAsset, searchSymbols, getIndicesOverview, getAssetAccuracyReport, clearMarketCache } = require('../services/marketData');
const Watchlist = require('../models/Watchlist');

/**
 * POST or GET /api/market/cache/clear
 */
function clearCache(req, res) {
  const result = clearMarketCache();
  res.json(result);
}

/**
 * GET /api/market/accuracy-report?symbol=^NSEI&days=30
 */
async function getAccuracyReport(req, res) {
  try {
    const symbol = req.query.symbol || '^NSEI';
    const days = parseInt(req.query.days, 10) || 30;
    const report = await getAssetAccuracyReport(symbol, days);
    res.json({ success: true, data: report });
  } catch (err) {
    console.error('Error generating accuracy report:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to generate accuracy report' });
  }
}

/**
 * GET /api/market/analyze?symbol=^NSEI
 */
async function getAssetAnalysis(req, res) {
  try {
    const symbol = req.query.symbol || '^NSEI';
    const analysis = await analyzeAsset(symbol);
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error('Error analyzing asset:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to analyze asset' });
  }
}

/**
 * GET /api/market/indices
 */
async function getIndices(req, res) {
  try {
    const indices = await getIndicesOverview();
    res.json({ success: true, data: indices });
  } catch (err) {
    console.error('Error fetching indices:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/market/search?q=tata
 */
async function search(req, res) {
  try {
    const query = req.query.q || '';
    const results = await searchSymbols(query);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error searching symbols:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/market/watchlist
 */
async function getWatchlist(req, res) {
  try {
    const items = await Watchlist.getAllItems();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/market/watchlist
 */
async function addToWatchlist(req, res) {
  try {
    const { symbol, name, exchange } = req.body;
    if (!symbol) return res.status(400).json({ success: false, error: 'Symbol is required' });
    const item = await Watchlist.addItem(symbol, name || symbol, exchange || 'NSE');
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * DELETE /api/market/watchlist/:symbol
 */
async function removeFromWatchlist(req, res) {
  try {
    const { symbol } = req.params;
    const result = await Watchlist.removeItem(symbol);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getAssetAnalysis,
  getAccuracyReport,
  getIndices,
  search,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearCache
};

