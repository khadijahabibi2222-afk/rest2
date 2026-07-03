const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI environment variable is not set.');
    console.error('   Set it in Render → Environment Variables.');
    // Don't exit — let the server stay up so Render doesn't keep restarting
    return;
  }
  const MAX_RETRIES = 10;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      console.error(`⚠️  MongoDB attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        const wait = attempt * 2000;
        console.log(`   Retrying in ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
      }
    }
  }
  console.error('❌ Could not connect to MongoDB after all retries. API calls will fail until DB is reachable.');
}

module.exports = connectDB;
