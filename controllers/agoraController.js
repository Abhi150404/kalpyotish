const { RtcTokenBuilder, RtcRole } = require('agora-token');

// The main function that handles the token generation logic
const generateAgoraToken = (req, res) => {
    // ================== TEMPORARY DEBUGGING ==================
    // We will hardcode the values to bypass the .env file for one test.
    
    const APP_ID = "cdb07bd78545426d8f8d94396c1226e3";
    
    // IMPORTANT: Paste the App Certificate you just copied from the Agora Console here.
    const APP_CERTIFICATE = "744e98ca28a243acae8f37d54df011ae"; 

    // =========================================================


    // Check if the credentials are set (this will now check our hardcoded value)
    if (!APP_ID || !APP_CERTIFICATE || APP_CERTIFICATE === "PASTE_YOUR_REAL_APP_CERTIFICATE_HERE") {
        // This error will trigger if you forget to paste the certificate
        return res.status(500).json({ 'error': 'FATAL: App Certificate is not hardcoded in the controller for this test.' });
    }

    // Get channelName, userId, and callType from the request body
    const { channelName, userId, callType } = req.body;

    // Validate the input
    if (!channelName || !userId) {
        return res.status(400).json({ 'error': 'channelName and userId are required' });
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    console.log(`--- HARDCODED TEST ---`);
    console.log(`Using App ID: ${APP_ID}`);
    console.log(`Using App Certificate: ${APP_CERTIFICATE}`);
    console.log(`For User ID: ${userId}`);
    console.log(`----------------------`);

    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            Number(userId),
            role,
            privilegeExpiredTs
        );

        return res.status(200).json({
            token: token,
            appId: APP_ID,
            channelName: channelName,
            userId: userId,
            callType: callType,
            message: "Token generated using HARDCODED values. Remember to change the code back!"
        });

    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ 'error': 'Failed to generate token even with hardcoded values.' });
    }
};

module.exports = {
    generateAgoraToken
};