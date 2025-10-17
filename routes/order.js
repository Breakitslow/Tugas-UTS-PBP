const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrderByCode,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/order');
const { authenticateToken, authorize, authenticateBuyer } = require('../middleware/auth');

// Routes untuk pesanan
// Hanya admin yang bisa melihat semua orders
router.get('/', authenticateToken, authorize('admin'), getAllOrders);
// User bisa melihat order miliknya, admin bisa melihat semua
router.get('/:id', authenticateToken, getOrderById);
// Public route untuk cek order by code (untuk tracking)
router.get('/code/:code', getOrderByCode);
// User dan buyer bisa membuat order
router.post('/', authenticateToken, createOrder);
// User hanya bisa update order miliknya, admin bisa update semua
router.put('/:id', authenticateToken, updateOrder);
// Hanya admin yang bisa delete orders
router.delete('/:id', authenticateToken, authorize('admin'), deleteOrder);

module.exports = router;
