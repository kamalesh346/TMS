const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getVehicleTypes, getLocations } = require('../controllers/dropdownController');

// GET endpoints
router.get('/vehicle-types', getVehicleTypes);
router.get('/locations', getLocations);


module.exports = router;
