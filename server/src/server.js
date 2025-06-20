const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Correct path for the routes file
const bookingRoutes = require('./routes/bookingRoutes');
const dropdownRoutes = require('./routes/dropdownRoutes');
const adminRoutes = require('./routes/adminRoutes');


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // This should match the route in the request

// Use the booking routes
app.use('/api/bookings', bookingRoutes);

// for GETSs
app.use('/api/dropdowns', dropdownRoutes);

// for POSTS
app.use('/api/admin', adminRoutes);

// Server setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});