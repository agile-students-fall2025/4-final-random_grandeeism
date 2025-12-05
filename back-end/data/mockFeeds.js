/**
 * Mock Feeds - Test data source
 * Aligned with Feed Mongoose schema
 * IDs use simple format: feed-1, feed-2, etc.
 */

const mockFeeds = [
  {
    "id": "feed-1",
    "name": "Tech Weekly",
    "url": "https://techweekly.com/feed",
    "description": "Weekly tech news and updates",
    "category": "Technology",
    "isActive": true,
    "favicon": "https://techweekly.com/favicon.ico",
    "articleCount": 0,
    "lastUpdated": "2024-01-05T00:00:00.000Z",
    "addedDate": "2024-01-01T00:00:00.000Z",
    "lastFetchAttempt": "2024-01-05T00:00:00.000Z",
    "lastSuccessfulFetch": "2024-01-05T00:00:00.000Z",
    "fetchErrors": [],
    "feedType": "rss",
    "updateFrequency": 24,
    "userId": "user-1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-05T00:00:00.000Z"
  },
  {
    "id": "feed-2",
    "name": "Dev.to",
    "url": "https://dev.to/feed",
    "description": "Community of software developers",
    "category": "Programming",
    "isActive": true,
    "favicon": "https://dev.to/favicon.ico",
    "articleCount": 0,
    "lastUpdated": "2024-01-05T00:00:00.000Z",
    "addedDate": "2024-01-02T00:00:00.000Z",
    "lastFetchAttempt": "2024-01-05T00:00:00.000Z",
    "lastSuccessfulFetch": "2024-01-05T00:00:00.000Z",
    "fetchErrors": [],
    "feedType": "rss",
    "updateFrequency": 60,
    "userId": "user-2",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-05T00:00:00.000Z"
  }
];

module.exports = { mockFeeds };
