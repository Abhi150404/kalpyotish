require('dotenv').config(); // make sure this is at the top

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 2025;
const MONGO_URI = process.env.MONGODB_URI;
//db added

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
