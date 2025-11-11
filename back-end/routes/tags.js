const express = require('express');
const router = express.Router();
const { mockTags } = require('../data/mockTags');
const { mockArticles } = require('../data/mockArticles');

/**
 * GET /api/tags
 * Retrieve all tags with optional filtering
 */
router.get('/', (req, res) => {
  try {
    const { sort } = req.query;
    let tags = [...mockTags];

    // Sort by article count, name, or most recent
    if (sort === 'popular') {
      tags.sort((a, b) => b.articleCount - a.articleCount);
    } else if (sort === 'alphabetical') {
      tags.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'recent') {
      tags.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
    }

    res.json({
      success: true,
      count: tags.length,
      data: tags
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
 * GET /api/tags/:id
 * Retrieve a single tag by ID
 */
router.get('/:id', (req, res) => {
  try {
    const tag = mockTags.find(t => t.id === req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
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
 * POST /api/tags
 * Create a new tag (mock - doesn't persist)
 */
router.post('/', (req, res) => {
  try {
    const { name, color, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Tag name is required'
      });
    }

    // Check if tag already exists
    const existingTag = mockTags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existingTag) {
      return res.status(409).json({
        success: false,
        error: 'Tag already exists',
        data: existingTag
      });
    }

    const newTag = {
      id: `tag-${mockTags.length + 1}`,
      name: name.toLowerCase(),
      color: color || '#6b7280',
      description: description || '',
      articleCount: 0,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    res.status(201).json({
      success: true,
      data: newTag,
      message: 'Tag created successfully'
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
 * PUT /api/tags/:id
 * Update a tag (mock - doesn't persist)
 */
router.put('/:id', (req, res) => {
  try {
    const tag = mockTags.find(t => t.id === req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    const updatedTag = {
      ...tag,
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: updatedTag,
      message: 'Tag updated successfully'
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
 * DELETE /api/tags/:id
 * Delete a tag (mock - doesn't persist)
 */
router.delete('/:id', (req, res) => {
  try {
    const tag = mockTags.find(t => t.id === req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    res.json({
      success: true,
      message: 'Tag deleted successfully',
      data: { id: req.params.id }
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
 * GET /api/tags/:id/articles
 * Get all articles with a specific tag
 */
router.get('/:id/articles', (req, res) => {
  try {
    const tag = mockTags.find(t => t.id === req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Find articles that have this tag (prefer ID matching, fall back to case-insensitive name match)
    const taggedArticles = mockArticles.filter(article => {
      if (!article.tags) return false;
      // Direct ID match
      if (article.tags.includes(tag.id)) return true;
      // Case-insensitive name match for backwards compatibility
      return article.tags.map(t => String(t).toLowerCase()).includes(String(tag.name).toLowerCase());
    });

    res.json({
      success: true,
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color
      },
      count: taggedArticles.length,
      data: taggedArticles
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
