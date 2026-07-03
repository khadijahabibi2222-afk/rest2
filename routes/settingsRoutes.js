const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.get);
router.put('/', requireRole('manager'), ctrl.update);
router.post('/close-day', requireRole('manager'), ctrl.closeDay);
router.post('/open-day', requireRole('manager'), ctrl.openDay);
router.get('/closings', ctrl.listClosings);

module.exports = router;
