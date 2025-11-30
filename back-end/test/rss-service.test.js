// test/rss-service.test.js
const { expect } = require('chai');
const RSSService = require('../services/rssService');

describe('RSSService', () => {
  let rssService;

  beforeEach(() => {
    rssService = RSSService.getInstance();
  });

  afterEach(() => {
    // Clear any running intervals
    if (rssService.stopAllAutoRefresh) {
      rssService.stopAllAutoRefresh();
    }
  });

  describe('detectMediaType', () => {
    it('should detect video content from enclosure', () => {
      const item = {
        enclosure: {
          type: 'video/mp4',
          url: 'https://example.com/video.mp4'
        },
        title: 'Sample Video'
      };
      
      const result = rssService.detectMediaType(item, 'Some content');
      expect(result).to.equal('video');
    });

    it('should detect audio content from enclosure', () => {
      const item = {
        enclosure: {
          type: 'audio/mpeg',
          url: 'https://example.com/podcast.mp3'
        },
        title: 'Sample Podcast'
      };
      
      const result = rssService.detectMediaType(item, 'Podcast episode');
      expect(result).to.equal('audio');
    });

    it('should detect video from YouTube URL in content', () => {
      const item = {
        link: 'https://example.com/article',
        title: 'Sample Article'
      };
      
      const result = rssService.detectMediaType(item, 'Check out this youtube.com/video');
      expect(result).to.equal('video');
    });

    it('should detect video from Vimeo URL in content', () => {
      const item = {
        link: 'https://example.com/article',
        title: 'Sample Article'
      };
      
      const result = rssService.detectMediaType(item, 'Watch on vimeo.com/123456');
      expect(result).to.equal('video');
    });

    it('should default to text for regular articles', () => {
      const item = {
        link: 'https://example.com/article',
        title: 'Sample Article'
      };
      
      const result = rssService.detectMediaType(item, 'Regular article content');
      expect(result).to.equal('text');
    });
  });

  describe('extractSummary', () => {
    it('should strip HTML tags from content', () => {
      const html = '<p>This is <strong>HTML</strong> content</p>';
      const result = rssService.extractSummary(html, 100);
      expect(result).to.equal('This is HTML content');
    });

    it('should limit summary to specified length', () => {
      const content = 'a'.repeat(200);
      const result = rssService.extractSummary(content, 50);
      expect(result.length).to.be.at.most(53); // 50 + '...'
    });

    it('should handle undefined content', () => {
      const result = rssService.extractSummary(undefined, 100);
      expect(result).to.equal('');
    });
  });

  describe('extractImage', () => {
    it('should extract image from enclosure', () => {
      const item = {
        enclosure: {
          type: 'image/jpeg',
          url: 'https://example.com/image.jpg'
        }
      };
      
      const result = rssService.extractImage(item);
      expect(result).to.equal('https://example.com/image.jpg');
    });

    it('should extract image from content:encoded', () => {
      const item = {
        'content:encoded': '<img src="https://example.com/image.jpg" alt="test">'
      };
      
      const result = rssService.extractImage(item);
      expect(result).to.equal('https://example.com/image.jpg');
    });

    it('should extract image from content', () => {
      const item = {
        content: '<p>Text <img src="https://example.com/photo.png"/> more text</p>'
      };
      
      const result = rssService.extractImage(item);
      expect(result).to.equal('https://example.com/photo.png');
    });

    it('should extract image from description', () => {
      const item = {
        description: '<div><img src="https://example.com/thumb.gif"></div>'
      };
      
      const result = rssService.extractImage(item);
      expect(result).to.equal('https://example.com/thumb.gif');
    });

    it('should return null when no image found', () => {
      const item = {
        description: 'Just plain text'
      };
      
      const result = rssService.extractImage(item);
      expect(result).to.be.null;
    });
  });

  describe('auto-refresh management', () => {
    it('should start auto-refresh with correct interval', () => {
      const feedId = 'test-feed-123';
      const userId = 'test-user-456';
      const intervalMinutes = 1;

      rssService.startAutoRefresh(feedId, userId, intervalMinutes);
      
      const status = rssService.getAutoRefreshStatus();
      expect(status).to.be.an('array');
      
      const job = status.find(j => j.feedId === feedId);
      expect(job).to.exist;
      expect(job.intervalMinutes).to.equal(intervalMinutes);
    });

    it('should stop auto-refresh', () => {
      const feedId = 'test-feed-123';
      const userId = 'test-user-456';
      
      rssService.startAutoRefresh(feedId, userId, 1);
      rssService.stopAutoRefresh(feedId);
      
      const status = rssService.getAutoRefreshStatus();
      const job = status.find(j => j.feedId === feedId);
      expect(job).to.be.undefined;
    });

    it('should not create duplicate intervals for same feed', () => {
      const feedId = 'test-feed-123';
      const userId = 'test-user-456';
      
      rssService.startAutoRefresh(feedId, userId, 1);
      rssService.startAutoRefresh(feedId, userId, 1);
      
      const status = rssService.getAutoRefreshStatus();
      const jobs = status.filter(j => j.feedId === feedId);
      expect(jobs.length).to.equal(1);
    });
  });
});
