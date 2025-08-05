const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  gender: String,
  city: String,
  mobileNo: String,
  profile: String, // Cloudinary URL
  dateOfBirth: Date,
  timeOfBirth: String, // or Date if storing with time zone logic
  uid: { // <-- ADD THIS FIELD
    type: Number,
    required: true,
    unique: true,
    index: true // Add an index for faster lookups
  },

  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  }
}, { timestamps: true });

module.exports = mongoose.model('UserDetail', userSchema, 'UserDetail');

