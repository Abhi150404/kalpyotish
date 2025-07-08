// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'PENDING', // or CONFIRMED, FAILED
    enum: ['PENDING', 'CONFIRMED', 'FAILED']
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
