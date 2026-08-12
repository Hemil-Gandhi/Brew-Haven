const express = require('express');
const router = express.Router();
const {
  getInventory,
  getSummary,
  createItem,
  updateItem,
  restockItem,
  deleteItem,
  syncProducts,
  getMovements,
} = require('../controllers/inventoryController');

// Specific routes BEFORE parameterized routes
router.get('/summary', getSummary);
router.get('/movements', getMovements);
router.post('/sync-products', syncProducts);
router.get('/', getInventory);
router.post('/', createItem);
router.put('/:id', updateItem);
router.put('/:id/restock', restockItem);
router.delete('/:id', deleteItem);

module.exports = router;