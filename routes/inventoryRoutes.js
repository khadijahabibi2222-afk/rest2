const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventoryController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/items', ctrl.listItems);
router.post('/items', ctrl.createItem);
router.put('/items/:id', ctrl.updateItem);
router.patch('/items/:id/restock', ctrl.restockItem);
router.delete('/items/:id', ctrl.removeItem);

router.get('/categories', ctrl.listCategories);
router.post('/categories', ctrl.createCategory);
router.delete('/categories/:id', ctrl.removeCategory);

module.exports = router;
