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
      return res.status(400).json({ message: "All fields are required" });
    }

    let tokens = [];
    let receiver = null;

    /** ---------------------------------------------------------
     * VOICE / VIDEO → SEND ONLY TO THAT ONE USER
     * --------------------------------------------------------- */
    if (type === "voice" || type === "video") {
      const tokenDoc = await NotificationToken.findOne({ userId: id });
      if (!tokenDoc || !tokenDoc.fcmToken) {
        return res.status(404).json({ message: "FCM token not found for this user" });
      }

      tokens = [tokenDoc.fcmToken];
      receiver = { userId: id, userType: tokenDoc.userType };
    }

    /** ---------------------------------------------------------
     * STREAM → SEND ONLY TO FOLLOWERS OF THIS ASTROLOGER
     * --------------------------------------------------------- */
    if (type === "stream") {
      const followers = await User.find({ following: id }).select("_id");

      if (!followers.length) {
        return res.status(200).json({
          message: "No followers found, no notifications sent.",
          tokensSent: 0
        });
      }

      const followerIds = followers.map(f => f._id);

      const tokenDocs = await NotificationToken.find({
        userId: { $in: followerIds },
        fcmToken: { $exists: true, $ne: null }
      }).select("fcmToken");

      tokens = tokenDocs.map(t => t.fcmToken);
    }

    if (!tokens.length) {
      return res.status(200).json({ message: "No valid FCM tokens found" });
    }

    /** ---------------------------------------------------------
     * FCM MULTICAST USING sendEachForMulticast()
     * --------------------------------------------------------- */
    const message = {
      notification: {
        title: `${name} started a ${type} call`,
        body: `Channel: ${channelName}`,
      },
      data: {
        name,
        profilePic,
        id,
        type,
        channelName
      },
      tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    /** ---------------------------------------------------------
     * REMOVE INVALID TOKENS FROM DB
     * --------------------------------------------------------- */
    const invalidTokens = [];

    response.responses.forEach((resObj, idx) => {
      if (!resObj.success) {
        const err = resObj.error?.code;

        if (
          err === "messaging/invalid-argument" ||
          err === "messaging/registration-token-not-registered" ||
          err === "messaging/invalid-registration-token"
        ) {
          invalidTokens.push(tokens[idx]);
        }
      }
    });

    if (invalidTokens.length) {
      await NotificationToken.deleteMany({ fcmToken: { $in: invalidTokens } });
    }

    /** ---------------------------------------------------------
     * SAVE NOTIFICATION FOR VOICE/VIDEO (ONLY ONE USER)
     * --------------------------------------------------------- */
    if (receiver) {
      await Notification.create({
        userId: receiver.userId,
        userType: receiver.userType,
        title: `${name} started a ${type} call`,
        body: `Channel: ${channelName}`
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notifications processed",
      summary: {
        success: response.successCount,
        failed: response.failureCount,
        removedInvalidTokens: invalidTokens.length
      }
    });

  } catch (error) {
    console.error("Notification Error:", error);
    return res.status(500).json({ message: "Internal error", error: error.message });
  }
};



