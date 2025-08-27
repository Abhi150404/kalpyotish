const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const crypto = require("crypto");

function convertUserIdToUid(userId) {
  const hash = crypto.createHash("md5").update(userId).digest("hex");
  // force it to fit within safe integer range
  const uid = parseInt(hash.substring(0, 8), 16) >>> 0; 
  return uid;
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
    // Always convert to numeric UID
    let numericUid = Number(userId);

    // If userId is not a number, hash it
    if (isNaN(numericUid)) {
      numericUid = convertUserIdToUid(String(userId));
    }

    console.log("✅ Using Numeric UID:", numericUid, "Type:", typeof numericUid);

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      numericUid,
      role,
      privilegeExpiredTs
    );

    // 🚨 Out-of-the-box safeguard: Ensure token starts with 007
    if (!token.startsWith("007")) {
      throw new Error("Invalid token generated (got 006 instead of 007). Check UID handling!");
    }

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId,       // original id
      numericUid,   // Agora UID
      callType,
      message: "Production token (007) generated successfully ✅"
    });
  } catch (error) {
    console.error("❌ Error generating token:", error.message);
    return res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
      hint: "Ensure UID is numeric and buildTokenWithUid is used"
    });
  }
};

module.exports = { generateAgoraToken };
