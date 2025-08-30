// controllers/agoraController.js
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

// 🔑 Replace with your Agora credentials
const APP_ID = "cdb07bd78545426d8f8d94396c1226e3";
const APP_CERTIFICATE = "744e98ca28a243acae8f37d54df011ae";

const generateAgoraToken = (req, res) => {
  try {
    const { channelName, role, uid } = req.params;

    if (!channelName || !uid) {
      return res.status(400).json({ error: "channelName and uid are required" });
    }

    // Role handling
    const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

    // Token expiration (1 hour)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build token
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      parseInt(uid), // ensure integer UID
      agoraRole,
      privilegeExpiredTs
    );

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      uid,
      role: agoraRole === RtcRole.PUBLISHER ? "publisher" : "subscriber",
      expiresIn: expirationTimeInSeconds,
      message: "Token generated successfully"
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({
      error: "Failed to generate token",
      details: error.message
    });
  }
};

module.exports = { generateAgoraToken };



