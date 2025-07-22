const Session = require('../models/Session');
const User = require('../models/UserDetail');
const CommunicationRequest = require('../models/CommunicationRequest');

const rates = {
  chat: 0.1,
  call: 0.5,
  videoCall: 1.0
};

exports.startSession = async (req, res) => {
  try {
    const { communicationId } = req.body;

    const request = await CommunicationRequest.findById(communicationId)
      .populate('user')
      .populate('astrologer');

    if (!request || request.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Invalid or unaccepted request' });
    }

    const user = await User.findById(request.user._id);

    const rate = rates[request.type];
    // if (user.wallet.balance < rate) {
    //   return res.status(400).json({ success: false, message: 'Insufficient balance' });
    // }

    const session = await Session.create({
      communicationId,
      user: request.user._id,
      astrologer: request.astrologer._id,
      type: request.type,
      ratePerSecond: rate
    });

    res.status(200).json({ success: true, message: 'Session started', session });
  } catch (err) {
    console.error('Start session error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


