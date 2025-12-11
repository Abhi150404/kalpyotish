const CallLog = require("../models/callModel");
const admin = require("../config/fcm");
const NotificationToken = require("../models/NotificationToken");

/*---------------------------------------------------
   1️⃣ START CALL (Caller creates a call)
----------------------------------------------------*/
exports.startCall = async (req, res) => {
  try {
    const { callerId, receiverId, callType, channelName, callerName, profilePic } = req.body;

    if (!callerId || !receiverId || !callType || !channelName) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Create Call Log entry
    const call = await CallLog.create({
      callerId,
      receiverId,
      callType,
      channelName,
      status: "ringing"
    });

    // Send FCM Notification to receiver
    const tokenDoc = await NotificationToken.findOne({ userId: receiverId });
    if (tokenDoc?.fcmToken) {
      await admin.messaging().send({
        token: tokenDoc.fcmToken,
        notification: {
          title: `${callerName} is calling you`,
          body: `${callType} call...`
        },
        data: {
          type: "incoming_call",
          callerId,
          receiverId,
          callType,
          channelName,
          callerName,
          profilePic
        }
      });
    }

    res.json({
      success: true,
      message: "Call started",
      data: call
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};


/*---------------------------------------------------
   2️⃣ UPDATE CALL STATUS (receiver actions)
----------------------------------------------------*/
exports.updateCallStatus = async (req, res) => {
  try {
    const { channelName, status } = req.body;

    if (!channelName || !status) {
      return res.status(400).json({ message: "channelName & status required" });
    }

    const call = await CallLog.findOne({ channelName });

    if (!call) return res.status(404).json({ message: "Call not found" });

    // Handle ending and timestamps
    if (["missed", "rejected", "ended"].includes(status)) {
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
    console.error(error);
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};


/*---------------------------------------------------
   3️⃣ GET CALL HISTORY (for each user)
----------------------------------------------------*/
exports.getCallHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const logs = await CallLog.find({
      $or: [{ callerId: userId }, { receiverId: userId }]
    })
      .populate("callerId", "name profile")
      .populate("receiverId", "name profile")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Call history fetched",
      data: logs
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};
