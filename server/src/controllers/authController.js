const bcrypt = require('bcrypt');
const prisma = require('../prisma/client');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a JWT token valid for 5 minutes
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '5m' });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"TMS Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p><b>Note:</b> This link will expire in 5 minutes.</p>
      `,
    });

    return res.json({ message: 'Password reset link sent to your email.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Error sending password reset link.' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    return res.status(400).json({ message: 'Invalid token or error resetting password.' });
  }
};

// Change Password (Logged-in users)
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new passwords are required' });
    }

    const userId = req.user.userId; // from authMiddleware

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    // Update with new hashed password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Server error while changing password' });
  }
};


module.exports = {
  register,
  forgotPassword,
  resetPassword,
  changePassword
};