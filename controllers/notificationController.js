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
    const { name, profilePic, id, type, channelName } = req.body;

    if (!name || !profilePic || !id || !type || !channelName) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    let tokens = [];
    let receiver = null;

    // --------------------------------------------------------
    // 1️⃣ VOICE / VIDEO → SEND TO SINGLE USER
    // --------------------------------------------------------
    if (type === "voice" || type === "video") {

      const tokenDoc = await NotificationToken.findOne({ userId: id });

      if (!tokenDoc || !tokenDoc.fcmToken) {
        return res.status(404).json({ success: false, message: "FCM token not found for this user" });
      }

      tokens.push(tokenDoc.fcmToken);
      receiver = { userId: id, userType: tokenDoc.userType };
    }

    // --------------------------------------------------------
    // 2️⃣ STREAM → SEND TO FOLLOWERS ONLY
    // --------------------------------------------------------
    if (type === "stream") {

      const astro = await Astro.findById(id).select("followers");
      if (!astro) {
        return res.status(404).json({ success: false, message: "Astrologer not found" });
      }

      const followerIds = astro.followers || [];

      const tokenDocs = await NotificationToken.find({
        userId: { $in: followerIds },
        fcmToken: { $exists: true, $ne: null }
      }).select("fcmToken");

      tokens = tokenDocs.map(t => t.fcmToken);
    }

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: "No FCM tokens found" });
    }

    // --------------------------------------------------------
    // FCM MESSAGE
    // --------------------------------------------------------
    const message = {
      tokens,
      notification: {
        title: `${name} started a ${type}`,
        body: type === "stream" ? "Live now!" : `Channel: ${channelName}`
      },
      data: {
        name,
        profilePic,
        id,
        type,
        channelName
      }
    };

    const result = await admin.messaging().sendEachForMulticast(message);

    // --------------------------------------------------------
    // SAVE DB NOTIFICATION ONLY FOR VOICE/VIDEO
    // (IMPORTANT: REMOVED fcmToken)
    // --------------------------------------------------------
    if (receiver) {
      await Notification.create({
        userId: receiver.userId,
        userType: receiver.userType,
        title: `${name} started a ${type}`,
        body: `Channel: ${channelName}`
      });
    }

    return res.json({
      success: true,
      message: "Notification processed",
      successCount: result.successCount,
      failureCount: result.failureCount,
      response: result
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



