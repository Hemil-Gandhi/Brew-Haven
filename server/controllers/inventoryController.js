const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// Record a stock movement entry
const recordMovement = async (inventory, type, delta, note = '', orderId = null, user = '') => {
  try {
    const beforeQuantity = Number(inventory.quantity);
    await StockMovement.create({
      inventoryId: inventory._id,
      itemName: inventory.name,
      type,
      delta,
      beforeQuantity,
      afterQuantity: Math.max(0, beforeQuantity + delta),
      note,
      orderId,
      user,
    });
  } catch (err) {
    console.error('Failed to record stock movement:', err.message);
  }
};

exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ type: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const items = await Inventory.find();
    const lowStock = items.filter(i => i.isLowStock && i.quantity > 0);
    const outOfStock = items.filter(i => i.quantity <= 0);
    const value = items.reduce((sum, i) => sum + Number(i.value || 0), 0);
    res.json({
      totalItems: items.length,
      productItems: items.filter(i => i.type === 'Product').length,
      ingredientItems: items.filter(i => i.type === 'Ingredient').length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      totalValue: Number(value.toFixed(2)),
      currency: 'INR',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const data = { ...req.body };
    // Guard: a menu product can only have one stock entry
    if (data.productId) {
      const existing = await Inventory.findOne({ productId: data.productId });
      if (existing) {
        return res.status(400).json({ message: 'This menu product already has a stock entry' });
      }
    }
    const item = new Inventory({
      name: data.name,
      type: data.type === 'Ingredient' ? 'Ingredient' : 'Product',
      category: data.category || '',
      quantity: Number(data.quantity) || 0,
      unit: data.unit || 'unit',
      reorderLevel: Number(data.reorderLevel) || 0,
      supplier: data.supplier || '',
      costPerUnit: Number(data.costPerUnit) || 0,
      productId: data.productId || null,
    });
    await item.save();
    await recordMovement(item, 'adjustment', Number(item.quantity), 'Initial stock entry', null, data.user || '');
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });

    const data = { ...req.body };
    const oldQuantity = Number(item.quantity);
    const newQuantity = Number(data.quantity) !== undefined && data.quantity !== '' ? Number(data.quantity) : oldQuantity;
    const quantityChanged = newQuantity !== oldQuantity;

    // Stop a menu product stock entry from switching to a different product
    if (data.productId && data.productId !== String(item.productId || '')) {
      const existing = await Inventory.findOne({ productId: data.productId });
      if (existing) {
        return res.status(400).json({ message: 'That menu product already has a stock entry' });
      }
    }

    item.name = data.name ?? item.name;
    item.type = data.type === 'Ingredient' || data.type === 'Product' ? data.type : item.type;
    item.category = data.category ?? item.category;
    item.unit = data.unit ?? item.unit;
    item.reorderLevel = data.reorderLevel !== undefined ? Number(data.reorderLevel) : item.reorderLevel;
    item.supplier = data.supplier ?? item.supplier;
    item.costPerUnit = data.costPerUnit !== undefined ? Number(data.costPerUnit) : item.costPerUnit;
    if (data.productId !== undefined) item.productId = data.productId || null;

    await item.save();

    if (quantityChanged) {
      await recordMovement(item, 'adjustment', newQuantity - oldQuantity, 'Manual adjustment', null, data.user || '');
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.restockItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });

    const addQty = Math.max(0, Number(req.body.quantity) || 0);
    if (addQty === 0) {
      return res.status(400).json({ message: 'Restock quantity must be greater than 0' });
    }

    item.quantity += addQty;
    await item.save();
    await recordMovement(item, 'in', addQty, req.body.note || 'Restock', null, req.body.user || '');

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    await StockMovement.deleteMany({ inventoryId: req.params.id });
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create stock entries for every menu product that doesn't have one yet
exports.syncProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const existing = await Inventory.find({ productId: { $ne: null } });
    const existingIds = new Set(existing.map(i => String(i.productId)));

    let created = 0;
    for (const p of products) {
      if (existingIds.has(String(p._id))) continue;
      const item = new Inventory({
        name: p.name,
        type: 'Product',
        category: p.category || '',
        quantity: 0,
        unit: p.unit || 'unit',
        reorderLevel: 0,
        supplier: '',
        costPerUnit: 0,
        productId: p._id,
      });
      await item.save();
      created += 1;
    }
    res.json({ message: `Synced menu products`, created });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const movements = await StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Called automatically when an order is placed
exports.applyOrderDeduction = async (orderItems, orderId) => {
  if (!orderItems || orderItems.length === 0) return;
  for (const item of orderItems) {
    if (!item.productId) continue;
    let inventory;
    try {
      inventory = await Inventory.findOne({ productId: item.productId });
    } catch (err) {
      console.error('Inventory lookup failed:', err.message);
      continue;
    }
    if (!inventory) continue;
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;
    inventory.quantity = Math.max(0, inventory.quantity - qty);
    await inventory.save();
    await recordMovement(inventory, 'out', -qty, 'Order sale', orderId, '');
  }
};