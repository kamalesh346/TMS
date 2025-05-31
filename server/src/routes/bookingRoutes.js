const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  updateBookingStatus,
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new booking (BOOKER only)
router.post('/create', authMiddleware, createBooking);

// Get all bookings created by the logged-in BOOKER
router.get('/my-bookings', authMiddleware, getUserBookings);

// Get all bookings (ADMIN only)
router.get('/all', authMiddleware, getAllBookings);

// Cancel a booking (BOOKER only, if pending)
router.delete('/:id', authMiddleware, cancelBooking);

// Update booking status (ADMIN only: approve/reject)
router.patch('/:id/status', authMiddleware, updateBookingStatus);

module.exports = router;
