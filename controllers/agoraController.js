const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const crypto = require("crypto");

function convertUserIdToUid(userId) {
  // Hash string to consistent numeric UID (0 - 2^32 range)
  const hash = crypto.createHash("md5").update(userId).digest("hex");
  return parseInt(hash.substring(0, 8), 16); 
}

const generateAgoraToken = (req, res) => {
  const APP_ID = "cdb07bd78545426d8f8d94396c1226e3";
  const APP_CERTIFICATE = "744e98ca28a243acae8f37d54df011ae"; 

  const { channelName, userId, callType } = req.body;

  if (!channelName || !userId) {
    return res.status(400).json({ error: "channelName and userId are required" });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    // 👇 convert string userId -> numeric UID
    const numericUid = Number.isInteger(userId) ? userId : convertUserIdToUid(userId);

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      numericUid,
      role,
      privilegeExpiredTs
    );

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId,        // original string (for frontend reference)
      numericUid,    // used for Agora
      callType,
      message: "Production token (007) generated successfully"
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({ error: "Failed to generate token", details: error.message });
  }
};

module.exports = { generateAgoraToken };
