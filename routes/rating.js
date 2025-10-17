const express = require('express');
const router = express.Router();
const {
  getAllRatings,
  getRatingById,
  createRating,
  updateRating,
  deleteRating,
  getRatingsByProduct
} = require('../controllers/rating');
const { authenticateToken, authorize } = require('../middleware/auth');

// Routes untuk rating
// Public routes untuk melihat rating produk
router.get('/product/:product_id', getRatingsByProduct);
// Protected routes
router.get('/', authenticateToken, authorize('admin'), getAllRatings);
router.get('/:id', authenticateToken, getRatingById);
router.post('/', authenticateToken, createRating); // User bisa memberikan rating
router.put('/:id', authenticateToken, updateRating); // User bisa update rating miliknya
router.delete('/:id', authenticateToken, deleteRating); // User bisa delete rating miliknya

module.exports = router;
