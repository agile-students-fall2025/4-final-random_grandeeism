/**
 * API Service Layer for Fieldnotes Front-End
 * Handles all HTTP requests to the back-end API
 */

// Use relative URL in development to leverage Vite's proxy
// In production, this should be set to the actual backend URL
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'http://localhost:7001/api'  // Production URL
  : '/api';  // Development - uses Vite proxy

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Generic API request handler with automatic JWT token injection
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        
        // Handle validation errors (array format from express-validator)
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const errorMessages = errorData.errors.map(err => err.msg || err.message).join('. ');
          throw new Error(errorMessages);
        }
        
        // Handle single error message
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        
        // Fallback to status message
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Expected JSON response but received invalid content.');
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};

/**
 * Articles API
 */
export const articlesAPI = {
  /**
   * Get all articles with optional filters
   * @param {Object} filters - Query parameters (status, tag, favorite, untagged)
   * @returns {Promise} API response with articles
   */
  getAll: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    return apiRequest(`/articles?${query}`);
  },

  /**
   * Get single article by ID
   * @param {string} id - Article ID
   * @returns {Promise} API response with article
   */
  getById: async (id) => {
    return apiRequest(`/articles/${id}`);
  },

  /**
   * Create new article
   * @param {Object} article - Article data
   * @returns {Promise} API response with created article
   */
  create: async (article) => {
    return apiRequest('/articles', {
      method: 'POST',
      body: JSON.stringify(article),
    });
  },

  /**
   * Update article
   * @param {string} id - Article ID
   * @param {Object} updates - Article updates
   * @returns {Promise} API response with updated article
   */
  update: async (id, updates) => {
    return apiRequest(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete article
   * @param {string} id - Article ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    return apiRequest(`/articles/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update article status
   * @param {string} id - Article ID
   * @param {string} status - New status
   * @returns {Promise} API response
   */
  updateStatus: async (id, status) => {
    return apiRequest(`/articles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Update reading progress
   * @param {string} id - Article ID
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Promise} API response
   */
  updateProgress: async (id, progress) => {
    return apiRequest(`/articles/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
  },

  /**
   * Update annotation-related flags
   * @param {string} id - Article ID
   * @param {boolean} hasAnnotations - Whether article has annotations
   */
  updateAnnotations: async (id, hasAnnotations) => {
    return apiRequest(`/articles/${id}/annotations`, {
      method: 'PATCH',
      body: JSON.stringify({ hasAnnotations }),
    });
  },

  /**
   * Toggle favorite status
   * @param {string} id - Article ID
   * @param {boolean} isFavorite - Favorite status
   * @returns {Promise} API response
   */
  toggleFavorite: async (id, isFavorite) => {
    return apiRequest(`/articles/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ isFavorite }),
    });
  },

  /**
   * Add tag to article
   * @param {string} id - Article ID
   * @param {string} tagId - Tag ID to add
   * @returns {Promise} API response
   */
  addTag: async (id, tagId) => {
    return apiRequest(`/articles/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagId }),
    });
  },

  /**
   * Remove tag from article
   * @param {string} id - Article ID
   * @param {string} tagId - Tag ID to remove
   * @returns {Promise} API response
   */
  removeTag: async (id, tagId) => {
    return apiRequest(`/articles/${id}/tags/${tagId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Feeds API
 */
export const feedsAPI = {
  /**
   * Get all feeds with optional filters
   * @param {Object} filters - Query parameters (category, status)
   * @returns {Promise} API response with feeds
   */
  getAll: async (filters = {}) => {
    const query = new URLSearchParams(filters);
    return apiRequest(`/feeds?${query}`);
  },

  /**
   * Get single feed by ID
   * @param {string} id - Feed ID
   * @returns {Promise} API response with feed
   */
  getById: async (id) => {
    return apiRequest(`/feeds/${id}`);
  },

  /**
   * Create new feed
   * @param {Object} feed - Feed data
   * @returns {Promise} API response with created feed
   */
  create: async (feed) => {
    return apiRequest('/feeds', {
      method: 'POST',
      body: JSON.stringify(feed),
    });
  },

  /**
   * Update feed
   * @param {string} id - Feed ID
   * @param {Object} updates - Feed updates
   * @returns {Promise} API response with updated feed
   */
  update: async (id, updates) => {
    return apiRequest(`/feeds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete feed
   * @param {string} id - Feed ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    return apiRequest(`/feeds/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get articles from specific feed
   * @param {string} id - Feed ID
   * @returns {Promise} API response with articles
   */
  getArticles: async (id) => {
    return apiRequest(`/feeds/${id}/articles`);
  },

  /**
   * Pause a feed (stops auto-refresh)
   * @param {string} id - Feed ID
   * @returns {Promise} API response
   */
  pause: async (id) => {
    return apiRequest(`/feeds/${id}/pause`, {
      method: 'POST',
    });
  },

  /**
   * Resume a feed (starts auto-refresh)
   * @param {string} id - Feed ID
   * @param {number} intervalMinutes - Refresh interval in minutes
   * @returns {Promise} API response
   */
  resume: async (id, intervalMinutes = 60) => {
    return apiRequest(`/feeds/${id}/resume`, {
      method: 'POST',
      body: JSON.stringify({ intervalMinutes }),
    });
  },
};

/**
 * Tags API
 */
export const tagsAPI = {
  /**
   * Get all tags with optional sorting
   * @param {Object} options - Query parameters (sort: popular|alphabetical|recent)
   * @returns {Promise} API response with tags
   */
  getAll: async (options = {}) => {
    const query = new URLSearchParams(options);
    return apiRequest(`/tags?${query}`);
  },

  /**
   * Get single tag by ID
   * @param {string} id - Tag ID
   * @returns {Promise} API response with tag
   */
  getById: async (id) => {
    return apiRequest(`/tags/${id}`);
  },

  /**
   * Create new tag
   * @param {Object} tag - Tag data
   * @returns {Promise} API response with created tag
   */
  create: async (tag) => {
    return apiRequest('/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    });
  },

  /**
   * Update tag
   * @param {string} id - Tag ID
   * @param {Object} updates - Tag updates
   * @returns {Promise} API response with updated tag
   */
  update: async (id, updates) => {
    return apiRequest(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete tag
   * @param {string} id - Tag ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    return apiRequest(`/tags/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get articles with specific tag
   * @param {string} id - Tag ID
   * @returns {Promise} API response with articles
   */
  getArticles: async (id) => {
    return apiRequest(`/tags/${id}/articles`);
  },
};

/**
 * Highlights API
 */
export const highlightsAPI = {
  /**
   * Get all highlights
   * @returns {Promise} API response with highlights
   */
  getAll: async () => {
    return apiRequest('/highlights');
  },

  /**
   * Get highlights for specific article
   * @param {string} articleId - Article ID
   * @returns {Promise} API response with highlights
   */
  getByArticle: async (articleId) => {
    return apiRequest(`/highlights/article/${articleId}`);
  },

  /**
   * Create new highlight
   * @param {Object} highlight - Highlight data
   * @returns {Promise} API response with created highlight
   */
  create: async (highlight) => {
    return apiRequest('/highlights', {
      method: 'POST',
      body: JSON.stringify(highlight),
    });
  },

  /**
   * Update highlight
   * @param {string} id - Highlight ID
   * @param {Object} updates - Highlight updates
   * @returns {Promise} API response with updated highlight
   */
  update: async (id, updates) => {
    return apiRequest(`/highlights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete highlight
   * @param {string} id - Highlight ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    return apiRequest(`/highlights/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Users API
 */
export const usersAPI = {
  /**
   * Get user profile
   * @param {string} id - User ID
   * @returns {Promise} API response with user profile
   */
  getProfile: async (id) => {
    return apiRequest(`/users/profile/${id}`);
  },

  /**
   * Update user profile
   * @param {string} id - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise} API response with updated profile
   */
  updateProfile: async (id, updates) => {
    return apiRequest(`/users/profile/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Change password
   * @param {string} id - User ID
   * @param {Object} passwordData - Old and new password
   * @returns {Promise} API response
   */
  changePassword: async (id, passwordData) => {
    return apiRequest(`/users/password/${id}`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  /**
   * Delete user account
   * @param {string} id - User ID
   * @returns {Promise} API response
   */
  deleteAccount: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get reading statistics
   * @param {string} id - User ID
   * @returns {Promise} API response with reading stats
   */
  getStats: async (id) => {
    return apiRequest(`/users/stats/${id}`);
  },
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} API response with JWT token
   */
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login user
   * @param {Object} credentials - Email and password
   * @returns {Promise} API response with JWT token
   */
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise} API response with token validity
   */
  verify: async (token) => {
    return apiRequest('/auth/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Refresh JWT token
   * @param {string} token - Current JWT token
   * @returns {Promise} API response with new token
   */
  refresh: async (token) => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  /**
   * Logout user
   * @param {string} token - JWT token
   * @returns {Promise} API response
   */
  logout: async (token) => {
    return apiRequest('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

/**
 * Utility function to handle API errors consistently
 * @param {Error} error - Error from API request
 * @param {string} context - Context where error occurred
 */
export const handleAPIError = (error, context = '') => {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  
  // You can customize error handling here
  // For example, show toast notifications, redirect to login, etc.
  
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
  };
};

/**
 * Check if API is available
 * @returns {Promise} API health check response
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return await response.json();
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};

/**
 * Extract API
 */
export const extractAPI = {
  extract: async (url) => {
    return apiRequest('/extract', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }
};

/**
 * Stacks API
 */
export const stacksAPI = {
  /**
   * Get all stacks
   * @returns {Promise} API response with stacks
   */
  getAll: async () => {
    return apiRequest('/stacks');
  },

  /**
   * Create new stack
   * @param {Object} stack - Stack data
   * @returns {Promise} API response with created stack
   */
  create: async (stack) => {
    return apiRequest('/stacks', {
      method: 'POST',
      body: JSON.stringify(stack),
    });
  },

  /**
   * Delete stack
   * @param {string} id - Stack ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    return apiRequest(`/stacks/${id}`, {
      method: 'DELETE',
    });
  },
};