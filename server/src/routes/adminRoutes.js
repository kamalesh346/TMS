// modified to add fuelRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const { assignTrip } = require('../controllers/tripController');
const fuelLogController = require('../controllers/fuelLogController');

// GET /api/fuel
router.get('/fuel', authMiddleware, requireAdmin, fuelLogController.getFuelLogs);

// ==============================
// POST - Add new location
// ==============================
router.post('/locations', authMiddleware, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Location name is required' });
  }

  try {
    const location = await prisma.location.create({ data: { name: name.trim() } });
    res.status(201).json(location);
  } catch (err) {
    console.error('Error adding location:', err);
    res.status(500).json({ error: 'Failed to add location' });
  }
});

// ==============================
// POST - Add new vehicle type
// ==============================
router.post('/vehicle-types', authMiddleware, requireAdmin, async (req, res) => {
  const { type, length, breadth, height } = req.body;

  if (!type || !length || !breadth || !height) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newVehicleType = await prisma.vehicleType.create({
      data: {
        type: type.trim(),
        length: parseFloat(length),
        breadth: parseFloat(breadth),
        height: parseFloat(height),
      },
    });
    res.status(201).json(newVehicleType);
  } catch (error) {
    console.error("Error creating vehicle type:", error);
    res.status(500).json({ message: "Failed to create vehicle type" });
  }
});

// ==============================
// POST - Add new vehicle
// ==============================
router.post('/vehicles', authMiddleware, requireAdmin, async (req, res) => {
  const { number, vehicleTypeId } = req.body;

  if (!number || !vehicleTypeId) {
    return res.status(400).json({ message: "Vehicle number and vehicleTypeId are required" });
  }

  const parsedVehicleTypeId = parseInt(vehicleTypeId);
  if (isNaN(parsedVehicleTypeId)) {
    return res.status(400).json({ message: "Invalid vehicle type ID" });
  }

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        number: number.trim(),
        vehicleTypeId: parsedVehicleTypeId,
      },
    });
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ message: "Failed to create vehicle" });
  }
});

// ==============================
// POST - Assign trip using mappingId
// ==============================
router.post('/trips/assign', authMiddleware, requireAdmin, assignTrip);

// ==============================
// GET - Get assigned trips (with filters)
// ==============================
router.get('/trips', authMiddleware, requireAdmin, async (req, res) => {
  const { status, driverId } = req.query;

  try {
    const trips = await prisma.trip.findMany({
      where: {
        ...(status && { status }),
        ...(driverId && { driverId: parseInt(driverId) }),
      },
      include: {
        driver: true,
        vehicle: {
          include: {
            vehicleType: true,
          }
        },
        bookings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(trips);
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
});

// ==============================
// GET - Available Drivers
// ==============================
router.get('/available-drivers', authMiddleware, requireAdmin, async (req, res) => {
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return res.status(400).json({ message: "Start and end time are required" });
  }

  try {
    const availableDrivers = await prisma.driver.findMany({
      where: {
        trips: {
          none: {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
        },
      },
      include: { user: true },
    });

    res.json(availableDrivers);
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ message: "Failed to fetch available drivers" });
  }
});

// ==============================
// GET - Available Vehicles
// ==============================
router.get('/available-vehicles', authMiddleware, requireAdmin, async (req, res) => {
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return res.status(400).json({ message: "Start and end time are required" });
  }

  try {
    const availableVehicles = await prisma.vehicle.findMany({
      where: {
        trips: {
          none: {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
        },
      },
      include: { vehicleType: true },
    });

    res.json(availableVehicles);
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    res.status(500).json({ message: "Failed to fetch available vehicles" });
  }
});

// ==============================
// DELETE - Soft delete a user by ID
// ==============================
router.delete('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });

    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ==============================
// GET - Fetch all users (Admin only)
// ==============================
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        loginId: true,
        role: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ==============================
// GET - Fetch single booking details (Admin only)
// ==============================
router.get('/bookings/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    if (isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        vehicleType: {
          select: { type: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("❌ Error fetching booking details:", error);
    res.status(500).json({ message: "Failed to fetch booking details" });
  }
});

// GET all drivers
router.get('/drivers', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: 'driver' },
      select: { id: true, name: true, email: true },
    });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// GET all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: { vehicleType: true },
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

module.exports = router;
