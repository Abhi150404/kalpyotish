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
    const { name, profilePic, id, type, channelName, fcmToken } = req.body;

    if (!name || !id || !type || !channelName) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    let tokens = [];

    // Voice / Video → single user
    if (["voice", "video"].includes(type)) {
      if (!fcmToken) {
        return res.status(400).json({ success: false, message: "FCM token required" });
      }
      tokens.push(fcmToken);
    }

    // Stream → followers
    if (type === "stream") {
      const astro = await Astro.findById(id).select("followers");
      if (astro?.followers?.length) {
        const tokenDocs = await NotificationToken.find({
          userId: { $in: astro.followers }
        }).select("fcmToken");

        tokens = tokenDocs.map(t => t.fcmToken);
      }
    }

    // 🟢 SAVE DB NOTIFICATION (ALWAYS)
    await Notification.create({
      userId: id,
      userType: "UserDetail",
      title: `${name} started a ${type}`,
      body: `Channel: ${channelName}`,
      type
    });

    // 🔔 SEND PUSH (OPTIONAL SUCCESS)
    let fcmResponse = null;
    if (tokens.length) {
      fcmResponse = await admin.messaging().sendEachForMulticast({
        tokens,
        data: {
          name,
          profilePic,
          id,
          type,
          channelName
        }
      });
    }

    return res.json({
      success: true,
      message: "Notification saved & processed",
      fcmResponse
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.sendNotification = async (req, res) => {
  try {
    const { name, profilePic, id, type, channelName, fcmToken } = req.body;

    if (!name || !id || !type || !channelName) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    let tokens = [];

    // Voice / Video → single user
    if (["voice", "video"].includes(type)) {
      if (!fcmToken) {
        return res.status(400).json({ success: false, message: "FCM token required" });
      }
      tokens.push(fcmToken);
    }

    // Stream → followers
    if (type === "stream") {
      const astro = await Astro.findById(id).select("followers");
      if (astro?.followers?.length) {
        const tokenDocs = await NotificationToken.find({
          userId: { $in: astro.followers }
        }).select("fcmToken");

        tokens = tokenDocs.map(t => t.fcmToken);
      }
    }

    // 🟢 SAVE DB NOTIFICATION (ALWAYS)
    await Notification.create({
      userId: id,
      userType: "UserDetail",
      title: `${name} started a ${type}`,
      body: `Channel: ${channelName}`,
      type
    });

    // 🔔 SEND PUSH (OPTIONAL SUCCESS)
    let fcmResponse = null;
    if (tokens.length) {
      fcmResponse = await admin.messaging().sendEachForMulticast({
        tokens,
        data: {
          name,
          profilePic,
          id,
          type,
          channelName
        }
      });
    }

    return res.json({
      success: true,
      message: "Notification saved & processed",
      fcmResponse
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// PATCH /api/notifications/read/:id
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, data: notification });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET /api/notifications/unread-count?userId=&userType=
exports.getUnreadCount = async (req, res) => {
  const { userId, userType } = req.query;

  const count = await Notification.countDocuments({
    userId,
    userType,
    isRead: false
  });

  res.json({ success: true, unreadCount: count });
};



