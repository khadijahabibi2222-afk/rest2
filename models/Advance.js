const mongoose = require('mongoose');

const advanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

advanceSchema.index({ userId: 1 });

module.exports = mongoose.model('Advance', advanceSchema);
