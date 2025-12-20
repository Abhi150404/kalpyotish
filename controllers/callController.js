const CallLog = require("../models/callModel");
const admin = require("../config/fcm");
const NotificationToken = require("../models/NotificationToken");

exports.startCall = async (req, res) => {
  try {
    const {
      callerId,        // UserDetail._id
      receiverId,      // Astro._id
      callType,        // chat | voice | video | live
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
      status: "ringing",
      duration: 0,
      ratePerMinute: 0,
      totalEarning: 0
    });

    // Get receiver FCM (Astrologer)
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

    // Set end time only for completed states
    if (["rejected", "missed", "ended"].includes(status)) {
      call.endTime = new Date();

      // Calculate duration
      const start = new Date(call.createdAt);
      const end = new Date(call.endTime);
      call.duration = end - start;   // milliseconds
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
    const { type } = req.query;

    let filter = {
      $or: [{ callerId: userId }, { receiverId: userId }]
    };

    if (type) {
      if (!["chat", "voice", "video", "live"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use chat, voice, video or live."
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


function getDateRange(filter) {
  const now = new Date();
  let start;

  switch (filter) {
    case "day":
      start = new Date(now.setHours(0, 0, 0, 0));
      break;

    case "week": {
      const first = now.getDate() - now.getDay(); 
      start = new Date(now.setDate(first));
      start.setHours(0, 0, 0, 0);
      break;
    }

    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    default:
      start = null;  // all time
  }

  return { start, end: new Date() };
}


exports.getEarnings = async (req, res) => {
  try {
    const { astroId } = req.params;
    const { filter, type } = req.query;

    // Validate astrologer
    if (!astroId) {
      return res.status(400).json({
        success: false,
        message: "Astrologer ID required"
      });
    }

    // Only receiverId (Astro)
    let query = { receiverId: astroId, status: "ended" };

    // 🎯 Apply call type filter (voice/video/chat/live)
    if (type) {
      if (!["chat", "voice", "video", "live"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use chat, voice, video, live"
        });
      }
      query.callType = type;
    }

    // 🎯 Apply date range filter
    if (filter) {
      const { start, end } = getDateRange(filter);
      if (start) query.createdAt = { $gte: start, $lte: end };
    }

    // 🔍 Fetch Logs
    const calls = await CallLog.find(query);

    // 🎯 Calculate earnings
    let totalEarning = 0;
    let totalMinutes = 0;

    calls.forEach(call => {
      const mins = call.duration / 60000; // convert ms → minutes
      totalMinutes += mins;

      const earning = mins * call.ratePerMinute;
      totalEarning += earning;

      // Auto-update DB if totalEarning missing
      if (!call.totalEarning || call.totalEarning === 0) {
        call.totalEarning = earning;
        call.save();
      }
    });

    return res.json({
      success: true,
      filter: filter || "all",
      type: type || "all",
      totalCalls: calls.length,
      totalMinutes: totalMinutes.toFixed(2),
      totalEarning: totalEarning.toFixed(2),
      currency: "INR",
      data: calls
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error",
      error: error.message
    });
  }
};


exports.getWallet = async (req, res) => {
  try {
    const { astroId } = req.params;
    const { filter, type } = req.query;

    if (!astroId) {
      return res.status(400).json({
        success: false,
        message: "Astrologer ID required"
      });
    }

    // -----------------------------
    // BASE QUERY
    // -----------------------------
    let query = {
      receiverId: astroId,
      status: "ended"
    };

    // Type filter
    if (type) {
      if (!["chat", "voice", "video", "live"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Allowed: chat, voice, video, live"
        });
      }
      query.callType = type;
    }

    // Date filter
    if (filter) {
      const { start, end } = getDateRange(filter);
      if (start && end) {
        query.createdAt = { $gte: start, $lte: end };
      }
    }

    const logs = await CallLog.find(query).sort({ createdAt: -1 });

    // -----------------------------
    // WALLET CALCULATION
    // -----------------------------
    let totalMinutes = 0;
    let walletBalance = 0;

    const transactions = [];

    for (const call of logs) {
      const mins = call.duration / 60000; // ms → minutes
      const earning = mins * 10; // ₹10/min

      totalMinutes += mins;
      walletBalance += earning;

      // Save earning if missing
      if (!call.totalEarning || call.totalEarning === 0) {
        call.totalEarning = earning;
        await call.save();
      }

      // Transaction history
      transactions.push({
        sessionId: call._id,
        callType: call.callType,
        durationMinutes: mins.toFixed(2),
        amount: earning.toFixed(2),
        date: call.createdAt
      });
    }

    // -----------------------------
    // RESPONSE
    // -----------------------------
    return res.json({
      success: true,
      data: {
        filter: filter || "all",
        type: type || "all",
        totalSessions: logs.length,
        totalMinutes: totalMinutes.toFixed(2),
        walletBalance: walletBalance.toFixed(2),
        currency: "INR",
        transactions
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error",
      error: error.message
    });
  }
};





exports.getAstroDashboard = async (req, res) => {
  try {
    const { astroId } = req.params;
    const { filter } = req.query;

    if (!astroId) {
      return res.status(400).json({
        success: false,
        message: "Astrologer ID required"
      });
    }

    // Base query only for this astrologer
    let query = { receiverId: astroId, status: "ended" };

    // Apply date filter
    if (filter) {
      const { start, end } = getDateRange(filter);
      if (start) query.createdAt = { $gte: start, $lte: end };
    }

    // Fetch all call logs
    const logs = await CallLog.find(query);

    // Initialise counters
    let summary = {
      voice: { count: 0, minutes: 0, earning: 0 },
      video: { count: 0, minutes: 0, earning: 0 },
      chat: { count: 0, minutes: 0, earning: 0 },
      live: { count: 0, minutes: 0, earning: 0 },
      totalEarning: 0
    };

    logs.forEach(call => {
      const mins = call.duration / 60000; // ms → mins
      const earning = mins * 10; // ₹10/minute

      if (summary[call.callType]) {
        summary[call.callType].count += 1;
        summary[call.callType].minutes += mins;
        summary[call.callType].earning += earning;
      }

      summary.totalEarning += earning;
    });

    return res.json({
      success: true,
      message: "Astrologer dashboard fetched",
      filter: filter || "all",
      data: {
        voice: {
          sessions: summary.voice.count,
          minutes: summary.voice.minutes.toFixed(2),
          earning: summary.voice.earning.toFixed(2)
        },
        video: {
          sessions: summary.video.count,
          minutes: summary.video.minutes.toFixed(2),
          earning: summary.video.earning.toFixed(2)
        },
        chat: {
          sessions: summary.chat.count,
          minutes: summary.chat.minutes.toFixed(2),
          earning: summary.chat.earning.toFixed(2)
        },
        live: {
          sessions: summary.live.count,
          minutes: summary.live.minutes.toFixed(2),
          earning: summary.live.earning.toFixed(2)
        },
        totalEarning: summary.totalEarning.toFixed(2),
        currency: "INR"
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal error",
      error: error.message
    });
  }
};
