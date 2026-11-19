# midTrade - Algorithmic Market Prediction & Trading Platform 🚀📈

> **Professional MERN Stack Quantitative Trading Platform** engineered to predict the **next-day market opening trend** for **NIFTY 50**, **BSE SENSEX**, **BANK NIFTY**, and **any Indian/Global stock** using multi-factor algorithmic analysis.

---

## 🌟 Key Highlights & Capabilities

- 🔮 **Tomorrow's Opening Trend Predictor**: Computes real-time quantitative forecasts (Strong Bullish, Mild Bullish, Rangebound/Neutral, Mild Bearish, Strong Bearish) with probability confidence percentages (e.g., 73% Bullish Gap-Up probability).
- 📜 **1-Month Prediction vs Actual Outcomes Audit Report**: Historical backtesting report that compares what the algorithm predicted on each day vs what actually happened at market open (win-rate %, accurate vs missed calls, net captured points, directional breakdown, and CSV export).
- 🎯 **Gap Projection & Opening Range**: Forecasts expected opening price range (points & %) based on Average True Range (ATR) and end-of-session momentum.
- ⚡ **Real-Time Market Data**: Integrates live Yahoo Finance OHLCV data for `^NSEI` (Nifty 50), `^BSESN` (Sensex), `^NSEBANK` (Bank Nifty), and all NSE/BSE stocks (`RELIANCE.NS`, `TCS.NS`, `TATAMOTORS.NS`, etc.).
- 📊 **Multi-Indicator Algorithm Matrix**:
  - **RSI (14)**: Momentum, divergence, and overbought/oversold detection.
  - **EMAs (9, 21, 50, 200)**: Multi-timeframe trend ribbons, Golden Cross & Death Cross detection.
  - **MACD (12, 26, 9)**: Signal crossovers, zero-line momentum, and histogram expansion.
  - **VWAP (Volume Weighted Average Price)**: Institutional benchmark positioning & divergence.
  - **Volume & Institutional Flow**: 20-day SMA comparison, volume surge factors, and accumulation vs distribution bias.
  - **Support & Resistance**: Classic Floor Pivots (P, R1, R2, R3, S1, S2, S3) and Fibonacci Pivot ranges.
  - **Bollinger Bands (20, 2)**: Volatility bandwidth squeeze and breakout alerts.
  - **ATR (14)**: Volatility-adjusted risk-reward stop loss & target calculations.
- 🕯️ **Candlestick Pattern Recognition Engine**: Automatic detection for Bullish/Bearish Engulfing, Hammer, Inverted Hammer, Shooting Star, Morning/Evening Star, Doji (Dragonfly, Gravestone), and Marubozu.
- 📈 **TradingView Interactive Candlestick Chart**: Embedded official TradingView `lightweight-charts` with togglable EMA overlays, volume histogram, and pivot lines.
- 📋 **Automated Action Plan**: Generates actionable Long and Short setups with exact Entry trigger, Target 1, Target 2, Stop Loss, and Risk-to-Reward ratios.
- 🔍 **Instant Global Search Modal**: Autocomplete search for any stock or index.
- 💾 **MongoDB Storage with Resilient Fallback**: Stores user watchlists and settings in MongoDB (with automatic in-memory fallback if MongoDB is not running locally).

---

## 🏛️ System Architecture

```
algo-trading-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & graceful fallback
│   │   ├── controllers/
│   │   │   └── marketController.js   # API route controllers
│   │   ├── models/
│   │   │   └── Watchlist.js          # Mongoose schema + in-memory store
│   │   ├── routes/
│   │   │   └── marketRoutes.js       # Express REST endpoints
│   │   ├── services/
│   │   │   ├── indicators.js         # RSI, EMA, MACD, VWAP, Bollinger, ATR, Pivots
│   │   │   ├── candlestickPatterns.js# Candlestick pattern recognition
│   │   │   ├── predictionEngine.js   # Tomorrow opening prediction algorithm
│   │   │   └── marketData.js         # Live Yahoo Finance fetcher & caching
│   │   └── server.js                 # Express application entrypoint
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Live indices ticker, brand, refresh
│   │   │   ├── WatchlistBar.jsx      # Quick-switch pills for top stocks
│   │   │   ├── PredictionHero.jsx    # Hero tomorrow opening prediction & plan
│   │   │   ├── InteractiveChart.jsx  # TradingView candlestick chart with EMAs
│   │   │   ├── IndicatorsDashboard.jsx# Multi-indicator matrix
│   │   │   ├── CandlestickSignals.jsx# Detected candlestick patterns
│   │   │   ├── PivotLevelsCard.jsx   # Classic & Fibonacci Support/Resistance
│   │   │   ├── ConsensusMeter.jsx    # Indicator consensus voting breakdown
│   │   │   └── SearchModal.jsx       # Instant stock & index search
│   │   ├── services/
│   │   │   └── api.js                # Axios backend API client
│   │   ├── App.jsx                   # Main React dashboard layout
│   │   ├── index.css                 # Custom Tailwind dark styling & glow effects
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🗄️ MongoDB Database Integration

MongoDB v7.0.16 is installed and running as a local service on port `27017`.

### Quick Management Commands
From anywhere in your terminal, you can manage the MongoDB service using:
```bash
# Start MongoDB service
mongodb-start
# (or: /Users/hardik.magiya/.mongodb/bin/mongod --config /Users/hardik.magiya/.mongodb/mongod.conf --fork)

# Stop MongoDB service
mongodb-stop
# (or: /Users/hardik.magiya/.mongodb/bin/mongod --config /Users/hardik.magiya/.mongodb/mongod.conf --shutdown)

# Check MongoDB status / port
nc -zv 127.0.0.1 27017
```

- **Database Name**: `algotrading`
- **Data Directory**: `/Users/hardik.magiya/.mongodb/data/db`
- **Log File**: `/Users/hardik.magiya/.mongodb/log/mongodb.log`
- **Config File**: `/Users/hardik.magiya/.mongodb/mongod.conf`
- **Connection URI**: `mongodb://127.0.0.1:27017/algotrading`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher - currently tested on Node v22)
- npm (v9 or higher)
- (Optional) MongoDB instance running locally on `mongodb://127.0.0.1:27017` (if not running, the platform runs in resilient in-memory mode seamlessly).

### Step 1: Start the Backend Server

```bash
cd backend
npm install
npm run dev
# Or: node src/server.js
```
The backend will launch at **`http://localhost:5001`**.

### Step 2: Start the Frontend Application

```bash
cd ../frontend
npm install
npm run dev
```
The web dashboard will launch at **`http://localhost:3000`**.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query Parameters |
|---|---|---|---|
| `GET` | `/api/market/analyze` | Full algorithmic analysis & tomorrow opening forecast | `symbol` (e.g. `^NSEI`, `^BSESN`, `RELIANCE.NS`) |
| `GET` | `/api/market/accuracy-report` | 1-Month predictions vs actual market outcomes audit & win-rate | `symbol`, `days` (7, 14, 30 max) |
| `GET` | `/api/market/indices` | Real-time overview of Nifty 50, Sensex & Bank Nifty | None |
| `GET` | `/api/market/search` | Search symbols and companies with autocomplete | `q` (e.g. `tata`, `hdfc`, `apple`) |
| `GET` | `/api/market/watchlist` | Get saved watchlist items | None |
| `POST` | `/api/market/watchlist` | Add stock to watchlist | JSON body: `{ symbol, name, exchange }` |
| `DELETE` | `/api/market/watchlist/:symbol` | Remove stock from watchlist | `symbol` in URL parameter |

---

## 🧮 How the Tomorrow Opening Prediction Algorithm Works

The algorithm calculates a composite momentum & price action score using 8 distinct quantitative factors:

$$\text{Composite Score} = W_{\text{EMA}} + W_{\text{RSI}} + W_{\text{MACD}} + W_{\text{VWAP}} + W_{\text{Close}} + W_{\text{Volume}} + W_{\text{Candlestick}} + W_{\text{Pivot}}$$

1. **EMA Trend Alignment ($W_{\text{EMA}} \in [-3.0, +3.0]$)**:
   - Full Bullish Stack ($Price > EMA_9 > EMA_{21} > EMA_{50} > EMA_{200}$): $+3.0$
   - Full Bearish Stack ($Price < EMA_9 < EMA_{21} < EMA_{50} < EMA_{200}$): $-3.0$
2. **RSI Momentum ($W_{\text{RSI}} \in [-2.0, +2.0]$)**:
   - $RSI \in [60, 70]$ (Ideal Bullish Expansion): $+2.0$
   - $RSI \le 40$ (Bearish Dominance): $-2.0$
   - $RSI \le 25$ (Extreme Oversold Rebound Probability): $+1.0$
3. **MACD Divergence & Cross ($W_{\text{MACD}} \in [-2.5, +2.5]$)**:
   - Bullish Crossover / Expanding Green Histogram: $+1.8$ to $+2.5$
   - Bearish Crossover / Expanding Red Histogram: $-1.8$ to $-2.5$
4. **VWAP Position ($W_{\text{VWAP}} \in [-1.5, +1.5]$)**:
   - $Price > VWAP + 0.3\%$: $+1.5$ (Institutional accumulation)
   - $Price < VWAP - 0.3\%$: $-1.5$ (Institutional selling)
5. **Intraday Close Strength ($W_{\text{Close}} \in [-2.0, +2.0]$)**:
   - Close in top 20% of day's high-low range: $+2.0$ (High overnight gap-up follow-through)
   - Close in bottom 20% of range: $-2.0$ (Heavy end-of-day liquidation)
6. **Volume Surge ($W_{\text{Volume}} \in [-2.0, +2.0]$)**:
   - $>1.35\times$ 20-day SMA volume on Green candle: $+2.0$
   - $>1.35\times$ 20-day SMA volume on Red candle: $-2.0$
7. **Candlestick Pattern ($W_{\text{Candlestick}} \in [-3.0, +3.0]$)**:
   - Bullish Engulfing / Morning Star / Bullish Marubozu: $+2.0$ to $+3.0$
   - Bearish Engulfing / Evening Star / Bearish Marubozu: $-2.0$ to $-3.0$
8. **Floor Pivot Bias ($W_{\text{Pivot}} \in [-1.0, +1.0]$)**:
   - $Price > Pivot$: $+1.0$ | $Price < Pivot$: $-1.0$

### Final Probability & Trend Mapping:
- **Normalized Score** is mapped from $[-10, +10]$ to a **Bullish Open Probability**:
  $$\text{Bullish Probability \%} = \min(95, \max(10, 50 + \text{Normalized Score} \times 4.5))$$
- **Score $\ge 4.5$**: `STRONG BULLISH 🚀` (High gap-up probability)
- **Score $1.5$ to $4.5$**: `MILD BULLISH 📈`
- **Score $-1.5$ to $1.5$**: `RANGEBOUND / NEUTRAL 🟡`
- **Score $-4.5$ to $-1.5$**: `MILD BEARISH 📉`
- **Score $\le -4.5$**: `STRONG BEARISH 🔻` (High gap-down probability)

---

## 🎨 UI Aesthetic

Designed with a sleek **Bloomberg Terminal & TradingView** dark theme:
- Deep obsidian background (`#080c14`) with glassmorphism cards.
- Glowing neon badges for Bullish (Emerald Green `#10b981`) and Bearish (Rose Red `#f43f5e`).
- Real-time interactive Candlestick charts with high refresh responsiveness.

