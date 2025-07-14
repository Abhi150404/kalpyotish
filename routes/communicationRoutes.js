const express = require('express');
const router = express.Router();
const {
  requestCommunication,
  getRequestsForAstrologer,
  updateRequestStatus
} = require('../controllers/communicationController');

// POST: Request communication (chat/call/videoCall)
router.post('/request', requestCommunication);

// GET: Get all requests for a specific astrologer
router.get('/requests/:astrologerId', getRequestsForAstrologer);
router.patch('/update-status/:requestId', updateRequestStatus);

module.exports = router;
