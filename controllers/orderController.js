const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const InventoryItem = require('../models/InventoryItem');
const Settings = require('../models/Settings');
const { broadcast } = require('../sockets');

// Deduct inventory based on each menu item's recipe (ingredients), if defined.
async function deductInventoryForOrder(items) {
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuId);
    if (!menuItem || !menuItem.ingredients || !menuItem.ingredients.length) continue;
    for (const ing of menuItem.ingredients) {
      await InventoryItem.findByIdAndUpdate(ing.inventoryItemId, {
        $inc: { qty: -(ing.qty * item.qty) },
      });
    }
  }
}

exports.create = async (req, res, next) => {
  try {
    const { tableId, tableNum, items, note, discount } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: 'سبد سفارش خالی است' });

    const settings = await Settings.findOne();
    if (settings && settings.dayOpen === false) {
      return res.status(409).json({ message: 'روز بسته است؛ ثبت سفارش امکان‌پذیر نیست' });
    }

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const finalAmount = total - (discount || 0);

    const order = await Order.create({
      tableId,
      tableNum,
      items,
      total,
      discount: discount || 0,
      finalAmount,
      note,
      date: settings ? settings.currentDay : new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('fa-IR'),
      createdBy: req.user?._id,
    });

    await deductInventoryForOrder(items);

    broadcast('order:created', order); // kitchen + cashier screens pick this up instantly
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// Scalable listing: defaults to "today" and is always capped/paginated so a multi-year
// database never forces the client to download the entire order history.
exports.list = async (req, res, next) => {
  try {
    const { date, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);
    res.json({ orders, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'سفارش یافت نشد' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    broadcast('order:updated', order);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', closed: true },
      { new: true }
    );
    broadcast('order:updated', order);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.pay = async (req, res, next) => {
  try {
    const { discount = 0, payMethod = 'cash' } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'سفارش یافت نشد' });
    const finalAmount = Math.max(0, order.total - (discount || 0));
    order.paid = true;
    order.payMethod = payMethod;
    order.discount = discount || 0;
    order.finalAmount = finalAmount;
    order.status = 'delivered';
    await order.save();
    broadcast('order:updated', order);
    res.json(order);
  } catch (err) {
    next(err);
  }
};
