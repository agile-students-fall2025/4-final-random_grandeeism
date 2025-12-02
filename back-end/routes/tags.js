const express = require('express');
const router = express.Router();
const { tagsDao, articlesDao } = require('../lib/daoFactory');
const { authenticateToken } = require('../middleware/auth');
const { validateTag, handleValidationErrors } = require('../middleware/validation');

/**
 * GET /api/tags
 * Retrieve all tags with optional filtering and sorting
 * Article counts are dynamically calculated by the DAO
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { sort, search, category } = req.query;
    
    // Get all tags with filters for authenticated user
    let tags = await tagsDao.getAll({ search, category, userId: req.user.id });

    // Dynamically calculate article count for each tag
    const tagsWithCounts = await Promise.all(tags.map(async (tag) => {
      const articles = await articlesDao.getAll({ 
        userId: req.user.id, 
        tag: tag.id 
      });
      return {
        ...tag,
        articleCount: articles.length
      };
    }));

    // Sort by article count, name, or most recent
    if (sort === 'popular') {
      tagsWithCounts.sort((a, b) => b.articleCount - a.articleCount);
    } else if (sort === 'alphabetical') {
      tagsWithCounts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'recent') {
      tagsWithCounts.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
    }

    res.json({
      success: true,
      count: tagsWithCounts.length,
      data: tagsWithCounts
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
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const tag = await tagsDao.getById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Verify tag belongs to authenticated user
    if (tag.userId && tag.userId !== req.user.id && tag.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own tags'
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
router.post('/', authenticateToken, validateTag, handleValidationErrors, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tag name is required' 
      });
    }

    // Check if tag already exists for this user
    const normalizedName = name.toLowerCase();
    const existingTag = await tagsDao.getByName(normalizedName, req.user.id);
    
    if (existingTag) {
      // Return 409 Conflict for duplicate tags
      return res.status(409).json({ 
        success: false, 
        error: 'Tag with this name already exists'
      });
    }

    // Create the tag with userId
    const newTag = await tagsDao.create({
      name: normalizedName,
      description: description || '',
      category: req.body.category,
      color: req.body.color,
      userId: req.user.id
    });

    res.status(201).json({ 
      success: true, 
      data: newTag, 
      message: 'Tag created successfully' 
    });
  } catch (error) {
    // Handle duplicate tag error from DAO
    if (error.message && error.message.includes('already exists')) {
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
router.put('/:id', authenticateToken, validateTag, handleValidationErrors, async (req, res) => {
  try {
    const existing = await tagsDao.getById(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tag not found' 
      });
    }

    // Verify tag belongs to authenticated user
    if (existing.userId && existing.userId !== req.user.id && existing.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only update your own tags'
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
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // First get the tag to verify ownership
    const tag = await tagsDao.getById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tag not found' 
      });
    }

    // Verify tag belongs to authenticated user
    if (tag.userId && tag.userId !== req.user.id && tag.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only delete your own tags'
      });
    }

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
router.get('/:id/articles', authenticateToken, async (req, res) => {
  try {
    const tag = await tagsDao.getById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Verify tag belongs to authenticated user
    if (tag.userId && tag.userId !== req.user.id && tag.userId !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own tags'
      });
    }

    // Get articles that have this tag (filtered by userId)
    const taggedArticles = await articlesDao.getAll({ tag: tag.id, userId: req.user.id });

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
