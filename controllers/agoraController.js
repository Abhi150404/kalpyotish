const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const generateAgoraToken = (req, res) => {
  const APP_ID = "cdb07bd78545426d8f8d94396c1226e3";
  const APP_CERTIFICATE = "744e98ca28a243acae8f37d54df011ae"; 

  if (!APP_ID || !APP_CERTIFICATE) {
    return res.status(500).json({ error: "Agora credentials missing" });
  }

  const { channelName, userId, callType } = req.body;

  console.log("Incoming Data:", { channelName, userId, callType });

  if (!channelName || !userId) {
    return res.status(400).json({ error: "channelName and userId are required" });
  }

  const role = RtcRole.PUBLISHER; // Or SUBSCRIBER if needed
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    // 👇 Use buildTokenWithUid for production (generates "007" token)
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      Number(userId),  // must be a number here
      role,
      privilegeExpiredTs
    );

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId,
      callType,
      message: "Production token (007) generated successfully"
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({ error: "Failed to generate token", details: error.message });
  }
};

module.exports = { generateAgoraToken };
