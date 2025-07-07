const express = require('express');
const router = express.Router();
const {
  getVehicleTypes,
  getLocations,
  getDrivers,
  getVehicles
} = require('../controllers/dropdownController');

const authMiddleware = require('../middleware/authMiddleware');

const requireAdmin = require('../middleware/requireAdmin'); 

// GET endpoints (accessible to authenticated users only)
router.get('/vehicle-types', authMiddleware, getVehicleTypes);
router.get('/locations', authMiddleware, getLocations);
router.get('/drivers', authMiddleware, requireAdmin, getDrivers);
router.get('/vehicles', authMiddleware, requireAdmin, getVehicles);

module.exports = router;
