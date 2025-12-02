/**
 * Articles Mongoose DAO - MongoDB-backed implementation
 * 
 * Purpose: Provides a MongoDB implementation of the articles data access layer
 * using Mongoose ODM. This DAO provides persistent storage with full CRUD
 * operations and complex query capabilities.
 */

const { Article } = require('./models');

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
  // Convert userId ObjectId to string for consistency with JWT
  if (obj.userId && typeof obj.userId === 'object') {
    obj.userId = obj.userId.toString();
  }
  // Convert feedId ObjectId to string if present
  if (obj.feedId && typeof obj.feedId === 'object') {
    obj.feedId = obj.feedId.toString();
  }
  return obj;
};

const articlesDao = {
  /**
   * Get all articles with optional filtering
   * @param {Object} filters - Query filters
   * @param {string} filters.status - Filter by status (inbox, daily, continue, rediscovery, archived)
   * @param {string} filters.tag - Filter by tag
   * @param {boolean} filters.isFavorite - Filter by favorite status
   * @param {boolean} filters.untagged - Filter for articles without tags
   * @param {string} filters.userId - User ID (required for MongoDB)
   * @returns {Promise<Array>} Array of articles
   */
  async getAll(filters = {}) {
    if (!filters.userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    let query = { userId: filters.userId };

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }

    // Tag filter - tags are stored as strings (ObjectId converted to string)
    if (filters.tag) {
      // Ensure the tag is a string for matching
      query.tags = String(filters.tag);
    }

    // Favorite filter
    if (typeof filters.isFavorite === 'boolean') {
      query.isFavorite = filters.isFavorite;
    }

    // Untagged filter
    if (filters.untagged === true) {
      query.$or = [
        { tags: { $size: 0 } },
        { tags: { $exists: false } }
      ];
    }

    const articles = await Article.find(query).sort({ dateAdded: -1 });
    return articles.map(transformToStringId);
  },

  /**
   * Get single article by ID
   * @param {string} id - Article ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Article object or null if not found
   */
  async getById(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const article = await Article.findOne(query);
    return transformToStringId(article);
  },

  /**
   * Create new article
   * @param {Object} articleData - Article data
   * @returns {Promise<Object>} Created article
   */
  async create(articleData) {
    if (!articleData.userId) {
      throw new Error('userId is required for creating articles');
    }

    const newArticle = new Article({
      title: articleData.title || 'Untitled',
      url: articleData.url,
      author: articleData.author || 'Unknown Author',
      source: articleData.source || 'Unknown Source',
      feedId: articleData.feedId || null,
      readingTime: articleData.readingTime || '1 min',
      wordCount: articleData.wordCount || 100,
      status: articleData.status || 'inbox',
      isFavorite: articleData.isFavorite || false,
      tags: articleData.tags || [],
      hasAnnotations: false,
      readProgress: 0,
      content: articleData.content || '',
      userId: articleData.userId,
      ...articleData
    });

    const savedArticle = await newArticle.save();
    return transformToStringId(savedArticle);
  },

  /**
   * Update article
   * @param {string} id - Article ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated article or null if not found
   */
  async update(id, updateData, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    // Don't allow updating userId or _id
    const { userId: _, _id, ...safeUpdateData } = updateData;

    const article = await Article.findOneAndUpdate(
      query,
      safeUpdateData,
      { new: true, runValidators: true }
    );

    return transformToStringId(article);
  },

  /**
   * Delete article
   * @param {string} id - Article ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const result = await Article.deleteOne(query);
    return result.deletedCount > 0;
  },

  /**
   * Get articles by status
   * @param {string} status - Status to filter by
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Articles with the specified status
   */
  async getByStatus(status, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const articles = await Article.findByStatus(status, userId);
    return articles.map(transformToStringId);
  },

  /**
   * Get articles by tag
   * @param {string} tag - Tag to filter by
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Articles with the specified tag
   */
  async getByTag(tag, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const articles = await Article.findByTag(tag, userId);
    return articles.map(transformToStringId);
  },

  /**
   * Get articles by feed ID
   * @param {string} feedId - Feed ID to filter by
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Array>} Articles from the specified feed
   */
  async getByFeedId(feedId, userId = null) {
    const query = { feedId };
    if (userId) {
      query.userId = userId;
    }

    const articles = await Article.find(query).sort({ dateAdded: -1 });
    return articles.map(transformToStringId);
  },

  /**
   * Update article status
   * @param {string} id - Article ID
   * @param {string} status - New status
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated article or null if not found
   */
  async updateStatus(id, status, userId = null) {
    return this.update(id, { status }, userId);
  },

  /**
   * Update reading progress
   * @param {string} id - Article ID
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated article or null if not found
   */
  async updateProgress(id, progress, userId = null) {
    const updateData = { readProgress: progress };
    if (progress > 0) {
      updateData.lastRead = new Date();
    }
    return this.update(id, updateData, userId);
  },

  /**
   * Toggle favorite status
   * @param {string} id - Article ID
   * @param {boolean} isFavorite - Favorite status
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated article or null if not found
   */
  async toggleFavorite(id, isFavorite, userId = null) {
    return this.update(id, { isFavorite }, userId);
  },

  /**
   * Get untagged articles
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Articles without tags
   */
  async getUntagged(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const articles = await Article.findUntagged(userId);
    return articles.map(transformToStringId);
  },

  /**
   * Get favorite articles
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Favorite articles
   */
  async getFavorites(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const articles = await Article.findFavorites(userId);
    return articles.map(transformToStringId);
  },

  /**
   * Search articles by title or content
   * @param {string} query - Search query
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Matching articles
   */
  async search(query, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    if (!query) return [];

    const regex = new RegExp(query, 'i');
    const articles = await Article.find({
      userId,
      $or: [
        { title: regex },
        { content: regex },
        { author: regex },
        { source: regex }
      ]
    }).sort({ dateAdded: -1 });

    return articles.map(transformToStringId);
  },

  /**
   * Get article count by status for user
   * @param {string} userId - User ID (required)
   * @returns {Promise<Object>} Status counts
   */
  async getStatusCounts(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const counts = await Article.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const result = {};
    counts.forEach(item => {
      result[item._id] = item.count;
    });

    return result;
  },

  /**
   * Reset - Not applicable for MongoDB (would clear entire collection)
   * This method is for testing compatibility but should be used with caution
   */
  reset() {
    // In production, this would be dangerous
    // For testing, you might want to clear test data only
    console.warn('reset() called on MongoDB DAO - this would clear all data in production');
    // return Article.deleteMany({});
  },

  /**
   * Get current count (for debugging)
   * @param {string} userId - User ID (optional, gets count for specific user)
   */
  async getCount(userId = null) {
    const query = userId ? { userId } : {};
    return Article.countDocuments(query);
  }
};

module.exports = articlesDao;