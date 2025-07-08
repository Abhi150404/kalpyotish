// controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');

// Create Order API
const createOrder = async (req, res) => {
  try {
    const { productId, sessionId } = req.body;

    console.log('Received:', { productId, sessionId });

    if (!productId || !sessionId) {
      return res.status(400).json({ message: 'Product ID and session ID are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const order = new Order({
      product: productId,
      sessionId,
      status: 'PENDING'
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create Order Error:', error.message || error);
    res.status(500).json({ message: 'Failed to create order', error: error.message || error });
  }
};


module.exports = {
  createOrder
};
