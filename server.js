require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 2025;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
// const authRoutes = require('./routes/auth');
// app.use('/api', authRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err.message));

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🌟 Kalp Jyotish backend is running!");
});
//port run env
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
