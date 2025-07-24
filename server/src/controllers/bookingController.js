const { PrismaClient,BookingStatus  } = require('@prisma/client');
const prisma = new PrismaClient();
const sendMail = require('../utils/email');


const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

// ✅ Create a new booking (Booker only)
const createBooking = async (req, res) => {
  console.log("🔧 Incoming booking payload:", req.body);
  console.log("👤 User from token:", req.user);

  const {
    purpose, pickup, delivery, itemDesc, weight,
    vehicleTypeId, vehicleLength, vehicleBreadth, vehicleHeight,
    startTime, endTime,
  } = req.body;

  const userId = req.user.userId;
  const userRole = req.user.role;

  if (userRole.toLowerCase() !== 'booker') {
    return res.status(403).json({ message: 'Only BOOKER users can create bookings' });
  }

  // Check required fields
  if (
    !purpose || !pickup || !delivery || !itemDesc ||
    !startTime || !endTime || weight === undefined
  ) {
    console.log("⛔ Missing required fields (basic info)");
    return res.status(400).json({ message: 'Missing basic required fields' });
  }

  // Validate vehicleTypeId
  const parsedVehicleTypeId = parseInt(vehicleTypeId);
  if (!parsedVehicleTypeId || isNaN(parsedVehicleTypeId) || parsedVehicleTypeId <= 0) {
    console.log("⛔ Invalid vehicleTypeId:", vehicleTypeId);
    return res.status(400).json({ message: 'Invalid vehicle type selected' });
  }

  // Parse remaining fields
  const parsedWeight = parseFloat(weight);
  const parsedLength = parseFloat(vehicleLength);
  const parsedBreadth = parseFloat(vehicleBreadth);
  const parsedHeight = parseFloat(vehicleHeight);
  

  // const parsedStart = new Date(startTime);
  // const parsedEnd = new Date(endTime);
  const parsedStart = new Date(new Date(startTime).getTime() + (5.5 * 60 * 60 * 1000))
  const parsedEnd = new Date(new Date(endTime).getTime() + (5.5 * 60 * 60 * 1000))


  console.log("📥 Received times:", startTime, endTime);
  console.log("🕓 Parsed to Date objects:", parsedStart, parsedEnd);


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
        vehicleType: {
          connect: { id: parsedVehicleTypeId },
        },
        vehicleLength: parsedLength || 0,
        vehicleBreadth: parsedBreadth || 0,
        vehicleHeight: parsedHeight || 0,
        requiredStartTime: parsedStart,
        requiredEndTime: parsedEnd,
        user: {
          connect: { id: userId },
        },
      },
      include: {
        vehicleType: true,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.email) {
      try {
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
              <li><strong>Start Time:</strong> ${parsedStart.toLocaleString()}</li>
              <li><strong>End Time:</strong> ${parsedEnd.toLocaleString()}</li>
            </ul>
            <p>Status: <strong>${newBooking.status}</strong></p>
          `,
        });

        await sendMail({
          to: process.env.ADMIN_EMAIL,
          subject: 'New Booking Submitted',
          html: `
            <h2>New Booking Request</h2>
            <p>User <strong>${user.name}</strong> has submitted a booking.</p>
            <ul>
              <li><strong>Pickup:</strong> ${pickup}</li>
              <li><strong>Delivery:</strong> ${delivery}</li>
              <li><strong>Vehicle Type:</strong> ${newBooking.vehicleType?.type || 'Unknown'}</li>
              <li><strong>Start:</strong> ${parsedStart.toLocaleString()}</li>
              <li><strong>End:</strong> ${parsedEnd.toLocaleString()}</li>
            </ul>
          `,
        });
      } catch (emailErr) {
        console.warn("📧 Email sending failed:", emailErr.message);
      }
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
      include: {
        vehicleType: true,
      },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};


// ✅ Admin view: get all bookings with optional filters
const getAllBookings = async (req, res) => {
  if (req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Only ADMIN can view all bookings' });
  }

  const { status, vehicleType, vehicleTypeId, startDate, endDate } = req.query;
  const filters = {};

  if (status) {
  const validStatus = BookingStatus[status.toLowerCase()];
  if (!validStatus) {
    return res.status(400).json({ message: 'Invalid status filter value' });
  }
  filters.status = validStatus;
  }
  if (vehicleType) {
    filters.vehicleType = {
      type: vehicleType,
    };
  }
  if (vehicleTypeId) {
    filters.vehicleTypeId = parseInt(vehicleTypeId);
  }

  const parsedStart = startDate ? new Date(new Date(startTime).getTime() + (5.5 * 60 * 60 * 1000)) : null;
  const parsedEnd = endDate ? new Date(new Date(endDate).getTime() + (5.5 * 60 * 60 * 1000)) : null;

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
        user: { select: { name: true, email: true } },
        vehicleType: true,
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

  if (isNaN(bookingId)) {
    return res.status(400).json({ message: 'Invalid booking ID' });
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

    if (!booking || booking.userId !== userId) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });

    res.json({ message: 'Booking cancelled successfully', booking: cancelledBooking });
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
