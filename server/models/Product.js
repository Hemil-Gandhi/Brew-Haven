const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: 'unit' },
  tax: { type: Number, default: 0 },
  description: { type: String },
  image: { type: String, default: '' },
  variants: [{
    name: { type: String },
    extraPrice: { type: Number, default: 0 }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
