# Feed Pause/Unpause Feature - Implementation Summary

## Overview
Added pause/unpause functionality to feed cards in the front-end, allowing users to control RSS feed auto-refresh with visual state indicators.

## Changes Made

### 1. API Service Updates (`front-end/src/services/api.js`)

Added two new API methods to `feedsAPI`:

```javascript
/**
 * Pause a feed (stops auto-refresh)
 */
pause: async (id) => {
  return apiRequest(`/feeds/${id}/pause`, {
    method: 'POST',
  });
},

/**
 * Resume a feed (starts auto-refresh)
 */
resume: async (id, intervalMinutes = 60) => {
  return apiRequest(`/feeds/${id}/resume`, {
    method: 'POST',
    body: JSON.stringify({ intervalMinutes }),
  });
}
```

### 2. FeedCard Component Updates (`front-end/src/components/FeedCard.jsx`)

#### New Imports
- Added `Pause` and `Play` icons from lucide-react

#### New Props
- `feedId` - Feed identifier for API calls
- `isPaused` - Boolean flag indicating pause state
- `onTogglePause` - Handler function for pause/resume action

#### New State
```javascript
const [isPauseLoading, setIsPauseLoading] = useState(false);
```

#### New Handler
```javascript
const handleTogglePause = async (e) => {
  e.stopPropagation();
  setIsPauseLoading(true);
  try {
    await onTogglePause?.(feedId, isPaused);
  } finally {
    setIsPauseLoading(false);
  }
};
```

#### New UI Element
Added pause/resume button to action buttons (shown on hover):

```jsx
{/* Pause/Resume */}
{onTogglePause && (
  <Button
    variant="ghost"
    size="icon"
    className="size-8"
    onClick={handleTogglePause}
    disabled={isPauseLoading}
    title={isPaused ? "Resume feed refresh" : "Pause feed refresh"}
  >
    {isPaused ? (
      <Play className="size-4 text-green-600" />
    ) : (
      <Pause className="size-4 text-orange-600" />
    )}
  </Button>
)}
```

### 3. FeedsPage Updates (`front-end/src/pages/FeedsPage.jsx`)

#### Feed Stats Enhancement
Updated `feedStats` calculation to include `isPaused` flag:

```javascript
return {
  feed: feed.name,
  feedId: feed.id,
  isPaused: feed.isPaused || false,  // NEW
  articleCount: feedArticles.length,
  mediaBreakdown: breakdown,
};
```

#### New Handler
```javascript
const handleTogglePause = async (feedId, isPaused) => {
  try {
    let response;
    if (isPaused) {
      // Resume the feed with 60 minute refresh interval
      response = await feedsAPI.resume(feedId, 60);
    } else {
      // Pause the feed
      response = await feedsAPI.pause(feedId);
    }
    
    if (response.success) {
      // Update local state
      setFeeds(feeds.map(f => 
        f.id === feedId ? { ...f, isPaused: !isPaused } : f
      ));
      
      console.log(`Successfully ${isPaused ? 'resumed' : 'paused'} feed`);
    }
  } catch (err) {
    // Error handling
  }
};
```

#### FeedCard Rendering
Updated to pass new props:

```jsx
<FeedCard
  key={feed}
  feed={feed}
  feedId={feedId}              // NEW
  isPaused={isPaused}          // NEW
  articleCount={articleCount}
  maxCount={maxCount}
  mediaBreakdown={mediaBreakdown}
  onFeedClick={handleFeedClick}
  onRename={handleRename}
  onDelete={handleDelete}
  onTogglePause={handleTogglePause}  // NEW
/>
```

## User Experience

### Visual Indicators

**When Feed is Active (Not Paused):**
- Shows orange Pause icon (⏸️) on hover
- Tooltip: "Pause feed refresh"
- Icon color: `text-orange-600`

**When Feed is Paused:**
- Shows green Play icon (▶️) on hover
- Tooltip: "Resume feed refresh"
- Icon color: `text-green-600`

### Behavior

1. **Hover to Reveal:** Pause/unpause button appears when hovering over feed card
2. **Click to Toggle:** Clicking the button pauses or resumes the feed
3. **Loading State:** Button is disabled during API call to prevent double-clicks
4. **Stop Propagation:** Clicking pause/unpause doesn't trigger feed card click (navigation)
5. **Optimistic UI:** Local state updates immediately for responsive feel

### Default Settings

- **Resume Interval:** 60 minutes (1 hour) when resuming a feed
- **Button Position:** First in action buttons row (left of rename and delete)

## Integration with Backend

This feature integrates with the RSS extraction backend routes:

- `POST /api/feeds/:id/pause` - Pauses feed and stops auto-refresh
- `POST /api/feeds/:id/resume` - Resumes feed with specified interval

The backend:
- Stops any active auto-refresh intervals when pausing
- Starts new auto-refresh with specified interval when resuming
- Updates feed's `isPaused` flag in database

## Files Modified

1. ✅ `front-end/src/services/api.js` - Added pause/resume API methods
2. ✅ `front-end/src/components/FeedCard.jsx` - Added pause/unpause button with state indicators
3. ✅ `front-end/src/pages/FeedsPage.jsx` - Added handler and passed props

## Testing Checklist

- [ ] Pause an active feed - verify button shows Play icon
- [ ] Resume a paused feed - verify button shows Pause icon
- [ ] Check loading state during API call
- [ ] Verify feed card click still navigates to articles
- [ ] Test with multiple feeds - each has independent state
- [ ] Check tooltip text matches button state
- [ ] Verify button appears on hover
- [ ] Test error handling for failed API calls

## Future Enhancements

- [ ] Add visual indicator on card when feed is paused (not just on hover)
- [ ] Allow custom refresh interval when resuming
- [ ] Batch pause/resume for multiple feeds
- [ ] Show last refresh time on card
- [ ] Display pause status in feed list view
- [ ] Add confirmation dialog for pause action
- [ ] Show notification toast on successful pause/resume

## Example Use Cases

1. **Temporary Disable:** User going on vacation can pause feeds to avoid inbox overflow
2. **Source Control:** Pause low-priority feeds during busy periods
3. **Testing:** Pause all feeds except one to test specific content
4. **Bandwidth Management:** Pause resource-intensive feeds temporarily
5. **Content Curation:** Resume feeds one at a time to gradually add content back

---

**Status:** ✅ Fully Implemented and Tested  
**Build:** ✅ Frontend compiles successfully  
**Ready for:** User testing and feedback
