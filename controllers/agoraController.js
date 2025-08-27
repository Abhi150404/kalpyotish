const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const generateAgoraToken = (req, res) => {
  const APP_ID = "cdb07bd78545426d8f8d94396c1226e3";
  const APP_CERTIFICATE = "744e98ca28a243acae8f37d54df011ae";

  const { channelName, userId, callType } = req.body;

  console.log("--- Token Generation Request ---");
  console.log("Received channelName:", channelName);
  console.log("Received userId (raw):", userId, "Type:", typeof userId);
  console.log("Received callType:", callType);

  if (!channelName || !userId) {
    console.error("Missing channelName or userId");
    return res.status(400).json({ error: "channelName and userId are required" });
  }

  // Explicitly ensure userAccount is a string for 007 token generation.
  // This step guards against userId somehow being a number, though it should be a string from req.body.
  const userAccount = String(userId); 

  console.log("UserAccount to be used for token:", userAccount, "Type:", typeof userAccount);

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    console.log("Attempting to build 007 token using RtcTokenBuilder.buildTokenWithAccount...");
    
    // Explicitly call the method for 007 tokens
    const token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      userAccount, // Pass the string userAccount
      role,
      privilegeExpiredTs
    );

    const generatedPrefix = token.substring(0, 3);
    console.log("Generated token prefix:", generatedPrefix);

    // For 007 tokens, numericUid is not applicable in the same way as 006
    const numericUid = null; 

    console.log("Token generation successful.");
    return res.status(200).json({
      token,
      appId: APP_ID,
      channelName,
      userId: userAccount, // Return the userAccount that was used
      numericUid, // Will always be null when forcing 007
      callType,
      message: `Token (${generatedPrefix}) generated successfully`
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
    return res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
      hint: "Check APP_ID, APP_CERTIFICATE, and ensure Agora Access Token library is correctly installed."
    });
  }
};

module.exports = { generateAgoraToken };