const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Parse variants if sent as JSON string (from FormData)
    if (typeof productData.variants === 'string') {
      productData.variants = JSON.parse(productData.variants);
    }
    
    // Handle uploaded image file
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Parse variants if sent as JSON string (from FormData)
    if (typeof updateData.variants === 'string') {
      updateData.variants = JSON.parse(updateData.variants);
    }
    
    // Handle uploaded image file
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
