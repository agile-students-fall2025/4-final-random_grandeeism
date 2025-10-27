# SearchFilter.jsx Creation Prompt - COMPLETE GUIDE

## Task
Create `/components/SearchFilter.jsx` - the advanced search and filtering component for the fieldnotes read-it-later app.

---

## Component Overview

SearchFilter is a sophisticated filtering interface that provides:
- 🔍 **Text search** with live updates
- 🏷️ **Tag filtering** with multi-select dropdown
- ⏱️ **Reading time filter** (short, medium, long)
- 📱 **Media type filter** (article, video, podcast)
- 📊 **Status filter** (inbox, daily reading, continue reading, etc.)
- ⭐ **Favorites filter** (all, starred only, non-starred)
- 📡 **Feed filter** (RSS feed source)
- 🔄 **Sort options** (date added, time ascending/descending)
- 📌 **Pin as Stack** button (save current search)
- ✅ **Select All** button (bulk selection integration)
- 🔖 **Active filter chips** with remove buttons
- 🔒 **Locked filters** (non-removable pre-applied filters)

**Used By:** TopBar component (advanced search mode)

---

## Design Specifications

### Visual Design System
✅ **Completely Grayscale** - No color except red for warnings  
✅ **Flat Design** - Minimal shadows (only on dropdowns)  
✅ **Minimal Rounding** - `rounded-lg` for buttons/dropdowns  
✅ **Single Pixel Borders** - `border border-border`  
✅ **Sticky Filter Chips** - Always visible when active  

### Layout Structure
```
┌────────────────────────────────────────────────────────────┐
│ SearchFilter Container                                     │
├────────────────────────────────────────────────────────────┤
│ Row 1: [🔍 Search Input]           [📌 Pin] [✅ Select All] │
│        [🎛️ Filter Toggle Button]                           │
├────────────────────────────────────────────────────────────┤
│ Row 2: [Active Filter Chips] [🔒 Locked Chips] [Clear All] │
├────────────────────────────────────────────────────────────┤
│ Row 3: [Tag] [Feed] [Time] [Media] [Status] [⭐] [Sort]   │
│        ↑ Filter buttons (when filter toggle active)        │
└────────────────────────────────────────────────────────────┘

Each filter button opens a dropdown menu below it (z-50)
```

---

## Props Interface

```javascript
export default function SearchFilter({
  // Required
  onSearch,                    // (query: string, filters: SearchFilters) => void
  
  // Configuration
  placeholder = "Search by name or content...",  // string
  availableTags = [],          // string[] - Tags to show in dropdown
  availableFeeds = [],         // Array<{id: string, name: string}>
  showTimeFilter = true,       // boolean - Show reading time filter
  showMediaFilter = false,     // boolean - Show media type filter
  showTagFilter = true,        // boolean - Show tag filter
  showSortOptions = true,      // boolean - Show sort dropdown
  showStatusFilter = false,    // boolean - Show status filter
  showFavoritesFilter = false, // boolean - Show favorites filter
  showFeedFilter = false,      // boolean - Show feed filter
  
  // Initial State
  preAppliedFilters,           // SearchFilters object - Pre-applied state
  initialQuery = "",           // string - Initial search text
  
  // Locked Filters (non-removable)
  lockedFilters = {},          // {status?, mediaType?, favoritesFilter?}
  onFilterChipRemoved,         // () => void - Called when locked chip removed
  
  // Actions
  onSaveSearch,                // () => void - Save as Stack button
  
  // Selection Mode (Bulk Actions)
  selectionMode = false,       // boolean - Current selection state
  onSelectAll,                 // () => void - Select all items callback
  selectedCount = 0,           // number - Count of selected items
  totalCount = 0               // number - Total items available
}) {
  // Component implementation
}
```

### SearchFilters Object Structure
```javascript
{
  query: string,              // Search text
  tags: string[],             // Selected tags
  timeFilter: string,         // "all" | "short" | "medium" | "long"
  mediaType: string,          // "all" | "article" | "video" | "podcast"
  sortBy: string,             // "dateAdded" | "timeAsc" | "timeDesc" | "none"
  status: string,             // "all" | "inbox" | "dailyReading" | "inProgress" | "rediscovery" | "archived"
  favoritesFilter: string,    // "all" | "favorites" | "nonFavorites"
  feedFilter: string          // Feed ID or ""
}
```

---

## Dependencies & Imports

```javascript
import { useState, useEffect, useRef } from "react";
import { 
  Search,       // Search icon
  X,            // Clear/remove icon
  Filter,       // Filter toggle icon
  Tag,          // Tag filter icon
  Clock,        // Time filter icon
  ArrowUpDown,  // Sort icon
  Inbox,        // Status filter icon
  Star,         // Favorites filter icon
  Pin,          // Save search icon
  Rss           // Feed filter icon
} from "lucide-react";

import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";
```

### Required Files
✅ **Custom Components:**
- `/components/ui/badge.jsx` - ShadCN badge component ✅ EXISTS
- `/components/ui/button.jsx` - ShadCN button component ✅ EXISTS

✅ **NO OTHER DEPENDENCIES!**

---

## State Management

### Filter State (8 variables)
```javascript
const [searchQuery, setSearchQuery] = useState(initialQuery);
const [selectedTags, setSelectedTags] = useState(preAppliedFilters?.tags || []);
const [timeFilter, setTimeFilter] = useState(preAppliedFilters?.timeFilter || "all");
const [mediaType, setMediaType] = useState(lockedFilters.mediaType || preAppliedFilters?.mediaType || "all");
const [sortBy, setSortBy] = useState(preAppliedFilters?.sortBy || "dateAdded");
const [statusFilter, setStatusFilter] = useState(lockedFilters.status || preAppliedFilters?.status || "all");
const [favoritesFilter, setFavoritesFilter] = useState(lockedFilters.favoritesFilter || preAppliedFilters?.favoritesFilter || "all");
const [feedFilter, setFeedFilter] = useState(preAppliedFilters?.feedFilter || "");
```

**Initialization Priority:**
1. Locked filters (can't be changed)
2. Pre-applied filters (initial state)
3. Default values ("all", "dateAdded", "", [])

### Dropdown State (7 variables)
```javascript
const [showFilters, setShowFilters] = useState(false);           // Master toggle
const [showTagDropdown, setShowTagDropdown] = useState(false);
const [showTimeDropdown, setShowTimeDropdown] = useState(false);
const [showMediaDropdown, setShowMediaDropdown] = useState(false);
const [showSortDropdown, setShowSortDropdown] = useState(false);
const [showStatusDropdown, setShowStatusDropdown] = useState(false);
const [showFavoritesDropdown, setShowFavoritesDropdown] = useState(false);
const [showFeedDropdown, setShowFeedDropdown] = useState(false);
```

**Behavior:**
- Only one dropdown open at a time
- Opening a dropdown closes all others
- Filter buttons only visible when `showFilters={true}`

### Ref for Change Detection
```javascript
const prevFiltersRef = useRef(undefined);
```

**Purpose:** Track previous `preAppliedFilters` to detect changes and prevent infinite loops

---

## Filter Labels & Options

### Time Filter
```javascript
const timeFilterLabels = {
  all: "All Lengths",
  short: "Short (< 5 min)",
  medium: "Medium (5-15 min)",
  long: "Long (> 15 min)"
};
```

### Media Type Filter
```javascript
const mediaTypeLabels = {
  all: "All Types",
  article: "Text",
  video: "Video",
  podcast: "Audio"
};
```

### Sort Options
```javascript
const sortLabels = {
  dateAdded: "Date Added",
  timeAsc: "Shortest First",
  timeDesc: "Longest First",
  none: "No Sort"
};
```

### Status Filter
```javascript
const statusFilterLabels = {
  all: "All Status",
  inbox: "Inbox",
  dailyReading: "Daily Reading",
  inProgress: "Continue Reading",
  rediscovery: "Rediscovery",
  archived: "Archived"
};
```

### Favorites Filter
```javascript
const favoritesFilterLabels = {
  all: "All Articles",
  favorites: "Starred Only",
  nonFavorites: "Non-Starred"
};
```

---

## Component Structure

### Row 1: Search Bar & Action Buttons

```jsx
<div className="px-4 py-3 md:px-6">
  <div className="flex items-center gap-2 mb-3">
    {/* Search Input */}
    <div className="flex-1 flex items-center gap-2 bg-input-background border border-border rounded-lg px-3 py-2">
      <Search size={18} className="text-muted-foreground flex-shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-foreground text-[14px] outline-none placeholder:text-muted-foreground"
      />
      {searchQuery && (
        <button onClick={clearSearch} className="p-1 hover:opacity-70 transition-opacity">
          <X size={14} className="text-muted-foreground" />
        </button>
      )}
    </div>
    
    {/* Pin Button (visible when filters are active) */}
    {hasActiveFilters && onSaveSearch && (
      <button
        onClick={onSaveSearch}
        className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
        title="Pin as Stack"
      >
        <Pin size={18} />
      </button>
    )}

    {/* Select All Button (visible in selection mode) */}
    {selectionMode && onSelectAll && (
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
        className="text-[13px] whitespace-nowrap"
        disabled={totalCount === 0}
      >
        <span className="hidden sm:inline">
          {selectedCount === totalCount && totalCount > 0 ? "Deselect All" : "Select All"}
        </span>
        <span className="sm:hidden">
          {selectedCount === totalCount && totalCount > 0 ? "Deselect" : "Select"}
        </span>
      </Button>
    )}

    {/* Filter Toggle Button */}
    <button
      onClick={() => setShowFilters(!showFilters)}
      className={`p-2 rounded-lg transition-colors ${
        hasActiveFilters ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80"
      }`}
    >
      <Filter size={18} />
    </button>
  </div>
  
  {/* Row 2 & 3 below... */}
</div>
```

**Key Details:**
- Search input: Full width with flex-1
- Clear button: Only shows when searchQuery has text
- Pin button: Only shows when hasActiveFilters AND callback provided
- Select All button: Only shows in selectionMode AND callback provided
  - Text changes based on selectedCount === totalCount
  - Disabled when totalCount === 0
  - Hidden on very small screens (sm:hidden for "All"/"Deselect")
- Filter toggle: Background changes based on hasActiveFilters

---

### Row 2: Active Filter Chips

```jsx
{(hasActiveFilters || lockedFilters.status || lockedFilters.mediaType || lockedFilters.favoritesFilter) && (
  <div className="flex flex-wrap items-center gap-2 mb-2">
    {/* Locked Status Filter */}
    {lockedFilters.status && lockedFilters.status !== "all" && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {statusFilterLabels[lockedFilters.status]}
        {onFilterChipRemoved && (
          <button onClick={onFilterChipRemoved} className="hover:opacity-70">
            <X size={12} />
          </button>
        )}
      </Badge>
    )}
    
    {/* Locked Media Type Filter */}
    {lockedFilters.mediaType && lockedFilters.mediaType !== "all" && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {mediaTypeLabels[lockedFilters.mediaType]}
        {onFilterChipRemoved && (
          <button onClick={onFilterChipRemoved} className="hover:opacity-70">
            <X size={12} />
          </button>
        )}
      </Badge>
    )}
    
    {/* Locked Favorites Filter */}
    {lockedFilters.favoritesFilter && lockedFilters.favoritesFilter !== "all" && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {favoritesFilterLabels[lockedFilters.favoritesFilter]}
        {onFilterChipRemoved && (
          <button onClick={onFilterChipRemoved} className="hover:opacity-70">
            <X size={12} />
          </button>
        )}
      </Badge>
    )}
    
    {/* Removable filters (tags, time, media, sort, status, favorites, feed) */}
    {selectedTags.map(tag => (
      <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {tag}
        <button onClick={() => removeTag(tag)} className="hover:opacity-70">
          <X size={12} />
        </button>
      </Badge>
    ))}
    
    {timeFilter !== "all" && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {timeFilterLabels[timeFilter]}
        <button onClick={() => setTimeFilter("all")} className="hover:opacity-70">
          <X size={12} />
        </button>
      </Badge>
    )}
    
    {mediaType !== "all" && mediaType !== lockedFilters.mediaType && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {mediaTypeLabels[mediaType]}
        <button onClick={() => setMediaType(lockedFilters.mediaType || "all")} className="hover:opacity-70">
          <X size={12} />
        </button>
      </Badge>
    )}
    
    {sortBy !== "dateAdded" && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {sortLabels[sortBy]}
        <button onClick={() => setSortBy("dateAdded")} className="hover:opacity-70">
          <X size={12} />
        </button>
      </Badge>
    )}
    
    {statusFilter !== "all" && statusFilter !== lockedFilters.status && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {statusFilterLabels[statusFilter]}
        <button onClick={() => setStatusFilter(lockedFilters.status || "all")} className="hover:opacity-70">
          <X size={12} />
        </button>
      </Badge>
    )}
    
    {favoritesFilter !== "all" && favoritesFilter !== lockedFilters.favoritesFilter && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {favoritesFilterLabels[favoritesFilter]}
        <button onClick={() => setFavoritesFilter(lockedFilters.favoritesFilter || "all")} className="hover:opacity-70">
          <X size={12} />
        </button>
      </Badge>
    )}
    
    {feedFilter && (
      <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
        {availableFeeds.find(f => f.id === feedFilter)?.name || "Feed"}
        <button onClick={() => setFeedFilter("")} className="hover:opacity-70">
          <X size={12} />
        </button>
      </Badge>
    )}
    
    {/* Clear All Button */}
    {hasActiveFilters && (
      <button
        onClick={clearAllFilters}
        className="text-[12px] text-muted-foreground hover:text-foreground transition-colors underline"
      >
        Clear all
      </button>
    )}
  </div>
)}
```

**Key Details:**
- Entire section only shows if filters are active OR locked filters exist
- **Locked filters** displayed first with remove button (calls `onFilterChipRemoved`)
- **Removable filters** displayed in order: tags → time → media → sort → status → favorites → feed
- Each removable filter:
  - Only shows if not default value
  - Respects locked filters (doesn't show duplicate)
  - X button resets to default (or locked value)
- Tags: Mapped array with unique key
- Feed: Shows feed name from availableFeeds array
- Clear All: Only shows if hasActiveFilters
  - Resets all to defaults (respecting locked filters)

---

### Row 3: Filter Buttons

```jsx
{showFilters && (
  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
    {/* Tag Filter */}
    {showTagFilter && availableTags.length > 0 && (
      <div className="relative">
        <button
          onClick={() => {
            setShowTagDropdown(!showTagDropdown);
            setShowTimeDropdown(false);
            setShowMediaDropdown(false);
            setShowSortDropdown(false);
            setShowStatusDropdown(false);
            setShowFavoritesDropdown(false);
            setShowFeedDropdown(false);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
        >
          <Tag size={14} />
          Tags
          {selectedTags.length > 0 && (
            <Badge variant="default" className="ml-1 h-5 min-w-5 flex items-center justify-center px-1">
              {selectedTags.length}
            </Badge>
          )}
        </button>
        
        {showTagDropdown && (
          <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                  selectedTags.includes(tag) ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{tag}</span>
                  {selectedTags.includes(tag) && (
                    <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Feed Filter - Similar structure */}
    {/* Time Filter - Similar structure */}
    {/* Media Type Filter - Similar structure */}
    {/* Status Filter - Similar structure */}
    {/* Favorites Filter - Similar structure */}
    {/* Sort Options - Similar structure */}
  </div>
)}
```

**Pattern for All Filters:**

1. **Button Structure:**
   ```jsx
   <button onClick={handleToggle}>
     <Icon size={14} />
     {currentLabel}
     {/* Badge count for tags only */}
   </button>
   ```

2. **Dropdown Structure:**
   ```jsx
   {showDropdown && (
     <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[...px]">
       {options.map(option => (
         <button
           key={option}
           onClick={() => selectOption(option)}
           className={`w-full text-left px-3 py-2 rounded hover:bg-accent ${
             isSelected ? "bg-accent" : ""
           }`}
         >
           {optionLabel}
         </button>
       ))}
     </div>
   )}
   ```

3. **Toggle Behavior:**
   ```javascript
   const handleToggle = () => {
     setShowThisDropdown(!showThisDropdown);
     // Close all other dropdowns
     setShowOtherDropdown1(false);
     setShowOtherDropdown2(false);
     // ... etc
   };
   ```

**Dropdown Specifics:**

- **Tag Filter:** Multi-select with checkmark indicator, count badge
- **Feed Filter:** Single-select with "All Feeds" option
- **Time Filter:** Single-select (all, short, medium, long)
- **Media Type Filter:** Single-select, hidden if locked
- **Status Filter:** Single-select, hidden if locked
- **Favorites Filter:** Single-select, hidden if locked
- **Sort Options:** Single-select (dateAdded, timeAsc, timeDesc, none)

---

## Event Handlers

### 1. Search Change
```javascript
const handleSearchChange = (e) => {
  setSearchQuery(e.target.value);
};
```

### 2. Clear Search
```javascript
const clearSearch = () => {
  setSearchQuery("");
};
```

### 3. Toggle Tag (Multi-select)
```javascript
const toggleTag = (tag) => {
  setSelectedTags(prev => 
    prev.includes(tag) 
      ? prev.filter(t => t !== tag)  // Remove if exists
      : [...prev, tag]                // Add if doesn't exist
  );
};
```

### 4. Remove Tag (From chip)
```javascript
const removeTag = (tag) => {
  setSelectedTags(prev => prev.filter(t => t !== tag));
};
```

### 5. Clear All Filters
```javascript
const clearAllFilters = () => {
  setSelectedTags([]);
  setTimeFilter("all");
  setMediaType(lockedFilters.mediaType || "all");
  setSortBy("dateAdded");
  setStatusFilter(lockedFilters.status || "all");
  setFavoritesFilter(lockedFilters.favoritesFilter || "all");
  setFeedFilter("");
  setSearchQuery("");
};
```

**Important:** Respects locked filters - resets to locked value, not "all"

---

## Effects & Side Effects

### Effect 1: Sync with Pre-Applied Filters
```javascript
useEffect(() => {
  if (!preAppliedFilters) return;

  // Check if preAppliedFilters actually changed
  const prev = prevFiltersRef.current;
  const hasChanged = !prev ||
    prev.query !== preAppliedFilters.query ||
    prev.timeFilter !== preAppliedFilters.timeFilter ||
    prev.mediaType !== preAppliedFilters.mediaType ||
    prev.sortBy !== preAppliedFilters.sortBy ||
    prev.status !== preAppliedFilters.status ||
    prev.favoritesFilter !== preAppliedFilters.favoritesFilter ||
    prev.feedFilter !== preAppliedFilters.feedFilter ||
    JSON.stringify(prev.tags) !== JSON.stringify(preAppliedFilters.tags);

  if (hasChanged) {
    prevFiltersRef.current = preAppliedFilters;
    
    // Update all filter state
    const newQuery = preAppliedFilters.query || "";
    const newTags = preAppliedFilters.tags || [];
    const newTimeFilter = preAppliedFilters.timeFilter || "all";
    const newMediaType = lockedFilters.mediaType || preAppliedFilters.mediaType || "all";
    const newSortBy = preAppliedFilters.sortBy || "dateAdded";
    const newStatusFilter = lockedFilters.status || preAppliedFilters.status || "all";
    const newFavoritesFilter = lockedFilters.favoritesFilter || preAppliedFilters.favoritesFilter || "all";
    const newFeedFilter = preAppliedFilters.feedFilter || "";

    setSearchQuery(newQuery);
    setSelectedTags(newTags);
    setTimeFilter(newTimeFilter);
    setMediaType(newMediaType);
    setSortBy(newSortBy);
    setStatusFilter(newStatusFilter);
    setFavoritesFilter(newFavoritesFilter);
    setFeedFilter(newFeedFilter);
  }
}, [preAppliedFilters, lockedFilters]);
```

**Purpose:**
- Reset filter state when parent changes preAppliedFilters (e.g., tab switch)
- Prevent infinite loops by checking if values actually changed
- Store previous values in ref for comparison
- Respect locked filters (they take precedence)

### Effect 2: Trigger Search on Filter Change
```javascript
useEffect(() => {
  onSearch(searchQuery, {
    query: searchQuery,
    tags: selectedTags,
    timeFilter,
    mediaType,
    sortBy,
    status: statusFilter,
    favoritesFilter,
    feedFilter
  });
}, [searchQuery, selectedTags, timeFilter, mediaType, sortBy, statusFilter, favoritesFilter, feedFilter]);
```

**Purpose:**
- Call parent's onSearch callback whenever ANY filter changes
- Live updates - results update immediately
- Passes complete filter object

**Note:** `onSearch` is not in dependency array (it's a callback prop)

---

## Computed Values

### Has Active Filters
```javascript
const hasActiveFilters = 
  selectedTags.length > 0 || 
  timeFilter !== "all" || 
  (mediaType !== "all" && mediaType !== lockedFilters.mediaType) || 
  searchQuery !== "" || 
  sortBy !== "dateAdded" || 
  (statusFilter !== "all" && statusFilter !== lockedFilters.status) || 
  (favoritesFilter !== "all" && favoritesFilter !== lockedFilters.favoritesFilter) ||
  feedFilter !== "";
```

**Used For:**
- Show/hide Pin button
- Show/hide Clear All button
- Show/hide filter chips section
- Change filter toggle button color

**Logic:**
- Any filter different from default = active
- Locked filters don't count (mediaType, status, favoritesFilter)
- Search query counts even if empty string (tracks input focus)

---

## Styling Requirements

### CSS Variables
```css
bg-background           /* Main background */
bg-input-background     /* Input field background */
bg-card                 /* Dropdown background */
bg-accent              /* Hover states, button background */
bg-primary             /* Active filter toggle, checkmark */
text-foreground        /* Primary text */
text-muted-foreground  /* Icons, placeholders */
text-accent-foreground /* Text on accent background */
text-primary-foreground /* Text on primary background */
border-border          /* All borders */
```

### Typography
```css
/* Search input */
text-[14px]

/* Filter buttons */
text-[14px]

/* Dropdown options */
text-[14px]

/* Clear all link */
text-[12px]

/* Select All button */
text-[13px]

/* Badge text */
text-[11px]  /* Default from ShadCN */
```

### Spacing & Sizing
```css
/* Container padding */
px-4 py-3 md:px-6

/* Search bar */
px-3 py-2

/* Filter buttons */
px-3 py-2

/* Dropdown */
min-w-[160px] to min-w-[200px]
max-h-[300px]  /* Tag dropdown only */
p-2

/* Gaps */
gap-2  /* Between elements */
gap-1  /* Badge content */

/* Margins */
mb-3  /* Below search row */
mb-2  /* Below chips row */
mt-1  /* Dropdown from button */
```

### Borders & Rounding
```css
/* Main container */
border-b border-border

/* Search input */
border border-border
rounded-lg

/* Filter buttons */
rounded-lg

/* Dropdowns */
border border-border
rounded-lg
shadow-lg  /* ONLY shadows in component */

/* Badges */
rounded-full  /* ShadCN default */

/* Pin button */
rounded-lg
```

### Z-Index
```css
Dropdowns: z-50  /* Above TopBar (z-40) */
```

---

## Dropdown Patterns

### Single-Select Dropdown (Time, Media, Status, Favorites, Sort)
```jsx
<div className="relative">
  {/* Button */}
  <button onClick={toggleDropdown}>
    <Icon size={14} />
    {currentFilterLabels[currentValue]}
  </button>
  
  {/* Dropdown */}
  {showDropdown && (
    <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
      {Object.keys(filterLabels).map(option => (
        <button
          key={option}
          onClick={() => {
            setFilter(option);
            setShowDropdown(false);  // Close after selection
          }}
          className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
            currentValue === option ? "bg-accent" : ""
          }`}
        >
          {filterLabels[option]}
        </button>
      ))}
    </div>
  )}
</div>
```

### Multi-Select Dropdown (Tags)
```jsx
<div className="relative">
  {/* Button with count badge */}
  <button onClick={toggleDropdown}>
    <Tag size={14} />
    Tags
    {selectedTags.length > 0 && (
      <Badge variant="default">
        {selectedTags.length}
      </Badge>
    )}
  </button>
  
  {/* Dropdown */}
  {showDropdown && (
    <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
      {availableTags.map(tag => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}  // Toggle, don't close
          className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
            selectedTags.includes(tag) ? "bg-accent" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{tag}</span>
            {selectedTags.includes(tag) && (
              <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground rounded-full" />
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )}
</div>
```

### Feed Dropdown (with "All" option)
```jsx
<div className="relative">
  {/* Button shows current selection */}
  <button onClick={toggleDropdown}>
    <Rss size={14} />
    {feedFilter ? (
      availableFeeds.find(f => f.id === feedFilter)?.name || "Feed"
    ) : (
      "All Feeds"
    )}
  </button>
  
  {/* Dropdown */}
  {showDropdown && (
    <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
      {/* "All Feeds" option */}
      <button
        onClick={() => {
          setFeedFilter("");
          setShowFeedDropdown(false);
        }}
        className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
          feedFilter === "" ? "bg-accent" : ""
        }`}
      >
        All Feeds
      </button>
      
      {/* Individual feeds */}
      {availableFeeds.map(feed => (
        <button
          key={feed.id}
          onClick={() => {
            setFeedFilter(feed.id);
            setShowFeedDropdown(false);
          }}
          className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
            feedFilter === feed.id ? "bg-accent" : ""
          }`}
        >
          {feed.name}
        </button>
      ))}
    </div>
  )}
</div>
```

---

## Integration with TopBar

TopBar passes these props:
```jsx
<SearchFilter
  onSearch={onSearchWithFilters}
  placeholder={searchPlaceholder}
  availableTags={availableTags}
  availableFeeds={availableFeeds}
  showTimeFilter={showTimeFilter}
  showMediaFilter={showMediaFilter}
  showTagFilter={showTagFilter}
  showStatusFilter={showStatusFilter}
  showFavoritesFilter={showFavoritesFilter}
  showFeedFilter={showFeedFilter}
  showSortOptions={showSortOptions}
  preAppliedFilters={preAppliedFilters}
  lockedFilters={lockedFilters}
  onSaveSearch={onSaveSearch}
  onFilterChipRemoved={onFilterChipRemoved}
  selectionMode={selectionMode}
  onSelectAll={onSelectAll}
  selectedCount={selectedCount}
  totalCount={totalCount}
/>
```

Parent receives callback:
```javascript
const handleSearchWithFilters = (query, filters) => {
  // filters object contains all current filter state
  // Apply filters to article list
  const filtered = applyFilters(allArticles, filters);
  setFilteredArticles(filtered);
};
```

---

## Example Usage Patterns

### 1. Basic Search Page
```jsx
<SearchFilter
  onSearch={handleSearch}
  availableTags={["Design", "Development", "AI"]}
  showTimeFilter={true}
  showMediaFilter={true}
  showTagFilter={true}
  showSortOptions={true}
/>
```

### 2. Videos Page (Locked Media Type)
```jsx
<SearchFilter
  onSearch={handleSearch}
  availableTags={allTags}
  lockedFilters={{
    mediaType: "video"
  }}
  preAppliedFilters={{
    mediaType: "video",
    sortBy: "dateAdded"
  }}
  showTimeFilter={true}
  showStatusFilter={true}
  onFilterChipRemoved={() => navigate("/articles")}
/>
```

### 3. Inbox Page (Locked Status)
```jsx
<SearchFilter
  onSearch={handleSearch}
  availableTags={allTags}
  lockedFilters={{
    status: "inbox"
  }}
  preAppliedFilters={{
    status: "inbox"
  }}
  showTimeFilter={true}
  showTagFilter={true}
  onFilterChipRemoved={() => navigate("/home")}
/>
```

### 4. Favorites Page
```jsx
<SearchFilter
  onSearch={handleSearch}
  lockedFilters={{
    favoritesFilter: "favorites"
  }}
  preAppliedFilters={{
    favoritesFilter: "favorites"
  }}
  showTimeFilter={true}
  showMediaFilter={true}
  onSaveSearch={saveAsStack}
/>
```

### 5. Feed Page
```jsx
<SearchFilter
  onSearch={handleSearch}
  availableFeeds={[
    { id: "1", name: "TechCrunch" },
    { id: "2", name: "Hacker News" }
  ]}
  showFeedFilter={true}
  showTimeFilter={true}
/>
```

---

## Accessibility

### Keyboard Navigation
- Tab through: Search input → Pin → Select All → Filter toggle → Filter buttons
- Enter to activate buttons
- Arrow keys in dropdowns (future enhancement)

### ARIA Labels
```jsx
<button aria-label="Pin this search as a Stack">
  <Pin size={18} />
</button>

<button aria-label="Toggle filters">
  <Filter size={18} />
</button>
```

### Screen Reader
- Filter count announced in Tag button badge
- Active filters announced via chips
- Dropdown state changes

---

## Performance Considerations

### 1. Live Search
- Search triggers on every keystroke
- Consider debouncing in parent component
- useEffect runs on every filter change

### 2. Dropdown Rendering
- Dropdowns only render when open (conditional)
- Tags/Feeds may have long lists → scrollable

### 3. Filter Synchronization
- prevFiltersRef prevents infinite loops
- Deep comparison only when needed (JSON.stringify for tags)

---

## Testing Checklist

### Visual
- [ ] All colors grayscale
- [ ] Dropdowns have subtle shadow
- [ ] Active filters show chips
- [ ] Locked filters show with remove button
- [ ] Pin button appears when filters active
- [ ] Filter toggle changes color when active
- [ ] Badges render correctly

### Functional
- [ ] Search input types and clears
- [ ] Each filter dropdown opens/closes
- [ ] Only one dropdown open at a time
- [ ] Tag multi-select works (checkmarks)
- [ ] Single-select closes dropdown after selection
- [ ] Filter chips appear/disappear correctly
- [ ] Chip X buttons remove filters
- [ ] Clear All resets everything (respects locked)
- [ ] Pin button calls onSaveSearch
- [ ] Select All toggles text based on count
- [ ] Locked filter chips call onFilterChipRemoved

### Integration
- [ ] onSearch called with correct filter object
- [ ] preAppliedFilters updates component state
- [ ] lockedFilters can't be changed
- [ ] Works with TopBar component
- [ ] No console errors

### Edge Cases
- [ ] No tags available → tag filter hidden
- [ ] No feeds available → feed filter hidden
- [ ] Locked filter same as selected → no duplicate chip
- [ ] Empty feed list → "Feed" fallback text
- [ ] totalCount = 0 → Select All disabled

---

## Common Pitfalls to Avoid

### ❌ Don't:
- Use plain JSX only
- Add colors (grayscale only)
- Forget to close other dropdowns when opening one
- Show locked filter in both locked and removable sections
- Forget optional chaining on callbacks (`onSaveSearch?.()`)
- Miss the count badge on Tag filter
- Hardcode filter options (use label objects)
- Forget `flex-shrink-0` on icons
- Miss the `z-50` on dropdowns

### ✅ Do:
- Use CSS variables for all colors
- Close all dropdowns when opening one
- Respect locked filters in clearAllFilters
- Use optional chaining for all callbacks
- Add scroll to dropdowns with many items (tags, feeds)
- Make dropdowns absolutely positioned
- Use hasActiveFilters for conditional rendering
- Test with no tags, no feeds
- Handle feed name fallback

---

## File Location

**Create at:** `/components/SearchFilter.jsx`

**File size:** ~700 lines  
**Complexity:** ⭐⭐⭐⭐ (High - complex state management)  
**Dependencies:** 2 components (Badge, Button)  
**Build time:** 90-120 minutes  

---

## Component Metrics

- **State variables:** 15 (8 filter + 7 dropdown)
- **Filter types:** 7 (tag, time, media, status, favorites, feed, sort)
- **Event handlers:** 5 main functions
- **Effects:** 2 (sync + search trigger)
- **Computed values:** 1 (hasActiveFilters)
- **Label objects:** 5 dictionaries

---

## Related Components

**Used By:**
- `/components/TopBar.jsx` - Advanced search mode

**Uses:**
- `/components/ui/badge.jsx` - ShadCN Badge
- `/components/ui/button.jsx` - ShadCN Button

**Similar:**
- `/components/BulkActionsBar.jsx` - Also uses filter chips

---

## Quick Reference

### Filter States
```javascript
searchQuery        // string
selectedTags       // string[]
timeFilter         // "all" | "short" | "medium" | "long"
mediaType          // "all" | "article" | "video" | "podcast"
sortBy             // "dateAdded" | "timeAsc" | "timeDesc" | "none"
statusFilter       // "all" | "inbox" | "dailyReading" | etc.
favoritesFilter    // "all" | "favorites" | "nonFavorites"
feedFilter         // string (feed ID)
```

### Key Classes
```css
Container:     border-b border-border px-4 py-3 md:px-6
Search input:  bg-input-background border rounded-lg px-3 py-2
Filter button: bg-accent rounded-lg px-3 py-2
Dropdown:      bg-card border rounded-lg shadow-lg p-2 z-50
Active badge:  pl-2 pr-1 py-1
```

### Key Icons
```javascript
Search:       size={18}  /* Search bar */
Clear X:      size={14}  /* Search clear */
Pin:          size={18}  /* Save search */
Filter:       size={18}  /* Toggle */
Tag:          size={14}  /* Filter buttons */
Clock:        size={14}
ArrowUpDown:  size={14}
Inbox:        size={14}
Star:         size={14}
Rss:          size={14}
Badge X:      size={12}  /* Chip remove */
```

---

## Final Notes

SearchFilter is the most complex component in the fieldnotes app due to:
- Multiple filter types with different behaviors
- State synchronization with parent
- Locked vs unlocked filter logic
- Active filter chip management
- Dropdown exclusivity (only one open)
- Selection mode integration

Take your time building it step-by-step:
1. ✅ Start with search input
2. ✅ Add filter toggle button
3. ✅ Implement one filter type (simplest first - time filter)
4. ✅ Add filter chips
5. ✅ Add remaining filters
6. ✅ Implement locked filters
7. ✅ Add Pin and Select All
8. ✅ Test thoroughly

---

## You're Ready! 🚀

You now have everything needed to build `/components/SearchFilter.jsx`:

✅ Complete props interface with defaults  
✅ All 7 filter types documented  
✅ State management strategy  
✅ Event handlers defined  
✅ Effects explained  
✅ Dropdown patterns provided  
✅ Chip logic detailed  
✅ Integration examples  
✅ Testing checklist  

**Follow this guide and you'll build a production-ready advanced search component!** 🎉

---

**Dependencies:** Badge.jsx ✅ | Button.jsx ✅  
**Status:** Ready to build! 🔨  
**Note:** Already converted to JSX (you did this earlier!) ✅
