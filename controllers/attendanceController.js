const Attendance = require('../models/Attendance');
const Advance = require('../models/Advance');
const Deduction = require('../models/Deduction');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { broadcast } = require('../sockets');

// ---------- Attendance ----------

exports.listAttendance = async (req, res, next) => {
  try {
    const { date, userId } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (userId) filter.userId = userId;
    const records = await Attendance.find(filter).sort({ createdAt: -1 }).limit(1000);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// Mark present or absent for "today" (upsert - one record per employee per day)
exports.markAttendance = async (req, res, next) => {
  try {
    const { userId, status, note } = req.body; // status: 'present' | 'absent'
    const settings = await Settings.findOne();
    const date = settings ? settings.currentDay : new Date().toISOString().slice(0, 10);

    const record = await Attendance.findOneAndUpdate(
      { userId, date },
      {
        userId,
        date,
        status,
        time: status === 'present' ? new Date().toLocaleTimeString('fa-IR') : '',
        note: status === 'absent' ? note || '' : '',
      },
      { upsert: true, new: true }
    );
    broadcast('attendance:changed', { date });
    res.json(record);
  } catch (err) {
    next(err);
  }
};

// ---------- Advances ----------

exports.listAdvances = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    const records = await Advance.find(filter).sort({ createdAt: -1 }).limit(2000);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.createAdvance = async (req, res, next) => {
  try {
    const { userId, amount, note } = req.body;
    if (!amount) return res.status(400).json({ message: 'مبلغ را وارد کنید' });
    const settings = await Settings.findOne();
    const date = settings ? settings.currentDay : new Date().toISOString().slice(0, 10);
    const adv = await Advance.create({ userId, amount, note, date });
    broadcast('advances:changed', {});
    res.status(201).json(adv);
  } catch (err) {
    next(err);
  }
};

// ---------- Deductions ----------

exports.listDeductions = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    const records = await Deduction.find(filter).sort({ createdAt: -1 }).limit(2000);
    res.json(records);
  } catch (err) {
    next(err);
  }
};

exports.createDeduction = async (req, res, next) => {
  try {
    const { userId, amount, reason } = req.body;
    if (!amount) return res.status(400).json({ message: 'مبلغ کسر را وارد کنید' });
    const settings = await Settings.findOne();
    const date = settings ? settings.currentDay : new Date().toISOString().slice(0, 10);
    const ded = await Deduction.create({ userId, amount, reason, date, by: req.user?.name || '' });
    broadcast('deductions:changed', {});
    res.status(201).json(ded);
  } catch (err) {
    next(err);
  }
};

exports.deleteDeduction = async (req, res, next) => {
  try {
    await Deduction.findByIdAndDelete(req.params.id);
    broadcast('deductions:changed', {});
    res.json({ message: 'حذف شد' });
  } catch (err) {
    next(err);
  }
};

// ---------- Payroll summary (aggregated server-side, not by pulling raw history to client) ----------

exports.payrollSummary = async (req, res, next) => {
  try {
    const users = await User.find({ active: true }).select('-passwordHash');
    const [advTotals, dedTotals, absentTotals] = await Promise.all([
      Advance.aggregate([{ $group: { _id: '$userId', total: { $sum: '$amount' } } }]),
      Deduction.aggregate([{ $group: { _id: '$userId', total: { $sum: '$amount' } } }]),
      Attendance.aggregate([
        { $match: { status: 'absent' } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
    ]);
    const advMap = Object.fromEntries(advTotals.map((a) => [String(a._id), a.total]));
    const dedMap = Object.fromEntries(dedTotals.map((d) => [String(d._id), d.total]));
    const absMap = Object.fromEntries(absentTotals.map((a) => [String(a._id), a.count]));

    const summary = users.map((u) => {
      const totalAdvances = advMap[String(u._id)] || 0;
      const totalDeductions = dedMap[String(u._id)] || 0;
      const absentDays = absMap[String(u._id)] || 0;
      return {
        userId: u._id,
        name: u.name,
        role: u.role,
        salary: u.salary,
        totalAdvances,
        totalDeductions,
        absentDays,
        netPay: u.salary - totalAdvances - totalDeductions,
      };
    });
    res.json(summary);
  } catch (err) {
    next(err);
  }
};
