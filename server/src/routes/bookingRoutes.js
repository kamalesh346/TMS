const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getAllBookings, cancelBooking } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new booking (BOOKER only)
router.post('/create', authMiddleware, createBooking);

// Get all bookings created by the logged-in BOOKER
router.get('/my-bookings', authMiddleware, getUserBookings);

// Get all bookings created by the bookers
router.get('/all', authMiddleware, getAllBookings); // Admin route

// Delete booking by the user
router.delete('/:id', authMiddleware, cancelBooking); // ✅ DELETE /api/bookings/:id

module.exports = router;