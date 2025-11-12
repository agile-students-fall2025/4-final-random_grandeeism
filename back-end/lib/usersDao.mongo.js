/**
 * Users Mongoose DAO - MongoDB-backed implementation
 * 
 * Purpose: Provides a MongoDB implementation of the users data access layer
 * using Mongoose ODM. This DAO provides persistent storage with full CRUD
 * operations and complex query capabilities.
 */

const { User } = require('./models');

/**
 * Helper to convert MongoDB ObjectId to string format for consistency with mock DAO
 */
const transformToStringId = (doc) => {
  if (!doc) return null;
  const obj = doc.toJSON ? doc.toJSON() : doc;
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  }
  return obj;
};

const usersDao = {
  /**
   * Get all users with optional filtering
   * @param {Object} filters - Query filters
   * @param {boolean} filters.isActive - Filter by active status
   * @param {string} filters.search - Search in username and email
   * @returns {Promise<Array>} Array of users (passwords excluded)
   */
  async getAll(filters = {}) {
    let query = {};

    // Active status filter
    if (typeof filters.isActive === 'boolean') {
      query.isActive = filters.isActive;
    }

    // Search filter
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { username: regex },
        { email: regex }
      ];
    }

    const users = await User.find(query).select('-password').sort({ 'stats.lastLogin': -1 });
    return users.map(transformToStringId);
  },

  /**
   * Get single user by ID
   * @param {string} id - User ID
   * @param {boolean} includePassword - Include password in response (for auth)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getById(id, includePassword = false) {
    let query = User.findById(id);
    if (!includePassword) {
      query = query.select('-password');
    }

    const user = await query.exec();
    return transformToStringId(user);
  },

  /**
   * Get single user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Include password in response (for auth)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getByEmail(email, includePassword = false) {
    let query = User.findByEmail(email.toLowerCase());
    if (!includePassword) {
      query = query.select('-password');
    }

    const user = await query.exec();
    return transformToStringId(user);
  },

  /**
   * Get single user by username
   * @param {string} username - Username
   * @param {boolean} includePassword - Include password in response (for auth)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getByUsername(username, includePassword = false) {
    let query = User.findByUsername(username.toLowerCase());
    if (!includePassword) {
      query = query.select('-password');
    }

    const user = await query.exec();
    return transformToStringId(user);
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password)
   */
  async create(userData) {
    const newUser = new User({
      username: userData.username || userData.email.split('@')[0],
      email: userData.email.toLowerCase(),
      password: userData.password, // Will be hashed by pre-save middleware
      isActive: userData.isActive !== false,
      profile: userData.profile || {},
      stats: userData.stats || {},
      security: userData.security || {},
      subscription: userData.subscription || {},
      ...userData
    });

    const savedUser = await newUser.save();
    return transformToStringId(savedUser);
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user (without password) or null if not found
   */
  async update(id, updateData) {
    // Don't allow updating _id
    const { _id, ...safeUpdateData } = updateData;

    // Normalize email and username if they're being updated
    if (safeUpdateData.email) {
      safeUpdateData.email = safeUpdateData.email.toLowerCase();
    }
    if (safeUpdateData.username) {
      safeUpdateData.username = safeUpdateData.username.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      id,
      safeUpdateData,
      { new: true, runValidators: true }
    ).select('-password');

    return transformToStringId(user);
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await User.deleteOne({ _id: id });
    return result.deletedCount > 0;
  },

  /**
   * Update user's password
   * @param {string} id - User ID
   * @param {string} newPassword - New password (will be hashed)
   * @returns {Promise<boolean>} True if updated, false if user not found
   */
  async updatePassword(id, newPassword) {
    const user = await User.findById(id);
    if (!user) return false;

    user.password = newPassword; // Will be hashed by pre-save middleware
    await user.save();
    return true;
  },

  /**
   * Update user's last login timestamp
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if updated, false if user not found
   */
  async updateLastLogin(id) {
    const user = await User.findById(id);
    if (!user) return false;

    await user.updateLastLogin();
    return true;
  },

  /**
   * Update user's statistics
   * @param {string} id - User ID
   * @param {Object} stats - Statistics to update
   * @returns {Promise<Object|null>} Updated user (without password) or null if not found
   */
  async updateStats(id, stats) {
    const user = await User.findById(id);
    if (!user) return null;

    // Merge stats with existing stats
    user.stats = {
      ...user.stats,
      ...stats
    };

    await user.save();
    return transformToStringId(user);
  },

  /**
   * Increment failed login attempts
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if updated, false if user not found
   */
  async incrementFailedLogin(id) {
    const user = await User.findById(id);
    if (!user) return false;

    await user.incrementFailedLogin();
    return true;
  },

  /**
   * Update reading statistics
   * @param {string} id - User ID
   * @param {number} readingTimeMinutes - Reading time to add
   * @returns {Promise<boolean>} True if updated, false if user not found
   */
  async updateReadingStats(id, readingTimeMinutes) {
    const user = await User.findById(id);
    if (!user) return false;

    await user.updateReadingStats(readingTimeMinutes);
    return true;
  },

  /**
   * Sync user statistics with actual data counts
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} Updated user or null if not found
   */
  async syncStats(id) {
    const user = await User.findById(id);
    if (!user) return null;

    await user.updateStats();
    return transformToStringId(user);
  },

  /**
   * Get active users only
   * @returns {Promise<Array>} Active users (without passwords)
   */
  async getActive() {
    const users = await User.findActive();
    return users.map(transformToStringId);
  },

  /**
   * Get inactive users (haven't logged in for specified days)
   * @param {number} daysSince - Days since last login (default: 30)
   * @returns {Promise<Array>} Inactive users (without passwords)
   */
  async getInactive(daysSince = 30) {
    const users = await User.findInactive(daysSince);
    return users.map(transformToStringId);
  },

  /**
   * Get users by subscription plan
   * @param {string} plan - Subscription plan (free, premium, enterprise)
   * @returns {Promise<Array>} Users with specified plan (without passwords)
   */
  async getBySubscription(plan) {
    const users = await User.findBySubscription(plan);
    return users.map(transformToStringId);
  },

  /**
   * Search users by username or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching users (without passwords)
   */
  async search(query) {
    if (!query) return [];

    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { username: regex },
        { email: regex },
        { 'profile.firstName': regex },
        { 'profile.lastName': regex }
      ]
    }).select('-password').sort({ username: 1 });

    return users.map(transformToStringId);
  },

  /**
   * Verify user password
   * @param {string} id - User ID
   * @param {string} candidatePassword - Password to verify
   * @returns {Promise<boolean>} True if password is correct
   */
  async verifyPassword(id, candidatePassword) {
    const user = await User.findById(id).select('+password');
    if (!user) return false;

    return user.comparePassword(candidatePassword);
  },

  /**
   * Check if user is locked out
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if user is locked out
   */
  async isLocked(id) {
    const user = await User.findById(id);
    if (!user) return false;

    return user.isLocked;
  },

  /**
   * Get user statistics summary
   * @returns {Promise<Object>} User statistics
   */
  async getGlobalStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalReadingTime: { $sum: '$stats.totalReadingTime' },
          totalArticles: { $sum: '$stats.totalArticles' },
          avgReadingTime: { $avg: '$stats.totalReadingTime' },
          subscriptionPlans: {
            $push: '$subscription.plan'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalReadingTime: 0,
        totalArticles: 0,
        avgReadingTime: 0,
        planDistribution: {}
      };
    }

    const result = stats[0];
    
    // Calculate subscription plan distribution
    const planCounts = {};
    result.subscriptionPlans.forEach(plan => {
      planCounts[plan || 'free'] = (planCounts[plan || 'free'] || 0) + 1;
    });
    result.planDistribution = planCounts;
    delete result.subscriptionPlans;
    delete result._id;

    return result;
  },

  /**
   * Reset - Not applicable for MongoDB (would clear entire collection)
   * This method is for testing compatibility but should be used with caution
   */
  reset() {
    console.warn('reset() called on MongoDB DAO - this would clear all data in production');
    // return User.deleteMany({});
  },

  /**
   * Get current count (for debugging)
   */
  async getCount() {
    return User.countDocuments({});
  }
};

module.exports = usersDao;