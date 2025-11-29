# RSS Feed Extraction API

Complete API documentation for RSS feed extraction, auto-refresh, and feed management.

## Overview

The RSS extraction feature automatically fetches and parses articles from RSS feeds, creating article entries in the system. It supports:

- Manual extraction from single or all feeds
- Automatic scheduled refreshing with configurable intervals
- Pause/resume functionality for individual feeds
- Media type detection (text, audio, video)
- Duplicate article prevention
- Concurrent refresh protection

## API Endpoints

### 1. Extract Articles from Single Feed

**Endpoint:** `POST /api/feeds/:id/extract`

**Description:** Manually extract articles from a specific RSS feed.

**Parameters:**
- `id` (path parameter) - The feed ID

**Response Success:**
```json
{
  "success": true,
  "feedId": "feed123",
  "feedName": "Tech News",
  "newArticles": 5,
  "totalArticles": 20,
  "skipped": 15
}
```

**Response Error:**
```json
{
  "success": false,
  "message": "Feed not found"
}
```

**Response Paused Feed:**
```json
{
  "success": false,
  "message": "Feed is paused",
  "paused": true
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/extract \
  -H "Content-Type: application/json"
```

---

### 2. Extract Articles from All Feeds

**Endpoint:** `POST /api/feeds/extract/all`

**Description:** Extract articles from all active (non-paused) feeds for the current user.

**Response:**
```json
{
  "success": true,
  "feedsProcessed": 3,
  "totalNewArticles": 12,
  "results": [
    {
      "feedId": "feed123",
      "feedName": "Tech News",
      "newArticles": 5,
      "success": true
    },
    {
      "feedId": "feed456",
      "feedName": "Science Daily",
      "newArticles": 7,
      "success": true
    }
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/feeds/extract/all \
  -H "Content-Type: application/json"
```

---

### 3. Pause Feed

**Endpoint:** `POST /api/feeds/:id/pause`

**Description:** Pause a feed and stop its auto-refresh schedule.

**Parameters:**
- `id` (path parameter) - The feed ID

**Response:**
```json
{
  "success": true,
  "message": "Feed paused successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/pause \
  -H "Content-Type: application/json"
```

---

### 4. Resume Feed

**Endpoint:** `POST /api/feeds/:id/resume`

**Description:** Resume a paused feed and optionally start auto-refresh.

**Parameters:**
- `id` (path parameter) - The feed ID

**Request Body:**
```json
{
  "intervalMinutes": 60
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feed resumed successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/resume \
  -H "Content-Type: application/json" \
  -d '{"intervalMinutes": 60}'
```

---

### 5. Start Auto-Refresh

**Endpoint:** `POST /api/feeds/:id/auto-refresh/start`

**Description:** Start automatic scheduled refreshing for a feed.

**Parameters:**
- `id` (path parameter) - The feed ID

**Request Body:**
```json
{
  "intervalMinutes": 60
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-refresh started",
  "feedId": "feed123",
  "intervalMinutes": 60
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/auto-refresh/start \
  -H "Content-Type: application/json" \
  -d '{"intervalMinutes": 60}'
```

---

### 6. Stop Auto-Refresh

**Endpoint:** `POST /api/feeds/:id/auto-refresh/stop`

**Description:** Stop automatic refreshing for a feed (does not pause the feed).

**Parameters:**
- `id` (path parameter) - The feed ID

**Response:**
```json
{
  "success": true,
  "message": "Auto-refresh stopped",
  "feedId": "feed123"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/auto-refresh/stop \
  -H "Content-Type: application/json"
```

---

### 7. Get Auto-Refresh Status

**Endpoint:** `GET /api/feeds/auto-refresh/status`

**Description:** Get the status of all active auto-refresh jobs.

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "feedId": "feed123",
      "active": true,
      "isRefreshing": false
    },
    {
      "feedId": "feed456",
      "active": true,
      "isRefreshing": true
    }
  ]
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/feeds/auto-refresh/status \
  -H "Content-Type: application/json"
```

---

## RSSService Class

The core service that handles RSS parsing and article extraction.

### Methods

#### `extractFromFeed(feedId, userId)`
Extracts articles from a single RSS feed.

**Returns:**
```javascript
{
  success: true,
  feedId: string,
  feedName: string,
  newArticles: number,
  totalArticles: number,
  skipped: number
}
```

#### `extractFromAllFeeds(userId)`
Extracts articles from all active feeds for a user.

**Returns:**
```javascript
{
  success: true,
  feedsProcessed: number,
  totalNewArticles: number,
  results: Array<{
    feedId: string,
    feedName: string,
    newArticles: number,
    success: boolean
  }>
}
```

#### `startAutoRefresh(feedId, userId, intervalMinutes)`
Starts automatic scheduled refreshing for a feed.

**Parameters:**
- `feedId` (string) - Feed ID
- `userId` (string) - User ID
- `intervalMinutes` (number) - Refresh interval in minutes

#### `stopAutoRefresh(feedId)`
Stops automatic refreshing for a feed.

**Parameters:**
- `feedId` (string) - Feed ID

#### `pauseFeed(feedId, userId)`
Pauses a feed and stops auto-refresh.

**Returns:**
```javascript
{
  success: true,
  message: string
}
```

#### `resumeFeed(feedId, userId, intervalMinutes = 60)`
Resumes a paused feed and optionally starts auto-refresh.

**Parameters:**
- `feedId` (string) - Feed ID
- `userId` (string) - User ID
- `intervalMinutes` (number) - Optional refresh interval (default: 60)

**Returns:**
```javascript
{
  success: true,
  message: string
}
```

#### `getAutoRefreshStatus()`
Gets status of all active auto-refresh jobs.

**Returns:**
```javascript
[
  {
    feedId: string,
    active: boolean,
    isRefreshing: boolean
  }
]
```

### Helper Methods

#### `detectMediaType(item, content)`
Detects if an RSS item is text, audio, or video.

**Returns:** `'text' | 'audio' | 'video'`

#### `extractSummary(content, maxLength = 200)`
Strips HTML and creates a summary from content.

**Returns:** `string`

#### `extractImage(item)`
Extracts the first image URL from an RSS item.

**Returns:** `string | null`

---

## Article Creation

When articles are extracted from RSS feeds, the following data is populated:

```javascript
{
  title: string,                    // From RSS item title
  url: string,                      // From RSS item link
  feedId: string,                   // Parent feed ID
  userId: string,                   // User ID
  summary: string,                  // Extracted and cleaned
  imageUrl: string | null,          // First image found
  mediaType: 'text' | 'audio' | 'video',
  publishedAt: Date,                // From RSS pubDate
  isRead: false,                    // Default
  isFavorite: false,                // Default
  isArchived: false,                // Default
  tags: []                          // Empty by default
}
```

---

## Features

### Duplicate Prevention
The service checks for existing articles with the same URL before creating new ones, preventing duplicates.

### Concurrent Refresh Protection
Uses an `isRefreshing` Map to prevent the same feed from being refreshed multiple times simultaneously.

### Auto-Refresh Scheduling
Stores interval IDs in a `refreshIntervals` Map, allowing feeds to be refreshed automatically at configurable intervals.

### Media Type Detection
Automatically detects if content is:
- **Video**: YouTube, Vimeo, video enclosures
- **Audio**: Podcast enclosures, audio files
- **Text**: Regular articles (default)

### Pause/Resume
Feeds can be temporarily paused without deleting them, stopping auto-refresh and preventing manual extraction.

---

## Usage Examples

### Basic Workflow

1. **Create a feed:**
```bash
curl -X POST http://localhost:3000/api/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech News",
    "url": "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    "category": "Technology",
    "refreshInterval": 60
  }'
```

2. **Extract articles manually:**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/extract
```

3. **Start auto-refresh (every 2 hours):**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/auto-refresh/start \
  -d '{"intervalMinutes": 120}'
```

4. **Check auto-refresh status:**
```bash
curl -X GET http://localhost:3000/api/feeds/auto-refresh/status
```

5. **Pause feed temporarily:**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/pause
```

6. **Resume feed:**
```bash
curl -X POST http://localhost:3000/api/feeds/feed123/resume \
  -d '{"intervalMinutes": 60}'
```

---

## Testing

### Manual Tests
Run the manual test script:
```bash
node test/manual-rss-test.js
```

### Integration Tests
Run the full integration test suite:
```bash
npm test -- test/rss-extraction.test.js
```

### Unit Tests
Run unit tests for the RSS service:
```bash
npm test -- test/rss-service.test.js
```

---

## Error Handling

### Common Errors

**Feed Not Found:**
```json
{
  "success": false,
  "message": "Feed not found"
}
```

**Feed is Paused:**
```json
{
  "success": false,
  "message": "Feed is paused",
  "paused": true
}
```

**Already Refreshing:**
```json
{
  "success": false,
  "message": "Feed is already being refreshed"
}
```

**Invalid RSS Feed:**
```json
{
  "success": false,
  "message": "Failed to parse RSS feed",
  "error": "Invalid XML"
}
```

---

## Configuration

### Recommended Refresh Intervals

- **News Sites:** 30-60 minutes
- **Blogs:** 2-6 hours
- **Podcasts:** 12-24 hours
- **Weekly Publications:** 24-48 hours

### Performance Considerations

- Avoid intervals shorter than 15 minutes to prevent rate limiting
- For many feeds (50+), stagger auto-refresh start times
- Monitor memory usage if running hundreds of concurrent refreshes

---

## Dependencies

- **rss-parser** (^3.13.0): RSS/Atom feed parsing
- **feedsDao**: Database access for feeds
- **articlesDao**: Database access for articles

---

## Future Enhancements

- [ ] Rate limiting per feed
- [ ] Feed health monitoring (detect broken feeds)
- [ ] Retry logic with exponential backoff
- [ ] Webhook notifications for new articles
- [ ] Feed update statistics and analytics
- [ ] Batch processing for large feeds
- [ ] Custom parsing rules per feed
- [ ] Content filtering and moderation
