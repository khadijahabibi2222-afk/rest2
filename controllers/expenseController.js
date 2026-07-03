const Expense = require('../models/Expense');
const ExpenseItem = require('../models/ExpenseItem');
const Settings = require('../models/Settings');
const { broadcast } = require('../sockets');

// ---------- Expenses ----------

exports.listExpenses = async (req, res, next) => {
  try {
    const { date, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (date) filter.date = date;
    const expenses = await Expense.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Expense.countDocuments(filter);
    res.json({ expenses, total });
  } catch (err) {
    next(err);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { title, category, amount, note } = req.body;
    if (!title || !amount) return res.status(400).json({ message: 'عنوان و مبلغ اجباری است' });
    const settings = await Settings.findOne();
    const expense = await Expense.create({
      title,
      category,
      amount,
      note,
      date: settings ? settings.currentDay : new Date().toISOString().slice(0, 10),
      by: req.user?.name || '',
    });
    broadcast('expenses:changed', {});
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

exports.removeExpense = async (req, res, next) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    broadcast('expenses:changed', {});
    res.json({ message: 'حذف شد' });
  } catch (err) {
    next(err);
  }
};

// ---------- Expense items (categories) ----------

exports.listItems = async (req, res, next) => {
  try {
    res.json(await ExpenseItem.find().sort({ name: 1 }));
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const item = await ExpenseItem.create({ name: req.body.name });
    broadcast('expenseItems:changed', {});
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    await ExpenseItem.findByIdAndDelete(req.params.id);
    broadcast('expenseItems:changed', {});
    res.json({ message: 'حذف شد' });
  } catch (err) {
    next(err);
  }
};
