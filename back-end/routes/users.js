const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { mockUsers } = require('../data/mockUsers');

/**
 * GET /api/users/profile/:id
 * Get user profile by ID
 */
router.get('/profile/:id', (req, res) => {
  try {
    const user = mockUsers.find(u => u.id === req.params.id);
    
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
router.put('/profile/:id', (req, res) => {
  try {
    const user = mockUsers.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Fields that can be updated
    const { displayName, bio, avatar, preferences } = req.body;

    const updatedUser = {
      ...user,
      displayName: displayName !== undefined ? displayName : user.displayName,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar,
      preferences: preferences ? { ...user.preferences, ...preferences } : user.preferences,
      updatedAt: new Date()
    };

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
router.put('/password/:id', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    const user = mockUsers.find(u => u.id === req.params.id);
    
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
router.get('/stats/:id', (req, res) => {
  try {
    const user = mockUsers.find(u => u.id === req.params.id);
    
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
router.delete('/:id', (req, res) => {
  try {
    const user = mockUsers.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User account deleted successfully',
      data: { id: req.params.id }
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
