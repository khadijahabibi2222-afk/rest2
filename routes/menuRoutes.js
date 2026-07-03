const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/menuController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', ctrl.list);
router.post('/', requireRole('manager'), ctrl.create);
router.put('/:id', requireRole('manager'), ctrl.update);
router.delete('/:id', requireRole('manager'), ctrl.remove);

module.exports = router;
