const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
  itemName: { type: String },
  type: { type: String, enum: ['in', 'out', 'adjustment'], default: 'adjustment' },
  delta: { type: Number, default: 0 }, // + restock, - consumption, ± manual adjustment
  beforeQuantity: { type: Number, default: 0 },
  afterQuantity: { type: Number, default: 0 },
  note: { type: String, default: '' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  user: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', StockMovementSchema);