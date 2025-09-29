const jwt = require('jsonwebtoken');
const { query } = require('../config/mysql-database');

// Protect routes
const protect = async (req, res, next) => {
  // Development bypass - remove this in production
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Create a mock admin user for development
    req.user = {
      id: 'dev-admin-user',
      name: 'Development Admin',
      email: 'admin@dev.com',
      role: 'admin',
      isActive: true
    };
    return next();
  }

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const [user] = await query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    req.user = user;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account has been deactivated'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
