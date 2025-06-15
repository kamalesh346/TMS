const prisma = require("../prisma/client");

const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await prisma.vehicleType.findMany();
    res.json(vehicleTypes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch vehicle types" });
  }
};

const getLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch locations" });
  }
};

module.exports = {
  getVehicleTypes,
  getLocations,
};
