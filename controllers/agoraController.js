const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

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

    // This condition checks if the userId string contains ONLY digits.
    // An _id like "687e951792ad1e628ec4a8c0" contains letters and will NOT satisfy this condition.
    if (/^\d+$/.test(userId)) {
      // This block will be executed if userId is purely numeric (e.g., "12345")
      // It generates an 006 token.
      numericUid = parseInt(userId, 10);
      token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        numericUid,
        role,
        privilegeExpiredTs
      );
      console.log(`Generated 006 token for numeric userId: ${userId}`);
    } else {
      // This block will be executed if userId contains non-digit characters
      // (like "687e951792ad1e628ec4a8c0", UUIDs, emails, etc.)
      // It generates an 007 token using the string as the account.
      token = RtcTokenBuilder.buildTokenWithAccount(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        userId, // Use the string userId directly as the account
        role,
        privilegeExpiredTs
      );
      console.log(`Generated 007 token for string userId (_id): ${userId}`);
    }

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId,
      numericUid,
      callType,
      message: `Token (${token.substring(0, 3)}) generated successfully`
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