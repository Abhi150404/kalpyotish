const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const crypto = require("crypto");

function convertUserIdToUid(userId) {
  const hash = crypto.createHash("md5").update(userId).digest("hex");
  return parseInt(hash.substring(0, 8), 16) >>> 0; // force 32-bit unsigned
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
    // ✅ Stable 32-bit UID
    const numericUid = Number.isInteger(userId)
      ? userId
      : convertUserIdToUid(String(userId));

    console.log("Generated Stable UID:", numericUid);

    // ✅ Try UID-based token first
    let token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      numericUid,
      role,
      privilegeExpiredTs
    );

    // 🔄 If still comes out "006", fallback to account-based 007 token
    if (token.startsWith("006")) {
      console.warn("⚠️ Got 006 token, retrying with account-based builder...");
      token = RtcTokenBuilder.buildTokenWithAccount(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        String(userId),
        role,
        privilegeExpiredTs
      );
    }

    if (!token.startsWith("007")) {
      throw new Error("Invalid token generated (got " + token.substring(0, 3) + ")");
    }

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId,
      numericUid,
      callType,
      message: "✅ Production token (007) generated successfully"
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
      hint: "Ensure UID is stable 32-bit integer and fallback to buildTokenWithAccount if buildTokenWithUid fails"
    });
  }
};

module.exports = { generateAgoraToken };
