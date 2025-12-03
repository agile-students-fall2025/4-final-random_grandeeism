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
    // Special handling for YouTube videos - don't try to extract content
    const { isYouTubeUrl, extractYouTubeVideoId } = require('./youtubeUtils');
    if (isYouTubeUrl(url)) {
      const videoId = extractYouTubeVideoId(url);
      
      // Try to fetch video title from YouTube oEmbed API (no API key needed)
      let title = 'YouTube Video';
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const response = await axios.get(oembedUrl, { timeout: 5000 });
        if (response.data && response.data.title) {
          title = response.data.title;
        }
      } catch (oembedError) {
        console.warn('Failed to fetch YouTube title from oEmbed:', oembedError.message);
      }
      
      // For YouTube videos, return minimal metadata
      return {
        success: true,
        data: {
          title: title,
          content: '',
          textContent: '',
          excerpt: 'YouTube video content',
          author: null,
          url,
          source: 'YouTube',
          wordCount: 0,
          readingTime: 0,
          publishedDate: null,
          mediaType: 'video',
          videoId: videoId
        },
      };
    }

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
    
    // Clean the HTML content - removes videos/iframes, optionally preserves images
    const cleanHtml = cleanHTMLContent(article.content || '', { preserveImages: true });
    const cleanHtmlNoImages = cleanHTMLContent(article.content || '', { preserveImages: false });

    // Calculate word count and reading time
    const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
    const readingTime = wordCount ? Math.ceil(wordCount / 200) : 0;

    return {
      success: true,
      data: {
        title: article.title || extractTitleFromUrl(url),
        content: cleanHtml, // Cleaned HTML content with images
        contentNoImages: cleanHtmlNoImages, // Cleaned HTML content without images (for reader settings)
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
      'p', 'h1', 'h2', 'h3', 'li', 'blockquote'
    ];

    const nodeList = doc.querySelectorAll(selectors.join(','));
    const parts = [];
    const seen = new Set(); // Avoid duplicates
    
    nodeList.forEach(node => {
      if (!node) return;
      const text = node.textContent && node.textContent.trim();
      if (text && !seen.has(text)) {
        // Clean up the text
        const cleaned = text
          .replace(/\[insert[^\]]*\]/gi, '') // Remove [insert...] mentions
          .replace(/\(insert[^\)]*\)/gi, '') // Remove (insert...) mentions
          .replace(/INSERT:?[^\n]*/gi, '') // Remove INSERT: mentions
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (cleaned.length > 10) { // Only include substantial text
          parts.push(cleaned);
          seen.add(text);
        }
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
  
  // Remove common noise patterns
  t = t.replace(/\[insert[^\]]*\]/gi, ''); // Remove [insert...] mentions
  t = t.replace(/\(insert[^\)]*\)/gi, ''); // Remove (insert...) mentions
  t = t.replace(/INSERT:?[^\n]*/gi, ''); // Remove INSERT: mentions
  
  // Collapse more than 2 newlines into 2
  t = t.replace(/\n{3,}/g, '\n\n');
  // Trim spaces on each line and collapse multiple spaces
  t = t.split('\n').map(line => line.trim().replace(/\s{2,}/g, ' ')).join('\n');
  // Trim overall
  t = t.trim();
  return t;
}

/**
 * Clean HTML content to make it more human-readable.
 * Removes unnecessary divs, spans, and common noise patterns.
 * For text articles: Removes videos/iframes, optionally preserves images.
 * 
 * Note: Mozilla Readability already removes most ads, popups, and tracking.
 * This function does additional cleanup for edge cases.
 * 
 * @param {string} html - The HTML content to clean
 * @param {Object} options - Cleaning options
 * @param {boolean} options.preserveImages - Whether to keep <img> tags (default: true)
 * @returns {string}
 */
function cleanHTMLContent(html, options = {}) {
  if (!html) return '';
  
  const { preserveImages = true } = options;
  
  let cleaned = html;
  
  // Remove common noise patterns (editor artifacts)
  cleaned = cleaned.replace(/\[insert[^\]]*\]/gi, ''); // Remove [insert...] mentions
  cleaned = cleaned.replace(/\(insert[^\)]*\)/gi, ''); // Remove (insert...) mentions
  cleaned = cleaned.replace(/INSERT:?[^\n<]*/gi, ''); // Remove INSERT: mentions
  
  // Remove script and style tags completely (prevents ad injection)
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove noscript tags (often contain fallback ads)
  cleaned = cleaned.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  
  // Remove comments (can contain ad markers or tracking codes)
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // ALWAYS remove embedded videos and iframes (not needed for text articles)
  cleaned = cleaned.replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<video\b[^>]*>.*?<\/video>/gi, '');
  cleaned = cleaned.replace(/<embed\b[^>]*>/gi, '');
  cleaned = cleaned.replace(/<object\b[^>]*>.*?<\/object>/gi, '');
  
  // Optionally remove images (for reader settings toggle)
  if (!preserveImages) {
    cleaned = cleaned.replace(/<img\b[^>]*>/gi, '');
    cleaned = cleaned.replace(/<figure\b[^>]*>.*?<\/figure>/gi, '');
    cleaned = cleaned.replace(/<picture\b[^>]*>.*?<\/picture>/gi, '');
  }
  
  // Replace divs with their content (keep semantic structure)
  cleaned = cleaned.replace(/<div[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/div>/gi, '');
  
  // Replace spans with their content
  cleaned = cleaned.replace(/<span[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/span>/gi, '');
  
  // Remove empty elements (but preserve self-closing tags like <br>, <img>)
  cleaned = cleaned.replace(/<(p|h[1-6]|blockquote|li|td|th)\b[^>]*>\s*<\/\1>/gi, '');
  
  // Normalize whitespace around block elements
  cleaned = cleaned.replace(/>\s+</g, '><');
  
  // Remove data attributes, classes, and inline styles (keep href, src, alt, title, width, height)
  cleaned = cleaned.replace(/\s(class|id|style|data-[a-z-]+|onclick|onload|onerror)="[^"]*"/gi, '');
  
  // Collapse multiple newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

module.exports = {
  extractContent,
  extractDomain,
  extractTitleFromUrl,
  cleanHTMLContent,
  formatPlainText,
  extractPlainTextFromDOM,
};
