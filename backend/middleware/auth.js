const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to check if user is authenticated
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from cookie or authorization header
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? 
                  req.headers.authorization.split(' ')[1] : null);
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please login.' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authenticated. Invalid token.' });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

// Middleware to check if user is moderator or admin
exports.isModeratorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'moderator' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Moderator privileges required.' });
  }
};

// Generate JWT token
exports.generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};
