/**
 * Users Mock DAO - Array-backed implementation
 * 
 * Purpose: Provides an in-memory implementation of the users data access layer
 * using the mock data from data/mockUsers.js. This DAO maintains state in memory
 * and provides deterministic behavior for testing and development.
 */

const { mockUsers } = require('../data/mockUsers');

// In-memory storage - clone the mock data to avoid mutations
let users = [...mockUsers.map(user => ({ ...user }))];

// Next numeric ID helper
let nextId = (users.length ? Math.max(...users.map(u => Number(u.id))) : 0) + 1;

/**
 * Generate a new ID for created users
 */
const generateId = () => nextId++;

const usersDao = {
  /**
   * Get all users with optional filtering
   * @param {Object} filters - Query filters
   * @param {boolean} filters.isActive - Filter by active status
   * @param {string} filters.search - Search in username and email
   * @returns {Promise<Array>} Array of users (passwords excluded)
   */
  async getAll(filters = {}) {
    let filteredUsers = [...users];

    // Active status filter
    if (typeof filters.isActive === 'boolean') {
      filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Remove password from response
    return filteredUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  /**
   * Get single user by ID
   * @param {string} id - User ID
   * @param {boolean} includePassword - Include password in response (for auth)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getById(id, includePassword = false) {
  const user = users.find(u => u.id == id);
    if (!user) return null;

    if (includePassword) {
      return { ...user };
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Get single user by email
   * @param {string} email - User email
   * @param {boolean} includePassword - Include password in response (for auth)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getByEmail(email, includePassword = false) {
    const user = users.find(u => u.email === email);
    if (!user) return null;

    if (includePassword) {
      return { ...user };
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Get single user by username
   * @param {string} username - Username
   * @param {boolean} includePassword - Include password in response (for auth)
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getByUsername(username, includePassword = false) {
    const user = users.find(u => u.username === username);
    if (!user) return null;

    if (includePassword) {
      return { ...user };
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user (without password)
   */
  async create(userData) {
    // Check if user with same email already exists
    const existingUser = await this.getByEmail(userData.email);
    if (existingUser) {
      throw new Error(`User with email "${userData.email}" already exists`);
    }

    // Check if username is taken
    if (userData.username) {
      const existingUsername = await this.getByUsername(userData.username);
      if (existingUsername) {
        throw new Error(`Username "${userData.username}" is already taken`);
      }
    }

    const newUser = {
      id: generateId(),
      username: userData.username || userData.email.split('@')[0],
      email: userData.email,
      password: userData.password, // Should be hashed before calling this
      isActive: userData.isActive !== false, // Default to true
      profile: {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        avatar: userData.avatar || '/images/default-avatar.png',
        bio: userData.bio || '',
        preferences: {
          theme: 'light',
          notifications: true,
          autoArchive: false,
          readingGoal: 5,
          ...userData.preferences
        }
      },
      stats: {
        totalArticles: 0,
        totalReadingTime: 0,
        favoriteCount: 0,
        tagsUsed: 0,
        joinedDate: new Date(),
        lastLogin: new Date(),
        ...userData.stats
      },
      ...userData
    };

    users.push(newUser);
    
    // Return without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user (without password) or null if not found
   */
  async update(id, updateData) {
  const index = users.findIndex(u => u.id == id);
    if (index === -1) {
      return null;
    }

    // Check if updating email and email already exists elsewhere
    if (updateData.email && updateData.email !== users[index].email) {
      const existingUser = await this.getByEmail(updateData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error(`User with email "${updateData.email}" already exists`);
      }
    }

    // Check if updating username and username already exists elsewhere
    if (updateData.username && updateData.username !== users[index].username) {
      const existingUser = await this.getByUsername(updateData.username);
      if (existingUser && existingUser.id !== id) {
        throw new Error(`Username "${updateData.username}" is already taken`);
      }
    }

    users[index] = {
      ...users[index],
      ...updateData,
      id // Ensure ID doesn't change
    };

    // Return without password
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  },

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
  const index = users.findIndex(u => u.id == id);
    if (index === -1) {
      return false;
    }

    users.splice(index, 1);
    return true;
  },

  /**
   * Update user's password
   * @param {string} id - User ID
   * @param {string} hashedPassword - New hashed password
   * @returns {Promise<boolean>} True if updated, false if user not found
   */
  async updatePassword(id, hashedPassword) {
  const index = users.findIndex(u => u.id == id);
    if (index === -1) {
      return false;
    }

    users[index].password = hashedPassword;
    return true;
  },

  /**
   * Update user's last login timestamp
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if updated, false if user not found
   */
  async updateLastLogin(id) {
  const index = users.findIndex(u => u.id == id);
    if (index === -1) {
      return false;
    }

    if (!users[index].stats) {
      users[index].stats = {};
    }
    users[index].stats.lastLogin = new Date();
    return true;
  },

  /**
   * Update user's statistics
   * @param {string} id - User ID
   * @param {Object} stats - Statistics to update
   * @returns {Promise<Object|null>} Updated user (without password) or null if not found
   */
  async updateStats(id, stats) {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return null;
    }

    users[index].stats = {
      ...users[index].stats,
      ...stats
    };

    // Return without password
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  },

  /**
   * Get active users only
   * @returns {Promise<Array>} Active users (without passwords)
   */
  async getActive() {
    const activeUsers = users.filter(user => user.isActive === true);
    return activeUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  /**
   * Search users by username or email
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching users (without passwords)
   */
  async search(query) {
    if (!query) return [];
    
    const queryLower = query.toLowerCase();
    const matchingUsers = users.filter(user => 
      user.username.toLowerCase().includes(queryLower) ||
      user.email.toLowerCase().includes(queryLower)
    );

    return matchingUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  /**
   * Reset users to original mock data (for testing)
   */
  reset() {
    users = [...mockUsers.map(user => ({ ...user }))];
  },

  /**
   * Get current count (for debugging)
   */
  getCount() {
    return users.length;
  }
};

module.exports = usersDao;