const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');  // Register controller
const { login } = require('../controllers/auth/login');         // Login controller
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

// ✅ Protected: Only logged-in admins can register users
router.post('/register', authMiddleware, register);

// ✅ Public: Login is open to all roles
router.post('/login', login);

module.exports = router;
