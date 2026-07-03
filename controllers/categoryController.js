const Category = require('../models/Category');
const { broadcast } = require('../sockets');

exports.list = async (req, res, next) => {
  try {
    res.json(await Category.find().sort({ createdAt: 1 }));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    broadcast('categories:changed', {});
    res.status(201).json(cat);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    broadcast('categories:changed', {});
    res.json(cat);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    broadcast('categories:changed', {});
    res.json({ message: 'حذف شد' });
  } catch (err) {
    next(err);
  }
};
