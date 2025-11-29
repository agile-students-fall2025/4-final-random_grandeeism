/**
 * DAO Factory - Environment-based Data Access Object Factory
 * 
 * Purpose: Provides a consistent interface for data access that can switch
 * between mock data (for development/testing) and MongoDB (for production)
 * based on the USE_MOCK_DB environment variable.
 * 
 * Usage:
 *   const { articlesDao, feedsDao, tagsDao, usersDao, highlightsDao } = require('./daoFactory');
 *   
 * Environment Variables:
 *   USE_MOCK_DB=true  -> Uses mock data from data/ folder
 *   USE_MOCK_DB=false -> Uses MongoDB with Mongoose (DEFAULT)
 * 
 * Default Behavior:
 *   - Defaults to MongoDB (production mode)
 *   - Set USE_MOCK_DB=true explicitly to use mock data for testing
 */

const useMockDB = process.env.USE_MOCK_DB === 'true'; // Default to MongoDB unless explicitly set to true

let articlesDao, feedsDao, tagsDao, usersDao, highlightsDao;

if (useMockDB) {
  // Load mock DAOs
  console.log('🔧 Using Mock DAOs (USE_MOCK_DB=true)');
  const mockArticlesDao = require('./articlesDao.mock');
  const mockFeedsDao = require('./feedsDao.mock');
  const mockTagsDao = require('./tagsDao.mock');
  const mockUsersDao = require('./usersDao.mock');
  const mockHighlightsDao = require('./highlightsDao.mock');

  articlesDao = mockArticlesDao;
  feedsDao = mockFeedsDao;
  tagsDao = mockTagsDao;
  usersDao = mockUsersDao;
  highlightsDao = mockHighlightsDao;
} else {
  // Load MongoDB/Mongoose DAOs
  console.log('🗄️  Using MongoDB DAOs (USE_MOCK_DB=false)');
  const mongoArticlesDao = require('./articlesDao.mongo');
  const mongoFeedsDao = require('./feedsDao.mongo');
  const mongoTagsDao = require('./tagsDao.mongo');
  const mongoUsersDao = require('./usersDao.mongo');
  const mongoHighlightsDao = require('./highlightsDao.mongo');

  articlesDao = mongoArticlesDao;
  feedsDao = mongoFeedsDao;
  tagsDao = mongoTagsDao;
  usersDao = mongoUsersDao;
  highlightsDao = mongoHighlightsDao;
}

/**
 * Common DAO Interface
 * 
 * Each DAO should implement these methods:
 * - getAll(filters = {}) -> Promise<Array>
 * - getById(id) -> Promise<Object|null>
 * - create(data) -> Promise<Object>
 * - update(id, data) -> Promise<Object|null>
 * - delete(id) -> Promise<boolean>
 * - reset() -> void (for testing, mock only)
 * 
 * Entity-specific methods:
 * - articlesDao.getByStatus(status), getByTag(tag), etc.
 * - feedsDao.getArticlesByFeedId(feedId)
 * - tagsDao.getArticlesByTagId(tagId)
 * - usersDao.getByEmail(email), hashPassword(password), etc.
 * - highlightsDao.getByArticleId(articleId)
 */

module.exports = {
  articlesDao,
  feedsDao,
  tagsDao,
  usersDao,
  highlightsDao,
  
  // Utility functions
  isUsingMockDB: () => useMockDB,
  
  // Test helper to reset mock data (only works with mock DAOs)
  resetMockData: () => {
    if (useMockDB) {
      console.log('🔄 Resetting mock data for testing');
      articlesDao.reset && articlesDao.reset();
      feedsDao.reset && feedsDao.reset();
      tagsDao.reset && tagsDao.reset();
      usersDao.reset && usersDao.reset();
      highlightsDao.reset && highlightsDao.reset();
    } else {
      console.warn('⚠️  Cannot reset data when using MongoDB DAOs');
    }
  }
};