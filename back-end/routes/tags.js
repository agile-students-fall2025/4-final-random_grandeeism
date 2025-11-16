const express = require('express');
const router = express.Router();
const { tagsDao, articlesDao } = require('../lib/daoFactory');

/**
 * GET /api/tags
 * Retrieve all tags with optional filtering and sorting
 * Article counts are dynamically calculated by the DAO
 */
router.get('/', async (req, res) => {
  try {
    const { sort, search, category } = req.query;
    
    // Get all tags with filters (DAO calculates articleCount automatically)
    let tags = await tagsDao.getAll({ search, category });

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
router.get('/:id', async (req, res) => {
  try {
    const tag = await tagsDao.getById(req.params.id);
    
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
 * Create a new tag (idempotent - returns existing tag if already exists)
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tag name is required' 
      });
    }

    // Check if tag already exists
    const normalizedName = name.toLowerCase();
    const existingTag = await tagsDao.getByName(normalizedName);
    
    if (existingTag) {
      // Return existing tag instead of error (idempotent behavior)
      return res.status(200).json({ 
        success: true, 
        data: existingTag, 
        message: 'Tag already exists',
        alreadyExists: true
      });
    }

    // Create the tag
    const newTag = await tagsDao.create({
      name: normalizedName,
      description: description || '',
      category: req.body.category,
      color: req.body.color
    });

    res.status(201).json({ 
      success: true, 
      data: newTag, 
      message: 'Tag created successfully' 
    });
  } catch (error) {
    // Handle duplicate tag error from DAO (shouldn't happen now with pre-check)
    if (error.message && error.message.includes('already exists')) {
      // Try to fetch and return the existing tag
      try {
        const existingTag = await tagsDao.getByName(req.body.name.toLowerCase());
        if (existingTag) {
          return res.status(200).json({ 
            success: true, 
            data: existingTag, 
            message: 'Tag already exists',
            alreadyExists: true
          });
        }
      } catch (fetchError) {
        // If we can't fetch it, return the original error
      }
      
      return res.status(409).json({ 
        success: false, 
        error: error.message
      });
    }
    
    // Handle other server errors
    res.status(500).json({ 
      success: false, 
      error: 'Server Error', 
      message: error.message 
    });
  }
});

/**
 * PUT /api/tags/:id
 * Update a tag
 */
router.put('/:id', async (req, res) => {
  try {
    const existing = await tagsDao.getById(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tag not found' 
      });
    }

    // Don't allow changing the ID
    const { id, createdAt, articleCount, ...updates } = req.body;

    const updatedTag = await tagsDao.update(req.params.id, updates);

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
 * Delete a tag
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await tagsDao.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tag not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Tag deleted successfully', 
      data: { id: String(req.params.id) } 
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
router.get('/:id/articles', async (req, res) => {
  try {
    const tag = await tagsDao.getById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Get articles that have this tag
    const taggedArticles = await articlesDao.getAll({ tag: tag.id });

    res.json({
      success: true,
      tag: { 
        id: tag.id, 
        name: tag.name, 
        articleCount: taggedArticles.length 
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
