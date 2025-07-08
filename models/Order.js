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
  customProductId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'CONFIRMED', 'FAILED']
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
