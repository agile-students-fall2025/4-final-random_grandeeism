/**
 * Tags Mongoose DAO - MongoDB-backed implementation
 * 
 * Purpose: Provides a MongoDB implementation of the tags data access layer
 * using Mongoose ODM. This DAO provides persistent storage with full CRUD
 * operations and complex query capabilities.
 */

const { Tag } = require('./models');

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
  return obj;
};

const tagsDao = {
  /**
   * Get all tags with optional filtering
   * @param {Object} filters - Query filters
   * @param {string} filters.category - Filter by category
   * @param {string} filters.search - Search in name and description
   * @param {string} filters.userId - User ID (required for MongoDB)
   * @returns {Promise<Array>} Array of tags
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

    // Search filter
    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: regex },
        { description: regex }
      ];
    }

    const tags = await Tag.find(query).sort({ name: 1 });
    return tags.map(transformToStringId);
  },

  /**
   * Get single tag by ID
   * @param {string} id - Tag ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Tag object or null if not found
   */
  async getById(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const tag = await Tag.findOne(query);
    return transformToStringId(tag);
  },

  /**
   * Get single tag by name
   * @param {string} name - Tag name
   * @param {string} userId - User ID (required)
   * @returns {Promise<Object|null>} Tag object or null if not found
   */
  async getByName(name, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const tag = await Tag.findOne({ 
      name: name.toLowerCase(), 
      userId 
    });
    return transformToStringId(tag);
  },

  /**
   * Create new tag
   * @param {Object} tagData - Tag data
   * @returns {Promise<Object>} Created tag
   */
  async create(tagData) {
    if (!tagData.userId) {
      throw new Error('userId is required for creating tags');
    }

    const newTag = new Tag({
      name: tagData.name.toLowerCase(),
      description: tagData.description || '',
      category: tagData.category || 'General',
      color: tagData.color || '#6366f1',
      articleCount: tagData.articleCount || 0,
      userId: tagData.userId,
      ...tagData
    });

    const savedTag = await newTag.save();
    return transformToStringId(savedTag);
  },

  /**
   * Update tag
   * @param {string} id - Tag ID
   * @param {Object} updateData - Data to update
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated tag or null if not found
   */
  async update(id, updateData, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    // Don't allow updating userId or _id
    const { userId: _, _id, ...safeUpdateData } = updateData;

    // Normalize name if it's being updated
    if (safeUpdateData.name) {
      safeUpdateData.name = safeUpdateData.name.toLowerCase();
    }

    const tag = await Tag.findOneAndUpdate(
      query,
      safeUpdateData,
      { new: true, runValidators: true }
    );

    return transformToStringId(tag);
  },

  /**
   * Delete tag
   * @param {string} id - Tag ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const result = await Tag.deleteOne(query);
    
    if (result.deletedCount > 0) {
      // Remove this tag from all articles
      const { Article } = require('./models');
      const updateQuery = userId ? { userId } : {};
      
      await Article.updateMany(
        { ...updateQuery, tags: id },
        { $pull: { tags: id } }
      );
    }
    
    return result.deletedCount > 0;
  },

  /**
   * Get tags by category
   * @param {string} category - Category to filter by
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Tags with the specified category
   */
  async getByCategory(category, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const tags = await Tag.findByCategory(category, userId);
    return tags.map(transformToStringId);
  },

  /**
   * Update tag's article count
   * @param {string} id - Tag ID
   * @param {number} count - Article count
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated tag or null if not found
   */
  async updateArticleCount(id, count, userId = null) {
    return this.update(id, { articleCount: count }, userId);
  },

  /**
   * Increment tag's article count
   * @param {string} id - Tag ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated tag or null if not found
   */
  async incrementArticleCount(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const tag = await Tag.findOne(query);
    if (!tag) return null;

    await tag.incrementCount();
    return transformToStringId(tag);
  },

  /**
   * Decrement tag's article count
   * @param {string} id - Tag ID
   * @param {string} userId - User ID (for security)
   * @returns {Promise<Object|null>} Updated tag or null if not found
   */
  async decrementArticleCount(id, userId = null) {
    const query = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const tag = await Tag.findOne(query);
    if (!tag) return null;

    await tag.decrementCount();
    return transformToStringId(tag);
  },

  /**
   * Search tags by name or description
   * @param {string} query - Search query
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Matching tags
   */
  async search(query, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    if (!query) return [];

    const tags = await Tag.search(query, userId);
    return tags.map(transformToStringId);
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

    const categories = await Tag.getCategories(userId);
    return categories.filter(cat => cat); // Remove empty/null categories
  },

  /**
   * Get popular tags (by article count)
   * @param {number} limit - Maximum number of tags to return
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Tags sorted by article count (descending)
   */
  async getPopular(limit = 10, userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const tags = await Tag.findPopular(userId, limit);
    return tags.map(transformToStringId);
  },

  /**
   * Get tags with no articles
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Tags with articleCount of 0
   */
  async getUnused(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const tags = await Tag.findUnused(userId);
    return tags.map(transformToStringId);
  },

  /**
   * Find or create tag by name
   * @param {string} name - Tag name
   * @param {string} userId - User ID (required)
   * @param {Object} options - Additional options for creation
   * @returns {Promise<Object>} Found or created tag
   */
  async findOrCreate(name, userId, options = {}) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const tag = await Tag.findOrCreate(name, userId, options);
    return transformToStringId(tag);
  },

  /**
   * Update tag counts based on actual article usage
   * @param {string} userId - User ID (required)
   * @returns {Promise<Array>} Updated tags
   */
  async syncArticleCounts(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const tags = await Tag.find({ userId });
    const updatedTags = [];

    for (const tag of tags) {
      await tag.updateCount();
      updatedTags.push(transformToStringId(tag));
    }

    return updatedTags;
  },

  /**
   * Get tag statistics
   * @param {string} userId - User ID (required)
   * @returns {Promise<Object>} Tag statistics
   */
  async getStats(userId) {
    if (!userId) {
      throw new Error('userId is required for MongoDB operations');
    }

    const stats = await Tag.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalTags: { $sum: 1 },
          totalArticles: { $sum: '$articleCount' },
          avgArticlesPerTag: { $avg: '$articleCount' },
          maxArticles: { $max: '$articleCount' },
          usedTags: {
            $sum: { $cond: [{ $gt: ['$articleCount', 0] }, 1, 0] }
          },
          unusedTags: {
            $sum: { $cond: [{ $eq: ['$articleCount', 0] }, 1, 0] }
          },
          categoriesCount: { $addToSet: '$category' }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalTags: 0,
        totalArticles: 0,
        avgArticlesPerTag: 0,
        maxArticles: 0,
        usedTags: 0,
        unusedTags: 0,
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
    // return Tag.deleteMany({});
  },

  /**
   * Get current count (for debugging)
   * @param {string} userId - User ID (optional, gets count for specific user)
   */
  async getCount(userId = null) {
    const query = userId ? { userId } : {};
    return Tag.countDocuments(query);
  }
};

module.exports = tagsDao;