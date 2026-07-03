const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Settings = require('../models/Settings');

const SHAMSI_MONTHS = ['حمل','ثور','جوزا','سرطان','اسد','سنبله','میزان','عقرب','قوس','جدی','دلو','حوت'];

exports.dashboard = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    const today = settings ? settings.currentDay : new Date().toISOString().slice(0, 10);

    const [todayOrders, todayExpenses, topItemsAgg, monthlyAgg] = await Promise.all([
      Order.find({ date: today, status: { $ne: 'cancelled' } }),
      Expense.find({ date: today }),

      // Top selling items overall (server-side aggregation - scales to millions of orders)
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
      ]),

      // Sales grouped by Shamsi month (date field is stored as "YYYY-MM-DD" Shamsi string)
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: { $substrCP: ['$date', 5, 2] }, total: { $sum: { $ifNull: ['$finalAmount', '$total'] } } } },
      ]),
    ]);

    const totalSalesToday = todayOrders.reduce((s, o) => s + (o.finalAmount || o.total), 0);
    const totalExpensesToday = todayExpenses.reduce((s, e) => s + e.amount, 0);

    // Build a 12-slot chart array in Shamsi month order (حمل..حوت)
    const monthlyChart = SHAMSI_MONTHS.map((name, idx) => {
      const monthNum = String(idx + 1).padStart(2, '0');
      const found = monthlyAgg.find((m) => m._id === monthNum);
      return { month: name, total: found ? found.total : 0 };
    });

    res.json({
      date: today,
      totalSalesToday,
      totalExpensesToday,
      orderCountToday: todayOrders.length,
      netToday: totalSalesToday - totalExpensesToday,
      topItems: topItemsAgg,
      monthlyChart,
    });
  } catch (err) {
    next(err);
  }
};
