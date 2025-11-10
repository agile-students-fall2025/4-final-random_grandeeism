const express = require('express');
const router = express.Router();
const { mockHighlights } = require('../data/mockHighlights');

// --- Helpers (exposed on router for easier testing) ----------------------

/**
 * Generate a short title from the highlighted text (used when no title provided)
 */
const generateTitle = txt => {
  if (!txt) return '';
  const words = txt.trim().split(/\s+/).slice(0, 6);
  let t = words.join(' ');
  if (t.length < txt.trim().length) t = `${t}...`;
  return t;
};

/**
 * Validate the annotations payload. Returns { valid: bool, error?: string }
 * Allowed values:
 *  - undefined => not provided
 *  - null => explicit remove annotations
 *  - object => single annotation (not array)
 */
const validateAnnotationsPayload = annotations => {
  if (annotations === undefined) return { valid: true };
  if (annotations === null) return { valid: true };
  if (Array.isArray(annotations)) return { valid: false, error: '`annotations` must be a single object, not an array' };
  if (typeof annotations !== 'object') return { valid: false, error: '`annotations` must be an object with `title` and/or `note` when provided' };
  return { valid: true };
};

/** Build a new highlight object (does not persist) */
const buildNewHighlight = ({ articleId, userId, text, color, position, annotations }) => {
  const providedTitle = annotations && annotations.title ? annotations.title : null;
  const providedNote = annotations && annotations.note !== undefined ? annotations.note : '';

  return {
    id: `highlight-${mockHighlights.length + 1}`,
    articleId,
    userId,
    text,
    annotations: {
      title: providedTitle || generateTitle(text),
      note: providedNote || ''
    },
    color: color || '#fef08a',
    position: {
      start: position.start,
      end: position.end
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/** Build an updated highlight object based on an existing highlight and request body.
 * Returns { updated, error } where updated is the new object (not persisted)
 */
const buildUpdatedHighlight = (highlight, body) => {
  const { annotations: newAnnotations, text: newText, color: newColor, position: newPosition } = body;

  // Do not allow changing the highlighted text
  if (newText !== undefined && newText !== highlight.text) {
    return { error: { status: 400, message: 'Highlighted text cannot be modified. To remove the highlight, delete it instead.' } };
  }

  // Validate annotations payload
  const validation = validateAnnotationsPayload(newAnnotations);
  if (!validation.valid) return { error: { status: 400, message: validation.error } };

  const updatedHighlight = { ...highlight };

  if (newAnnotations !== undefined) {
    if (newAnnotations === null) {
      updatedHighlight.annotations = null;
    } else {
      const { title: naTitle, note: naNote } = newAnnotations;
      updatedHighlight.annotations = { ...(highlight.annotations || {}) };
      if (naTitle !== undefined) updatedHighlight.annotations.title = naTitle;
      if (naNote !== undefined) updatedHighlight.annotations.note = naNote;
    }
  }

  // preserve id/articleId/userId, update updatedAt
  updatedHighlight.id = highlight.id;
  updatedHighlight.articleId = highlight.articleId;
  updatedHighlight.userId = highlight.userId;
  updatedHighlight.updatedAt = new Date();
  // keep color/position unchanged (current behavior)
  updatedHighlight.color = highlight.color;
  updatedHighlight.position = highlight.position;

  return { updated: updatedHighlight };
};

// Attach helpers to router for tests to import via router._helpers
router._helpers = { generateTitle, validateAnnotationsPayload, buildNewHighlight, buildUpdatedHighlight };

// -------------------------------------------------------------------------

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
    const { articleId, userId, text, color, position, annotations } = req.body;

    // Validate required fields
    if (!articleId || !userId || !text || !position) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: articleId, userId, text, position'
      });
    }

    if (position.start === undefined || position.end === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Position must include start and end character positions'
      });
    }

    // Validate annotations and build the new highlight using helper
    const validation = router._helpers.validateAnnotationsPayload(annotations);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const newHighlight = router._helpers.buildNewHighlight({ articleId, userId, text, color, position, annotations });

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
    // Build updated object carefully to support nested `annotations` while
    // preserving id/articleId/userId and updatedAt.
    const {annotations: newAnnotations} = req.body;

    // Validate annotations payload: only accept a single object (or null to remove annotations)
    if (newAnnotations !== undefined && newAnnotations !== null && typeof newAnnotations !== 'object') {
      return res.status(400).json({
        success: false,
        error: '`annotations` must be an object with `title` and/or `note`, or null to remove annotations'
      });
    }
    if (Array.isArray(newAnnotations)) {
      return res.status(400).json({
        success: false,
        error: '`annotations` must be a single object, not an array'
      });
    }

    const result = router._helpers.buildUpdatedHighlight(highlight, req.body);
    if (result.error) {
      return res.status(result.error.status).json({ success: false, error: result.error.message });
    }

    res.json({ success: true, data: result.updated, message: 'Highlight updated successfully' });
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
