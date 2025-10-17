const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');

// User authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Buyer authentication routes
router.post('/buyer/register', authController.registerBuyer);
router.post('/buyer/login', authController.loginBuyer);

// Protected routes (memerlukan authentication)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
