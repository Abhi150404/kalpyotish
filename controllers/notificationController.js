const NotificationToken = require("../models/NotificationToken");
const Notification = require("../models/Notification");

// Save new FCM token
exports.saveFcmToken = async (req, res) => {
  try {
    const { userId, userType, fcmToken, deviceType } = req.body;

    if (!userId || !userType || !fcmToken) {
      return res.status(400).json({ message: "userId, userType and fcmToken are required" });
    }

    if (!["UserDetail", "Astrologer"].includes(userType)) {
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
const admin = require("../config/fcm"); 

exports.sendNotification = async (req, res) => {
  try {
    const { name, profilePic, id, type, channelName } = req.body;

    if (!name || !profilePic || !id || !type || !channelName) {
      return res.status(400).json({ message: "All fields required." });
    }

    let tokens = [];

    // 🔹 If type = voice or video → target single user only
    if (type === "voice" || type === "video") {
      const user = await User.findById(id);
      if (!user || !user.fcmToken) {
        return res.status(404).json({ message: "User token not found" });
      }
      tokens.push(user.fcmToken);
    }

    // 🔹 If type = stream → send to all users
    if (type === "stream") {
      const users = await User.find({ fcmToken: { $exists: true } }).select("fcmToken");
      tokens = users.map(u => u.fcmToken);
    }

    if (tokens.length === 0) {
      return res.status(400).json({ message: "No tokens found" });
    }

    // 🔥 Notification payload
    const message = {
      notification: {
        title: `${name} started a ${type} call`,
        body: `Channel: ${channelName}`
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

    // Send Multicast Notification
    const response = await admin.messaging().sendMulticast(message);

    return res.status(200).json({
      success: true,
      message: "Notification sent",
      response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal error", error });
  }
};
