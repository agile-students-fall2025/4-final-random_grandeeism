/**
 * Reading Time Calculation Utility (Backend)
 * 
 * Calculates estimated reading time based on article content
 * Average reading speed: 200-250 words per minute (we use 225)
 */

/**
 * Get word count from content
 * @param {string} content - Article content (HTML or plain text)
 * @returns {number} - Word count
 */
function getWordCount(content) {
  if (!content || typeof content !== 'string') {
    return 0;
  }

  // Strip HTML tags to get plain text
  const plainText = content.replace(/<[^>]*>/g, ' ');
  
  // Count words (split by whitespace and filter empty strings)
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  return words.length;
}

/**
 * Calculate reading time in minutes (numeric value)
 * @param {string} content - Article content
 * @returns {number} - Reading time in minutes
 */
function calculateReadingTimeMinutes(content) {
  const wordCount = getWordCount(content);
  return Math.max(1, Math.ceil(wordCount / 225));
}

/**
 * Calculate reading time from content
 * @param {string} content - Article content (HTML or plain text)
 * @returns {string} - Formatted reading time (e.g., "5 min read")
 */
function calculateReadingTime(content) {
  const minutes = calculateReadingTimeMinutes(content);
  
  if (minutes === 1) {
    return '1 min read';
  } else {
    return `${minutes} min read`;
  }
}

module.exports = {
  getWordCount,
  calculateReadingTimeMinutes,
  calculateReadingTime
};
