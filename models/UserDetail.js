const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  gender: String,
  city: String,
  mobileNo: String,
  profile: String, 
  dateOfBirth: Date,
  timeOfBirth: String, 
uid: { 
  type: Number,
  unique: true,
  index: true,

    required: false
},

   fcmToken: { type: String, default: null },

  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
 
isVerified: { type: Boolean, default: false },
token: { type: String, default: null } 

}, { timestamps: true });

module.exports = mongoose.model('UserDetail', userSchema, 'UserDetail');

