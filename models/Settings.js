const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, default: 'رستورانت' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    currency: { type: String, default: 'AFN' },
    taxRate: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    logo: { type: String, default: '' }, // base64 data URL
    currentDay: { type: String, default: '' }, // Shamsi date label for the open business day
    dayOpen: { type: Boolean, default: true },
    dayId: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
