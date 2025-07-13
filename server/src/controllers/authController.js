// const bcrypt = require('bcrypt');
// const prisma = require('../prisma/client');

// const register = async (req, res) => {
//   try {
//     const { name, loginId, password, role } = req.body;

//     if (!name || !loginId || !password || !role) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     const allowedRoles = ['booker', 'driver', 'admin'];
//     if (!allowedRoles.includes(role)) {
//       return res.status(400).json({ message: 'Invalid role specified' });
//     }

//     const existingUser = await prisma.user.findUnique({ where: { loginId } });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await prisma.user.create({
//       data: {
//         name,
//         loginId,
//         password: hashedPassword,
//         role
//       }
//     });

//     const { password: _, ...userWithoutPassword } = newUser;
//     res.status(201).json({ message: 'User registered successfully', user: userWithoutPassword });

//   } catch (error) {
//     console.error('Register error:', error);
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// };

// module.exports = { register };
const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only admins can register users
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can register users' });
    }

    const { name, loginId, password, role } = req.body;

    // Basic validations
    if (!name || !loginId || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const allowedRoles = ['admin', 'booker', 'driver'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check for duplicate loginId
    const existingUser = await prisma.user.findUnique({ where: { loginId } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this login ID' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-set email for admin/booker from loginId
    const data = {
      name,
      loginId,
      password: hashedPassword,
      role,
      ...(role !== 'driver' && loginId.includes('@') ? { email: loginId } : {})
    };

    const newUser = await prisma.user.create({ data });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { register };
