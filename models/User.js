const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['manager', 'waiter', 'chef', 'cashier'], default: 'waiter' },
    phone: { type: String, default: '' },
    salary: { type: Number, default: 0 },
    joinDate: { type: String, default: '' }, // Shamsi date string e.g. 1402-01-01
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
