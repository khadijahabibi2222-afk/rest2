const Table = require('../models/Table');
const Order = require('../models/Order');
const { broadcast } = require('../sockets');

exports.list = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ num: 1 });
    // attach the active order (if any) for each table so clients don't need a second round trip
    const activeOrders = await Order.find({ status: { $in: ['pending', 'preparing', 'ready'] } });
    const withStatus = tables.map((t) => {
      const order = activeOrders.find((o) => String(o.tableId) === String(t._id));
      return {
        ...t.toObject(),
        occupied: !!order,
        activeOrder: order || null,
      };
    });
    res.json(withStatus);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { num, cap } = req.body;
    if (!num) return res.status(400).json({ message: 'شماره میز را وارد کنید' });
    const table = await Table.create({ num, cap: cap || 4 });
    broadcast('tables:changed', {});
    res.status(201).json(table);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const occupied = await Order.findOne({
      tableId: req.params.id,
      status: { $in: ['pending', 'preparing', 'ready'] },
    });
    if (occupied) {
      return res.status(409).json({ message: 'این میز سفارش فعال دارد و قابل حذف نیست' });
    }
    await Table.findByIdAndDelete(req.params.id);
    broadcast('tables:changed', {});
    res.json({ message: 'میز حذف شد' });
  } catch (err) {
    next(err);
  }
};
