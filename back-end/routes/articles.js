const express = require('express');
const router = express.Router();
const { mockArticles } = require('../data/mockArticles');

/**
 * GET /api/articles
 * Retrieve all articles with optional filtering
 */
router.get('/', (req, res) => {
  try {
    // Optional: Add filtering support
    const { status, tag, favorite, untagged } = req.query;
    let filteredArticles = [...mockArticles];

    if (status) {
      filteredArticles = filteredArticles.filter(article => article.status === status);
    }

    if (tag) {
      filteredArticles = filteredArticles.filter(article => 
        article.tags && article.tags.includes(tag)
      );
    }

    if (untagged === 'true') {
      filteredArticles = filteredArticles.filter(article => 
        !article.tags || article.tags.length === 0
      );
    }

    if (favorite === 'true') {
      filteredArticles = filteredArticles.filter(article => article.isFavorite === true);
    }

    res.json({
      success: true,
      count: filteredArticles.length,
      data: filteredArticles
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
    // TODO: Add content extraction logic here (see comment above)
    
    const newArticle = {
      id: String(mockArticles.length + 1),
      ...req.body,
      dateAdded: new Date(),
      status: req.body.status || 'inbox',
      isFavorite: false,
      hasAnnotations: false,
      readProgress: 0,
      tags: req.body.tags || []  // Default to empty array if no tags provided
    };

    // In a real implementation, this would save to database
    // For now, we just return the created article
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
 * Delete an article (mock - doesn't persist)
 */
router.delete('/:id', (req, res) => {
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
router.patch('/:id/status', (req, res) => {
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
      status: req.body.status
    };

    res.json({
      success: true,
      data: updatedArticle,
      message: 'Article status updated successfully'
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
 * PATCH /api/articles/:id/progress
 * Update reading progress
 */
router.patch('/:id/progress', (req, res) => {
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
      readProgress: req.body.progress
    };

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
router.patch('/:id/favorite', (req, res) => {
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
      isFavorite: req.body.isFavorite
    };

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

module.exports = router;
