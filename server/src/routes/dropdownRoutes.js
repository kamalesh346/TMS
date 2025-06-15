const express = require('express');
const router = express.Router();
const { getVehicleTypes, getLocations } = require('../controllers/dropdownController');

router.get('/vehicle-types', getVehicleTypes);
router.get('/locations', getLocations);

module.exports = router;
