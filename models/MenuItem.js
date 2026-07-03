const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    desc: { type: String, default: '' },
    icon: { type: String, default: '🍛' },
    price: { type: Number, required: true, default: 0 },
    catId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    stock: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    ingredients: [
      {
        inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
        qty: Number,
      },
    ],
  },
  { timestamps: true }
);

menuItemSchema.index({ catId: 1, active: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
