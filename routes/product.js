const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductByCode,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductRating
} = require('../controllers/product');
const { authenticateToken, authorize } = require('../middleware/auth');

// Routes untuk produk
// Public routes (tidak perlu auth)
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/code/:code', getProductByCode);
router.get('/:id/rating', getProductRating);

// Protected routes (perlu auth dan role admin)
router.post('/', authenticateToken, authorize('admin'), createProduct);
router.put('/:id', authenticateToken, authorize('admin'), updateProduct);
router.delete('/:id', authenticateToken, authorize('admin'), deleteProduct);

module.exports = router;
