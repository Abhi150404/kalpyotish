const Product = require('../models/Product');

// CREATE Product
const createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const images = req.files.map(file => file.path); // Cloudinary image URLs

    const newProduct = new Product({ name, images, description, price });
    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', data: newProduct });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Products fetched successfully', data: products });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ message: 'Failed to fetch products', error });
  }
};

// UPDATE product by ID
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;

    let updatedData = { name, description, price };

    // If new images uploaded
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => file.path);
      updatedData.images = images;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Failed to update product', error });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  updateProduct
};
