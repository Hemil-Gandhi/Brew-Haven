const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// Menu-linked stock entries start with this many units
const DEFAULT_PRODUCT_QTY = 10;

exports.getProducts = async (req, res) => {
  try {
    const [products, stocks] = await Promise.all([
      Product.find(),
      Inventory.find({ productId: { $ne: null } }),
    ]);
    const stockMap = new Map(stocks.map(s => [String(s.productId), s]));
    const enriched = products.map(p => {
      const stock = stockMap.get(String(p._id));
      return {
        ...p.toObject(),
        stock: stock ? stock.quantity : null, // null = not tracked → treated as in stock
        stockUnit: stock ? stock.unit : 'unit',
        lowStock: stock ? stock.isLowStock : false,
      };
    });
    res.json(enriched);
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

    // Auto-create a stock entry so new menu items are trackable
    try {
      await Inventory.create({
        name: product.name,
        type: 'Product',
        category: product.category || '',
        quantity: DEFAULT_PRODUCT_QTY,
        unit: product.unit || 'unit',
        reorderLevel: 0,
        supplier: '',
        costPerUnit: 0,
        productId: product._id,
      });
    } catch (err) {
      console.error('Inventory auto-create error:', err.message);
    }

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

    // Keep the linked stock entry in sync with menu details
    try {
      await Inventory.updateOne(
        { productId: product._id },
        {
          $set: {
            name: product.name,
            category: product.category || '',
            unit: product.unit || 'unit',
          },
        }
      );
    } catch (err) {
      console.error('Inventory sync error:', err.message);
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    await Inventory.deleteOne({ productId: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
