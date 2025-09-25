const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const dropdownRoutes = require('./routes/dropdownRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const fuelRoutes = require('./routes/fuelRoutes');
// const driverVehicleRoutes = require('./routes/driverVehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('🚚 Transport Management System API is running...');
});

// Route mounting
// app.use('/api/fuel', fuelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dropdowns', dropdownRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/driver-vehicle', driverVehicleRoutes);
app.use('/api/driver',driverRoutes);
// Optional 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Server start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
