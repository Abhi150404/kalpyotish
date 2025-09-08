const express = require("express");
const { saveFcmToken, updateFcmToken } = require("../controllers/notificationController");

const router = express.Router();

// Save new token
router.post("/save-token", saveFcmToken);

// Update existing token
router.put("/update-token", updateFcmToken);

module.exports = router;
