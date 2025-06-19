const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add new location
router.post('/locations', async (req, res) => {
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

// POST - Add new vehicle type
router.post('/vehicle-types', async (req, res) => {
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

// POST - Add new vehicle
router.post('/vehicles', async (req, res) => {
  const { number, vehicleTypeId } = req.body;

  if (!number || !vehicleTypeId) {
    return res.status(400).json({ message: "Vehicle number and vehicleTypeId are required" });
  }

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        number: number.trim(),
        vehicleTypeId: parseInt(vehicleTypeId),
      },
    });
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ message: "Failed to create vehicle" });
  }
});


module.exports = router;
