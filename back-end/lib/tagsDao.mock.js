/**
 * Tags Mock DAO - Array-backed implementation
 * 
 * Purpose: Provides an in-memory implementation of the tags data access layer
 * using the mock data from data/mockTags.js. This DAO maintains state in memory
 * and provides deterministic behavior for testing and development.
 */

const { mockTags } = require('../data/mockTags');
const { mockArticles } = require('../data/mockArticles');

// In-memory storage - clone the mock data to avoid mutations
let tags = [...mockTags.map(tag => ({ ...tag }))];

/**
 * Generate a new ID for created tags
 */
const generateId = () => `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Calculate the actual article count for a tag
 * @param {string} tagId - Tag ID to count articles for
 * @returns {number} Number of articles with this tag
 */
const calculateArticleCount = (tagId) => {
  return mockArticles.filter(article => 
    article.tags && Array.isArray(article.tags) && article.tags.includes(tagId)
  ).length;
};

const tagsDao = {
  /**
   * Get all tags with optional filtering
   * @param {Object} filters - Query filters
   * @param {string} filters.category - Filter by category
   * @param {string} filters.search - Search in name and description
   * @returns {Promise<Array>} Array of tags
   */
  async getAll(filters = {}) {
    let filteredTags = [...tags];

    // Category filter
    if (filters.category) {
      filteredTags = filteredTags.filter(tag => tag.category === filters.category);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTags = filteredTags.filter(tag => 
        tag.name.toLowerCase().includes(searchLower) ||
        (tag.description && tag.description.toLowerCase().includes(searchLower))
      );
    }

    // Update article counts with actual values
    filteredTags = filteredTags.map(tag => ({
      ...tag,
      articleCount: calculateArticleCount(tag.id)
    }));

    return filteredTags;
  },

  /**
   * Get single tag by ID
   * @param {string} id - Tag ID
   * @returns {Promise<Object|null>} Tag object or null if not found
   */
  async getById(id) {
    const tag = tags.find(t => t.id === id);
    return tag ? { ...tag } : null;
  },

  /**
   * Get single tag by name
   * @param {string} name - Tag name
   * @returns {Promise<Object|null>} Tag object or null if not found
   */
  async getByName(name) {
    const tag = tags.find(t => t.name === name);
    return tag ? { ...tag } : null;
  },

  /**
   * Create new tag
   * @param {Object} tagData - Tag data
   * @returns {Promise<Object>} Created tag
   */
  async create(tagData) {
    // Check if tag with same name already exists
    const existingTag = await this.getByName(tagData.name);
    if (existingTag) {
      throw new Error(`Tag with name "${tagData.name}" already exists`);
    }

    const newTag = {
      id: generateId(),
      name: tagData.name,
      description: tagData.description || '',
      category: tagData.category || 'General',
      color: tagData.color || '#6366f1',
      articleCount: tagData.articleCount || 0,
      createdDate: new Date(),
      ...tagData
    };

    tags.push(newTag);
    return { ...newTag };
  },

  /**
   * Update tag
   * @param {string} id - Tag ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated tag or null if not found
   */
  async update(id, updateData) {
    const index = tags.findIndex(t => t.id === id);
    if (index === -1) {
      return null;
    }

    // Check if updating name and name already exists elsewhere
    if (updateData.name && updateData.name !== tags[index].name) {
      const existingTag = await this.getByName(updateData.name);
      if (existingTag && existingTag.id !== id) {
        throw new Error(`Tag with name "${updateData.name}" already exists`);
      }
    }

    tags[index] = {
      ...tags[index],
      ...updateData,
      id // Ensure ID doesn't change
    };

    return { ...tags[index] };
  },

  /**
   * Delete tag
   * @param {string} id - Tag ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const index = tags.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }

    tags.splice(index, 1);
    return true;
  },

  /**
   * Get tags by category
   * @param {string} category - Category to filter by
   * @returns {Promise<Array>} Tags with the specified category
   */
  async getByCategory(category) {
    return tags.filter(tag => tag.category === category);
  },

  /**
   * Update tag's article count
   * @param {string} id - Tag ID
   * @param {number} count - Article count
   * @returns {Promise<Object|null>} Updated tag or null if not found
   */
  async updateArticleCount(id, count) {
    return this.update(id, { articleCount: count });
  },

  /**
   * Increment tag's article count
   * @param {string} id - Tag ID
   * @returns {Promise<Object|null>} Updated tag or null if not found
   */
  async incrementArticleCount(id) {
    const tag = await this.getById(id);
    if (!tag) return null;
    return this.update(id, { articleCount: tag.articleCount + 1 });
  },

  /**
   * Decrement tag's article count
   * @param {string} id - Tag ID
   * @returns {Promise<Object|null>} Updated tag or null if not found
   */
  async decrementArticleCount(id) {
    const tag = await this.getById(id);
    if (!tag) return null;
    return this.update(id, { articleCount: Math.max(0, tag.articleCount - 1) });
  },

  /**
   * Search tags by name or description
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching tags
   */
  async search(query) {
    if (!query) return [];
    
    const queryLower = query.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(queryLower) ||
      (tag.description && tag.description.toLowerCase().includes(queryLower))
    );
  },

  /**
   * Get unique categories
   * @returns {Promise<Array>} Array of unique categories
   */
  async getCategories() {
    const categories = [...new Set(tags.map(tag => tag.category))];
    return categories.filter(cat => cat); // Remove empty/null categories
  },

  /**
   * Get popular tags (by article count)
   * @param {number} limit - Maximum number of tags to return
   * @returns {Promise<Array>} Tags sorted by article count (descending)
   */
  async getPopular(limit = 10) {
    const sortedTags = [...tags].sort((a, b) => b.articleCount - a.articleCount);
    return sortedTags.slice(0, limit);
  },

  /**
   * Get tags with no articles
   * @returns {Promise<Array>} Tags with articleCount of 0
   */
  async getUnused() {
    return tags.filter(tag => tag.articleCount === 0);
  },

  /**
   * Reset tags to original mock data (for testing)
   */
  reset() {
    tags = [...mockTags.map(tag => ({ ...tag }))];
  },

  /**
   * Get current count (for debugging)
   */
  getCount() {
    return tags.length;
  }
};

module.exports = tagsDao;