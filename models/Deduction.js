const mongoose = require('mongoose');

const deductionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, default: '' },
    date: { type: String, required: true },
    by: { type: String, default: '' },
  },
  { timestamps: true }
);

deductionSchema.index({ userId: 1 });

module.exports = mongoose.model('Deduction', deductionSchema);
