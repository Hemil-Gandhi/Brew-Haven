const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 },
    variant: { type: String },
    kitchenStatus: { type: String, enum: ['To Cook', 'Preparing', 'Completed'], default: 'To Cook' }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  paymentMethod: { type: String, enum: ['Cash', 'Digital', 'UPI QR', 'UPI', 'None'], default: 'None' },
  status: { type: String, enum: ['Open', 'Completed', 'Cancelled'], default: 'Open' },
  type: { type: String, enum: ['Dine-in', 'Self-order', 'Takeaway'], default: 'Dine-in' },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
