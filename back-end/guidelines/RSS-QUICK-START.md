# RSS Feed Extraction - Quick Start Guide

## Installation

```bash
cd back-end
npm install  # Installs rss-parser dependency
```

## Quick Test

```bash
# Run manual tests to verify everything works
node test/manual-rss-test.js

# Expected output: ✅ All manual tests passed!
```

## Usage

### 1. Extract from a Single Feed

```bash
curl -X POST http://localhost:3000/api/feeds/FEED_ID/extract
```

### 2. Extract from All Feeds

```bash
curl -X POST http://localhost:3000/api/feeds/extract/all
```

### 3. Start Auto-Refresh (every hour)

```bash
curl -X POST http://localhost:3000/api/feeds/FEED_ID/auto-refresh/start \
  -H "Content-Type: application/json" \
  -d '{"intervalMinutes": 60}'
```

### 4. Check Auto-Refresh Status

```bash
curl http://localhost:3000/api/feeds/auto-refresh/status
```

### 5. Pause a Feed

```bash
curl -X POST http://localhost:3000/api/feeds/FEED_ID/pause
```

### 6. Resume a Feed

```bash
curl -X POST http://localhost:3000/api/feeds/FEED_ID/resume \
  -H "Content-Type: application/json" \
  -d '{"intervalMinutes": 60}'
```

### 7. Stop Auto-Refresh

```bash
curl -X POST http://localhost:3000/api/feeds/FEED_ID/auto-refresh/stop
```

## Common Workflows

### Setup a New Feed with Auto-Refresh

```bash
# 1. Create the feed
curl -X POST http://localhost:3000/api/feeds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech News",
    "url": "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    "category": "Technology"
  }'

# 2. Extract initial articles
curl -X POST http://localhost:3000/api/feeds/FEED_ID/extract

# 3. Enable auto-refresh every 2 hours
curl -X POST http://localhost:3000/api/feeds/FEED_ID/auto-refresh/start \
  -H "Content-Type: application/json" \
  -d '{"intervalMinutes": 120}'
```

### Temporarily Disable a Feed

```bash
# Pause (stops auto-refresh)
curl -X POST http://localhost:3000/api/feeds/FEED_ID/pause

# Resume later with 1-hour refresh
curl -X POST http://localhost:3000/api/feeds/FEED_ID/resume \
  -H "Content-Type: application/json" \
  -d '{"intervalMinutes": 60}'
```

### Bulk Extract from All Feeds

```bash
# Extract articles from all active feeds at once
curl -X POST http://localhost:3000/api/feeds/extract/all
```

## Response Examples

### Successful Extraction

```json
{
  "success": true,
  "feedId": "feed123",
  "feedName": "Tech News",
  "newArticles": 15,
  "totalArticles": 20,
  "skipped": 5
}
```

### Auto-Refresh Status

```json
{
  "success": true,
  "jobs": [
    {
      "feedId": "feed123",
      "active": true,
      "isRefreshing": false
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "message": "Feed not found"
}
```

## Recommended Intervals

| Feed Type | Refresh Interval |
|-----------|------------------|
| News Sites | 30-60 minutes |
| Blogs | 2-6 hours |
| Podcasts | 12-24 hours |
| Weekly Content | 24-48 hours |

## Features at a Glance

✅ **Automatic Article Extraction** - Parse RSS/Atom feeds  
✅ **Scheduled Auto-Refresh** - Configurable intervals per feed  
✅ **Pause/Resume** - Temporarily disable feeds  
✅ **Media Type Detection** - Text, audio, video  
✅ **Duplicate Prevention** - Won't create duplicate articles  
✅ **Image Extraction** - Finds and saves article images  
✅ **Summary Generation** - Clean, HTML-stripped summaries  
✅ **Concurrent Protection** - Prevents parallel refreshes  

## Testing

```bash
# Run integration tests
npm test -- test/rss-extraction.test.js

# Run unit tests
npm test -- test/rss-service.test.js

# Run manual tests
node test/manual-rss-test.js
```

## Documentation

- **API Reference:** `back-end/guidelines/RSS-EXTRACTION-API.md`
- **Implementation Details:** `back-end/guidelines/RSS-IMPLEMENTATION-SUMMARY.md`
- **Code:** `back-end/services/rssService.js`

## Troubleshooting

### Feed Won't Extract
- Check if feed is paused: GET `/api/feeds/FEED_ID`
- Verify RSS URL is valid and accessible
- Check server logs for parsing errors

### Duplicate Articles
- Service automatically prevents duplicates by URL
- Existing articles are skipped, not duplicated

### Auto-Refresh Not Working
- Check status: GET `/api/feeds/auto-refresh/status`
- Verify intervalMinutes was provided when starting
- Ensure feed is not paused

## Quick Commands Cheat Sheet

```bash
# Extract now
POST /api/feeds/:id/extract

# Extract all
POST /api/feeds/extract/all

# Start auto (1 hour)
POST /api/feeds/:id/auto-refresh/start {"intervalMinutes": 60}

# Stop auto
POST /api/feeds/:id/auto-refresh/stop

# Check status
GET /api/feeds/auto-refresh/status

# Pause
POST /api/feeds/:id/pause

# Resume (2 hours)
POST /api/feeds/:id/resume {"intervalMinutes": 120}
```

---

**Need help?** Check the full documentation in `RSS-EXTRACTION-API.md`
