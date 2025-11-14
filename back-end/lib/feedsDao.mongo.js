/**
 * Feeds Mongoose DAO - MongoDB-backed implementation
 * 
 * Purpose: Provides a MongoDB implementation of the feeds data access layer
 * using Mongoose ODM. This DAO provides persistent storage with full CRUD
 * operations and complex query capabilities.
 */

const { Feed } = require('./models');

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

const feedsDao = {
  /**
   * Get all feeds with optional filtering
   * @param {Object} filters - Query filters
   * @param {string} filters.category - Filter by category
   * @param {boolean} filters.isActive - Filter by active status
   * @param {string} filters.search - Search in name and description
   * @param {string} filters.userId - User ID (required for MongoDB)
   * @returns {Promise<Array>} Array of feeds
   */
  async getAll(filters = {}) {
    if (!filters.userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    let query = { userId: filters.userId };

    // Category filter
    if (filters.category) {
      query.category = filters.category;
    }

    // Active status filter
    if (typeof filters.isActive === 'boolean') {
      query.isActive = filters.isActive;
    }

    // Search filter
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: regex },
        { description: regex }
      ];
    }

    const feeds = await Feed.find(query).sort({ name: 1 });
    return feeds.map(transformToStringId);
  },

  /**
   * Get single feed by ID
   * @param {string} id - Feed ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Feed object or null if not found
   */
  async getById(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const feed = await Feed.findOne(query);
    return transformToStringId(feed);
  },

  /**
   * Create new feed
   * @param {Object} feedData - Feed data
   * @returns {Promise<Object>} Created feed
   */
  async create(feedData) {
    if (!feedData.userId) {
      throw new Error('userId is required for creating feeds');
    }

    const newFeed = new Feed({
      name: feedData.name,
      url: feedData.url,
      description: feedData.description || '',
      category: feedData.category || 'General',
      isActive: feedData.isActive !== false,
      favicon: feedData.favicon || '/icons/rss.svg',
      articleCount: feedData.articleCount || 0,
      userId: feedData.userId,
      ...feedData
    });

    const savedFeed = await newFeed.save();
    return transformToStringId(savedFeed);
  },

  /**
   * Update feed
   * @param {string} id - Feed ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async update(id, updateData, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    // Don't allow updating userId or _id
    const { userId: _, _id, ...safeUpdateData } = updateData;

    const feed = await Feed.findOneAndUpdate(
      query,
      safeUpdateData,
      { new: true, runValidators: true }
    );

    return transformToStringId(feed);
  },

  /**
   * Delete feed
   * @param {string} id - Feed ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const result = await Feed.deleteOne(query);
    return result.deletedCount > 0;
  },

  /**
   * Get feeds by category
   * @param {string} category - Category to filter by
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Feeds with the specified category
   */
  async getByCategory(category, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const feeds = await Feed.findByCategory(category, userId);
    return feeds.map(transformToStringId);
  },

  /**
   * Get active feeds only
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Active feeds
   */
  async getActive(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const feeds = await Feed.findActive(userId);
    return feeds.map(transformToStringId);
  },

  /**
   * Get inactive feeds only
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Inactive feeds
   */
  async getInactive(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const feeds = await Feed.find({ isActive: false, userId }).sort({ name: 1 });
    return feeds.map(transformToStringId);
  },

  /**
   * Update feed's active status
   * @param {string} id - Feed ID
   * @param {boolean} isActive - Active status
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async updateStatus(id, isActive, userId = null) {
    return this.update(id, { isActive }, userId);
  },

  /**
   * Update feed's article count
   * @param {string} id - Feed ID
   * @param {number} count - Article count
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async updateArticleCount(id, count, userId = null) {
    return this.update(id, { articleCount: count, lastUpdated: new Date() }, userId);
  },

  /**
   * Update feed's last updated timestamp
   * @param {string} id - Feed ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async updateLastUpdated(id, userId = null) {
    return this.update(id, { lastUpdated: new Date() }, userId);
  },

  /**
   * Update feed fetch status
   * @param {string} id - Feed ID
   * @param {boolean} success - Whether fetch was successful
   * @param {string} error - Error message if fetch failed
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async updateFetchStatus(id, success = true, error = null, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const feed = await Feed.findOne(query);
    if (!feed) return null;

    await feed.updateLastFetch(success, error);
    return transformToStringId(feed);
  },

  /**
   * Search feeds by name or description
   * @param {string} query - Search query
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Matching feeds
   */
  async search(query, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    if (!query) return [];

    const regex = new RegExp(query, 'i');
    const feeds = await Feed.find({
      userId,
      $or: [
        { name: regex },
        { description: regex }
      ]
    }).sort({ name: 1 });

    return feeds.map(transformToStringId);
  },

  /**
   * Get unique categories
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Array of unique categories
   */
  async getCategories(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const categories = await Feed.getCategories(userId);
    return categories.filter(cat => cat); // Remove empty/null categories
  },

  /**
   * Get feeds that need updating (stale feeds)
   * @param {number} hoursStale - Hours since last successful fetch (default: 24)
   * @returns {Promise<Array>} Feeds that need updating
   */
  async getStale(hoursStale = 24) {
    const feeds = await Feed.findStale(hoursStale);
    return feeds.map(transformToStringId);
  },

  /**
   * Get feeds with errors
   * @param {number} errorThreshold - Minimum number of errors (default: 3)
   * @returns {Promise<Array>} Feeds with errors
   */
  async getWithErrors(errorThreshold = 3) {
    const feeds = await Feed.findWithErrors(errorThreshold);
    return feeds.map(transformToStringId);
  },

  /**
   * Increment article count for feed
   * @param {string} id - Feed ID
   * @param {number} count - Amount to increment (default: 1)
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async incrementArticleCount(id, count = 1, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const feed = await Feed.findOne(query);
    if (!feed) return null;

    await feed.incrementArticleCount(count);
    return transformToStringId(feed);
  },

  /**
   * Get feed statistics
   * @param {string} userId - User ID (required)
   * @returns {Promise<Object>} Feed statistics
   */
  async getStats(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const stats = await Feed.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalFeeds: { $sum: 1 },
          activeFeeds: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalArticles: { $sum: '$articleCount' },
          avgArticlesPerFeed: { $avg: '$articleCount' },
          categoriesCount: { $addToSet: '$category' }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalFeeds: 0,
        activeFeeds: 0,
        totalArticles: 0,
        avgArticlesPerFeed: 0,
        categoriesCount: 0
      };
    }

    const result = stats[0];
    result.categoriesCount = result.categoriesCount.length;
    delete result._id;

    return result;
  },

  /**
   * Reset - Not applicable for MongoDB (would clear entire collection)
   * This method is for testing compatibility but should be used with caution
   */
  reset() {
    console.warn('reset() called on MongoDB DAO - this would clear all data in production');
    // return Feed.deleteMany({});
  },

  /**
   * Get current count (for debugging)
   * @param {string} userId - User ID (optional, gets count for specific user)
   */
  async getCount(userId = null) {
    const query = userId ? { userId } : {};
    return Feed.countDocuments(query);
  }
};

module.exports = feedsDao;