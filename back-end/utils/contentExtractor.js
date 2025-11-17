/**
 * Content Extraction Utility
 * 
 * This utility extracts clean article content from web URLs using Mozilla Readability.
 * It fetches the HTML, parses it, and returns structured article data.
 * 
 * TODO for Sprint 3+: Install required dependencies:
 * npm install @mozilla/readability jsdom axios
 */

const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

/**
 * Extract article content from a URL
 * @param {string} url - The URL to extract content from
 * @returns {Promise<Object>} Extracted article data
 */
async function extractContent(url) {
  try {
    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000, // 10 second timeout
      responseType: 'text',
      maxRedirects: 5,
    });

    const html = response.data;

    // Parse HTML with JSDOM
    const dom = new JSDOM(html, { url });

    // Extract article content using Readability
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      // Attempt a minimal fallback: grab document title and body text
      const title = dom.window.document.querySelector('title')?.textContent || extractTitleFromUrl(url);
      const bodyText = dom.window.document.body ? dom.window.document.body.textContent.trim() : '';
      const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

      return {
        success: true,
        data: {
          title,
          content: dom.window.document.body ? dom.window.document.body.innerHTML : '',
          textContent: bodyText,
          excerpt: bodyText ? bodyText.substring(0, 200) + '...' : '',
          author: null,
          url,
          source: extractDomain(url),
          wordCount,
          readingTime: wordCount ? Math.ceil(wordCount / 200) : 0,
          publishedDate: extractPublishedDate(dom.window.document) || null,
        },
      };
    }

    // Prepare plain-text content: ensure HTML tags removed and paragraphs preserved
    const rawText = article.textContent || extractPlainTextFromDOM(dom.window.document) || '';
    const cleanText = formatPlainText(rawText);

    // Calculate word count and reading time
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
    const readingTime = wordCount ? Math.ceil(wordCount / 200) : 0;

    return {
      success: true,
      data: {
        title: article.title || extractTitleFromUrl(url),
        content: article.content || '', // HTML content
        textContent: cleanText, // Plain text (sanitized)
        excerpt: article.excerpt || (cleanText ? cleanText.substring(0, 200) + '...' : ''),
        author: article.byline || null,
        url: url,
        source: extractDomain(url),
        wordCount: wordCount,
        readingTime: readingTime,
        publishedDate: extractPublishedDate(dom.window.document) || null,
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
 * Attempt to extract a published date from common meta tags
 * @param {Document} doc
 * @returns {string|null}
 */
function extractPublishedDate(doc) {
  try {
    const selectors = [
      "meta[property='article:published_time']",
      "meta[name='pubdate']",
      "meta[name='publishdate']",
      "meta[name='publication_date']",
      "meta[name='date']",
      "time[datetime]",
    ];

    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (el) {
        const val = el.getAttribute('content') || el.getAttribute('datetime') || el.textContent;
        if (val) return val.trim();
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
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

/**
 * Build plain text from DOM by joining block-level elements with paragraph breaks.
 * This helps preserve paragraph boundaries instead of returning a single long line.
 * @param {Document} doc
 * @returns {string}
 */
function extractPlainTextFromDOM(doc) {
  try {
    if (!doc) return '';

    // Select common block-level elements that represent paragraphs or headings
    const selectors = [
      'article p', 'article h1', 'article h2', 'article h3',
      'p', 'h1', 'h2', 'h3', 'li', 'section', 'article', 'div'
    ];

    const nodeList = doc.querySelectorAll(selectors.join(','));
    const parts = [];
    nodeList.forEach(node => {
      if (!node) return;
      const text = node.textContent && node.textContent.trim();
      if (text) {
        parts.push(text.replace(/\s+/g, ' '));
      }
    });

    if (parts.length > 0) {
      // Join with double newline to preserve paragraph separation
      return parts.join('\n\n');
    }

    // Fallback to body textContent
    const bodyText = doc.body ? String(doc.body.textContent || '') : '';
    return bodyText.trim();
  } catch (e) {
    return '';
  }
}

/**
 * Normalize whitespace and remove extraneous newlines. Ensures readable paragraphs.
 * @param {string} text
 * @returns {string}
 */
function formatPlainText(text) {
  if (!text) return '';
  // Replace CR, normalize newlines
  let t = String(text).replace(/\r/g, '\n');
  // Collapse more than 2 newlines into 2
  t = t.replace(/\n{3,}/g, '\n\n');
  // Trim spaces on each line and collapse multiple spaces
  t = t.split('\n').map(line => line.trim().replace(/\s{2,}/g, ' ')).join('\n');
  // Trim overall
  t = t.trim();
  return t;
}

module.exports = {
  extractContent,
  extractDomain,
  extractTitleFromUrl,
};
