const MenuItem = require('../models/MenuItem');
const { broadcast } = require('../sockets');

exports.list = async (req, res, next) => {
  try {
    const { activeOnly, catId } = req.query;
    const filter = {};
    if (activeOnly === 'true') filter.active = true;
    if (catId) filter.catId = catId;
    res.json(await MenuItem.find(filter).sort({ createdAt: 1 }));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = await MenuItem.create(req.body);
    broadcast('menu:changed', {});
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    broadcast('menu:changed', {});
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    broadcast('menu:changed', {});
    res.json({ message: 'حذف شد' });
  } catch (err) {
    next(err);
  }
};
