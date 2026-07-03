const mongoose = require('mongoose');

const inventoryCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryCategory', inventoryCategorySchema);
