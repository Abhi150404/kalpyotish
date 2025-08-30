const express = require('express');
const router = express.Router();


const { generateAgoraToken } = require("../controllers/agoraController");


// GET /rtc/:channelName/:role/:uid
router.get("/rtc/:channelName/:role/:uid", generateAgoraToken);

// Export the router so it can be used by the main index.js file
module.exports = router;