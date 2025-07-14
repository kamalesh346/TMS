import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const assignTrip = async (req, res) => {
  const { bookingIds, mappingId } = req.body;

  try {
    // 1. Validate input
    if (!mappingId || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ error: 'Missing mappingId or bookingIds' });
    }

    // 2. Fetch mapping to get driverId and vehicleId
    const mapping = await prisma.driverVehicle.findUnique({
      where: { id: mappingId },
    });

    if (!mapping) {
      return res.status(404).json({ error: 'Driver-Vehicle mapping not found' });
    }

    const { driverId, vehicleId } = mapping;

    // 3. Fetch required times from selected bookings
    const bookings = await prisma.booking.findMany({
      where: {
        id: { in: bookingIds },
      },
      select: {
        id: true,
        requiredStartTime: true,
        requiredEndTime: true,
        status: true,
      },
    });

    if (bookings.length === 0) {
      return res.status(400).json({ error: 'No valid bookings found' });
    }

    const notApproved = bookings.filter(b => b.status !== 'approved');
    if (notApproved.length > 0) {
      return res.status(400).json({
        error: 'Some bookings are not in approved state',
        invalidIds: notApproved.map(b => b.id),
      });
    }

    const startTime = bookings.reduce(
      (min, b) => (b.requiredStartTime < min ? b.requiredStartTime : min),
      bookings[0].requiredStartTime
    );

    const endTime = bookings.reduce(
      (max, b) => (b.requiredEndTime > max ? b.requiredEndTime : max),
      bookings[0].requiredEndTime
    );

    // 4. Create the trip
    const trip = await prisma.trip.create({
      data: {
        driverId,
        vehicleId,
        startTime,
        endTime,
        bookings: {
          connect: bookingIds.map((id) => ({ id })),
        },
      },
      include: {
        bookings: true,
      },
    });

    // 5. Update booking statuses
    await prisma.booking.updateMany({
      where: {
        id: { in: bookingIds },
      },
      data: {
        status: 'assigned',
      },
    });

    res.status(201).json({ message: 'Trip assigned successfully', trip });
  } catch (error) {
    console.error('Error assigning trip:', error);
    res.status(500).json({ error: 'Failed to assign trip' });
  }
};
