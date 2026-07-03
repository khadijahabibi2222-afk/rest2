const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.patch('/:id/status', ctrl.updateStatus);
router.patch('/:id/cancel', ctrl.cancel);
router.patch('/:id/pay', ctrl.pay);

module.exports = router;
