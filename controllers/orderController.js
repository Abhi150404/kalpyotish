const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/UserDetail');

const generateCustomProductId = () => {
  const random10Digit = Math.floor(1000000000 + Math.random() * 9000000000);
  return `#KJ${random10Digit}`;
};

const createOrder = async (req, res) => {
  try {
    const { productId, sessionId, userId } = req.body;

    if (!productId || !sessionId || !userId) {
      return res.status(400).json({ message: 'Product ID, session ID and user ID are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const customProductId = generateCustomProductId();

    const order = new Order({
      product: productId,
      sessionId,
      user: userId,
      customProductId,
      status: 'PENDING'
    });

    await order.save();

    // Populate user and product in the response
    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'name price description images')
      .populate('user', 'name email mobileNo');

    res.status(201).json({
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Create Order Error:', error.message || error);
    res.status(500).json({ message: 'Failed to create order', error: error.message || error });
  }
};

module.exports = {
  createOrder
};
