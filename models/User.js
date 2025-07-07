const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  gender: String,
  city: String,
  mobileNo: String,
  password: String,
  profile: String, // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
