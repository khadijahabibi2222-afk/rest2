function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) {
    return res.status(409).json({ message: 'این مقدار قبلاً ثبت شده است (تکراری)', field: err.keyValue });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || 'خطای سرور' });
}

module.exports = errorHandler;
