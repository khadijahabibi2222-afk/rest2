const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Shamsi date label
    status: { type: String, enum: ['present', 'absent'], default: 'present' },
    time: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

// One attendance record per employee per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
