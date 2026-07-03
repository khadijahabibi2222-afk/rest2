const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    qty: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
    tableNum: { type: Number },
    items: [orderItemSchema],
    total: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled', 'paid'],
      default: 'pending',
    },
    note: { type: String, default: '' },
    paid: { type: Boolean, default: false },
    payMethod: { type: String, enum: ['cash', 'card', null], default: null },
    date: { type: String, required: true }, // Shamsi date label, e.g. 1403-04-06 - for business-day grouping/reports
    time: { type: String, default: '' },
    closed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // createdAt used for true chronological sorting/range queries at scale
);

// Indexes that matter once this collection has millions of rows:
orderSchema.index({ date: 1 });               // "today's orders" / daily reports
orderSchema.index({ status: 1 });             // kitchen/active-order views
orderSchema.index({ tableId: 1, status: 1 }); // "is this table occupied"
orderSchema.index({ createdAt: -1 });         // recent-orders list, pagination

module.exports = mongoose.model('Order', orderSchema);
