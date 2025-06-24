const mongoose = require('mongoose');

const astrologerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  experience: { type: String, required: true },
  skills: { type: [String], required: true },
  profilePhoto: { type: String, default: null } // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('Astrologer', astrologerSchema);
