const express = require('express');
const router = express.Router();
const { mockTags } = require('../data/mockTags');
const { mockArticles } = require('../data/mockArticles');
const path = require('path');
const fs = require('fs');
const TAGS_FILE = path.join(__dirname, '../data/mockTags.js');

function serializeTags(tags) {
  // Write as JS file with module.exports
  return `/**\n * Mock tags data for development and testing\n * This will be replaced with MongoDB Tag model in Sprint 3\n */\n\nconst mockTags = ${JSON.stringify(tags, (key, value) => {
    if (key === 'createdAt' || key === 'lastUsed' || key === 'updatedAt') {
      return value ? `__DATE__${new Date(value).toISOString()}` : value;
    }
    return value;
  }, 2).replace(/"__DATE__(.*?)"/g, 'new Date("$1")')};\n\nmodule.exports = { mockTags };\n`;
}

function saveTagsToFile(tags) {
  fs.writeFileSync(TAGS_FILE, serializeTags(tags), 'utf8');
}

/**
 * GET /api/tags
 * Retrieve all tags with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const { sort } = req.query;
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    const filters = { userId };
    const tags = await tagsDao.getAll(filters);

    // Sort by article count, name, or most recent
    if (sort === 'popular') {
      tags.sort((a, b) => b.articleCount - a.articleCount);
    } else if (sort === 'alphabetical') {
      tags.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'recent') {
      tags.sort((a, b) => new Date(b.lastUsed || b.createdDate) - new Date(a.lastUsed || a.createdDate));
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
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    const tag = await tagsDao.getById(req.params.id, userId);
    
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
 * Create a new tag
 */
router.post('/', async (req, res) => {
  try {
    const { name, color, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Tag name is required' });
    }
    const existingTag = mockTags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existingTag) {
      return res.status(409).json({ success: false, error: 'Tag already exists', data: existingTag });
    }
    const newTag = {
      id: `tag-${mockTags.length + 1}`,
      name: name.toLowerCase(),
      color: color || '#6b7280',
      description: description || '',
      userId
    };
    mockTags.push(newTag);
    saveTagsToFile(mockTags);
    res.status(201).json({ success: true, data: newTag, message: 'Tag created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
});

/**
 * PUT /api/tags/:id
 * Update a tag
 */
router.put('/:id', async (req, res) => {
  try {
    const tagIdx = mockTags.findIndex(t => t.id === req.params.id);
    if (tagIdx === -1) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }
    const updatedTag = {
      ...mockTags[tagIdx],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date()
    };
    mockTags[tagIdx] = updatedTag;
    saveTagsToFile(mockTags);
    res.json({ success: true, data: updatedTag, message: 'Tag updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
});

/**
 * DELETE /api/tags/:id
 * Delete a tag
 */
router.delete('/:id', async (req, res) => {
  try {
    const tagIdx = mockTags.findIndex(t => t.id === req.params.id);
    if (tagIdx === -1) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }
    mockTags.splice(tagIdx, 1);
    saveTagsToFile(mockTags);
    res.json({ success: true, message: 'Tag deleted successfully', data: { id: req.params.id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
});

/**
 * GET /api/tags/:id/articles
 * Get all articles with a specific tag
 */
router.get('/:id/articles', async (req, res) => {
  try {
    const userId = 'user-1'; // TODO: Get from authenticated user
    
    
    
    const tag = await tagsDao.getById(req.params.id, userId);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Find articles that have this tag (match by tag name)
    const taggedArticles = await articlesDao.getByTag(tag.name, userId);

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
