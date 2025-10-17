const express = require('express');
const router = express.Router();
const {
  getAllDetailOrders,
  getDetailOrderById,
  createDetailOrder,
  updateDetailOrder,
  deleteDetailOrder
} = require('../controllers/detail_order');

// Routes untuk detail pesanan
router.get('/', getAllDetailOrders);
router.get('/:id', getDetailOrderById);
router.post('/', createDetailOrder);
router.put('/:id', updateDetailOrder);
router.delete('/:id', deleteDetailOrder);

module.exports = router;
