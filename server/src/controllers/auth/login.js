const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const login = async (req, res) => {
  const { email, password } = req.body; // Ensure email and password are passed in the body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: {email},
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: `Server error: \n${error.message}` });
  }
};

module.exports = { login };