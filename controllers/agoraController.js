const { RtcTokenBuilder, RtcRole } = require('agora-token');

const generateAgoraToken = (req, res) => {
  const APP_ID = "cdb07bd78545426d8f8d94396c1226e3";
  const APP_CERTIFICATE = "744e98ca28a243acae8f37d54df011ae"; 

  if (!APP_ID || !APP_CERTIFICATE) {
    return res.status(500).json({ error: "Agora credentials missing" });
  }

  const { channelName, userId, callType } = req.body;

  if (!channelName || !userId) {
    return res.status(400).json({ error: "channelName and userId are required" });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      userId, // keep as string
      role,
      privilegeExpiredTs
    );

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId,
      callType,
      message: "Token generated successfully with User Account method"
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return res.status(500).json({ error: "Failed to generate token" });
  }
};

module.exports = { generateAgoraToken };
