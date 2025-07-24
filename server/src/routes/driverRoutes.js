const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { createFuelLog } = require('../controllers/fuelLogController');
const authMiddleware = require('../middleware/authMiddleware');
const { login, getTrips, getVehicles, getMyVehicle } = require('../controllers/driverController');

router.route('/login')
    .post(login);

// GET - Get all trips for the logged-in driver
router.route('/trips') 
    .get(authMiddleware, getTrips);

// GET - Get the vehicle assigned to the logged-in driver
router.route('/myvehicle')
    .get(authMiddleware, getMyVehicle);

// GET - Get all vehicles
router.route('/vehicleslist')
    .get(authMiddleware, getVehicles);

// POST - Create fuel log (driver submits odometer + fuel)
router.post('/fuel-log', authMiddleware, createFuelLog);

module.exports = router;
