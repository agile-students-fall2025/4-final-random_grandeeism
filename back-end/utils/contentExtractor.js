/**
 * Content Extraction Utility
 * 
 * This utility extracts clean article content from web URLs using Mozilla Readability.
 * It fetches the HTML, parses it, and returns structured article data.
 * 
 * TODO for Sprint 3+: Install required dependencies:
 * npm install @mozilla/readability jsdom axios
 */

// const axios = require('axios');
// const { JSDOM } = require('jsdom');
// const { Readability } = require('@mozilla/readability');

/**
 * Extract article content from a URL
 * @param {string} url - The URL to extract content from
 * @returns {Promise<Object>} Extracted article data
 */
async function extractContent(url) {
  try {
    // TODO Sprint 3+: Uncomment when dependencies are installed
    /*
    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000, // 10 second timeout
    });

    // Parse HTML with JSDOM
    const dom = new JSDOM(response.data, { url });
    
    // Extract article content using Readability
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error('Failed to extract article content');
    }

    // Calculate word count and reading time
    const wordCount = article.textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    // Extract domain for source
    const domain = extractDomain(url);

    return {
      success: true,
      data: {
        title: article.title,
        content: article.content, // HTML content
        textContent: article.textContent, // Plain text
        excerpt: article.excerpt || article.textContent.substring(0, 200) + '...',
        author: article.byline || null,
        url: url,
        source: domain,
        wordCount: wordCount,
        readingTime: readingTime,
        publishedDate: null, // Readability doesn't extract this
      },
    };
    */

    // MOCK DATA for Sprint 2 (until dependencies installed)
    const domain = extractDomain(url);
    const title = extractTitleFromUrl(url);
    
    return {
      success: true,
      data: {
        title: title,
        content: '<p>This is mock content. Install @mozilla/readability, jsdom, and axios to enable real content extraction.</p>',
        textContent: 'This is mock content. Install @mozilla/readability, jsdom, and axios to enable real content extraction.',
        excerpt: 'Mock article excerpt from ' + domain,
        author: 'Unknown Author',
        url: url,
        source: domain,
        wordCount: 21,
        readingTime: 1,
        publishedDate: null,
      },
    };
  } catch (error) {
    // Handle different error types
    if (error.code === 'ENOTFOUND') {
      throw new Error('Invalid URL or unable to reach the website');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timed out - website took too long to respond');
    } else {
      throw new Error(`Failed to extract content: ${error.message}`);
    }
  }
}

/**
 * Extract domain from URL
 * @param {string} url - The URL to extract domain from
 * @returns {string} Domain name
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return 'Unknown Source';
  }
}

/**
 * Extract a reasonable title from URL if content extraction fails
 * @param {string} url - The URL to extract title from
 * @returns {string} Generated title
 */
function extractTitleFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Get last path segment
    const segments = path.split('/').filter(s => s);
    const lastSegment = segments[segments.length - 1] || urlObj.hostname;
    
    // Clean up the title
    return lastSegment
      .replace(/[-_]/g, ' ')
      .replace(/\.(html|htm|php|asp|aspx)$/i, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (error) {
    return 'Untitled Article';
  }
}

module.exports = {
  extractContent,
  extractDomain,
  extractTitleFromUrl,
};
