const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate JWT tokens
 * Expects Authorization header: "Bearer <token>"
 * Attaches decoded user data to req.user if valid
 * Returns 401 if token missing, 403 if invalid/expired
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

/**
 * Optional authentication middleware
 * Attaches user data to req.user if valid token provided
 * Continues execution even if no token or invalid token
 * Useful for endpoints that work for both authenticated and anonymous users
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

module.exports = { authenticateToken, optionalAuth };
