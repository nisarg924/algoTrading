import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/market';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000 // 60 seconds (allows Render free tier cold-start to wake up smoothly)
});

// Auto-retry interceptor for cold-start timeouts
api.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    // If request timed out or network error, retry once automatically
    if (!config || config._retry) {
      return Promise.reject(error);
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || !error.response) {
      config._retry = true;
      console.warn('Backend cold-start detected. Auto-retrying request in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(config);
    }

    return Promise.reject(error);
  }
);

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

