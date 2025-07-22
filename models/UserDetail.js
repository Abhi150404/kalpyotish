const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  gender: String,
  city: String,
  mobileNo: String,
  password: String,
  profile: String, // Cloudinary URL
  wallet: {
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' }
},

}, { timestamps: true });

module.exports = mongoose.model('UserDetail', userSchema, 'UserDetail');
