const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); // ✅ LOG STEP 1
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token); // ✅ LOG STEP 2

  try {
    // Log the token to see if it's correctly extracted
    console.log('Authorization token:', token);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // ✅ LOG STEP 3

    // Normalize role to lowercase to keep consistent
    req.user = {
      ...decoded,
      role: decoded.role ? decoded.role.toLowerCase() : undefined,
    };
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message); // Log the error for debugging
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
