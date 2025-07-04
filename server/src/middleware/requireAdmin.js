// middleware/requireAdmin.js
module.exports = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  
    if (req.user.role === 'admin') {
      return next();
    }
  
    return res.status(403).json({ message: 'Admin access required' });
  };
  