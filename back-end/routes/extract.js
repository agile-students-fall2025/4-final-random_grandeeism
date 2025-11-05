const express = require('express');
const router = express.Router();

/**
 * POST /api/extract
 * Extract metadata and content from a URL
 * 
 * FUTURE ENHANCEMENT (Sprint 3+)
 * ================================
 * This endpoint provides URL content extraction for the "Add Link" feature.
 * Currently returns mock data based on URL parsing.
 * 
 * To implement real content extraction:
 * 
 * 1. Install dependencies:
 *    npm install @mozilla/readability jsdom axios
 * 
 * 2. Add imports at top of file:
 *    const { Readability } = require('@mozilla/readability');
 *    const { JSDOM } = require('jsdom');
 *    const axios = require('axios');
 * 
 * 3. Replace mock extraction logic with:
 *    const response = await axios.get(url, {
 *      headers: { 'User-Agent': 'Mozilla/5.0' }
 *    });
 *    const dom = new JSDOM(response.data, { url });
 *    const reader = new Readability(dom.window.document);
 *    const article = reader.parse();
 * 
 * 4. Return extracted data:
 *    title: article.title
 *    content: article.textContent
 *    author: article.byline
 *    excerpt: article.excerpt
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
        error: 'URL is required'
      });
    }

    // TODO: In Sprint 3+, implement real metadata extraction
    // For now, return mock metadata based on URL
    const mockMetadata = {
      url: url,
      title: extractTitleFromUrl(url),
      author: 'Unknown Author',
      source: extractDomainFromUrl(url),
      description: 'Article description will be extracted here',
      image: null,
      readingTime: '5 min',
      publishedDate: new Date().toISOString(),
      content: 'Full content will be extracted here'
    };

    res.json({
      success: true,
      data: mockMetadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to extract metadata',
      message: error.message
    });
  }
});

// Helper functions
function extractTitleFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const slug = path.split('/').filter(Boolean).pop() || 'Untitled';
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  } catch {
    return 'Untitled Article';
  }
}

function extractDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'Unknown Source';
  }
}

module.exports = router;
