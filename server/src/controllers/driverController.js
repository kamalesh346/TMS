const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { subDays } = require('date-fns');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const login = async (req, res) => {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const user = await prisma.user.findUnique({ where: { loginId } });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '99y',
        });

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        res.json({ token: token, user_id: user.id, username: user.name, role: user.role, exp: decoded.exp });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: `Server error: \n${error.message}` });
    }
};

const getTrips = async (req, res) => {
    const user = req.user;
    const status = req.query.status;

    if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Access denied. Only drivers can access their trips.' });
    }

    if (!['active', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid or missing status. Must be "active" or "completed".' });
    }

    try {
        let bookings;
        if (status === 'active') {
            bookings = await prisma.booking.findMany({
                where: {
                    status: {
                        in: ['assigned', 'ongoing']
                    },
                    trip: {
                        driverId: user.userId,
                        startTime: {
                            gte: subDays(new Date(), 1),
                        },
                        status: {
                            in: ['ongoing', 'scheduled'],
                        },
                    },
                },
                include: {
                    trip: true, // optional: include trip info if needed
                },
                orderBy: {
                    requiredStartTime: 'asc'
                }
            });
        } else if (status === 'completed') {
            bookings = await prisma.booking.findMany({
                where: {
                    status: {
                        in: ['completed']
                    },
                    trip: {
                        driverId: user.userId,
                    },
                },
                include: {
                    trip: true, // optional: include trip info if needed
                },
                orderBy: {
                    completedAt: 'desc'
                }
            });
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching driver trips:', error);
        res.status(500).json({ error: 'Failed to fetch driver trips' });
    }
};

const getBooking = async (req, res) => {
    const user = req.user;
    const bookingId = parseInt(req.params.bookingId);

    if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Access denied. Only drivers can access their trips.' });
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                trip: true
            }
        });

        res.status(200).json(booking);
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
};

const updateBookingStatus = async (req, res) => {
    const user = req.user;
    const { bookingId } = req.params;
    const updateData = req.body.data;

    // Only drivers can update trip status
    if (user.role !== 'driver') {
        return res.status(403).json({
            error: 'Access denied. Only drivers can update trip status.'
        });
    }

    try {
        // First, verify that this booking belongs to the current driver
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) },
            include: {
                trip: true
            }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (!booking.trip || booking.trip.driverId !== user.userId) {
            return res.status(403).json({
                error: 'Access denied. This trip is not assigned to you.'
            });
        }

        // Validate the booking is in a valid state for updates
        if (!['assigned', 'ongoing'].includes(booking.status)) {
            return res.status(400).json({
                error: 'Trip cannot be updated in current status'
            });
        }

        // Prepare update object with current timestamp
        const now = new Date();
        const bookingUpdateObject = {};
        const tripUpdateObject = {};

        // Map the phase updates to database columns
        if (updateData.actualStartTime) {
            bookingUpdateObject.startedAt = updateData.actualStartTime === 'null' ? null :  new Date(updateData.actualStartTime);
            bookingUpdateObject.status = 'ongoing';

            // Update Trip table - only status
            tripUpdateObject.status = 'ongoing';
        }

        if (updateData.startedAt) {
            bookingUpdateObject.startedAt = updateData.startedAt === 'null' ? null : new Date(updateData.startedAt);
            bookingUpdateObject.status = 'ongoing';

            // Update Trip table - only status
            tripUpdateObject.status = 'ongoing';
        }

        if (updateData.loadingStartTime) {
            bookingUpdateObject.loadingStartTime = updateData.loadingStartTime === 'null' ? null : new Date(updateData.loadingStartTime);
        }

        if (updateData.loadingEndTime) {
            bookingUpdateObject.loadingEndTime = updateData.loadingEndTime === 'null' ? null : new Date(updateData.loadingEndTime);
        }

        if (updateData.unloadingStartTime) {
            bookingUpdateObject.unloadingStartTime = updateData.unloadingStartTime === 'null' ? null : new Date(updateData.unloadingStartTime);
        }

        if (updateData.unloadingEndTime) {
            bookingUpdateObject.unloadingEndTime = updateData.unloadingEndTime === 'null' ? null : new Date(updateData.unloadingEndTime);
        }

        if (updateData.actualEndTime) {
            bookingUpdateObject.completedAt = updateData.actualEndTime === 'null' ? null : new Date(updateData.actualEndTime);
            bookingUpdateObject.status = 'completed';

            // Update Trip table - only status
            tripUpdateObject.status = 'completed';
        }

        if (updateData.completedAt) {
            bookingUpdateObject.completedAt = updateData.completedAt === 'null' ? null : new Date(updateData.completedAt);
            bookingUpdateObject.status = 'completed';
        }

        // Validate status transitions for booking
        const validStatusTransitions = {
            'assigned': ['ongoing'],
            'ongoing': ['completed']
        };

        if (bookingUpdateObject.status && bookingUpdateObject.status !== booking.status) {
            const allowedStatuses = validStatusTransitions[booking.status] || [];
            if (!allowedStatuses.includes(bookingUpdateObject.status)) {
                return res.status(400).json({
                    error: `Cannot change status from ${booking.status} to ${bookingUpdateObject.status}`
                });
            }
        }

        // Validate timestamp logic
        if (bookingUpdateObject.loadingEndTime && !bookingUpdateObject.loadingStartTime && !booking.loadingStartTime) {
            return res.status(400).json({
                error: 'Loading must be started before it can be completed'
            });
        }

        if (bookingUpdateObject.unloadingStartTime && !bookingUpdateObject.loadingEndTime && !booking.loadingEndTime) {
            return res.status(400).json({
                error: 'Loading must be completed before unloading can start'
            });
        }

        if (bookingUpdateObject.unloadingEndTime && !bookingUpdateObject.unloadingStartTime && !booking.unloadingStartTime) {
            return res.status(400).json({
                error: 'Unloading must be started before it can be completed'
            });
        }

        if (bookingUpdateObject.completedAt && !bookingUpdateObject.unloadingEndTime && !booking.unloadingEndTime) {
            return res.status(400).json({
                error: 'Unloading must be completed before trip can be marked as completed'
            });
        }

        // Use transaction to update both tables atomically
        const result = await prisma.$transaction(async (prisma) => {
            // Update the booking
            const updatedBooking = await prisma.booking.update({
                where: { id: parseInt(bookingId) },
                data: bookingUpdateObject,
                include: {
                    trip: true
                }
            });

            const incompleteBookings = await prisma.booking.findMany({
                where: {
                    status: {
                        in: ['assigned', 'ongoing']
                    },
                    tripId: booking.tripId,
                }
            });

            // If there are no incomplete bookings, mark the trip as completed
            if(incompleteBookings.length === 0) {
                tripUpdateObject.status = 'completed';
            }

            // Update the trip table if there are trip-related updates
            let updatedTrip = null;
            if (Object.keys(tripUpdateObject).length > 0) {
                updatedTrip = await prisma.trip.update({
                    where: { id: booking.trip.id },
                    data: tripUpdateObject
                });
            }

            return { updatedBooking, updatedTrip };
        });

        res.status(200).json({
            success: true,
            message: 'Trip status updated successfully',
            booking: result.updatedBooking,
            trip: result.updatedTrip
        });

    } catch (error) {
        console.error('Error updating trip status:', error);

        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return res.status(400).json({
                error: 'Duplicate entry. This update conflicts with existing data.'
            });
        }

        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Booking not found or already updated.'
            });
        }

        res.status(500).json({
            error: 'Failed to update trip status. Please try again.'
        });
    }
};

const getMyVehicle = async (req, res) => {
    const user = req.user;
    if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Access denied. Only drivers can access their vehicle.' });
    }
    try {
        const vehicle = await prisma.vehicle.findFirst({
            where: {
                driverId: user.id,
            },
        });

        if (!vehicle) {
            return res.status(400).json({ error: 'Vehicle not found for this driver' });
        }

        res.status(200).json(vehicle);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
}

const getDriverDetails = async (req, res) => {
    const user = req.user;

    if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Access denied. Only drivers can access their details.' });
    }

    try {
        const driver = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                name: true,
                loginId: true,
                vehicle: {
                    select: {
                        number: true,
                        vehicleType: {
                            select: {
                                type: true
                            }
                        }
                    }
                }
            }
        });

        if (!driver || !driver.vehicle) {
            return res.status(404).json({ error: 'Driver vehicle details not found' });
        }

        const result = {
            name: driver.name,
            driverId: driver.loginId,
            vehicleNumber: driver.vehicle.number,
            vehicleType: driver.vehicle.vehicleType.type
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching driver details:', error);
        res.status(500).json({ error: 'Failed to fetch driver details' });
    }
};

const getVehicles = async (req, res) => {
    const user = req.user;
    if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Access denied. Only drivers can access vehicle list.' });
    }
    try {
        const vehicles = await prisma.vehicle.findMany();
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
}

module.exports = {
    login,
    getTrips,
    getBooking,
    updateBookingStatus,
    getVehicles,
    getMyVehicle,
    getDriverDetails
}