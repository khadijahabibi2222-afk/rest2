const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    num: { type: Number, required: true, unique: true },
    cap: { type: Number, default: 4 },
    status: { type: String, enum: ['free', 'occupied'], default: 'free' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
