const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Add money to wallet
router.post('/add', walletController.addMoney);

// Get wallet by userId
router.get('/:userId', walletController.getWalletByUser);

// Admin: Get all wallets
router.get('/all', walletController.getAllWallets);

module.exports = router;
