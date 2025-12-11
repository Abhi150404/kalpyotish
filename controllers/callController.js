const CallLog = require("../models/callModel");
const admin = require("../config/fcm");
const NotificationToken = require("../models/NotificationToken");

exports.startCall = async (req, res) => {
  try {
    const {
      callerId,        // must be UserDetail._id
      receiverId,      // must be Astro._id
      callType,
      channelName,
      callerName,
      profilePic
    } = req.body;

    if (!callerId || !receiverId || !callType || !channelName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Create call record
    const call = await CallLog.create({
      callerId,
      receiverId,
      callType,
      channelName,
      status: "ringing"
    });

    // Get receiver FCM token (Astrologer)
    const tokenDoc = await NotificationToken.findOne({ userId: receiverId });

    if (tokenDoc?.fcmToken) {
      await admin.messaging().send({
        token: tokenDoc.fcmToken,
        notification: {
          title: `${callerName} is calling you`,
          body: `${callType.toUpperCase()} call`
        },
        data: {
          type: "incoming_call",
          callerId: String(callerId),
          receiverId: String(receiverId),
          callType,
          channelName,
          callerName,
          profilePic
        }
      });
    }

    return res.json({
      success: true,
      message: "Call started",
      data: call
    });
  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};


exports.updateCallStatus = async (req, res) => {
  try {
    const { channelName, status } = req.body;

    if (!channelName || !status) {
      return res.status(400).json({ message: "channelName & status required" });
    }

    const call = await CallLog.findOne({ channelName });

    if (!call) return res.status(404).json({ message: "Call not found" });

    // Set endTime only for these statuses
    if (["rejected", "missed", "ended"].includes(status)) {
      call.endTime = new Date();
    }

    call.status = status;
    await call.save();

    return res.json({
      success: true,
      message: "Call status updated",
      data: call
    });

  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};


exports.getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query; // chat | voice | video | undefined

    let filter = {
      $or: [{ callerId: userId }, { receiverId: userId }]
    };

    // Apply type filter ONLY if provided
    if (type) {
      if (!["chat", "voice", "video"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use chat, voice or video."
        });
      }
      filter.callType = type;
    }

    const logs = await CallLog.find(filter)
      .populate("callerId", "name profilePhoto")
      .populate("receiverId", "name profilePhoto")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: "Call history fetched",
      count: logs.length,
      data: logs
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal error",
      error: error.message
    });
  }
};
