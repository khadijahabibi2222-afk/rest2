const mongoose = require('mongoose');

// Increase buffering timeout so slow Atlas connections don't immediately fail
mongoose.set('bufferTimeoutMS', 30000);

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not set. Set it in Render → Environment Variables.');
    return;
  }

  const opts = {
    serverSelectionTimeoutMS: 15000,  // wait up to 15s to find a server
    socketTimeoutMS: 45000,           // how long to wait on a slow query
    connectTimeoutMS: 15000,
    maxPoolSize: 10,
  };

  const MAX_RETRIES = 8;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, opts);
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (err) {
      console.error(`⚠️  MongoDB attempt ${attempt}/${MAX_RETRIES}: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        const wait = Math.min(attempt * 3000, 15000);
        console.log(`   Retrying in ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        console.error('❌ All MongoDB connection attempts failed.');
        console.error('   Check: 1) MONGO_URI is correct  2) Atlas Network Access allows 0.0.0.0/0');
      }
    }
  }
}

module.exports = connectDB;
