const Settings = require('../models/Settings');
const DayClosing = require('../models/DayClosing');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const { broadcast } = require('../sockets');

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ currentDay: new Date().toISOString().slice(0, 10) });
  }
  return settings;
}

exports.get = async (req, res, next) => {
  try {
    res.json(await getOrCreateSettings());
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    Object.assign(settings, req.body);
    await settings.save();
    broadcast('settings:changed', settings);
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// Close the current business day: snapshot totals, then open a fresh day.
exports.closeDay = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    const date = settings.currentDay;

    const orders = await Order.find({ date, status: { $ne: 'cancelled' }, paid: true });
    const expenses = await Expense.find({ date });
    const totalSales = orders.reduce((s, o) => s + (o.finalAmount || o.total), 0);
    const cashSales = orders.filter(o => o.payMethod === 'cash').reduce((s, o) => s + (o.finalAmount || o.total), 0);
    const cardSales = orders.filter(o => o.payMethod === 'card').reduce((s, o) => s + (o.finalAmount || o.total), 0);
    const discounts = orders.reduce((s, o) => s + (o.discount || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

    await DayClosing.create({
      dayId: settings.dayId,
      date,
      totalSales,
      cashSales,
      cardSales,
      discounts,
      totalExpenses,
      orderCount: orders.length,
      closedBy: req.user?.name || '',
    });

    await Order.updateMany({ date }, { closed: true });
    await Expense.updateMany({ date }, { closed: true });

    settings.dayOpen = false;
    await settings.save();
    broadcast('settings:changed', settings);
    res.json({ message: 'روز با موفقیت بسته شد', totalSales, totalExpenses, orderCount: orders.length });
  } catch (err) {
    next(err);
  }
};

exports.openDay = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    settings.dayOpen = true;
    settings.dayId = (settings.dayId || 0) + 1;
    settings.currentDay = req.body.date || new Date().toISOString().slice(0, 10);
    await settings.save();
    broadcast('settings:changed', settings);
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

exports.listClosings = async (req, res, next) => {
  try {
    res.json(await DayClosing.find().sort({ closedAt: -1 }).limit(365));
  } catch (err) {
    next(err);
  }
};
