const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');  // Register controller
const { login } = require('../controllers/auth/login'); // Login controller

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

module.exports = router;
