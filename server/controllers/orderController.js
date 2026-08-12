const Order = require('../models/Order');
const Table = require('../models/Table');
const { applyOrderDeduction } = require('./inventoryController');

exports.createOrder = async (req, res) => {
  try {
    const { tableId, items, totalAmount, type, sessionId, paymentStatus, paymentMethod, status } = req.body;
    const orderNumber = `ORD-${Date.now()}`;
    
    const order = new Order({
      orderNumber,
      tableId,
      items,
      totalAmount,
      type,
      sessionId,
      paymentStatus: paymentStatus || 'Unpaid',
      paymentMethod: paymentMethod || 'None',
      status: status || 'Open'
    });
    
    await order.save();

    // Reduce inventory stock for the ordered items (best-effort)
    try {
      await applyOrderDeduction(items, order._id);
    } catch (err) {
      console.error('Inventory deduction error:', err.message);
    }

    if (tableId) {
      const updatedTable = await Table.findByIdAndUpdate(tableId, { status: 'Occupied' }, { new: true });
      req.app.get('io').emit('table_updated', updatedTable);
    }
    
    const populated = await Order.findById(order._id).populate('tableId');
    req.app.get('io').emit('order_received', populated); // Also emit from controller for reliability
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('tableId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('tableId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paymentMethod, items } = req.body;
    
    const order = await Order.findByIdAndUpdate(id, req.body, { new: true });
    
    // If order is completed, free the table
    if (order.status === 'Completed') {
      if (order.tableId) {
        const updatedTable = await Table.findByIdAndUpdate(order.tableId, { status: 'Available' }, { new: true });
        req.app.get('io').emit('table_updated', updatedTable);
      }
    }
    
    const populated = await Order.findById(order._id).populate('tableId');
    req.app.get('io').emit('order_status_updated', populated);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getKitchenOrders = async (req, res) => {
  try {
    // Orders that are not completed and have items with kitchen status not completed
    const orders = await Order.find({ 
      status: 'Open',
    }).populate('tableId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
