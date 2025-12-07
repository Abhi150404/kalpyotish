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

exports.sendNotification = async (req, res) => {
  try {
    const { name, profilePic, id, type, channelName } = req.body;

    if (!name || !profilePic || !id || !type || !channelName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let tokens = [];
    let receiver = null;
    let fcmToken = null;

    // Voice / Video: only 1 ID
    if (type === "voice" || type === "video") {
      let user = await User.findById(id).select("fcmToken name");

      if (user && user.fcmToken) {
        fcmToken = user.fcmToken;
        tokens.push(user.fcmToken);
        receiver = { userId: user._id, userType: "UserDetail" };
      } else {
        let astro = await Astro.findById(id).select("fcmToken name");
        if (astro && astro.fcmToken) {
          fcmToken = astro.fcmToken;
          tokens.push(astro.fcmToken);
          receiver = { userId: astro._id, userType: "Astrologer" };
        } else {
          return res.status(404).json({ message: "FCM token not found for this ID" });
        }
      }
    }

    // Stream → send to all
    if (type === "stream") {
      const users = await User.find({ fcmToken: { $exists: true, $ne: null } }).select("fcmToken");
      const astros = await Astro.find({ fcmToken: { $exists: true, $ne: null } }).select("fcmToken");

      tokens = [
        ...users.map(u => u.fcmToken),
        ...astros.map(a => a.fcmToken)
      ];
    }

    if (tokens.length === 0) {
      return res.status(400).json({ message: "No FCM tokens found" });
    }

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
        channelName,
        fcmToken   // <-- token now included in payload
      },
      tokens
    };

    // Send notification
    const response = await admin.messaging().sendEachForMulticast(message);

    // Save notification ONLY for single receiver (voice/video)
    if (receiver) {
      await Notification.create({
        userId: receiver.userId,
        userType: receiver.userType,
        title: `${name} started a ${type} call`,
        body: `Channel: ${channelName}`,
        fcmToken,   // <-- save token
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification sent & saved",
      response
    });

  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ message: "Internal error", error });
  }
};

