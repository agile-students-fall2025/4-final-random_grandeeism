/**
 * Feeds Mock DAO - Array-backed implementation
 * 
 * Purpose: Provides an in-memory implementation of the feeds data access layer
 * using the mock data from data/mockFeeds.js. This DAO maintains state in memory
 * and provides deterministic behavior for testing and development.
 */

const { mockFeeds } = require('../data/mockFeeds');

// In-memory storage - clone the mock data to avoid mutations
let feeds = [...mockFeeds.map(feed => ({ ...feed }))];

// ID tracking for string-based IDs (compatible with normalized hex format)
let nextNumericId = 1000;

/**
 * Generate a new ID for created feeds (returns hex string matching seed format)
 */
const generateId = () => {
  const hexId = nextNumericId.toString(16).padStart(24, '0');
  nextNumericId++;
  return hexId;
};

const feedsDao = {
  /**
   * Get all feeds with optional filtering
   * @param {Object} filters - Query filters
   * @param {string} filters.category - Filter by category
   * @param {boolean} filters.isActive - Filter by active status
   * @param {string} filters.search - Search in name and description
   * @returns {Promise<Array>} Array of feeds
   */
  async getAll(filters = {}) {
    let filteredFeeds = [...feeds];

    // Category filter
    if (filters.category) {
      filteredFeeds = filteredFeeds.filter(feed => feed.category === filters.category);
    }

    // Active status filter
    if (typeof filters.isActive === 'boolean') {
      filteredFeeds = filteredFeeds.filter(feed => feed.isActive === filters.isActive);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredFeeds = filteredFeeds.filter(feed => 
        feed.name.toLowerCase().includes(searchLower) ||
        (feed.description && feed.description.toLowerCase().includes(searchLower))
      );
    }

    return filteredFeeds;
  },

  /**
   * Get single feed by ID
   * @param {string} id - Feed ID
   * @returns {Promise<Object|null>} Feed object or null if not found
   */
  async getById(id) {
  const feed = feeds.find(f => f.id == id);
    return feed ? { ...feed } : null;
  },

  /**
   * Create new feed
   * @param {Object} feedData - Feed data
   * @returns {Promise<Object>} Created feed
   */
  async create(feedData) {
    const newFeed = {
      id: generateId(),
      name: feedData.name,
      url: feedData.url,
      description: feedData.description || '',
      category: feedData.category || 'General',
      isActive: feedData.isActive !== false, // Default to true
      favicon: feedData.favicon || '/icons/rss.svg',
      articleCount: feedData.articleCount || 0,
      lastUpdated: new Date(),
      addedDate: new Date(),
      ...feedData
    };

    feeds.push(newFeed);
    return { ...newFeed };
  },

  /**
   * Update feed
   * @param {string} id - Feed ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async update(id, updateData) {
  const index = feeds.findIndex(f => f.id == id);
    if (index === -1) {
      return null;
    }

    feeds[index] = {
      ...feeds[index],
      ...updateData,
      id: Number(id) || id // Ensure ID doesn't change, keep numeric when possible
    };

    return { ...feeds[index] };
  },

  /**
   * Delete feed
   * @param {string} id - Feed ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
  const index = feeds.findIndex(f => f.id == id);
    if (index === -1) {
      return false;
    }

    feeds.splice(index, 1);
    return true;
  },

  /**
   * Get feeds by category
   * @param {string} category - Category to filter by
   * @returns {Promise<Array>} Feeds with the specified category
   */
  async getByCategory(category) {
    return feeds.filter(feed => feed.category === category);
  },

  /**
   * Get active feeds only
   * @returns {Promise<Array>} Active feeds
   */
  async getActive() {
    return feeds.filter(feed => feed.isActive === true);
  },

  /**
   * Get inactive feeds only
   * @returns {Promise<Array>} Inactive feeds
   */
  async getInactive() {
    return feeds.filter(feed => feed.isActive === false);
  },

  /**
   * Update feed's active status
   * @param {string} id - Feed ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async updateStatus(id, isActive) {
    return this.update(id, { isActive });
  },

  /**
   * Update feed's article count
   * @param {string} id - Feed ID
   * @param {number} count - Article count
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async updateArticleCount(id, count) {
    return this.update(id, { articleCount: count });
  },

  /**
   * Update feed's last updated timestamp
   * @param {string} id - Feed ID
   * @returns {Promise<Object|null>} Updated feed or null if not found
   */
  async updateLastUpdated(id) {
    return this.update(id, { lastUpdated: new Date() });
  },

  /**
   * Search feeds by name or description
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching feeds
   */
  async search(query) {
    if (!query) return [];
    
    const queryLower = query.toLowerCase();
    return feeds.filter(feed => 
      feed.name.toLowerCase().includes(queryLower) ||
      (feed.description && feed.description.toLowerCase().includes(queryLower))
    );
  },

  /**
   * Get unique categories
   * @returns {Promise<Array>} Array of unique categories
   */
  async getCategories() {
    const categories = [...new Set(feeds.map(feed => feed.category))];
    return categories.filter(cat => cat); // Remove empty/null categories
  },

  /**
   * Reset feeds to original mock data (for testing)
   */
  reset() {
    feeds = [...mockFeeds.map(feed => ({ ...feed }))];
  },

  /**
   * Get current count (for debugging)
   */
  getCount() {
    return feeds.length;
  }
};

module.exports = feedsDao;