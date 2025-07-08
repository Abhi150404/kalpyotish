const Order = require('../models/Order');
const Product = require('../models/Product');

// Helper to generate random ID like #KJ1234567890
const generateCustomProductId = () => {
  const random10Digit = Math.floor(1000000000 + Math.random() * 9000000000); // Ensures 10 digits
  return `#KJ${random10Digit}`;
};

const createOrder = async (req, res) => {
  try {
    const { productId, sessionId } = req.body;

    if (!productId || !sessionId) {
      return res.status(400).json({ message: 'Product ID and session ID are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const customProductId = generateCustomProductId();

    const order = new Order({
      product: productId,
      sessionId,
      customProductId,
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
