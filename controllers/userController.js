const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { broadcast } = require('../sockets');

exports.list = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, username, password, phone, role, salary, joinDate } = req.body;
    if (!name || !username) return res.status(400).json({ message: 'نام و نام کاربری اجباری است' });
    const passwordHash = await bcrypt.hash(password || '1234', 10);
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      passwordHash,
      phone,
      role,
      salary,
      joinDate,
    });
    const safe = user.toObject();
    delete safe.passwordHash;
    broadcast('users:changed', {});
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.password) {
      update.passwordHash = await bcrypt.hash(update.password, 10);
      delete update.password;
    } else {
      delete update.password;
    }
    if (update.username) update.username = update.username.toLowerCase();
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'کارمند یافت نشد' });
    broadcast('users:changed', {});
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { active: false });
    broadcast('users:changed', {});
    res.json({ message: 'کارمند غیرفعال شد' });
  } catch (err) {
    next(err);
  }
};
