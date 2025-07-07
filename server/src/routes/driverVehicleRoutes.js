const express = require('express');
const router = express.Router();
const {
  assignDriverToVehicle,
  getDriverVehicleMappings
} = require('../controllers/driverVehicleController');

const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

// Assign driver to vehicle (ADMIN only)
router.post('/assign', authMiddleware, requireAdmin, assignDriverToVehicle);

// Get all current driver-vehicle mappings (ADMIN only)
router.get('/mappings', authMiddleware, requireAdmin, getDriverVehicleMappings);

module.exports = router;
