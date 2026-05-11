const mongoose = require('mongoose');

const FloorSchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Floor', FloorSchema);
