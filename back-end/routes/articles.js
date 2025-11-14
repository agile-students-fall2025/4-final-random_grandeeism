const express = require('express');
const router = express.Router();
const { articlesDao } = require('../lib/daoFactory');
const { mockArticles } = require('../data/mockArticles');
const { mockTags } = require('../data/mockTags');

/**
 * GET /api/articles
 * Retrieve all articles with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { status, tag, favorite, untagged } = req.query;
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    const filters = { userId };

    if (status) {
      filters.status = status;
    }

    if (tag) {
      filters.tag = tag;
    }

    if (untagged === 'true') {
      filters.untagged = true;
    }

    if (favorite === 'true') {
      filters.isFavorite = true;
    }

    const articles = await articlesDao.getAll(filters);

    res.json({
      success: true,
      count: articles.length,
      data: articles
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
 * GET /api/articles/:id
 * Retrieve a single article by ID
 */
router.get('/:id', (req, res) => {
  try {
    const article = mockArticles.find(a => a.id === req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: article
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
 * POST /api/articles
 * Create a new article (mock - doesn't persist)
 * 
 * TODO (Future Enhancement - Sprint 3+):
 * ============================================
 * Add content extraction if only URL is provided:
 * 
 * Installation needed:
 *   npm install @mozilla/readability jsdom axios
 * 
 * Implementation:
 *   const { Readability } = require('@mozilla/readability');
 *   const { JSDOM } = require('jsdom');
 *   const axios = require('axios');
 * 
 * Logic to add:
 *   if (req.body.url && !req.body.title) {
 *     // 1. Fetch webpage with axios
 *     const response = await axios.get(req.body.url);
 *     
 *     // 2. Parse HTML with JSDOM
 *     const dom = new JSDOM(response.data, { url: req.body.url });
 *     
 *     // 3. Extract content with Readability
 *     const reader = new Readability(dom.window.document);
 *     const article = reader.parse();
 *     
 *     // 4. Auto-populate fields
 *     req.body.title = article.title;
 *     req.body.content = article.textContent;
 *     req.body.author = article.byline || 'Unknown';
 *     req.body.readingTime = calculateReadingTime(article.textContent);
 *   }
 * 
 * Reference: See routes/extract.js for standalone extraction endpoint example
 * ============================================
 */

router.post('/', (req, res) => {
  try {
    const { title, url } = req.body;

    // Validation: Check if required fields are present
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        error: 'Title and URL are required fields.'
      });
    }

    const newArticle = {
      id: String(mockArticles.length + 1),
      ...req.body,
      dateAdded: new Date(),
      status: req.body.status || 'inbox',
      isFavorite: false,
      hasAnnotations: false,
      readProgress: 0,
      tags: req.body.tags || [] // Default to empty array if no tags provided
    };

    // In a real implementation, this would save to a database
    res.status(201).json({
      success: true,
      data: newArticle,
      message: 'Article created successfully'
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
 * PUT /api/articles/:id
 * Update an article (mock - doesn't persist)
 */
router.put('/:id', (req, res) => {
  try {
    const article = mockArticles.find(a => a.id === req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const updatedArticle = {
      ...article,
      ...req.body,
      id: req.params.id // Ensure ID doesn't change
    };

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Article updated successfully'
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
 * DELETE /api/articles/:id
 * Delete an article
 */
router.delete('/:id', async (req, res) => {
  try {
    const articleId = req.params.id;

    // Use the DAO to properly delete the article
    const deleted = await articlesDao.delete(articleId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      message: 'Article deleted successfully'
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
 * PATCH /api/articles/:id/status
 * Update article status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const articleId = req.params.id;

    // Use the DAO to properly persist the change
    const updatedArticle = await articlesDao.updateStatus(articleId, status);
    
    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Set default readProgress when changing to 'continue' status
    if (status === 'continue' && updatedArticle.readProgress === undefined) {
      const finalArticle = await articlesDao.updateProgress(articleId, 0);
      res.json({
        success: true,
        data: finalArticle,
        message: 'Article status updated successfully'
      });
    } else {
      res.json({
        success: true,
        data: updatedArticle,
        message: 'Article status updated successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
});

/**
 * PATCH /api/articles/:id/progress
 * Update reading progress
 */
router.patch('/:id/progress', async (req, res) => {
  try {
    const { readProgress } = req.body;
    const articleId = req.params.id;

    // Use the DAO to properly persist the change
    const updatedArticle = await articlesDao.updateProgress(articleId, readProgress);
    
    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Reading progress updated successfully'
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
 * PATCH /api/articles/:id/favorite
 * Toggle favorite status
 */
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { isFavorite } = req.body;
    const articleId = req.params.id;

    // Use the DAO to properly persist the change
    const updatedArticle = await articlesDao.toggleFavorite(articleId, isFavorite);
    
    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Favorite status updated successfully'
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
 * POST /api/articles/:id/tags
 * Add a tag to an article by tag ID
 */
router.post('/:id/tags', async (req, res) => {
  try {
    const { tagId: requestedTagId } = req.body;
    if (!requestedTagId) {
      return res.status(400).json({ success: false, error: 'tagId is required' });
    }

    // Get the current article using DAO
    const article = await articlesDao.getById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    // Verify tag exists
    const tag = mockTags.find(t => t.id === requestedTagId);
    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    const tagId = tag.id;
    const existingTags = (article.tags || []).map(t => String(t).toLowerCase());

    if (existingTags.includes(tagId.toLowerCase())) {
      return res.status(409).json({ success: false, error: 'Tag already on article' });
    }

    // Use DAO to update the article with new tags
    const updatedTags = [...(article.tags || []), tagId];
    const updatedArticle = await articlesDao.update(req.params.id, { tags: updatedTags });

    if (!updatedArticle) {
      return res.status(404).json({ success: false, error: 'Failed to update article' });
    }

    res.json({ success: true, data: updatedArticle, message: 'Tag added to article successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
});

/**
 * DELETE /api/articles/:id/tags/:tagId
 * Remove a tag from an article by tag ID
 */
router.delete('/:id/tags/:tagId', async (req, res) => {
  try {
    // Get the current article using DAO
    const article = await articlesDao.getById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    // Verify tag exists
    const tag = mockTags.find(t => t.id === req.params.tagId);
    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    const tagId = tag.id;
    const existingTags = (article.tags || []).map(t => String(t).toLowerCase());

    if (!existingTags.includes(tagId.toLowerCase())) {
      return res.status(404).json({ success: false, error: 'Tag not found on article' });
    }

    // Use DAO to update the article with tag removed
    const updatedTags = (article.tags || []).filter(t => String(t).toLowerCase() !== tagId.toLowerCase());
    const updatedArticle = await articlesDao.update(req.params.id, { tags: updatedTags });

    if (!updatedArticle) {
      return res.status(404).json({ success: false, error: 'Failed to update article' });
    }

    res.json({ success: true, data: updatedArticle, message: 'Tag removed from article successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
});

module.exports = router;
