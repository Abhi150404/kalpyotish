const express = require('express');
const router = express.Router();

// Import the controller function
const { generateAgoraToken } = require('../controllers/agoraController');

// Define a POST route for '/generate-token'
// When a request hits this route, it will execute the generateAgoraToken function
router.post('/generate-token', generateAgoraToken);

// You can add a simple health-check route for this module too
router.get('/ping', (req, res) => {
    res.status(200).send('pong from Agora routes');
});


// Export the router so it can be used by the main index.js file
module.exports = router;