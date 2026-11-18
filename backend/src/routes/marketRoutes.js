const express = require('express');
const router = express.Router();
const {
  getAssetAnalysis,
  getAccuracyReport,
  getIndices,
  search,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} = require('../controllers/marketController');

router.get('/analyze', getAssetAnalysis);
router.get('/accuracy-report', getAccuracyReport);
router.get('/indices', getIndices);
router.get('/search', search);
router.get('/watchlist', getWatchlist);
router.post('/watchlist', addToWatchlist);
router.delete('/watchlist/:symbol', removeFromWatchlist);

module.exports = router;

