const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const sendMail = require('../utils/email');

// ✅ Create a new booking (Booker only)
const createBooking = async (req, res) => {
  console.log("🔧 Incoming booking payload:", req.body);
  console.log("👤 User from token:", req.user);

  const {
    purpose, pickup, delivery, itemDesc, weight,
    vehicleType, vehicleLength, vehicleBreadth, vehicleHeight,
    startTime, endTime,
  } = req.body;

  const userId = req.user.userId;
  const userRole = req.user.role;

  if (userRole.toLowerCase() !== 'booker') {
    return res.status(403).json({ message: 'Only BOOKER users can create bookings' });
  }

  if (
    !purpose || !pickup || !delivery || !itemDesc || !vehicleType ||
    !startTime || !endTime || weight === undefined
  ) {
    console.log("⛔ Missing required fields.");
    return res.status(400).json({ message: 'All fields are required including vehicle and timing info' });
  }

  const parsedWeight = parseFloat(weight);
  const parsedLength = parseFloat(vehicleLength);
  const parsedBreadth = parseFloat(vehicleBreadth);
  const parsedHeight = parseFloat(vehicleHeight);
  const parsedStart = new Date(startTime);
  const parsedEnd = new Date(endTime);

  if (isNaN(parsedWeight) || parsedWeight <= 0) {
    return res.status(400).json({ message: 'Weight must be a positive number' });
  }

  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    return res.status(400).json({ message: 'Invalid start or end time' });
  }

  try {
    const newBooking = await prisma.booking.create({
      data: {
        purpose,
        pickup,
        delivery,
        itemDesc,
        weight: parsedWeight,
        vehicleType,
        vehicleLength: parsedLength || 0,
        vehicleBreadth: parsedBreadth || 0,
        vehicleHeight: parsedHeight || 0,
        requiredStartTime: parsedStart,
        requiredEndTime: parsedEnd,
        userId,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Email to user
    if (user?.email) {
      await sendMail({
        to: user.email,
        subject: 'Booking Confirmation',
        html: `
          <h2>Booking Created Successfully</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>Your booking has been created with the following details:</p>
          <ul>
            <li><strong>ID:</strong> ${newBooking.id}</li>
            <li><strong>Purpose:</strong> ${purpose}</li>
            <li><strong>Pickup:</strong> ${pickup}</li>
            <li><strong>Delivery:</strong> ${delivery}</li>
            <li><strong>Vehicle:</strong> ${vehicleType}</li>
            <li><strong>Start Time:</strong> ${parsedStart.toLocaleString()}</li>
            <li><strong>End Time:</strong> ${parsedEnd.toLocaleString()}</li>
          </ul>
          <p>Status: <strong>${newBooking.status}</strong></p>
        `,
      });

      // Email to Admin
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: 'New Booking Submitted',
        html: `
          <h2>New Booking Request</h2>
          <p>User <strong>${user.name}</strong> has submitted a booking.</p>
          <ul>
            <li><strong>Pickup:</strong> ${pickup}</li>
            <li><strong>Delivery:</strong> ${delivery}</li>
            <li><strong>Vehicle Type:</strong> ${vehicleType}</li>
            <li><strong>Start:</strong> ${parsedStart.toLocaleString()}</li>
            <li><strong>End:</strong> ${parsedEnd.toLocaleString()}</li>
          </ul>
        `,
      });
    }

    return res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
    });

  } catch (error) {
    console.error('❌ Booking creation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Get bookings for logged-in user (Booker)
const getUserBookings = async (req, res) => {
  const userId = req.user.userId;

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

const getAllBookings = async (req, res) => {
  if (req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Only ADMIN can view all bookings' });
  }

  const { status, vehicleType, startDate, endDate } = req.query;
  const filters = {};

  if (status) filters.status = status;
  if (vehicleType) filters.vehicleType = vehicleType;

  const parsedStart = startDate ? new Date(startDate) : null;
  const parsedEnd = endDate ? new Date(endDate) : null;

  if ((parsedStart && isNaN(parsedStart.getTime())) || (parsedEnd && isNaN(parsedEnd.getTime()))) {
    return res.status(400).json({ message: 'Invalid date filter format' });
  }

  if (parsedStart || parsedEnd) {
    filters.createdAt = {};
    if (parsedStart) filters.createdAt.gte = parsedStart;
    if (parsedEnd) filters.createdAt.lte = parsedEnd;
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: filters,
      include: {
        user: { select: { name: true, email: true} },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch all bookings', error: error.message });
  }
};


// ✅ Cancel a booking (Booker only, if status is pending)
const cancelBooking = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const userId = req.user.userId;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }

    await prisma.booking.delete({ where: { id: bookingId } });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

// ✅ Admin updates booking status (approve/reject)
const updateBookingStatus = async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { status } = req.body;

  if (req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Only ADMIN can update status' });
  }

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    res.json({ message: `Booking ${status}`, booking: updated });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

// ✅ Export controller functions
module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  updateBookingStatus,
};
