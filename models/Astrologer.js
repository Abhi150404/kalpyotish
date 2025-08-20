const mongoose = require('mongoose');

const astrologerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  experience: { type: String, required: true },
  skills: { type: [String], required: true },
  profilePhoto: { type: String, default: null },
  availability: {
    chat: { type: Boolean, default: false },
    call: { type: Boolean, default: false },
    videoCall: { type: Boolean, default: false }
  },
 status: {
    type: String,
    enum: ['live', 'offline'],
    default: 'offline'
  },

  agoraToken: { type: String, default: null },
  channelId: { type: String, default: null }

  
}, { timestamps: true });


module.exports = mongoose.model('Astrologer', astrologerSchema);
