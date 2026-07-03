function errorHandler(err, req, res, next) {
  console.error(err);

  // Mongoose not connected yet — give a clear message instead of a cryptic timeout
  if (err.message && err.message.includes('buffering timed out')) {
    return res.status(503).json({
      message: 'سرور در حال اتصال به پایگاه داده است. چند ثانیه صبر کنید و دوباره تلاش کنید.'
    });
  }
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError') {
    return res.status(503).json({ message: 'خطای اتصال به پایگاه داده. دوباره تلاش کنید.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'این مقدار قبلاً ثبت شده است (تکراری)', field: err.keyValue });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  res.status(err.status || 500).json({ message: err.message || 'خطای سرور' });
}

module.exports = errorHandler;
