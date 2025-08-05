const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { createFuelLog } = require('../controllers/fuelLogController');
const authMiddleware = require('../middleware/authMiddleware');
const { login, getTrips, updateBookingStatus, getVehicles, getMyVehicle, getBooking, getDriverDetails } = require('../controllers/driverController');

router.route('/login')
    .post(login);

router.use(authMiddleware);

// GET - Get all trips for the logged-in driver
router.route('/trips') 
    .get(getTrips);

router.route('/trips/:bookingId')
    .get(getBooking)
    .put(updateBookingStatus)

// GET - Get the vehicle assigned to the logged-in driver
router.route('/myvehicle')
    .get(getMyVehicle);

router.route('/driver_details')
    .get(getDriverDetails);

// GET - Get all vehicles
router.route('/vehicleslist')
    .get(getVehicles);

// POST - Create fuel log (driver submits odometer + fuel)
router.post('/fuel-log', createFuelLog);

module.exports = router;
