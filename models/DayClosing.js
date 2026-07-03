const mongoose = require('mongoose');

const dayClosingSchema = new mongoose.Schema(
  {
    dayId: { type: Number, required: true },
    date: { type: String, required: true },
    totalSales: { type: Number, default: 0 },
    cashSales: { type: Number, default: 0 },
    cardSales: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    closedBy: { type: String, default: '' },
    closedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DayClosing', dayClosingSchema);
