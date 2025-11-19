const mongoose = require('mongoose');

const isLocalUri = (u) => /^mongodb:\/\/(localhost|127\.0\.0\.1)/i.test(String(u||''));

const connectDB = async (uri) => {
  const opts = {
    // These are defaults in Mongoose 7+, but kept explicit for clarity
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Fail fast if cluster unreachable (useful during setup)
    serverSelectionTimeoutMS: 8000
  };
  try {
    await mongoose.connect(uri, opts);
    console.log(`MongoDB connected (${isLocalUri(uri) ? 'local' : 'remote'})`);
    return;
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    const allowFallback = String(process.env.MONGO_FALLBACK_LOCAL || '').toLowerCase() === 'true' || process.env.MONGO_FALLBACK_LOCAL === '1';
    const localUri = process.env.MONGO_LOCAL_URI || 'mongodb://localhost:27017/learnhub';
    if (allowFallback && !isLocalUri(uri)) {
      try {
        console.warn(`Attempting local MongoDB fallback -> ${localUri}`);
        await mongoose.connect(localUri, opts);
        console.log('MongoDB connected (local fallback)');
        return;
      } catch (e2) {
        console.error('Local MongoDB fallback failed:', e2.message || e2);
      }
    }
    process.exit(1);
  }
};

module.exports = connectDB;
