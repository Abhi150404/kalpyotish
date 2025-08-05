const { RtcTokenBuilder, RtcRole } = require('agora-token');

// It's a good practice to load and validate environment variables
// right where they are used or in a dedicated config file.
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// The main function that handles the token generation logic
const generateAgoraToken = (req, res) => {
    // Check if the credentials are set
    if (!APP_ID || !APP_CERTIFICATE) {
        return res.status(500).json({ 'error': 'Agora credentials are not set on the server.' });
    }

    // Get channelName, userId, and callType from the request body
    const { channelName, userId, callType } = req.body;

    // Validate the input
    if (!channelName || !userId) {
        return res.status(400).json({ 'error': 'channelName and userId are required' });
    }

    if (callType !== 'video' && callType !== 'voice') {
        return res.status(400).json({ 'error': "callType must be 'video' or 'voice'" });
    }

    // Set the user's role. PUBLISHER allows them to stream video/audio.
    const role = RtcRole.PUBLISHER;

    // Set the token's expiration time (e.g., 1 hour = 3600 seconds)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    console.log(`Generating token for user ${userId} in channel '${channelName}'`);

    // Use a try-catch block to handle any errors during token generation
    try {
        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            Number(userId), // UID must be a number
            role,
            privilegeExpiredTs
        );

        // Success: send the token and other relevant data back to the client
        return res.status(200).json({
            token: token,
            appId: APP_ID,
            channelName: channelName,
            userId: userId,
            callType: callType
        });

    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ 'error': 'Failed to generate token' });
    }
};

// Export the function so it can be used in our routes file
module.exports = {
    generateAgoraToken
};