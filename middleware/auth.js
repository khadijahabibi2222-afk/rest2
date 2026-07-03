const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the user to req.user
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'لطفاً وارد سیستم شوید (توکن موجود نیست)' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user || !user.active) return res.status(401).json({ message: 'کاربر یافت نشد یا غیرفعال است' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'نشست شما منقضی شده، دوباره وارد شوید' });
  }
}

// Restricts a route to specific roles, e.g. requireRole('manager')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'شما اجازه دسترسی به این بخش را ندارید' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
