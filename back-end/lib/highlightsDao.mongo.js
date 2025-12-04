/**
 * Highlights Mongoose DAO - MongoDB-backed implementation
 * 
 * Purpose: Provides a MongoDB implementation of the highlights data access layer
 * using Mongoose ODM. This DAO provides persistent storage with full CRUD
 * operations and complex query capabilities.
 */

const { Highlight } = require('./models');

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
  // Also transform articleId and userId if they exist
  if (obj.articleId) obj.articleId = obj.articleId.toString();
  if (obj.userId) obj.userId = obj.userId.toString();
  return obj;
};

const highlightsDao = {
  /**
   * Get all highlights with optional filtering
   * @param {Object} filters - Query filters
   * @param {string} filters.articleId - Filter by article ID
   * @param {string} filters.userId - Filter by user ID
   * @param {string} filters.color - Filter by highlight color
   * @param {string} filters.search - Search in text and notes
   * @returns {Promise<Array>} Array of highlights
   */
  async getAll(filters = {}) {
    let query = {};

    // Article ID filter
    if (filters.articleId) {
      query.articleId = filters.articleId;
    }

    // User ID filter
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Color filter
    if (filters.color) {
      query.color = filters.color.toLowerCase();
    }

    // Search filter
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { text: regex },
        { 'annotations.note': regex }
      ];
    }

    const highlights = await Highlight.find(query).sort({ createdAt: -1 });
    return highlights.map(transformToStringId);
  },

  /**
   * Get single highlight by ID
   * @param {string} id - Highlight ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Highlight object or null if not found
   */
  async getById(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const highlight = await Highlight.findOne(query);
    return transformToStringId(highlight);
  },

  /**
   * Create new highlight
   * @param {Object} highlightData - Highlight data
   * @returns {Promise<Object>} Created highlight
   */
  async create(highlightData) {
    if (!highlightData.articleId || !highlightData.userId) {
      throw new Error('articleId and userId are required for creating highlights');
    }

    const newHighlight = new Highlight({
      articleId: highlightData.articleId,
      userId: highlightData.userId,
      text: highlightData.text,
      annotations: highlightData.annotations || { title: '', note: '' },
      color: (highlightData.color ? highlightData.color.trim().toLowerCase() : null) || '#fef08a',
      position: highlightData.position || { start: 0, end: 0 },
      tags: highlightData.tags || [],
      isPublic: highlightData.isPublic || false,
      metadata: highlightData.metadata || {}
    });

    const savedHighlight = await newHighlight.save();
    return transformToStringId(savedHighlight);
  },

  /**
   * Update highlight
   * @param {string} id - Highlight ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated highlight or null if not found
   */
  async update(id, updateData, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    // Don't allow updating userId, articleId, or _id
    const { userId: _, articleId: __, _id, ...safeUpdateData } = updateData;

    const highlight = await Highlight.findOneAndUpdate(
      query,
      { ...safeUpdateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return transformToStringId(highlight);
  },

  /**
   * Delete highlight
   * @param {string} id - Highlight ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const result = await Highlight.deleteOne(query);
    return result.deletedCount > 0;
  },

  /**
   * Get highlights by article ID
   * @param {string} articleId - Article ID to filter by
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Array>} Highlights for the specified article
   */
  async getByArticleId(articleId, userId = null) {
    const highlights = await Highlight.findByArticle(articleId, userId);
    return highlights.map(transformToStringId);
  },

  /**
   * Get highlights by user ID
   * @param {string} userId - User ID to filter by
   * @param {number} limit - Maximum number of highlights (optional)
   * @returns {Promise<Array>} Highlights for the specified user
   */
  async getByUserId(userId, limit = null) {
    const highlights = await Highlight.findByUser(userId, limit);
    return highlights.map(transformToStringId);
  },

  /**
   * Get highlights by color
   * @param {string} color - Color to filter by
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Highlights with the specified color
   */
  async getByColor(color, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const highlights = await Highlight.findByColor(color, userId);
    return highlights.map(transformToStringId);
  },

  /**
   * Update highlight note
   * @param {string} id - Highlight ID
   * @param {string} note - New note text
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated highlight or null if not found
   */
  async updateNote(id, note, userId = null) {
    return this.update(id, { annotations: { note } }, userId);
  },

  /**
   * Update highlight color
   * @param {string} id - Highlight ID
   * @param {string} color - New color
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated highlight or null if not found
   */
  async updateColor(id, color, userId = null) {
    return this.update(id, { color: color.trim().toLowerCase() }, userId);
  },

  /**
   * Search highlights by text or note
   * @param {string} query - Search query
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Matching highlights
   */
  async search(query, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    if (!query) return [];

    const highlights = await Highlight.search(query, userId);
    return highlights.map(transformToStringId);
  },

  /**
   * Get highlights with notes
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Highlights that have notes
   */
  async getWithNotes(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const highlights = await Highlight.findWithNotes(userId);
    return highlights.map(transformToStringId);
  },

  /**
   * Get highlights without notes
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Highlights that don't have notes
   */
  async getWithoutNotes(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const highlights = await Highlight.find({ 
      userId,
      $or: [
        { note: { $exists: false } },
        { note: '' }
      ]
    }).sort({ createdAt: -1 });

    return highlights.map(transformToStringId);
  },

  /**
   * Get unique colors used in highlights
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Array of unique colors
   */
  async getColors(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const colors = await Highlight.distinct('color', { userId });
    return colors.filter(color => color); // Remove empty/null colors
  },

  /**
   * Delete all highlights for an article
   * @param {string} articleId - Article ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<number>} Number of highlights deleted
   */
  async deleteByArticleId(articleId, userId = null) {
    const query = { articleId };
    if (userId) {
      query.userId = userId;
    }

    const result = await Highlight.deleteMany(query);
    return result.deletedCount;
  },

  /**
   * Delete all highlights for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of highlights deleted
   */
  async deleteByUserId(userId) {
    const result = await Highlight.deleteMany({ userId });
    return result.deletedCount;
  },

  /**
   * Get recent highlights for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of highlights to return
   * @returns {Promise<Array>} Recent highlights sorted by creation date (descending)
   */
  async getRecentByUserId(userId, limit = 10) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const highlights = await Highlight.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('article', 'title url');

    return highlights.map(transformToStringId);
  },

  /**
   * Get highlights by tag
   * @param {string} tag - Tag to filter by
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Highlights with the specified tag
   */
  async getByTag(tag, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const highlights = await Highlight.findByTag(tag, userId);
    return highlights.map(transformToStringId);
  },

  /**
   * Get public highlights
   * @param {number} limit - Maximum number of highlights (default: 50)
   * @returns {Promise<Array>} Public highlights with user and article info
   */
  async getPublic(limit = 50) {
    const highlights = await Highlight.findPublic(limit);
    return highlights.map(transformToStringId);
  },

  /**
   * Toggle public status of highlight
   * @param {string} id - Highlight ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated highlight or null if not found
   */
  async togglePublic(id, userId) {
    const highlight = await Highlight.findOne({ _id: id, userId });
    if (!highlight) return null;

    await highlight.togglePublic();
    return transformToStringId(highlight);
  },

  /**
   * Get highlight statistics for user
   * @param {string} userId - User ID (required)
   * @returns {Promise<Object>} Highlight statistics
   */
  async getStats(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const [colorStats, tagStats, totalCount, withNotesCount] = await Promise.all([
      Highlight.getColorDistribution(userId),
      Highlight.getTagsUsed(userId),
      Highlight.countDocuments({ userId }),
      Highlight.countDocuments({ userId, note: { $exists: true, $ne: '' } })
    ]);

    return {
      totalHighlights: totalCount,
      highlightsWithNotes: withNotesCount,
      highlightsWithoutNotes: totalCount - withNotesCount,
      colorDistribution: colorStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topTags: tagStats.slice(0, 10),
      tagsUsed: tagStats.length
    };
  },

  /**
   * Reset - Not applicable for MongoDB (would clear entire collection)
   * This method is for testing compatibility but should be used with caution
   */
  reset() {
    console.warn('reset() called on MongoDB DAO - this would clear all data in production');
    // return Highlight.deleteMany({});
  },

  /**
   * Get current count (for debugging)
   * @param {string} userId - User ID (optional, gets count for specific user)
   */
  async getCount(userId = null) {
    const query = userId ? { userId } : {};
    return Highlight.countDocuments(query);
  }
};

module.exports = highlightsDao;