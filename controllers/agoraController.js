const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const crypto = require("crypto");

function convertUserIdToUid(userId) {
  const hash = crypto.createHash("md5").update(userId).digest("hex");
  return parseInt(hash.substring(0, 8), 16) >>> 0; // force unsigned 32-bit
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
    let token;
    let numericUid = null;

    if (/^\d+$/.test(userId)) {
      // ✅ numeric userId → 006 token
      numericUid = parseInt(userId, 10);
      token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        numericUid,
        role,
        privilegeExpiredTs
      );
    } else {
      // ✅ string userId → 007 token
      numericUid = convertUserIdToUid(userId);
      token = RtcTokenBuilder.buildTokenWithAccount(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        userId,
        role,
        privilegeExpiredTs
      );
    }

    // Sanity check: token prefix
    if (!token.startsWith("007")) {
      throw new Error(
        `Invalid token generated (got ${token.substring(0, 3)}) — try using buildTokenWithAccount for string userId`
      );
    }

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId,
      numericUid,
      callType,
      message: `Production token (${token.substring(0, 3)}) generated successfully`
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
      hint: "Ensure UID is numeric for 006 or string for 007 tokens"
    });
  }
};

module.exports = { generateAgoraToken };
