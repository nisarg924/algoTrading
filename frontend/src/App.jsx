import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import WatchlistBar from './components/WatchlistBar';
import PredictionHero from './components/PredictionHero';
import InteractiveChart from './components/InteractiveChart';
import IndicatorsDashboard from './components/IndicatorsDashboard';
import CandlestickSignals from './components/CandlestickSignals';
import PivotLevelsCard from './components/PivotLevelsCard';
import ConsensusMeter from './components/ConsensusMeter';
import AccuracyReport from './components/AccuracyReport';
import SearchModal from './components/SearchModal';
import {
  fetchAssetAnalysis,
  fetchIndicesOverview,
  fetchWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from './services/api';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('^NSEI');
  const [activeTab, setActiveTab] = useState('predictor'); // 'predictor' or 'report'
  const [assetData, setAssetData] = useState(null);
  const [indices, setIndices] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load Indices overview
  const loadIndices = useCallback(async () => {
    try {
      const res = await fetchIndicesOverview();
      if (res && res.data) setIndices(res.data);
    } catch (e) {
      console.warn('Failed to load indices overview:', e);
    }
  }, []);

  // Load Watchlist
  const loadWatchlist = useCallback(async () => {
    try {
      const res = await fetchWatchlist();
      if (res && res.data) setWatchlist(res.data);
    } catch (e) {
      console.warn('Failed to load watchlist:', e);
    }
  }, []);

  // Load Analysis for currently selected symbol
  const loadAssetAnalysis = useCallback(async (symbol) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAssetAnalysis(symbol);
      if (res && res.data) {
        setAssetData(res.data);
        setLastUpdated(new Date());
      } else {
        throw new Error('No data received from analysis engine');
      }
    } catch (err) {
      console.error('Error fetching asset analysis:', err);
      let errorMsg = err.response?.data?.error || err.message || 'Failed to load market data';
      if (err.code === 'ECONNABORTED' || (typeof errorMsg === 'string' && errorMsg.includes('timeout'))) {
        errorMsg = 'Cloud server is waking up from free-tier sleep (takes ~25-35s on initial launch). Click Retry below to connect.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadIndices();
    loadWatchlist();
  }, [loadIndices, loadWatchlist]);

  // Load asset on symbol change
  useEffect(() => {
    loadAssetAnalysis(selectedSymbol);
  }, [selectedSymbol, loadAssetAnalysis]);

  // Keyboard shortcut (Cmd/Ctrl + K for search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle symbol selection
  const handleSelectSymbol = (symbol) => {
    setSelectedSymbol(symbol);
  };

  // Handle remove item from watchlist
  const handleRemoveWatchlistItem = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* Header with Navigation Tabs */}
      <Header
        indices={indices}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={handleSelectSymbol}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRefresh={() => {
          loadAssetAnalysis(selectedSymbol);
          loadIndices();
        }}
        loading={loading}
        lastUpdated={lastUpdated}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Quick Watchlist Bar */}
      <WatchlistBar
        watchlist={watchlist}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={handleSelectSymbol}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRemoveItem={handleRemoveWatchlistItem}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadAssetAnalysis(selectedSymbol)}
              className="px-3 py-1 rounded bg-rose-900 hover:bg-rose-800 text-xs font-bold text-white transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab 1: 1-Month Accuracy & Performance Audit Report */}
        {activeTab === 'report' ? (
          <AccuracyReport
            selectedSymbol={selectedSymbol}
            assetName={assetData?.meta?.name}
          />
        ) : (
          /* Tab 2: Live Predictor Dashboard */
          <>
            {loading && !assetData && (
              <div className="py-24 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-sm text-slate-400 font-mono">
                  Running Algo Analysis on <span className="text-white font-bold">{selectedSymbol}</span>...
                </div>
                <div className="text-xs text-slate-500">
                  Calculating RSI, EMAs, MACD, VWAP, Pivots, Candlesticks & Tomorrow Forecast
                </div>
              </div>
            )}

            {assetData && (
              <>
                {/* 1. Tomorrow's Opening Prediction Hero */}
                <PredictionHero assetData={assetData} />

                {/* 2. Interactive Candlestick Chart */}
                <InteractiveChart
                  chartData={assetData.chartData}
                  pivots={assetData.indicators.pivots}
                  symbol={assetData.meta.name || assetData.meta.symbol}
                />

                {/* 3. Technical Indicators & Momentum Matrix */}
                <IndicatorsDashboard
                  indicators={assetData.indicators}
                  currentPrice={assetData.meta.price}
                />

                {/* 4. Candlestick Signals & Pivot Levels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CandlestickSignals patterns={assetData.candlestickPatterns} />
                  <PivotLevelsCard
                    pivots={assetData.indicators.pivots}
                    currentPrice={assetData.meta.price}
                  />
                </div>

                {/* 5. Technical Consensus Voting Breakdown */}
                <ConsensusMeter
                  consensus={assetData.prediction.consensus}
                  votes={assetData.prediction.votes}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Global Stock Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSymbol={handleSelectSymbol}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-dark-900/60 py-6 px-4 mt-12 text-xs text-slate-500 text-center space-y-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>midTrade Algorithmic Market Prediction System</span>
          </div>
          <div>
            Built with MERN Stack • Real-time OHLCV • Multi-Factor Quantitative Model
          </div>
        </div>
        <p className="max-w-4xl mx-auto text-[11px] text-slate-600">
          Disclaimer: Algorithmic predictions are generated using quantitative indicators (RSI, EMAs, MACD, VWAP, Candlestick Patterns, Floor Pivots). They are for informational and educational purposes only and should not be considered as financial advice. Always practice prudent risk management.
        </p>
      </footer>
    </div>
  );
}
