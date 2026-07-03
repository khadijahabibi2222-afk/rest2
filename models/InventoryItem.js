const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    unit: { type: String, default: '' },
    minQty: { type: Number, default: 0 },
    costPerUnit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ category: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
