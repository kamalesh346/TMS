// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// // POST /api/driver/fuel-log
// const createFuelLog = async (req, res) => {
//   const user = req.user;

//   const { vehicleId, odometer, fuelQuantity } = req.body.data;

//   if (!vehicleId || !odometer || !fuelQuantity) {
//     return res.status(400).json({ message: "All fields are required." });
//   }

//   try {
//     const log = await prisma.fuelLog.create({
//       data: {
//         driverId: user.userId,
//         vehicleId: parseInt(vehicleId),
//         odometer: parseFloat(odometer),
//         fuelQuantity: parseFloat(fuelQuantity),
//         createdBy: user.userId, 
//       },
//     });

//     return res.status(201).json(log);
//   } catch (error) {
//     console.error("Error creating fuel log:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };

// // CommonJS export
// module.exports = {
//   createFuelLog,
// };
// controllers/fuelController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all fuel logs
exports.getFuelLogs = async (req, res) => {
  try {
    const fuelLogs = await prisma.fuelLog.findMany({
      include: {
        driver: true,
        vehicle: true,
        user: true,
      },
      orderBy: { filledAt: 'desc' },
    });
    res.json(fuelLogs);
  } catch (err) {
    console.error("Failed to fetch fuel logs", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST a new fuel log (optional for later)
exports.addFuelLog = async (req, res) => {
  try {
    const { driverId, vehicleId, odometer, fuelQuantity, createdBy } = req.body;

    const newLog = await prisma.fuelLog.create({
      data: {
        driverId,
        vehicleId,
        odometer,
        fuelQuantity,
        createdBy,
      },
    });

    res.json(newLog);
  } catch (err) {
    console.error("Failed to add fuel log", err);
    res.status(500).json({ message: "Server error" });
  }
};
