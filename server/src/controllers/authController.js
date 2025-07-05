const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const allowedRoles = ['booker', 'driver', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { register };
