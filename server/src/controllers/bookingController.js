const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const sendMail = require('../utils/email');

// Create a new booking (BOOKER only)
const createBooking = async (req, res) => {
  console.log("Booking payload:", req.body);
  console.log("User from token:", req.user);

  const { purpose, pickup, delivery, itemDesc, weight } = req.body;
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (userRole.toLowerCase() !== 'booker') {
    return res.status(403).json({ message: 'Only BOOKER users can create bookings' });
  }

  if (!purpose || !pickup || !delivery || !itemDesc || weight === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

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

    // Get user's email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log('User fetched for email:', user);

    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: 'Booking Confirmation',
        html: `
          <h2>Booking Created Successfully</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>Your booking has been created successfully with the following details:</p>
          <ul>
            <li><strong>Booking ID:</strong> ${newBooking.id}</li>
            <li><strong>Purpose:</strong> ${purpose}</li>
            <li><strong>Pickup:</strong> ${pickup}</li>
            <li><strong>Delivery:</strong> ${delivery}</li>
            <li><strong>Weight:</strong> ${weight} kg</li>
          </ul>
          <p>Status: <strong>${newBooking.status}</strong></p>
        `,
      });
      // Send email to admin
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: 'New Booking Request Submitted',
        html: `
          <h2>New Booking Request</h2>
          <p>User <strong>${user.name || 'User'}</strong> (ID: ${user.id}) has submitted a new booking.</p>
          <ul>
            <li><strong>Purpose:</strong> ${purpose}</li>
            <li><strong>Pickup:</strong> ${pickup}</li>
            <li><strong>Delivery:</strong> ${delivery}</li>
            <li><strong>Weight:</strong> ${weight} kg</li>
            <li><strong>Status:</strong> ${newBooking.status}</li>
          </ul>
          <p>Please review and approve/reject the request in the admin dashboard.</p>
        `,
      });

          }

          return res.status(201).json({
            message: 'Booking created successfully',
            booking: newBooking,
          });
        } catch (error) {
          console.error('Booking creation error:', error);
          return res.status(500).json({ message: 'Server error', error: error.message });
        }
      };

// admin control approve / reject
const updateBookingStatus = async (req, res) => {
  const userRole = req.user.role;
  const bookingId = parseInt(req.params.id);
  const { status } = req.body;
  console.log('Received status:', status);
  
  if (userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Only ADMIN can update booking status' });
  }

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Notify the user
    const user = await prisma.user.findUnique({ where: { id: booking.userId } });
    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: `Booking ${status}`,
        html: `
          <p>Hello ${user.name || 'User'},</p>
          <p>Your booking (ID: ${bookingId}) has been <strong>${status}</strong>.</p>
        `,
      });
    }

    return res.status(200).json({ message: `Booking ${status}`, booking: updated });
  } catch (error) {
    console.error('Status update error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
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
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bookings (admin only) with optional status filter
const getAllBookings = async (req, res) => {
  const userRole = req.user.role;
  const { status } = req.query;

  if (userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Only ADMIN can view all bookings' });
  }

  try {
    const filters = {};
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

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });

    // Get user's email
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: 'Booking Cancelled',
        html: `
          <h2>Booking Cancelled</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>Your booking from <strong>${booking.pickup}</strong> to <strong>${booking.delivery}</strong> has been cancelled.</p>
        `,
      });
      
    }

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
  updateBookingStatus ,
};
