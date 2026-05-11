const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  terminalId: { type: String, required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  openingBalance: { type: Number, default: 0 },
  closingBalance: { type: Number },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
