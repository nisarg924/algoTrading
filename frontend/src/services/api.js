import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/market';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

export async function fetchAssetAnalysis(symbol = '^NSEI') {
  const res = await api.get('/analyze', { params: { symbol } });
  return res.data;
}

export async function fetchAccuracyReport(symbol = '^NSEI', days = 30) {
  const res = await api.get('/accuracy-report', { params: { symbol, days } });
  return res.data;
}

export async function fetchIndicesOverview() {
  const res = await api.get('/indices');
  return res.data;
}

export async function searchSymbols(query) {
  const res = await api.get('/search', { params: { q: query } });
  return res.data;
}

export async function fetchWatchlist() {
  const res = await api.get('/watchlist');
  return res.data;
}

export async function addToWatchlist(symbol, name, exchange) {
  const res = await api.post('/watchlist', { symbol, name, exchange });
  return res.data;
}

export async function removeFromWatchlist(symbol) {
  const res = await api.delete(`/watchlist/${encodeURIComponent(symbol)}`);
  return res.data;
}

