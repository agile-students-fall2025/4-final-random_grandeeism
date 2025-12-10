const express = require('express');
const router = express.Router();
const { feedsDao, articlesDao } = require('../lib/daoFactory');
const rssService = require('../services/rssService');
const { authenticateToken } = require('../middleware/auth');
const { validateFeed, handleValidationErrors } = require('../middleware/validation');

/**
 * GET /api/feeds
 * Retrieve all feeds with optional filtering
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, status } = req.query;
    const userId = req.user.id; // Get from authenticated user
    
    
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
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    
    
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
 * Create a new feed and automatically extract articles
 */
router.post('/', authenticateToken, validateFeed, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    
    
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

    // Automatically extract articles from the new feed
    let extractionResult = null;
    try {
      console.log(`🔄 Auto-extracting articles from new feed: ${newFeed.id}`);
      extractionResult = await rssService.extractFromFeed(newFeed.id, userId);
      console.log(`✅ Extracted ${extractionResult.count || 0} articles from feed: ${newFeed.name}`);
      
      // Update feed name with the actual feed title from RSS if available
      if (extractionResult.success && extractionResult.feedTitle && extractionResult.feedTitle !== newFeed.name) {
        console.log(`📝 Updating feed name from "${newFeed.name}" to "${extractionResult.feedTitle}"`);
        const updatedFeed = await feedsDao.update(newFeed.id, { name: extractionResult.feedTitle }, userId);
        if (updatedFeed) {
          newFeed.name = extractionResult.feedTitle;
        }
      }
    } catch (extractError) {
      console.error('Error extracting articles from new feed:', extractError);
      extractionResult = { 
        success: false, 
        message: 'Feed created but article extraction failed', 
        error: extractError.message 
      };
    }

    res.status(201).json({
      success: true,
      data: newFeed,
      extraction: extractionResult,
      message: extractionResult?.success 
        ? `Feed created successfully with ${extractionResult.count || 0} articles extracted`
        : 'Feed created successfully but article extraction failed'
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
router.put('/:id', authenticateToken, validateFeed, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    
    
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    
    
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
router.get('/:id/articles', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    
    
    
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

/**
 * POST /api/feeds/:id/extract
 * Extract articles from an RSS feed
 */
router.post('/:id/extract', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const result = await rssService.extractFromFeed(req.params.id, userId);
    
    if (!result.success) {
      const status = result.paused ? 200 : 400;
      return res.status(status).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/feeds/extract/all
 * Extract articles from all active feeds
 */
router.post('/extract/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const result = await rssService.extractFromAllFeeds(userId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/feeds/:id/pause
 * Pause a feed (stops auto-refresh)
 */
router.post('/:id/pause', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const result = await rssService.pauseFeed(req.params.id, userId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/feeds/:id/resume
 * Resume a paused feed (starts auto-refresh)
 */
router.post('/:id/resume', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const { intervalMinutes = 60 } = req.body;
    
    const result = await rssService.resumeFeed(req.params.id, userId, intervalMinutes);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * POST /api/feeds/:id/auto-refresh/start
 * Start automatic refresh for a feed
 */
router.post('/:id/auto-refresh/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const { intervalMinutes = 60 } = req.body;
    
    rssService.startAutoRefresh(req.params.id, userId, intervalMinutes);
    
    res.json({
      success: true,
      message: `Auto-refresh started for feed ${req.params.id}`,
      intervalMinutes
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
 * POST /api/feeds/:id/auto-refresh/stop
 * Stop automatic refresh for a feed
 */
router.post('/:id/auto-refresh/stop', authenticateToken, async (req, res) => {
  try {
    rssService.stopAutoRefresh(req.params.id);
    
    res.json({
      success: true,
      message: `Auto-refresh stopped for feed ${req.params.id}`
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
 * GET /api/feeds/auto-refresh/status
 * Get status of all auto-refresh jobs
 */
router.get('/auto-refresh/status', authenticateToken, async (req, res) => {
  try {
    const status = rssService.getAutoRefreshStatus();
    
    res.json({
      success: true,
      jobs: status
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
