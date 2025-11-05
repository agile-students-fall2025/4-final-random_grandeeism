const express = require('express');
const router = express.Router();
const { mockHighlights } = require('../data/mockHighlights');

/**
 * GET /api/highlights
 * Retrieve all highlights (optionally filtered by userId)
 */
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;
    let highlights = [...mockHighlights];

    // Filter by user if provided
    if (userId) {
      highlights = highlights.filter(h => h.userId === userId);
    }

    // Sort by creation date (newest first)
    highlights.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: highlights.length,
      data: highlights
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
 * GET /api/highlights/article/:articleId
 * Get all highlights for a specific article
 */
router.get('/article/:articleId', (req, res) => {
  try {
    const highlights = mockHighlights.filter(
      h => h.articleId === req.params.articleId
    );

    // Sort by position in article
    highlights.sort((a, b) => a.position.start - b.position.start);

    res.json({
      success: true,
      articleId: req.params.articleId,
      count: highlights.length,
      data: highlights
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
 * POST /api/highlights
 * Create a new highlight/annotation (mock - doesn't persist)
 */
router.post('/', (req, res) => {
  try {
    const { articleId, userId, text, note, color, position } = req.body;

    // Validate required fields
    if (!articleId || !userId || !text || !position) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: articleId, userId, text, position'
      });
    }

    if (!position.start || !position.end) {
      return res.status(400).json({
        success: false,
        error: 'Position must include start and end character positions'
      });
    }

    const newHighlight = {
      id: `highlight-${mockHighlights.length + 1}`,
      articleId,
      userId,
      text,
      note: note || '',
      color: color || '#fef08a',
      position: {
        start: position.start,
        end: position.end
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: newHighlight,
      message: 'Highlight created successfully'
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
 * PUT /api/highlights/:id
 * Update a highlight/annotation (mock - doesn't persist)
 */
router.put('/:id', (req, res) => {
  try {
    const highlight = mockHighlights.find(h => h.id === req.params.id);
    
    if (!highlight) {
      return res.status(404).json({
        success: false,
        error: 'Highlight not found'
      });
    }

    const updatedHighlight = {
      ...highlight,
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      articleId: highlight.articleId, // Ensure articleId doesn't change
      userId: highlight.userId, // Ensure userId doesn't change
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: updatedHighlight,
      message: 'Highlight updated successfully'
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
 * DELETE /api/highlights/:id
 * Delete a highlight (mock - doesn't persist)
 */
router.delete('/:id', (req, res) => {
  try {
    const highlight = mockHighlights.find(h => h.id === req.params.id);
    
    if (!highlight) {
      return res.status(404).json({
        success: false,
        error: 'Highlight not found'
      });
    }

    res.json({
      success: true,
      message: 'Highlight deleted successfully',
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

module.exports = router;
