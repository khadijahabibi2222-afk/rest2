const InventoryItem = require('../models/InventoryItem');
const InventoryCategory = require('../models/InventoryCategory');
const { broadcast } = require('../sockets');

// ---------- Inventory items ----------

exports.listItems = async (req, res, next) => {
  try {
    res.json(await InventoryItem.find().sort({ name: 1 }));
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.create(req.body);
    broadcast('inventory:changed', {});
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    broadcast('inventory:changed', {});
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.restockItem = async (req, res, next) => {
  try {
    const { qty } = req.body;
    const item = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { qty: Number(qty) || 0 } },
      { new: true }
    );
    broadcast('inventory:changed', {});
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    broadcast('inventory:changed', {});
    res.json({ message: 'حذف شد' });
  } catch (err) {
    next(err);
  }
};

// ---------- Inventory categories ----------

exports.listCategories = async (req, res, next) => {
  try {
    res.json(await InventoryCategory.find().sort({ name: 1 }));
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const cat = await InventoryCategory.create({ name: req.body.name });
    broadcast('inventoryCategories:changed', {});
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
};

exports.removeCategory = async (req, res, next) => {
  try {
    await InventoryCategory.findByIdAndDelete(req.params.id);
    broadcast('inventoryCategories:changed', {});
    res.json({ message: 'حذف شد' });
  } catch (err) {
    next(err);
  }
};
