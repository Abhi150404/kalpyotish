const Wallet = require('../models/Wallet');
const User = require('../models/UserDetail');

// 👉 Add Money to Wallet
exports.addMoney = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'UserId and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    // check user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // find or create wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: userId, balance: 0 });
    }

    wallet.balance += amount;
    wallet.transactions.push({ type: 'credit', amount, reason: reason || 'Wallet Top-up' });

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: 'Money added successfully',
      wallet
    });
  } catch (err) {
    console.error('Add Money error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 👉 Get Wallet by UserId
exports.getWalletByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ user: userId }).populate('user');
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found for this user' });
    }

    return res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error('Get Wallet error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// 👉 Get All Wallets (Admin)
exports.getAllWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find().populate('user');
    return res.status(200).json({ success: true, wallets });
  } catch (err) {
    console.error('Get All Wallets error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
