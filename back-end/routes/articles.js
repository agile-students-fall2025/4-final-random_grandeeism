const express = require('express');
const router = express.Router();
const { articlesDao, tagsDao } = require('../lib/daoFactory');
const { extractContent } = require('../utils/contentExtractor');
const { authenticateToken } = require('../middleware/auth');
const { validateArticle, validateTagAssignment, handleValidationErrors } = require('../middleware/validation');

/**
 * GET /api/articles
 * Retrieve all articles with optional filtering
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, tag, favorite, untagged, tags, sort } = req.query;
    const userId = req.user.id; // Get from authenticated user
    
    const filters = { userId };

    if (status) {
      filters.status = status;
    }

    if (tag) {
      // Support filtering by tag id or tag name
      const tagLower = String(tag).toLowerCase();
      const allTags = await tagsDao.getAll({ userId: req.user.id });
      const match = allTags.find(t => String(t.id) === String(tag) || String(t.name).toLowerCase() === tagLower);
      // Convert to string since tags are stored as strings in Article model
      filters.tag = match ? String(match.id) : String(tag);
    }

    if (tags) {
      filters.tags = { $in: tags.split(',') };
    }

    if (untagged === 'true') {
      filters.untagged = true;
    }

    if (favorite === 'true') {
      filters.isFavorite = true;
    }

    const sortOptions = {};
    if (sort === 'Date Added (Newest)') {
      sortOptions.createdAt = -1;
    } else if (sort === 'Date Added (Oldest)') {
      sortOptions.createdAt = 1;
    }

    const articles = await articlesDao.getAll(filters, sortOptions);

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
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const article = await articlesDao.getById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own articles'
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
 * Required fields:
 * - title: String (required)
 * - url: String (optional, but either url or content must be provided)
 * - content: String (optional, but either url or content must be provided)
 * 
 * Optional fields:
 * - author: String
 * - source: String
 * - status: String ('inbox', 'daily', 'continue', 'rediscovery', 'archived')
 * - isFavorite: Boolean
 * - tags: Array of tag IDs or names
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

router.post('/', authenticateToken, validateArticle, handleValidationErrors, async (req, res) => {
  try {
    let { title, url } = req.body;

    // Require both title and url for this error case (for test compatibility)
    if (!url && !title) {
      return res.status(400).json({
        success: false,
        error: 'Title and URL are required fields.'
      });
    }
    // If only url is missing
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required to create an article.'
      });
    }

    // If title is missing, attempt server-side extraction to populate metadata
    if (!title) {
      try {
        const extraction = await extractContent(url);
        if (extraction && extraction.success && extraction.data) {
          const ext = extraction.data;
          title = ext.title || title;

          // Merge useful extracted fields into request body if not provided
          req.body.content = req.body.content || ext.content || '';
          req.body.textContent = req.body.textContent || ext.textContent || '';
          req.body.author = req.body.author || ext.author || null;
          req.body.source = req.body.source || ext.source || null;
          req.body.wordCount = req.body.wordCount || ext.wordCount || 0;
          req.body.readingTime = req.body.readingTime || ext.readingTime || null;
          req.body.publishedDate = req.body.publishedDate || ext.publishedDate || null;
          req.body.description = req.body.description || ext.excerpt || '';
        }
      } catch (err) {
        console.warn('Extraction error while creating article:', err.message || err);
      }
    }

    // After extraction attempt, ensure we have a title
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title could not be determined. Provide a title or use the extract endpoint first.'
      });
    }

    // Set userId from authenticated user
    const userId = req.user.id;

    const toCreate = {
      ...req.body,
      title,
      url,
      userId,
      status: req.body.status || 'inbox',
      isFavorite: req.body.isFavorite || false,
      hasAnnotations: false,
      readProgress: 0,
      tags: req.body.tags || [] // Default to empty array if no tags provided
    };

    const newArticle = await articlesDao.create(toCreate);

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
 * Update an article
 */
router.put('/:id', authenticateToken, validateArticle, handleValidationErrors, async (req, res) => {
  try {
    const article = await articlesDao.getById(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only update your own articles'
      });
    }

    // Don't allow ID to be changed
    const { id, ...updates } = req.body;

    const updatedArticle = await articlesDao.update(req.params.id, updates);

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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const articleId = req.params.id;

    // First get the article to verify ownership
    const article = await articlesDao.getById(articleId);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only delete your own articles'
      });
    }

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
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const articleId = req.params.id;

    // First get the article to verify ownership
    const article = await articlesDao.getById(articleId);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only update your own articles'
      });
    }

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
router.patch('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    const articleId = req.params.id;

    // First get the article to verify ownership
    const article = await articlesDao.getById(articleId);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only update your own articles'
      });
    }

    // Use the DAO to properly persist the change
    const updatedArticle = await articlesDao.updateProgress(articleId, progress);
    
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
router.patch('/:id/favorite', authenticateToken, async (req, res) => {
  try {
    const { isFavorite } = req.body;
    const articleId = req.params.id;

    // First get the article to verify ownership
    const article = await articlesDao.getById(articleId);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only update your own articles'
      });
    }

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
 * PATCH /api/articles/:id/annotations
 * Update annotation flags (e.g., hasAnnotations)
 */
router.patch('/:id/annotations', authenticateToken, async (req, res) => {
  try {
    const { hasAnnotations } = req.body;
    const articleId = req.params.id;

    if (typeof hasAnnotations !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'hasAnnotations must be a boolean'
      });
    }

    const article = await articlesDao.getById(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only update your own articles'
      });
    }

    const updatedArticle = await articlesDao.updateAnnotations(articleId, { hasAnnotations });

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Annotations updated successfully'
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
router.post('/:id/tags', authenticateToken, validateTagAssignment, handleValidationErrors, async (req, res) => {
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

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only modify your own articles'
      });
    }

    // Verify tag exists using DAO
    const allTags = await tagsDao.getAll({ userId: req.user.id });
    const tag = allTags.find(t => String(t.id) === String(requestedTagId) || String(t.name).toLowerCase() === String(requestedTagId).toLowerCase());
    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    const tagId = tag.id;
    const existingTags = (article.tags || []).map(t => String(t).toLowerCase());

    if (existingTags.includes(String(tagId).toLowerCase())) {
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
router.delete('/:id/tags/:tagId', authenticateToken, async (req, res) => {
  try {
    // Get the current article using DAO
    const article = await articlesDao.getById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    // Verify article belongs to authenticated user
    if (article.userId !== req.user.id && article.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only modify your own articles'
      });
    }

    // Verify tag exists using DAO
    const allTags = await tagsDao.getAll({ userId: req.user.id });
    const tag = allTags.find(t => String(t.id) === String(req.params.tagId) || String(t.name).toLowerCase() === String(req.params.tagId).toLowerCase());
    if (!tag) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }

    const tagId = tag.id;
    const existingTags = (article.tags || []).map(t => String(t).toLowerCase());

    if (!existingTags.includes(String(tagId).toLowerCase())) {
      return res.status(404).json({ success: false, error: 'Tag not found on article' });
    }

    // Use DAO to update the article with tag removed
    const updatedTags = (article.tags || []).filter(t => String(t).toLowerCase() !== String(tagId).toLowerCase());
    const updatedArticle = await articlesDao.update(req.params.id, { tags: updatedTags });

    if (!updatedArticle) {
      return res.status(404).json({ success: false, error: 'Failed to update article' });
    }

    res.json({ success: true, data: updatedArticle, message: 'Tag removed from article successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
});

router.get('/tags', async (req, res) => {
  try {
    const tags = await Article.distinct('tags');
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

module.exports = router;
