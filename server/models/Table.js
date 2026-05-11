const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
  number: { type: String, required: true },
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
  seats: { type: Number, default: 2 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Reserved'], default: 'Available' },
  appointmentResource: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Table', TableSchema);
