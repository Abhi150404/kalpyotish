const express = require("express");
const { saveFcmToken, updateFcmToken,  createNotification,
  getNotifications, } = require("../controllers/notificationController");

const router = express.Router();

// Save new token
router.post("/save-token", saveFcmToken);

// Update existing token
router.put("/update-token", updateFcmToken);

router.post("/create", createNotification);

// Fetch all or by user/astrologer id
router.get("/list", getNotifications);

module.exports = router;
