/**
 * Reading Time Calculation Utility
 * 
 * Calculates estimated reading time based on article content
 * Average reading speed: 200-250 words per minute (we use 225)
 */

/**
 * Calculate reading time from content
 * @param {string} content - Article content (HTML or plain text)
 * @returns {string} - Formatted reading time (e.g., "5 min read")
 */
export function calculateReadingTime(content) {
  if (!content || typeof content !== 'string') {
    return '1 min read';
  }

  // Strip HTML tags to get plain text
  const plainText = content.replace(/<[^>]*>/g, ' ');
  
  // Count words (split by whitespace and filter empty strings)
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  const wordCount = words.length;
  
  // Calculate reading time (225 words per minute average)
  const minutes = Math.ceil(wordCount / 225);
  
  // Format output
  if (minutes < 1) {
    return '1 min read';
  } else if (minutes === 1) {
    return '1 min read';
  } else {
    return `${minutes} min read`;
  }
}

/**
 * Get word count from content
 * @param {string} content - Article content (HTML or plain text)
 * @returns {number} - Word count
 */
export function getWordCount(content) {
  if (!content || typeof content !== 'string') {
    return 0;
  }

  const plainText = content.replace(/<[^>]*>/g, ' ');
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
export function calculateReadingTimeMinutes(content) {
  const wordCount = getWordCount(content);
  return Math.max(1, Math.ceil(wordCount / 225));
}
