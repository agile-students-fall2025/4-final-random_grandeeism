const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { usersDao } = require('../lib/daoFactory');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');

// Get JWT secret from environment or use default for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /api/auth/register
 * Register a new user (mock - doesn't persist)
 */
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
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
    // Query both username and email to prevent duplicate accounts
    const existingByUsername = await usersDao.getByUsername(username);
    const existingByEmail = await usersDao.getByEmail(email);

    // Return 409 Conflict if user already exists
    if (existingByUsername || existingByEmail) {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Hash password using bcrypt with salt rounds of 10
    // This ensures passwords are never stored in plain text
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

    // Generate JWT token containing user ID and username
    // Token is signed with JWT_SECRET and expires based on JWT_EXPIRES_IN
    // Client will use this token for authenticated requests
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password from response before sending to client
    // Using destructuring to exclude password field
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
 * POST /api/auth/signup
 * Alias for /register endpoint for better UX consistency
 */
router.post('/signup', validateRegistration, handleValidationErrors, async (req, res) => {
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
    if (existingByUsername) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    const existingByEmail = await usersDao.getByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const userData = {
      username,
      email,
      password: hashedPassword,
      displayName: displayName || username
    };

    // Create user using DAO
    const user = await usersDao.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = user;
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
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
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
    // The 'username' field can contain either username or email
    // includePassword=true is required to get the hashed password for comparison
    let user = await usersDao.getByUsername(username, true); // includePassword = true
    if (!user) {
      // Try email if username lookup failed
      user = await usersDao.getByEmail(username, true); // includePassword = true
    }

    // Return generic "Invalid credentials" to prevent user enumeration attacks
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password using bcrypt.compare
    // This securely compares the plain text password with the hashed password
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
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    // User is already verified by authenticateToken middleware
    // The middleware decodes the JWT and attaches user data to req.user
    // Find user from decoded token (available in req.user.id)
    const user = await usersDao.getById(req.user.id);

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
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // User is already verified by authenticateToken middleware
    // Find user from decoded token to ensure user still exists
    const user = await usersDao.getById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new token with same user data but fresh expiration
    // This extends the session without requiring re-authentication
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
