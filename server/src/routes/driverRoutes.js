const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { createFuelLog } = require('../controllers/fuelLogController');
const authMiddleware = require('../middleware/authMiddleware');

// GET - Get all trips for the logged-in driver
router.get('/trips', authMiddleware, async (req, res) => {
  const user = req.user;

  if (user.role !== 'driver') {
    return res.status(403).json({ error: 'Access denied. Only drivers can access their trips.' });
  }

  try {
    const trips = await prisma.trip.findMany({
      where: { driverId: user.id },
      include: {
        vehicle: true,
        bookings: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    res.status(200).json(trips);
  } catch (error) {
    console.error('Error fetching driver trips:', error);
    res.status(500).json({ error: 'Failed to fetch driver trips' });
  }
});

// POST - Create fuel log (driver submits odometer + fuel)
router.post('/fuel-log', authMiddleware, createFuelLog);

module.exports = router;
