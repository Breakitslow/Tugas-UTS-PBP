const express = require('express');
const router = express.Router();
const {
  getAllVouchers,
  getVoucherById,
  getVoucherByCode,
  createVoucher,
  updateVoucher,
  useVoucher,
  deleteVoucher
} = require('../controllers/voucher');
const { authenticateToken, authorize } = require('../middleware/auth');

// Routes untuk voucher
// Public routes untuk melihat voucher yang tersedia
router.get('/', getAllVouchers);
router.get('/code/:code', getVoucherByCode);
// Protected routes
router.get('/:id', authenticateToken, authorize('admin'), getVoucherById);
router.post('/', authenticateToken, authorize('admin'), createVoucher);
router.put('/:id', authenticateToken, authorize('admin'), updateVoucher);
router.put('/:id/use', authenticateToken, useVoucher); // User bisa menggunakan voucher
router.delete('/:id', authenticateToken, authorize('admin'), deleteVoucher);

module.exports = router;
