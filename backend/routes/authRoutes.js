const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authController.logout);

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Forgot password - send reset link
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Update user profile
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
