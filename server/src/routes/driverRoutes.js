const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fuelLogController = require('../controllers/fuelLogController');
const authMiddleware = require('../middleware/authMiddleware');
const { login, getTrips, updateBookingStatus, getVehicles, getBooking } = require('../controllers/driverController');

router.route('/login').post(login);

router.use(authMiddleware);

// GET - Get all trips for the logged-in driver
router.route('/trips').get(getTrips);

router.route('/trips/:bookingId')
    .get(getBooking)
    .put(updateBookingStatus);

// GET - Get all vehicles
router.route('/vehicleslist').get(getVehicles);

// POST - Create fuel log
router.post('/fuel-log', fuelLogController.addFuelLog);

module.exports = router;
