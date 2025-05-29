const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new booking (BOOKER only)
const createBooking = async (req, res) => {
  const { purpose, pickup, delivery, itemDesc, weight } = req.body;
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Only BOOKER role can create bookings
  if (userRole.toLowerCase() !== 'booker') {
    return res.status(403).json({ message: 'Only BOOKER users can create bookings' });
  }

  // Validate required fields
  if (!purpose || !pickup || !delivery || !itemDesc || weight === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate weight
  const parsedWeight = parseFloat(weight);
  if (isNaN(parsedWeight) || parsedWeight <= 0) {
    return res.status(400).json({ message: 'Weight must be a positive number' });
  }

  try {
    const newBooking = await prisma.booking.create({
      data: {
        purpose,
        pickup,
        delivery,
        itemDesc,
        weight: parsedWeight,
        userId,
      },
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get bookings for the logged-in BOOKER
const getUserBookings = async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (userRole.toLowerCase() !== 'booker') {
    return res.status(403).json({ message: 'Only BOOKER users can view their bookings' });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  const userRole = req.user.role;
  const { status } = req.query;

  if (userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Only ADMIN can view all bookings' });
  }

  try {
    const filters = {};

    // If query param "status" is provided, apply filtering
    if (status) {
      const validStatuses = ['pending', 'cancelled', 'completed'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }

      filters.status = status.toLowerCase();
    }

    const bookings = await prisma.booking.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ bookings });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel booking (only if status is pending and user owns it)
const cancelBooking = async (req, res) => { 
  const userId = req.user.userId;
  const userRole = req.user.role;
  const bookingId = parseInt(req.params.id);

  if (userRole.toLowerCase() !== 'booker') {
    return res.status(403).json({ message: 'Only BOOKER users can cancel bookings' });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }

    // 🔄 Change status instead of deleting
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' }
    });

    return res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
};