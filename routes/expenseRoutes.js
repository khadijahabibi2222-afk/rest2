const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/expenseController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', ctrl.listExpenses);
router.post('/', ctrl.createExpense);
router.delete('/:id', ctrl.removeExpense);

router.get('/items/all', ctrl.listItems);
router.post('/items', ctrl.createItem);
router.delete('/items/:id', ctrl.removeItem);

module.exports = router;
