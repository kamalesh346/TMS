//  modified getVehicles to include vehile type name //
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get vehicle types
const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await prisma.vehicleType.findMany();
    res.json(vehicleTypes);
  } catch (err) {
    console.error("Failed to fetch vehicle types:", err);
    res.status(500).json({ message: "Failed to fetch vehicle types" });
  }
};

// Get locations
const getLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (err) {
    console.error("Failed to fetch locations:", err);
    res.status(500).json({ message: "Failed to fetch locations" });
  }
};

// Get drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await prisma.user.findMany({
      where: { 
        role: "driver",
        isDeleted: false
      },
      select: { id: true, name: true, email: true },
    });
    res.json(drivers);
  } catch (err) {
    console.error("Failed to fetch drivers:", err);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
};

// Get vehicles
// const getVehicles = async (req, res) => {
//   try {
//     const vehicles = await prisma.vehicle.findMany({
//       select: { id: true, number: true },
//     });
//     res.json(vehicles);
//   } catch (err) {
//     console.error("Failed to fetch vehicles:", err);
//     res.status(500).json({ error: "Failed to fetch vehicles" });
//   }
// };
const getVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        number: true,
        vehicleType: {
          select: { type: true }  // <-- include type name
        }
      }
    });

    // Map to match frontend expected format
    const formattedVehicles = vehicles.map(v => ({
      id: v.id,
      number: v.number,
      type: v.vehicleType?.type || 'N/A'
    }));

    res.json(formattedVehicles);
  } catch (err) {
    console.error("Failed to fetch vehicles:", err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
};


// Assign driver to vehicle
// NOTE: This function requires a DriverVehicle model in the schema
// Currently commented out as the model doesn't exist in schema.prisma
/*
const assignDriverToVehicle = async (req, res) => {
  const { driverId, vehicleId } = req.body;

  const parsedDriverId = parseInt(driverId);
  const parsedVehicleId = parseInt(vehicleId);

  if (isNaN(parsedDriverId) || isNaN(parsedVehicleId)) {
    return res.status(400).json({ message: 'Invalid driver or vehicle ID.' });
  }

  try {
    // Check if vehicle is already mapped
    const existing = await prisma.driverVehicle.findFirst({
      where: { vehicleId: parsedVehicleId },
    });

    if (existing) {
      await prisma.driverVehicle.delete({ where: { id: existing.id } });
    }

    const mapping = await prisma.driverVehicle.create({
      data: {
        driverId: parsedDriverId,
        vehicleId: parsedVehicleId,
      },
    });

    res.status(201).json({ message: 'Driver assigned successfully.', mapping });
  } catch (err) {
    console.error('Assign driver error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};
*/

// Temporary placeholder - returns error since DriverVehicle model doesn't exist
const assignDriverToVehicle = async (req, res) => {
  res.status(501).json({ 
    message: 'Driver-Vehicle assignment not implemented. DriverVehicle model missing from schema.' 
  });
};

// Get all current driver-vehicle mappings
// NOTE: This function requires a DriverVehicle model in the schema
// Currently commented out as the model doesn't exist in schema.prisma
/*
const getDriverVehicleMappings = async (req, res) => {
  try {
    const mappings = await prisma.driverVehicle.findMany({
      include: {
        driver: true,
        vehicle: {
          include: { vehicleType: true }
        }
      },
    });

    res.json(mappings);
  } catch (err) {
    console.error('Fetch mappings error:', err);
    res.status(500).json({ message: 'Failed to fetch mappings' });
  }
};
*/

// Temporary placeholder - returns error since DriverVehicle model doesn't exist
const getDriverVehicleMappings = async (req, res) => {
  res.status(501).json({ 
    message: 'Driver-Vehicle mappings not implemented. DriverVehicle model missing from schema.' 
  });
};

// ✅ Export all functions properly
module.exports = {
  getVehicleTypes,
  getLocations,
  getDrivers,
  getVehicles,
  assignDriverToVehicle,
  getDriverVehicleMappings,
};
