const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    amount: { type: Number, required: true, default: 0 },
    note: { type: String, default: '' },
    date: { type: String, required: true }, // Shamsi date label
    by: { type: String, default: '' },
    closed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

expenseSchema.index({ date: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
