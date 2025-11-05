const express = require('express');
const router = express.Router();
const { extractContent } = require('../utils/contentExtractor');

/**
 * POST /api/extract
 * Extract metadata and content from a URL
 * 
 * This endpoint uses utils/contentExtractor.js to extract article content.
 * 
 * FUTURE ENHANCEMENT (Sprint 3+)
 * ================================
 * To enable real content extraction, install dependencies in contentExtractor.js:
 *    npm install @mozilla/readability jsdom axios
 * 
 * Front-End Usage:
 *   1. User pastes URL in "Add Link" modal
 *   2. Front-end calls POST /api/extract with { url }
 *   3. Back-end extracts content and returns metadata
 *   4. Front-end pre-fills form with extracted data
 *   5. User can edit and save to POST /api/articles
 * 
 * Benefits:
 *   - Saves user time (auto-fills title, author, content)
 *   - Better UX than manual entry
 *   - Works across all browsers (extraction on server)
 * 
 * Note: Content extraction can fail for various reasons:
 *   - Paywall sites
 *   - Sites that block scrapers
 *   - JavaScript-heavy SPAs
 *   - Always have fallback to manual entry
 * ================================
 */
router.post('/extract', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Use utility function to extract content
    const result = await extractContent(url);
    
    return res.json(result);

  } catch (error) {
    // Handle different error types
    if (error.message.includes('Invalid URL')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('timed out')) {
      return res.status(408).json({
        success: false,
        message: error.message
      });
    }

    console.error('Content extraction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to extract content',
      error: error.message
    });
  }
})

module.exports = router;
