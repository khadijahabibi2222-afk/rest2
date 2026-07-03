const express = require('express');
const router = express.Router();
const { dashboard } = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, dashboard);

module.exports = router;
