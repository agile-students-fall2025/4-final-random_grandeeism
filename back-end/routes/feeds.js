const express = require('express');
const router = express.Router();
const { mockFeeds } = require('../data/mockFeeds');
const { mockArticles } = require('../data/mockArticles');

/**
 * GET /api/feeds
 * Retrieve all feeds with optional filtering
 */
router.get('/', (req, res) => {
  try {
    const { category, status } = req.query;
    let filteredFeeds = [...mockFeeds];

    if (category) {
      filteredFeeds = filteredFeeds.filter(feed => 
        feed.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status) {
      filteredFeeds = filteredFeeds.filter(feed => feed.status === status);
    }

    res.json({
      success: true,
      count: filteredFeeds.length,
      data: filteredFeeds
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
router.get('/:id', (req, res) => {
  try {
    const feed = mockFeeds.find(f => f.id === req.params.id);
    
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
 * Create a new feed (mock - doesn't persist)
 */
router.post('/', (req, res) => {
  try {
    const newFeed = {
      id: `feed-${mockFeeds.length + 1}`,
      ...req.body,
      lastFetched: new Date(),
      lastUpdated: new Date(),
      status: 'success',
      errorMessage: null,
      createdAt: new Date()
    };

    // In a real implementation, this would save to database
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
 * Update a feed (mock - doesn't persist)
 */
router.put('/:id', (req, res) => {
  try {
    const feed = mockFeeds.find(f => f.id === req.params.id);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    const updatedFeed = {
      ...feed,
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      lastUpdated: new Date()
    };

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
router.delete('/:id', (req, res) => {
  try {
    const feed = mockFeeds.find(f => f.id === req.params.id);
    
    if (!feed) {
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
router.get('/:id/articles', (req, res) => {
  try {
    const feed = mockFeeds.find(f => f.id === req.params.id);
    
    if (!feed) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }

    // Get articles that belong to this feed
    const feedArticles = mockArticles.filter(article => article.feedId === req.params.id);

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
