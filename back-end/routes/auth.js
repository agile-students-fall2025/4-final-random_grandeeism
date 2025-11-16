const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { usersDao } = require('../lib/daoFactory');

// Get JWT secret from environment or use default for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/register
 * Register a new user (mock - doesn't persist)
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    // Check if user already exists using DAO
    const existingByUsername = await usersDao.getByUsername(username);
    const existingByEmail = await usersDao.getByEmail(email);

    if (existingByUsername || existingByEmail) {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user via DAO
    const newUser = await usersDao.create({
      username,
      email,
      password: hashedPassword,
      displayName: displayName || username,
      bio: '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      preferences: {
        theme: 'system',
        readingGoal: 20,
        emailNotifications: true,
        defaultView: 'inbox'
      },
      stats: {
        articlesRead: 0,
        totalReadingTime: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user by username or email - need password for verification
    let user = await usersDao.getByUsername(username, true); // includePassword = true
    if (!user) {
      user = await usersDao.getByEmail(username, true); // includePassword = true
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Update last login (mock - won't persist)
    user.lastLogin = new Date();

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify JWT token and return user data
 */
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user
    const user = await usersDao.getById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't send password in response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        valid: true
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify old token (ignore expiration)
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    // Find user
    const user = await usersDao.getById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: { token: newToken },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token deletion, server just confirms)
 */
router.post('/logout', (req, res) => {
  try {
    // In a real app with refresh tokens stored in DB, would invalidate them here
    // For mock implementation, just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

module.exports = router;
