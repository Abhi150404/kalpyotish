const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetail", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetail", required: true },

  callType: { type: String, enum: ["voice", "video"], required: true },

  channelName: { type: String, required: true },

  status: {
    type: String,
    enum: ["calling", "ringing", "received", "rejected", "missed", "ended"],
    default: "calling"
  },

  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },

}, { timestamps: true });

module.exports = mongoose.model("CallLog", callSchema);
