const express = require('express');
const router = express.Router();
const { feedsDao, articlesDao } = require('../lib/daoFactory');

/**
 * GET /api/feeds
 * Retrieve all feeds with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    const filters = { userId };

    if (category) {
      filters.category = category;
    }

    if (status === 'active') {
      filters.isActive = true;
    } else if (status === 'inactive') {
      filters.isActive = false;
    }

    const feeds = await feedsDao.getAll(filters);

    res.json({
      success: true,
      count: feeds.length,
      data: feeds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * GET /api/feeds/:id
 * Retrieve a single feed by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    const feed = await feedsDao.getById(req.params.id, userId);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    res.json({
      success: true,
      data: feed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/feeds
 * Create a new feed
 */
router.post('/', async (req, res) => {
  try {
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    const feedData = {
      ...req.body,
      userId,
      status: 'success',
      lastFetched: new Date(),
      lastUpdated: new Date(),
      addedDate: new Date(),
      createdAt: new Date()
    };

    const newFeed = await feedsDao.create(feedData);

    res.status(201).json({
      success: true,
      data: newFeed,
      message: 'Feed created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * PUT /api/feeds/:id
 * Update a feed
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    const updatedFeed = await feedsDao.update(req.params.id, {
      ...req.body,
      lastUpdated: new Date()
    }, userId);
    
    if (!updatedFeed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    res.json({
      success: true,
      data: updatedFeed,
      message: 'Feed updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * DELETE /api/feeds/:id
 * Delete a feed (mock - doesn't persist)
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    const deleted = await feedsDao.delete(req.params.id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    res.json({
      success: true,
      message: 'Feed deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * GET /api/feeds/:id/articles
 * Get all articles from a specific feed
 */
router.get('/:id/articles', async (req, res) => {
  try {
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    
    const feed = await feedsDao.getById(req.params.id, userId);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    // Get articles that belong to this feed
    const feedArticles = await articlesDao.getByFeedId(req.params.id, userId);

    res.json({
      success: true,
      feed: {
        id: feed.id,
        name: feed.name,
        category: feed.category
      },
      count: feedArticles.length,
      data: feedArticles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

module.exports = router;
