require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const astrologerRoutes = require('./routes/astrologerRoutes'); //spellcheck
const dropdownRoutes = require('./routes/dropdownRoutes');
const transitRoutes = require('./routes/transitRoutes');
const poojaRoutes = require('./routes/poojaRoutes');
const productRoutes = require('./routes/productRoutes');
const faqRoutes = require('./routes/faqRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use('/api/astrologer', astrologerRoutes);
app.use('/api', dropdownRoutes); 
const kundaliRoutes = require('./routes/kundaliRoutes');
app.use('/api/kundali', kundaliRoutes);
const bannerRoutes = require('./routes/bannerRoutes');
app.use('/api/banners', bannerRoutes);
app.use('/api', poojaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/faqs', faqRoutes);



app.use('/api/transits', transitRoutes);
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

app.post("/test", (req, res) => {
  res.send("Test route works!");
  console.log(res);
});

//port run env
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
