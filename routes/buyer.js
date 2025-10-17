const express = require('express');
const router = express.Router();
const {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer
} = require('../controllers/buyer');
const { authenticateToken, authorize, authenticateBuyer } = require('../middleware/auth');

// Routes untuk pembeli
// Hanya admin yang bisa melihat semua buyers
router.get('/', authenticateToken, authorize('admin'), getAllBuyers);
// Buyer bisa melihat profile sendiri, admin bisa melihat semua
router.get('/:id', authenticateBuyer, getBuyerById);
// Registrasi buyer baru (tidak perlu auth, sudah ada di /api/auth/buyer/register)
router.post('/', createBuyer);
// Buyer hanya bisa update profile sendiri, admin bisa update semua
router.put('/:id', authenticateBuyer, updateBuyer);
// Hanya admin yang bisa delete buyers
router.delete('/:id', authenticateToken, authorize('admin'), deleteBuyer);

module.exports = router;
