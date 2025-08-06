const express = require('express');
const router = express.Router();
const { register, forgotPassword, resetPassword, changePassword  } = require('../controllers/authController');  // Register controller
const { login } = require('../controllers/auth/login');         // Login controller
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// Protected: Only logged-in admins can register users
router.post('/register', authMiddleware, register);

// Public: Login is open to all roles
router.post('/login', login);

// Forgot Password
router.post('/forgot-password', forgotPassword);

// Reset Password
router.post('/reset-password', resetPassword);

// change Password
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
