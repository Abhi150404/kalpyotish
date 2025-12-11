const NotificationToken = require("../models/NotificationToken");
const Notification = require("../models/Notification");

// Save new FCM token
exports.saveFcmToken = async (req, res) => {
  try {
    const { userId, userType, fcmToken, deviceType } = req.body;

    if (!userId || !userType || !fcmToken) {
      return res.status(400).json({ message: "userId, userType and fcmToken are required" });
    }

    if (!["UserDetail", "astroModel"].includes(userType)) {
      return res.status(400).json({ message: "Invalid userType" });
    }

    // check if token already exists
    let tokenDoc = await NotificationToken.findOne({ fcmToken });

    if (tokenDoc) {
      return res.status(400).json({ message: "FCM token already exists. Use update API instead." });
    }

    const newToken = new NotificationToken({ userId, userType, fcmToken, deviceType });
    await newToken.save();

    res.status(201).json({ message: "FCM token saved", data: newToken });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update existing token
exports.updateFcmToken = async (req, res) => {
  try {
    const { oldToken, newToken } = req.body;

    if (!oldToken || !newToken) {
      return res.status(400).json({ message: "oldToken and newToken are required" });
    }

    let tokenDoc = await NotificationToken.findOne({ fcmToken: oldToken });

    if (!tokenDoc) {
      return res.status(404).json({ message: "Old token not found" });
    }

    tokenDoc.fcmToken = newToken;
    await tokenDoc.save();

    res.json({ message: "FCM token updated", data: tokenDoc });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// POST - Create a notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, userType, title, body } = req.body;

    if (!userId || !userType || !title || !body) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["UserDetail", "Astrologer"].includes(userType)) {
      return res.status(400).json({ message: "Invalid userType" });
    }

    const newNotification = new Notification({
      userId,
      userType,
      title,
      body,
    });

    await newNotification.save();

    res.status(201).json({
      message: "Notification created successfully",
      data: newNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET - Fetch notifications
exports.getNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.query;

    let query = {};
    if (userId && userType) {
      query = { userId, userType };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    res.json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const User = require("../models/UserDetail");
const Astro = require("../models/astroModel");
const admin = require("../config/fcm");
const mongoose = require("mongoose");

exports.sendNotification = async (req, res) => {
  try {
    // 1. Destructure the new payload structure
    const { name, profilePic, id, type, channelName, fcmToken } = req.body;

    if (!name || !profilePic || !id || !type || !channelName) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let tokens = [];
    let receiverId = null; // To store ID for DB logging

    // --------------------------------------------------------
    // 1️⃣ VOICE / VIDEO → USE TOKEN FROM REQUEST BODY
    // --------------------------------------------------------
    if (type === "voice" || type === "video") {
      if (!fcmToken) {
        return res.status(400).json({ success: false, message: "fcmToken is required for voice/video" });
      }
      
      // Add the specific token sent from client
      tokens.push(fcmToken);
      
      // We keep the ID for the DB log history
      receiverId = id; 
    }

    // --------------------------------------------------------
    // 2️⃣ STREAM → SEND TO FOLLOWERS (DB LOOKUP)
    // --------------------------------------------------------
    if (type === "stream") {
      const astro = await Astro.findById(id).select("followers");
      if (!astro) {
        return res.status(404).json({ success: false, message: "Astrologer not found" });
      }

      const followerIds = astro.followers || [];

      // Find all tokens for these followers
      const tokenDocs = await NotificationToken.find({
        userId: { $in: followerIds },
        fcmToken: { $exists: true, $ne: null }
      }).select("fcmToken");

      tokens = tokenDocs.map(t => t.fcmToken);
      
      // If the sender passed their own token in body, ensure we don't send to self
      // (Optional logic: tokens = tokens.filter(t => t !== fcmToken));
    }

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: "No FCM tokens found to send to." });
    }

    // --------------------------------------------------------
    // FCM MESSAGE (DATA ONLY - NO TITLE/BODY)
    // --------------------------------------------------------
    // Note: All values in 'data' must be strings.
    const message = {
      tokens: tokens,
      data: {
        name: String(name),
        profilePic: String(profilePic),
        id: String(id),
        type: String(type),
        channelName: String(channelName)
        // You can add "click_action": "FLUTTER_NOTIFICATION_CLICK" if using Flutter
      },
      // Android specific priority to ensure data messages arrive immediately
      android: {
        priority: "high",
      },
      // Apple specific (needed for background data messages)
      apns: {
        payload: {
          aps: {
            "content-available": 1 
          }
        }
      }
    };

    const result = await admin.messaging().sendEachForMulticast(message);

    // --------------------------------------------------------
    // CLEANUP INVALID TOKENS (Crucial for Stream)
    // --------------------------------------------------------
    if (type === "stream" && result.failureCount > 0) {
      const failedTokens = [];
      result.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error.code;
          if (errCode === 'messaging/invalid-argument' || errCode === 'messaging/registration-token-not-registered') {
            failedTokens.push(tokens[idx]);
          }
        }
      });

      if (failedTokens.length > 0) {
        await NotificationToken.deleteMany({ fcmToken: { $in: failedTokens } });
      }
    }

    // --------------------------------------------------------
    // SAVE DB NOTIFICATION LOG (Optional)
    // --------------------------------------------------------
    // Only saving for 1-on-1 calls as Stream creates too many logs usually
    if (receiverId && (type === "voice" || type === "video")) {
      // Assuming you want to log it even if it's data-only
      await Notification.create({
        userId: receiverId, 
        title: `${name} started a ${type}`, // Just for DB history
        body: `Channel: ${channelName}`,
        type: type
      });
    }

    return res.json({
      success: true,
      message: "Notification processed",
      successCount: result.successCount,
      failureCount: result.failureCount
    });

  } catch (error) {
    console.error("Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



