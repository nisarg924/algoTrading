const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const marketRoutes = require('./routes/marketRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Algo Trading Analysis Engine is online', timestamp: new Date() });
});

// API Routes
app.use('/api/market', marketRoutes);

// Connect Database & Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Algo Trading Server running on http://localhost:${PORT}`);
    console.log(`📊 Benchmark Endpoints ready: /api/market/indices & /api/market/analyze`);
  });
}

startServer();

