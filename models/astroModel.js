const mongoose = require("mongoose");

const astroSchema = new mongoose.Schema(
  {
    name: String,
    fcmToken: { type: String, default: null },
    eid: String,
    password: String,
    isSystemGeneratedPassword: { type: Boolean, default: true },
    loginToken: String,
    age: Number,
    gender: String,
    state: String,
    city: String,
    address: String,
    skills: String,
    salary: Number,
    perMinuteRate: Number,

    available_at: {
      chat: { type: Boolean, default: false },
      voice: { type: Boolean, default: false },
      video: { type: Boolean, default: false },
    },

    number: String,
    email: String,
    experience: String,
    profilePhoto: String, // Cloudinary URL

    // ⭐ Rating summary fields
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Astro", astroSchema);
