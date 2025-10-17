const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/user_new');
const { authenticateToken, authorize, checkOwnership } = require('../middleware/auth');

// Routes untuk pengguna
// Hanya admin yang bisa melihat semua users
router.get('/', authenticateToken, authorize('admin'), getAllUsers);
// User bisa melihat profile sendiri, admin bisa melihat semua
router.get('/:id', authenticateToken, getUserById);
// Registrasi user baru (tidak perlu auth, sudah ada di /api/auth/register)
router.post('/', createUser);
// User hanya bisa update profile sendiri, admin bisa update semua
router.put('/:id', authenticateToken, checkOwnership('user_id'), updateUser);
// Hanya admin yang bisa delete users
router.delete('/:id', authenticateToken, authorize('admin'), deleteUser);

module.exports = router;
