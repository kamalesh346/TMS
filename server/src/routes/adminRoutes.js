const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const { assignTrip } = require('../controllers/tripController');

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
// UPDATED: POST - Assign trip using mappingId
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
        vehicle: true,
        bookings: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    res.json(trips);
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
});

module.exports = router;
