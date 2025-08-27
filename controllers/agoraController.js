const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const generateAgoraToken = (req, res) => {
  const APP_ID = "cdb07bd78545426d8f8d94396c1226e3";
  const APP_CERTIFICATE = "744e98ca28a243acae8f37d54df011ae";

  const { channelName, userId, callType } = req.body;

  if (!channelName || !userId) {
    return res.status(400).json({ error: "channelName and userId are required" });
  }

  // Ensure userId is treated as a string for 007 token generation.
  // If userId is passed as a number, convert it to string.
  const userAccount = String(userId); 

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    // Force 007 token generation by always using buildTokenWithAccount
    const token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      userAccount, // Always use the string account
      role,
      privilegeExpiredTs
    );

    // For 007 tokens, numericUid will not be directly used/returned by Agora's build method
    const numericUid = null; 

    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId: userAccount, // Return the userAccount that was used
      numericUid, // Will always be null when forcing 007
      callType,
      message: `Token (${token.substring(0, 3)}) generated successfully`
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
      hint: "Ensure APP_ID and APP_CERTIFICATE are correct and you're providing valid channelName/userId"
    });
  }
};

module.exports = { generateAgoraToken };