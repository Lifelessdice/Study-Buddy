const mongoose = require('mongoose');

async function connectDB() {
  // For local dev: .env gives MONGODB_URI or MONGO_URI
  // For CI: we fall back to mongo service name + test DB
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://mongo:27017/serverTestDB';

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected:', uri);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
