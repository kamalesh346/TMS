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
const requireAdmin = require('../middleware/requireAdmin');

// Create a new booking (BOOKER only)
router.post('/create', authMiddleware, createBooking);

// Get all bookings created by the logged-in BOOKER
router.get('/my-bookings', authMiddleware, getUserBookings);

// Get all bookings (ADMIN only)
router.get('/all', authMiddleware, requireAdmin, getAllBookings);

// Cancel a booking (BOOKER only, if pending)
router.delete('/:id', authMiddleware, cancelBooking); // ✅ fixed this line

// Update booking status (ADMIN only: approve/reject)
router.patch('/:id/status', authMiddleware, requireAdmin, updateBookingStatus); // ✅ added requireAdmin here (was missing)

module.exports = router;
