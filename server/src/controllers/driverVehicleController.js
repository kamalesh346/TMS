// no use since driver-vehicle mapping is removed

// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// // Assign driver to vehicle
// exports.assignDriverToVehicle = async (req, res) => {
//   const { driverId, vehicleId } = req.body;

//   const parsedDriverId = parseInt(driverId);
//   const parsedVehicleId = parseInt(vehicleId);

//   if (isNaN(parsedDriverId) || isNaN(parsedVehicleId)) {
//     return res.status(400).json({ message: 'Invalid driver or vehicle ID.' });
//   }

//   try {
//     // Check if the vehicle is already assigned
//     const existing = await prisma.driverVehicle.findFirst({
//       where: { vehicleId: parsedVehicleId },
//     });

//     if (existing) {
//       // Optional: allow reassignment by deleting existing
//       await prisma.driverVehicle.delete({
//         where: { id: existing.id },
//       });
//     }

//     const mapping = await prisma.driverVehicle.create({
//       data: {
//         driverId: parsedDriverId,
//         vehicleId: parsedVehicleId,
//       },
//     });

//     res.status(201).json({ message: 'Driver assigned successfully.', mapping });
//   } catch (err) {
//     console.error('Assign driver error:', err);
//     res.status(500).json({ message: 'Something went wrong.' });
//   }
// };

// // Get all current mappings
// exports.getDriverVehicleMappings = async (req, res) => {
//   try {
//     const mappings = await prisma.driverVehicle.findMany({
//       include: {
//         driver: true,
//         vehicle: {
//           include: { vehicleType: true },
//         },
//       },
//     });

//     res.json(mappings);
//   } catch (err) {
//     console.error('Fetch mappings error:', err);
//     res.status(500).json({ message: 'Failed to fetch mappings' });
//   }
// };
