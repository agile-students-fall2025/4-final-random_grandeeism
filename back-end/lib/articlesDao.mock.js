/**
 * Articles Mock DAO - Array-backed implementation
 * 
 * Purpose: Provides an in-memory implementation of the articles data access layer
 * using the mock data from data/mockArticles.js. This DAO maintains state in memory
 * and provides deterministic behavior for testing and development.
 */

const { mockArticles } = require('../data/mockArticles');

// In-memory storage - clone the mock data to avoid mutations
let articles = [...mockArticles.map(article => ({ ...article }))];

// Next numeric ID helper
let nextId = (articles.length ? Math.max(...articles.map(a => Number(a.id))) : 0) + 1;

/**
 * Generate a new ID for created articles
 */
const generateId = () => nextId++;

const articlesDao = {
  /**
   * Get all articles with optional filtering
   * @param {Object} filters - Query filters
   * @param {string} filters.status - Filter by status (inbox, daily, continue, rediscovery, archived)
   * @param {string} filters.tag - Filter by tag
   * @param {boolean} filters.isFavorite - Filter by favorite status
   * @param {boolean} filters.untagged - Filter for articles without tags
   * @returns {Promise<Array>} Array of articles
   */
  async getAll(filters = {}) {
    let filteredArticles = [...articles];

    // Status filter
    if (filters.status) {
      filteredArticles = filteredArticles.filter(article => article.status === filters.status);
    }

    // Tag filter
    if (filters.tag) {
      filteredArticles = filteredArticles.filter(article => 
        article.tags && article.tags.includes(filters.tag)
      );
    }

    // Favorite filter
    if (typeof filters.isFavorite === 'boolean') {
      filteredArticles = filteredArticles.filter(article => article.isFavorite === filters.isFavorite);
    }

    // Untagged filter
    if (filters.untagged === true) {
      filteredArticles = filteredArticles.filter(article => 
        !article.tags || article.tags.length === 0
      );
    }

    return filteredArticles;
  },

  /**
   * Get single article by ID
   * @param {string} id - Article ID
   * @returns {Promise<Object|null>} Article object or null if not found
   */
  async getById(id) {
  const article = articles.find(a => a.id == id);
    return article ? { ...article } : null;
  },

  /**
   * Create new article
   * @param {Object} articleData - Article data
   * @returns {Promise<Object>} Created article
   */
  async create(articleData) {
    const { detectMediaType, extractYouTubeVideoId } = require('../utils/youtubeUtils.js');
    
    const mediaType = articleData.mediaType || detectMediaType(articleData.url);
    const videoId = mediaType === 'video' ? extractYouTubeVideoId(articleData.url) : null;
    
    const newArticle = {
      id: generateId(),
      ...articleData,
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
      dateAdded: new Date(),
      hasAnnotations: false,
      readProgress: 0,
      content: articleData.content || '',
      mediaType,
      videoId
    };

    console.log('Created article with mediaType:', mediaType, 'videoId:', videoId);
    articles.push(newArticle);
    return { ...newArticle };
  },

  /**
   * Update article
   * @param {string} id - Article ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated article or null if not found
   */
  async update(id, updateData) {
    const index = articles.findIndex(a => a.id == id);
    if (index === -1) {
      return null;
    }

    articles[index] = {
      ...articles[index],
      ...updateData,
      id // Ensure ID doesn't change
    };

    return { ...articles[index] };
  },

  /**
   * Delete article
   * @param {string} id - Article ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
  const index = articles.findIndex(a => a.id == id);
    if (index === -1) {
      return false;
    }

    articles.splice(index, 1);
    return true;
  },

  /**
   * Get articles by status
   * @param {string} status - Status to filter by
   * @returns {Promise<Array>} Articles with the specified status
   */
  async getByStatus(status) {
    return articles.filter(article => article.status === status);
  },

  /**
   * Get articles by tag
   * @param {string} tag - Tag to filter by
   * @returns {Promise<Array>} Articles with the specified tag
   */
  async getByTag(tag) {
    return articles.filter(article => article.tags && article.tags.includes(tag));
  },

  /**
   * Get articles by feed ID
   * @param {string} feedId - Feed ID to filter by
   * @returns {Promise<Array>} Articles from the specified feed
   */
  async getByFeedId(feedId) {
  return articles.filter(article => article.feedId == feedId);
  },

  /**
   * Update article status
   * @param {string} id - Article ID
   * @param {string} status - New status
   * @returns {Promise<Object|null>} Updated article or null if not found
   */
  async updateStatus(id, status) {
    return this.update(id, { status });
  },

  /**
   * Update reading progress
   * @param {string} id - Article ID
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Promise<Object|null>} Updated article or null if not found
   */
  async updateProgress(id, progress) {
    return this.update(id, { readProgress: progress });
  },

  /**
   * Toggle favorite status
   * @param {string} id - Article ID
   * @param {boolean} isFavorite - Favorite status
   * @returns {Promise<Object|null>} Updated article or null if not found
   */
  async toggleFavorite(id, isFavorite) {
    return this.update(id, { isFavorite });
  },

  /**
   * Reset articles to original mock data (for testing)
   */
  reset() {
    articles = [...mockArticles.map(article => ({ ...article }))];
  },

  /**
   * Get current count (for debugging)
   */
  getCount() {
    return articles.length;
  },

  /**
   * Get all articles for internal usage (no filters applied)
   * Used by other DAOs for cross-referencing
   * @returns {Array} All articles in current state
   */
  getAllArticlesForInternalUse() {
    return [...articles];
  }
};

module.exports = articlesDao;