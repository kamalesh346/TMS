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
            expiresIn: '30d',
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

    if (user.role !== 'driver') {
        return res.status(403).json({ error: 'Access denied. Only drivers can access their trips.' });
    }

    try {
        const bookings = await prisma.booking.findMany({
            where: {
                status: 'assigned',
                trip: {
                    driverId: user.id,
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
        });

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching driver trips:', error);
        res.status(500).json({ error: 'Failed to fetch driver trips' });
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
    getVehicles,
    getMyVehicle,
}