const mongoose = require("mongoose");

const callLogSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserDetail",
      required: true
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astro",
      required: true
    },

    callType: {
      type: String,
      enum: ["voice", "video"],
      required: true
    },

    channelName: { type: String, required: true },

    status: {
      type: String,
      enum: ["ringing", "accepted", "rejected", "missed", "ended"],
      default: "ringing"
    },

    endTime: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallLog", callLogSchema);
