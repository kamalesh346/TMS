const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/driver/fuel-log
const createFuelLog = async (req, res) => {
  const user = req.user;

  const { vehicleId, odometer, fuelQuantity } = req.body.data;

  if (!vehicleId || !odometer || !fuelQuantity) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const log = await prisma.fuelLog.create({
      data: {
        driverId: user.userId,
        vehicleId: parseInt(vehicleId),
        odometer: parseFloat(odometer),
        fuelQuantity: parseFloat(fuelQuantity),
        createdBy: user.userId, 
      },
    });

    return res.status(201).json(log);
  } catch (error) {
    console.error("Error creating fuel log:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// CommonJS export
module.exports = {
  createFuelLog,
};
