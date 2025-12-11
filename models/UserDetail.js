const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  gender: String,
  city: String,
  mobileNo: String,
  profile: String, // Cloudinary URL
  dateOfBirth: Date,
  timeOfBirth: String,
  
 uid: {
  type: Number,
  unique: true,
  index: true,
  default: null
},

  fcmToken: { type: String, default: null },

  // ⭐ ADD THIS FIELD
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astro" // must match model name from astroModel.js
    }
  ],

  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  }
},
{ timestamps: true }
);

module.exports = mongoose.model('UserDetail', userSchema, 'UserDetail');
