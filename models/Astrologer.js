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
  }
}, { timestamps: true });
