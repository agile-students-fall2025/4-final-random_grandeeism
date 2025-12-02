const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const daoFactory = require('../lib/daoFactory');
const { usersDao } = require('../lib/daoFactory');
const { authenticateToken } = require('../middleware/auth');
const { validateUserProfile, validatePasswordChange, handleValidationErrors } = require('../middleware/validation');

/**
 * GET /api/users/profile/:id
 * Get user profile by ID
 */
router.get('/profile/:id', authenticateToken, async (req, res) => {
  try {
    // Verify user can only access their own profile
    if (req.user.id !== req.params.id && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own profile'
      });
    }

    const user = await usersDao.getById(req.params.id);
    
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
      data: userWithoutPassword
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
 * PUT /api/users/profile/:id
 * Update user profile (mock - doesn't persist)
 */
router.put('/profile/:id', 
  authenticateToken,
  validateUserProfile,
  handleValidationErrors,
  async (req, res) => {
  try {
    // Verify user can only update their own profile
    if (req.user.id !== req.params.id && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only update your own profile'
      });
    }

    const user = await usersDao.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Fields that can be updated
    const { displayName, bio, avatar, preferences } = req.body;

    const updatedUser = await usersDao.update(req.params.id, {
      displayName: displayName !== undefined ? displayName : user.displayName,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar,
      preferences: preferences ? { ...user.preferences, ...preferences } : user.preferences,
      updatedAt: new Date()
    });

    // Don't send password in response
    const { password, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      data: userWithoutPassword,
      message: 'Profile updated successfully'
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
 * PUT /api/users/password/:id
 * Change user password (mock - doesn't persist)
 */
router.put('/password/:id',
  authenticateToken,
  validatePasswordChange,
  handleValidationErrors,
  async (req, res) => {
  try {
    // Verify user can only change their own password
    if (req.user.id !== req.params.id && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only change your own password'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    const user = await usersDao.getById(req.params.id, true); // includePassword = true for verification
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // In a real app, would hash and save new password
    // For mock, just return success
    res.json({
      success: true,
      message: 'Password changed successfully'
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
 * GET /api/users/stats/:id
 * Get user reading statistics
 */
router.get('/stats/:id', authenticateToken, async (req, res) => {
  try {
    // Verify user can only access their own stats
    if (req.user.id !== req.params.id && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own statistics'
      });
    }

    const user = await usersDao.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.stats
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
 * DELETE /api/users/:id
 * Delete user account (mock - doesn't persist)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verify user can only delete their own account
    if (req.user.id !== req.params.id && req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only delete your own account'
      });
    }

    const user = await usersDao.getById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await usersDao.delete(req.params.id);

    res.json({
      success: true,
      message: 'User account deleted successfully',
      data: { id: Number(req.params.id) || req.params.id }
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
