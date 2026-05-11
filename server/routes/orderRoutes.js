const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, getKitchenOrders, getOrderById } = require('../controllers/orderController');

// Specific routes BEFORE parameterized routes
router.get('/kitchen', getKitchenOrders);
router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);
router.put('/:id', updateOrderStatus);

module.exports = router;
