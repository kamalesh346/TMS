// src/controllers/tripController.js (or wherever your assignTrip lives)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const assignTrip = async (req, res) => {
  const { bookingIds, driverId, vehicleId } = req.body;

  try {
    // Validate input
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ error: 'bookingIds must be a non-empty array' });
    }
    if (!driverId || !vehicleId) {
      return res.status(400).json({ error: 'driverId and vehicleId are required' });
    }

    const parsedDriverId = Number(driverId);
    const parsedVehicleId = Number(vehicleId);
    if (isNaN(parsedDriverId) || isNaN(parsedVehicleId)) {
      return res.status(400).json({ error: 'driverId and vehicleId must be numeric' });
    }

    // Validate driver exists and is a driver
    const driver = await prisma.user.findUnique({ where: { id: parsedDriverId } });
    if (!driver || (driver.role && driver.role.toLowerCase() !== 'driver')) {
      return res.status(400).json({ error: 'Invalid driver selected' });
    }

    // Validate vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: parsedVehicleId } });
    if (!vehicle) {
      return res.status(400).json({ error: 'Invalid vehicle selected' });
    }

    // Fetch bookings and ensure they are approved
    const bookings = await prisma.booking.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, requiredStartTime: true, requiredEndTime: true, status: true },
    });

    if (bookings.length === 0) {
      return res.status(400).json({ error: 'No valid bookings found for given bookingIds' });
    }

    const notApproved = bookings.filter(b => b.status !== 'approved');
    if (notApproved.length > 0) {
      return res.status(400).json({
        error: 'Some bookings are not in approved state',
        invalidIds: notApproved.map(b => b.id),
      });
    }

    // Compute aggregated start & end time for the trip
    const startTime = bookings.reduce(
      (min, b) => (b.requiredStartTime < min ? b.requiredStartTime : min),
      bookings[0].requiredStartTime
    );
    const endTime = bookings.reduce(
      (max, b) => (b.requiredEndTime > max ? b.requiredEndTime : max),
      bookings[0].requiredEndTime
    );

    // Check overlapping trips for driver or vehicle
    const overlappingTrip = await prisma.trip.findFirst({
      where: {
        OR: [
          {
            driverId: parsedDriverId,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
          {
            vehicleId: parsedVehicleId,
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (overlappingTrip) {
      return res.status(400).json({
        error: 'Driver or Vehicle is already assigned to another trip in this time window',
        overlappingTripId: overlappingTrip.id,
      });
    }

    // Create trip and update bookings in one transaction
    const trip = await prisma.$transaction(async (tx) => {
      const createdTrip = await tx.trip.create({
        data: {
          driverId: parsedDriverId,
          vehicleId: parsedVehicleId,
          startTime,
          endTime,
          bookings: {
            connect: bookingIds.map((id) => ({ id })),
          },
        },
        include: { bookings: true },
      });

      await tx.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: { status: 'assigned', tripId: createdTrip.id },
      });

      return createdTrip;
    });

    res.status(201).json({ message: 'Trip assigned successfully', trip });
  } catch (error) {
    console.error('Error assigning trip:', error);
    res.status(500).json({ error: 'Failed to assign trip', details: error.message });
  }
};

module.exports = { assignTrip };