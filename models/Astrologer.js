const mongoose = require('mongoose');

const AstrologerSchema = new mongoose.Schema({
  // Step 1: Personal Details
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobileNo: { type: String, required: true },

  // Step 2: Skill Details
  user_profile: { type: String }, // Cloudinary URL
  astrologer_category: { type: String },
  primary_skills: { type: String },
  all_skills: [{ type: String }],
  language: [{ type: String }],
  charge_per_minute: { type: Number },
  report_charges: { type: Number },
  experience: { type: String },
  working_hours: { type: String },
  app_info: { type: String },
  other_platform: {
    selected: { type: Boolean },
    platform_name: { type: String, default: 'no' }
  },

  // Step 3: Other Details
  highest_qualification: { type: String },
  qualification_1: { type: String },
  qualification_2: { type: String },
  qualification_3: { type: String },
  qualification_4: { type: String },
  qualification_5: { type: String },
  qualification_6: { type: String },
  qualification_7: { type: String },
  qualification_8: { type: String },
  qualification_9: { type: String },
  qualification_10: { type: String },
  qualification_11: { type: String },
  qualification_12: { type: String },
  social_media_links: {
    instagram: String,
    facebook: String,
    youtube: String,
    linkedin: String
  },

  // Step 4: Assignment
  assignment_1: { type: String },
  assignment_2: { type: String },
  assignment_3: { type: String },
  assignment_4: { type: String },
  assignment_5: { type: String },

  // Step 5: Availability
  availability: {
    sunday: String,
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Astrologer', AstrologerSchema);
