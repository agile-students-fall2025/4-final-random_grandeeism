/**
 * Highlights Mock DAO - Array-backed implementation
 * 
 * Purpose: Provides an in-memory implementation of the highlights data access layer
 * using the mock data from data/mockHighlights.js. This DAO maintains state in memory
 * and provides deterministic behavior for testing and development.
 */

const { mockHighlights } = require('../data/mockHighlights');

// In-memory storage - clone the mock data to avoid mutations
let highlights = [...mockHighlights.map(highlight => ({ ...highlight }))];

// Next numeric ID helper
let nextId = (highlights.length ? Math.max(...highlights.map(h => Number(h.id))) : 0) + 1;

/**
 * Generate a new ID for created highlights
 */
const generateId = () => nextId++;

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
    let filteredHighlights = [...highlights];

    // Article ID filter
    if (filters.articleId) {
      filteredHighlights = filteredHighlights.filter(highlight => highlight.articleId == filters.articleId);
    }

    // User ID filter
    if (filters.userId) {
      filteredHighlights = filteredHighlights.filter(highlight => highlight.userId == filters.userId);
    }

    // Color filter
    if (filters.color) {
      filteredHighlights = filteredHighlights.filter(highlight => highlight.color === filters.color);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredHighlights = filteredHighlights.filter(highlight => 
        highlight.text.toLowerCase().includes(searchLower) ||
        (highlight.annotations?.note && highlight.annotations.note.toLowerCase().includes(searchLower))
      );
    }

    return filteredHighlights;
  },

  /**
   * Get single highlight by ID
   * @param {string} id - Highlight ID
   * @returns {Promise<Object|null>} Highlight object or null if not found
   */
  async getById(id) {
  const highlight = highlights.find(h => h.id == id);
    return highlight ? { ...highlight } : null;
  },

  /**
   * Create new highlight
   * @param {Object} highlightData - Highlight data
   * @returns {Promise<Object>} Created highlight
   */
  async create(highlightData) {
    const newHighlight = {
      id: generateId(),
      articleId: highlightData.articleId,
      userId: highlightData.userId || 'user-1', // Default user for mock
      text: highlightData.text,
      annotations: highlightData.annotations || { title: '', note: '' },
      color: (highlightData.color ? highlightData.color.trim() : null) || '#fef08a',
      position: {
        start: highlightData.position?.start || 0,
        end: highlightData.position?.end || 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    highlights.push(newHighlight);
    return { ...newHighlight };
  },

  /**
   * Update highlight
   * @param {string} id - Highlight ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated highlight or null if not found
   */
  async update(id, updateData) {
  const index = highlights.findIndex(h => h.id == id);
    if (index === -1) {
      return null;
    }

    // Handle nested annotations update properly
    const updatedHighlight = {
      ...highlights[index],
      ...updateData,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    // If annotations is being updated, merge it properly
    if (updateData.annotations && highlights[index].annotations) {
      updatedHighlight.annotations = {
        ...highlights[index].annotations,
        ...updateData.annotations
      };
    }

    highlights[index] = updatedHighlight;
    return { ...highlights[index] };
  },

  /**
   * Delete highlight
   * @param {string} id - Highlight ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
  const index = highlights.findIndex(h => h.id == id);
    if (index === -1) {
      return false;
    }

    highlights.splice(index, 1);
    return true;
  },

  /**
   * Get highlights by article ID
   * @param {string} articleId - Article ID to filter by
   * @returns {Promise<Array>} Highlights for the specified article
   */
  async getByArticleId(articleId) {
  return highlights.filter(highlight => highlight.articleId == articleId);
  },

  /**
   * Get highlights by user ID
   * @param {string} userId - User ID to filter by
   * @returns {Promise<Array>} Highlights for the specified user
   */
  async getByUserId(userId) {
  return highlights.filter(highlight => highlight.userId == userId);
  },

  /**
   * Get highlights by color
   * @param {string} color - Color to filter by
   * @returns {Promise<Array>} Highlights with the specified color
   */
  async getByColor(color) {
    return highlights.filter(highlight => highlight.color === color);
  },

  /**
   * Update highlight note
   * @param {string} id - Highlight ID
   * @param {string} note - New note text
   * @returns {Promise<Object|null>} Updated highlight or null if not found
   */
  async updateNote(id, note) {
    return this.update(id, { note });
  },

  /**
   * Update highlight color
   * @param {string} id - Highlight ID
   * @param {string} color - New color
   * @returns {Promise<Object|null>} Updated highlight or null if not found
   */
  async updateColor(id, color) {
    return this.update(id, { color: color.trim() });
  },

  /**
   * Search highlights by text or note
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching highlights
   */
  async search(query) {
    if (!query) return [];
    
    const queryLower = query.toLowerCase();
    return highlights.filter(highlight => 
      highlight.text.toLowerCase().includes(queryLower) ||
      (highlight.annotations?.note && highlight.annotations.note.toLowerCase().includes(queryLower))
    );
  },

  /**
   * Get highlights with notes
   * @returns {Promise<Array>} Highlights that have notes
   */
  async getWithNotes() {
    return highlights.filter(highlight => highlight.annotations?.note && highlight.annotations.note.trim().length > 0);
  },

  /**
   * Get highlights without notes
   * @returns {Promise<Array>} Highlights that don't have notes
   */
  async getWithoutNotes() {
    return highlights.filter(highlight => !highlight.annotations?.note || highlight.annotations.note.trim().length === 0);
  },

  /**
   * Get unique colors used in highlights
   * @returns {Promise<Array>} Array of unique colors
   */
  async getColors() {
    const colors = [...new Set(highlights.map(highlight => highlight.color))];
    return colors.filter(color => color); // Remove empty/null colors
  },

  /**
   * Delete all highlights for an article
   * @param {string} articleId - Article ID
   * @returns {Promise<number>} Number of highlights deleted
   */
  async deleteByArticleId(articleId) {
    const initialLength = highlights.length;
    highlights = highlights.filter(highlight => highlight.articleId !== articleId);
    return initialLength - highlights.length;
  },

  /**
   * Delete all highlights for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of highlights deleted
   */
  async deleteByUserId(userId) {
    const initialLength = highlights.length;
    highlights = highlights.filter(highlight => highlight.userId !== userId);
    return initialLength - highlights.length;
  },

  /**
   * Get recent highlights for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of highlights to return
   * @returns {Promise<Array>} Recent highlights sorted by creation date (descending)
   */
  async getRecentByUserId(userId, limit = 10) {
    const userHighlights = highlights.filter(highlight => highlight.userId === userId);
    return userHighlights
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  /**
   * Reset highlights to original mock data (for testing)
   */
  reset() {
    highlights = [...mockHighlights.map(highlight => ({ ...highlight }))];
  },

  /**
   * Get current count (for debugging)
   */
  getCount() {
    return highlights.length;
  }
};

module.exports = highlightsDao;