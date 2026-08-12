const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Product', 'Ingredient'], default: 'Product' },
  category: { type: String, default: '' },
  quantity: { type: Number, default: 0, min: 0 },
  unit: { type: String, default: 'unit' },
  reorderLevel: { type: Number, default: 0, min: 0 },
  supplier: { type: String, default: '' },
  costPerUnit: { type: Number, default: 0, min: 0 },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
}, { timestamps: true });

// Each menu product can only have one stock entry
InventorySchema.index({ productId: 1 }, { unique: true, sparse: true });

InventorySchema.virtual('value').get(function () {
  return Number(this.quantity) * Number(this.costPerUnit);
});

InventorySchema.virtual('isLowStock').get(function () {
  return Number(this.quantity) <= Number(this.reorderLevel);
});

InventorySchema.set('toJSON', { virtuals: true });
InventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', InventorySchema);