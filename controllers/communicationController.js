const CommunicationRequest = require('../models/CommunicationRequest');
const User = require('../models/UserDetail');
const Astrologer = require('../models/astrologerModel');

// Request communication
exports.requestCommunication = async (req, res) => {
  try {
    const { userId, astrologerId, type } = req.body;

    if (!['chat', 'call', 'videoCall'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid communication type' });
    }

    const user = await User.findById(userId);
    const astrologer = await Astrologer.findById(astrologerId);

    if (!user || !astrologer) {
      return res.status(404).json({ success: false, message: 'User or Astrologer not found' });
    }

    const request = new CommunicationRequest({
      user: userId,
      astrologer: astrologerId,
      type
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: `${type} request sent successfully`,
      data: request
    });
  } catch (err) {
    console.error('Communication request error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Get all requests for an astrologer
exports.getRequestsForAstrologer = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    const requests = await CommunicationRequest.find({ astrologer: astrologerId })
      .populate('user', 'name email profile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error('Fetching requests error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
