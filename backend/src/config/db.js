const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/algotrading';

  try {
    // Attempt connection with short timeout so server doesn't hang if Mongo isn't running
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully to: ${uri}`);
  } catch (err) {
    console.warn(`⚠️ MongoDB connection skipped: ${err.message}`);
    console.log(`ℹ️ Running in resilient In-Memory storage mode for Watchlists and Settings.`);
    isConnected = false;
  }
}

function getIsConnected() {
  return isConnected;
}

module.exports = {
  connectDB,
  getIsConnected
};

