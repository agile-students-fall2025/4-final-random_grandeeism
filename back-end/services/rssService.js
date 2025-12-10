const Parser = require('rss-parser');
const { feedsDao, articlesDao } = require('../lib/daoFactory');
const { cleanHTMLContent, formatPlainText, extractPlainTextFromDOM } = require('../utils/contentExtractor');
const { JSDOM } = require('jsdom');

class RSSService {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['content:encoded', 'description', 'summary']
      }
    });
    // Store interval metadata for each feed: { intervalId, intervalMinutes, userId }
    this.refreshIntervals = new Map();
    this.isRefreshing = new Map(); // Track if a feed is currently being refreshed
  }

  /**
   * Extract articles from a single RSS feed
   * @param {string} feedId - The feed ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Result with extracted articles
   */
  async extractFromFeed(feedId, userId) {
    try {
      // Prevent concurrent refreshes of the same feed
      if (this.isRefreshing.get(feedId)) {
        return {
          success: false,
          message: 'Feed is already being refreshed'
        };
      }

      this.isRefreshing.set(feedId, true);

      const feed = await feedsDao.getById(feedId, userId);
      
      if (!feed) {
        this.isRefreshing.set(feedId, false);
        return {
          success: false,
          message: 'Feed not found'
        };
      }

      if (feed.isPaused) {
        this.isRefreshing.set(feedId, false);
        return {
          success: false,
          message: 'Feed is paused',
          paused: true
        };
      }

      // Parse RSS feed
      const rssFeed = await this.parser.parseURL(feed.url);
      
      const newArticles = [];
      const existingArticles = await articlesDao.getByFeedId(feedId, userId);
      const existingUrls = new Set(existingArticles.map(a => a.url));

      // Process each RSS item
      for (const item of rssFeed.items) {
        // Skip if article already exists
        if (existingUrls.has(item.link)) {
          continue;
        }

        // Extract content (try multiple fields)
        const rawContent = item['content:encoded'] || item.content || item.description || item.summary || '';
        
        // Clean HTML content - remove videos/iframes, preserve images
        const cleanedContent = cleanHTMLContent(rawContent, { preserveImages: true });
        const cleanedContentNoImages = cleanHTMLContent(rawContent, { preserveImages: false });
        
        // Extract plain text for search and word count
        let plainText = '';
        try {
          const dom = new JSDOM(rawContent);
          plainText = extractPlainTextFromDOM(dom.window.document);
          plainText = formatPlainText(plainText);
        } catch (e) {
          // Fallback: strip HTML tags manually
          plainText = rawContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
        
        // Calculate word count and reading time
        const wordCount = plainText ? plainText.split(/\s+/).length : 0;
        const readingTime = wordCount > 0 ? `${Math.ceil(wordCount / 200)} min` : '1 min';
        
        const article = {
          title: item.title || 'Untitled',
          url: item.link,
          author: item.creator || item.author || feed.name,
          publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          addedDate: new Date(),
          feedId: feed.id,
          feedName: feed.name,
          status: 'inbox',
          mediaType: this.detectMediaType(item, rawContent),
          summary: this.extractSummary(rawContent),
          content: cleanedContent,
          contentNoImages: cleanedContentNoImages,
          textContent: plainText,
          wordCount: wordCount,
          readingTime: readingTime,
          imageUrl: this.extractImage(item),
          tags: feed.defaultTags || [],
          userId: userId,
          isFavorite: false,
          isHidden: false,
          readingProgress: 0
        };

        const createdArticle = await articlesDao.create(article);
        newArticles.push(createdArticle);
      }

      // Update feed metadata
      await feedsDao.update(feedId, {
        lastFetched: new Date(),
        lastUpdated: new Date(),
        articleCount: existingArticles.length + newArticles.length,
        status: 'success',
        errorMessage: null
      }, userId);

      this.isRefreshing.set(feedId, false);

      return {
        success: true,
        feedId: feed.id,
        feedName: feed.name,
        feedTitle: rssFeed.title || feed.name, // Include actual feed title from RSS
        newArticles: newArticles.length,
        totalArticles: existingArticles.length + newArticles.length,
        count: newArticles.length, // Add count for convenience
        articles: newArticles
      };

    } catch (error) {
      this.isRefreshing.set(feedId, false);
      
      // Update feed with error status
      await feedsDao.update(feedId, {
        status: 'error',
        errorMessage: error.message,
        lastFetched: new Date()
      }, userId);

      return {
        success: false,
        feedId: feedId,
        message: error.message,
        error: error.message
      };
    }
  }

  /**
   * Extract articles from all active feeds for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} Results for all feeds
   */
  async extractFromAllFeeds(userId) {
    try {
      const feeds = await feedsDao.getAll({ userId, isPaused: false });
      
      const results = [];
      for (const feed of feeds) {
        const result = await this.extractFromFeed(feed.id, userId);
        results.push(result);
      }

      const totalNew = results.reduce((sum, r) => sum + (r.newArticles || 0), 0);

      return {
        success: true,
        feedsProcessed: results.length,
        totalNewArticles: totalNew,
        results: results
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Start automatic refresh for a feed
   * @param {string} feedId - The feed ID
   * @param {string} userId - The user ID
   * @param {number} intervalMinutes - Refresh interval in minutes (default: 60)
   */
  startAutoRefresh(feedId, userId, intervalMinutes = 60) {
    // Clear existing interval if any
    this.stopAutoRefresh(feedId);

    const intervalMs = intervalMinutes * 60 * 1000;
    
    const intervalId = setInterval(async () => {
      console.log(`Auto-refreshing feed ${feedId}...`);
      await this.extractFromFeed(feedId, userId);
    }, intervalMs);

    this.refreshIntervals.set(feedId, { intervalId, intervalMinutes, userId });
    
    console.log(`Started auto-refresh for feed ${feedId} every ${intervalMinutes} minutes`);
  }

  /**
   * Stop automatic refresh for a feed
   * @param {string} feedId - The feed ID
   */
  stopAutoRefresh(feedId) {
    const intervalMeta = this.refreshIntervals.get(feedId);
    if (intervalMeta?.intervalId) {
      clearInterval(intervalMeta.intervalId);
      this.refreshIntervals.delete(feedId);
      console.log(`Stopped auto-refresh for feed ${feedId}`);
    }
  }

  /**
   * Pause a feed (stops auto-refresh and marks as paused)
   * @param {string} feedId - The feed ID
   * @param {string} userId - The user ID
   */
  async pauseFeed(feedId, userId) {
    this.stopAutoRefresh(feedId);
    
    await feedsDao.update(feedId, {
      isPaused: true,
      pausedAt: new Date()
    }, userId);

    return {
      success: true,
      message: 'Feed paused successfully'
    };
  }

  /**
   * Resume a paused feed
   * @param {string} feedId - The feed ID
   * @param {string} userId - The user ID
   * @param {number} intervalMinutes - Refresh interval in minutes
   */
  async resumeFeed(feedId, userId, intervalMinutes = 60) {
    await feedsDao.update(feedId, {
      isPaused: false,
      pausedAt: null
    }, userId);

    this.startAutoRefresh(feedId, userId, intervalMinutes);

    return {
      success: true,
      message: 'Feed resumed successfully'
    };
  }

  /**
   * Get status of all auto-refresh jobs
   */
  getAutoRefreshStatus() {
    const status = [];
    for (const [feedId, meta] of this.refreshIntervals.entries()) {
      status.push({
        feedId,
        active: true,
        isRefreshing: this.isRefreshing.get(feedId) || false,
        intervalMinutes: meta.intervalMinutes
      });
    }
    return status;
  }

  /**
   * Helper: Detect media type from RSS item
   */
  detectMediaType(item, content) {
    const title = (item.title || '').toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Check for video indicators
    if (title.includes('video') || contentLower.includes('youtube') || 
        contentLower.includes('vimeo') || item.enclosure?.type?.includes('video')) {
      return 'video';
    }
    
    // Check for audio/podcast indicators
    if (title.includes('podcast') || title.includes('audio') || 
        item.enclosure?.type?.includes('audio')) {
      return 'audio';
    }
    
    return 'text';
  }

  /**
   * Helper: Extract summary from content
   */
  extractSummary(content, maxLength = 200) {
    if (!content) return '';
    
    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    // Trim and truncate
    const trimmed = text.trim();
    if (trimmed.length <= maxLength) return trimmed;
    
    return trimmed.substring(0, maxLength) + '...';
  }

  /**
   * Helper: Extract image URL from RSS item
   */
  extractImage(item) {
    // Check various possible image locations
    if (item.enclosure?.type?.includes('image')) {
      return item.enclosure.url;
    }
    
    if (item.image?.url) {
      return item.image.url;
    }
    
    if (item.itunes?.image) {
      return item.itunes.image;
    }
    
    // Try to find image in content
    const content = item['content:encoded'] || item.content || item.description || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }
    
    return null;
  }

  /**
   * Stop all auto-refresh intervals (useful for cleanup in tests)
   */
  stopAllAutoRefresh() {
    for (const [feedId, meta] of this.refreshIntervals) {
      if (meta?.intervalId) {
        clearInterval(meta.intervalId);
      }
    }
    this.refreshIntervals.clear();
  }
}

// Export singleton instance
const rssServiceInstance = new RSSService();

// Also export class for testing
rssServiceInstance.getInstance = () => rssServiceInstance;

module.exports = rssServiceInstance;
