/**
 * YouTube utility functions
 * Handles YouTube URL parsing and video ID extraction
 */

/**
 * Extracts YouTube video ID from various URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 * 
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Pattern 1: youtube.com/watch?v=VIDEO_ID
  const watchPattern = /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
  const watchMatch = url.match(watchPattern);
  if (watchMatch) {
    return watchMatch[1];
  }

  // Pattern 2: youtu.be/VIDEO_ID
  const shortPattern = /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const shortMatch = url.match(shortPattern);
  if (shortMatch) {
    return shortMatch[1];
  }

  // Pattern 3: youtube.com/embed/VIDEO_ID
  const embedPattern = /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const embedMatch = url.match(embedPattern);
  if (embedMatch) {
    return embedMatch[1];
  }

  // Pattern 4: youtube.com/v/VIDEO_ID
  const vPattern = /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
  const vMatch = url.match(vPattern);
  if (vMatch) {
    return vMatch[1];
  }

  return null;
}

/**
 * Checks if a URL is a YouTube video URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if YouTube URL
 */
function isYouTubeUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  return /(?:youtube\.com\/(?:watch|embed|v)|youtu\.be\/)/.test(url);
}

/**
 * Generates YouTube embed URL from video ID
 * @param {string} videoId - YouTube video ID
 * @returns {string} - Embed URL
 */
function getYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Detects media type from URL
 * @param {string} url - URL to check
 * @returns {string} - 'video', 'audio', or 'text'
 */
function detectMediaType(url) {
  if (!url || typeof url !== 'string') {
    return 'text';
  }

  const urlLower = url.toLowerCase();

  // Check for YouTube
  if (isYouTubeUrl(url)) {
    return 'video';
  }

  // Check for other video platforms
  if (urlLower.includes('vimeo.com') || 
      urlLower.includes('dailymotion.com') ||
      urlLower.includes('twitch.tv')) {
    return 'video';
  }

  // Check for audio/podcast platforms
  if (urlLower.includes('soundcloud.com') || 
      urlLower.includes('spotify.com') ||
      urlLower.includes('podcasts.apple.com') ||
      urlLower.includes('anchor.fm')) {
    return 'audio';
  }

  // Default to text
  return 'text';
}

module.exports = {
  extractYouTubeVideoId,
  isYouTubeUrl,
  getYouTubeEmbedUrl,
  detectMediaType
};
