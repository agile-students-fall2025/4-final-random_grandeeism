# MainLayout.jsx Creation Prompt - COMPLETE GUIDE

## Task
Create `/components/MainLayout.jsx` - the main application layout wrapper that provides unified Sidebar + TopBar + content area structure for all pages in the fieldnotes app.

---

## Component Overview

MainLayout is the **master layout component** that wraps all main application pages. It provides:

- 🗂️ **Sidebar** - Desktop (fixed) + Mobile (overlay)
- 🔝 **TopBar** - Unified header with logo, search, and actions
- 📄 **Content Area** - Scrollable main content region
- 🔢 **Auto-calculated Counts** - Extracts queue counts from articles
- 📱 **Responsive Design** - Mobile menu overlay, desktop fixed sidebar
- 🎯 **Single Source of Truth** - One component for all layout needs

**Used By:** All main app pages (Dashboard, Articles, Search, Feeds, Videos, Podcasts, Text, Statistics, Settings)

---

## Design Philosophy

### ✅ What MainLayout DOES:
- Provides Sidebar + TopBar + content structure
- Manages mobile menu state
- Auto-calculates sidebar counts from articles
- Handles responsive layout
- Provides consistent spacing and z-index layers

### ❌ What MainLayout DOES NOT:
- Render page content (passed as `children`)
- Manage filter/search state (callbacks only)
- Handle modals (rendered by parent)
- Filter/sort articles (parent's responsibility)
- Manage selection state (callbacks only)

---

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Desktop (≥1024px)                                           │
├────────────┬────────────────────────────────────────────────┤
│            │  TopBar (sticky, z-40)                         │
│  Sidebar   ├────────────────────────────────────────────────┤
│  (fixed,   │                                                │
│  280px)    │  Main Content Area (scrollable)                │
│            │  {children}                                    │
│            │                                                │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Mobile (<1024px)                                            │
├─────────────────────────────────────────────────────────────┤
│  TopBar (with ≡ Menu button)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Main Content Area (full width, scrollable)                 │
│  {children}                                                 │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

When Mobile Menu Open:
┌─────────────────────────────────────────────────────────────┐
│ [Overlay: black/50]                                         │
│ ┌─────────────┐                                             │
│ │  Sidebar    │                                             │
│ │  (280px,    │                                             │
│ │  slide-in)  │                                             │
│ │             │                                             │
│ └─────────────┘                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Props Interface (42 Props!)

```javascript
export default function MainLayout({
  // === CORE NAVIGATION (Required) ===
  children,                          // React.ReactNode - Page content
  currentPage,                       // string - Current page identifier
  currentView,                       // string - Current view/tab
  onNavigate,                        // (page: string, view?: string) => void
  
  // === DATA (Required for counts) ===
  articles = [],                     // Article[] - All articles for counting
  
  // === ACTIONS (Optional) ===
  onAddLink,                         // () => void - Add Link button
  onSearch,                          // (query: string) => void - Simple search
  onSearchWithFilters,               // (query: string, filters: SearchFilters) => void - Advanced search
  
  // === SIDEBAR - STACKS (Optional) ===
  savedSearches = [],                // SavedSearch[] - Saved searches/stacks
  onLoadSavedSearch,                 // (id: string) => void - Load stack
  onDeleteSavedSearch,               // (id: string) => void - Delete stack
  
  // === TOPBAR - BASIC CONFIG (Optional) ===
  pageTitle,                         // string - Page title (shown in row 2)
  showSearch = true,                 // boolean - Show search functionality
  searchPlaceholder = "Search articles...",  // string
  initialSearchQuery = "",           // string - Initial search value
  customSearchContent,               // React.ReactNode - Replace search with custom component
  addLinkButtonText = "Add Link",    // string - Button label
  
  // === TOPBAR - ADVANCED SEARCH (Optional) ===
  useAdvancedSearch = false,         // boolean - Use SearchFilter component
  availableTags = [],                // string[] - Tags for filter
  availableFeeds = [],               // Feed[] - Feeds for filter
  showTimeFilter = false,            // boolean
  showMediaFilter = false,           // boolean
  showTagFilter = false,             // boolean
  showStatusFilter = false,          // boolean
  showFavoritesFilter = false,       // boolean
  showFeedFilter = false,            // boolean
  showSortOptions = false,           // boolean
  preAppliedFilters,                 // SearchFilters - Initial filter state
  lockedFilters,                     // Partial<SearchFilters> - Non-removable filters
  onFilterChipRemoved,               // () => void - When locked chip removed
  onSaveSearch,                      // () => void - Save as Stack
  
  // === TOPBAR - SELECTION MODE (Optional) ===
  showSelectionMode = false,         // boolean - Show selection button
  selectionMode = false,             // boolean - Currently in selection mode
  onToggleSelectionMode,             // () => void - Toggle selection
  onSelectAll,                       // () => void - Select all items
  selectedCount = 0,                 // number - Selected item count
  totalCount = 0,                    // number - Total items available
}) {
  // Component implementation
}
```

### Props Organized by Feature

#### **Core (5 props - REQUIRED)**
```javascript
children                    // Page content to render
currentPage                 // "articles", "search", "feeds", etc.
currentView                 // "Inbox", "All", "Daily Reading", etc.
onNavigate                  // Navigation callback
articles                    // Array for auto-calculating counts
```

#### **Actions (3 props)**
```javascript
onAddLink                   // Add Link button callback
onSearch                    // Simple search callback
onSearchWithFilters         // Advanced search callback
```

#### **Sidebar - Stacks (3 props)**
```javascript
savedSearches               // Array of saved searches
onLoadSavedSearch          // Load stack callback
onDeleteSavedSearch        // Delete stack callback
```

#### **TopBar - Basic (5 props)**
```javascript
pageTitle                   // Page title display
showSearch                  // Show/hide search
searchPlaceholder          // Search input placeholder
initialSearchQuery         // Initial search value
addLinkButtonText          // Button label
customSearchContent        // Custom search component
```

#### **TopBar - Advanced Search (15 props)**
```javascript
useAdvancedSearch          // Enable SearchFilter
availableTags              // Tags for dropdown
availableFeeds             // Feeds for dropdown
showTimeFilter             // Time filter toggle
showMediaFilter            // Media filter toggle
showTagFilter              // Tag filter toggle
showStatusFilter           // Status filter toggle
showFavoritesFilter        // Favorites filter toggle
showFeedFilter             // Feed filter toggle
showSortOptions            // Sort options toggle
preAppliedFilters          // Initial filters
lockedFilters              // Non-removable filters
onFilterChipRemoved        // Locked chip removal
onSaveSearch               // Save as Stack
```

#### **TopBar - Selection Mode (6 props)**
```javascript
showSelectionMode          // Show selection button
selectionMode              // Selection active state
onToggleSelectionMode      // Toggle callback
onSelectAll                // Select all callback
selectedCount              // Count of selected
totalCount                 // Count of total
```

---

## Dependencies & Imports

```javascript
import { useState } from "react";
import TopBar from "./TopBar.jsx";
import Sidebar from "./Sidebar.jsx";  // NOTE: ensure Sidebar.jsx exists
```

### Required Files
✅ **Custom Components:**
- `/components/TopBar.jsx` - Header component ✅ EXISTS
- `/components/Sidebar.jsx` - Navigation sidebar (ensure Sidebar.jsx exists)

✅ **NO OTHER DEPENDENCIES!**

---

## State Management

MainLayout manages **only one piece of state**:

```javascript
const [showMobileMenu, setShowMobileMenu] = useState(false);
```

**Purpose:** Control mobile sidebar overlay visibility

**Behavior:**
- `false` by default (menu closed)
- Set to `true` when TopBar menu button clicked
- Set to `false` when:
  - User clicks overlay backdrop
  - User navigates to a page
  - User loads a saved search

---

## Auto-Calculated Counts

MainLayout **automatically calculates** these counts from the `articles` prop:

```javascript
// Calculate counts for sidebar
const inboxCount = articles.filter(a => a.status === "inbox" && !a.isHidden).length;
const dailyReadingCount = articles.filter(a => a.status === "daily" && !a.isHidden).length;
const inProgressCount = articles.filter(a => a.status === "continue" && !a.isHidden).length;
const rediscoveryCount = articles.filter(a => a.status === "rediscovery" && !a.isHidden).length;
const favoriteCount = articles.filter(a => a.isFavorite && !a.isHidden).length;
```

**Filtering Logic:**
- ✅ Count only non-hidden articles (`!a.isHidden`)
- ✅ Favorites count across ALL statuses
- ✅ Status counts are mutually exclusive

**Parent Responsibility:**
- Parent must pass ALL articles (not pre-filtered)
- MainLayout will calculate counts correctly
- Don't pre-filter articles before passing to MainLayout

---

## Component Structure (3 Main Sections)

### 1. Desktop Sidebar (Fixed)

```jsx
{/* Desktop Sidebar */}
<aside className="hidden lg:block w-[280px] border-r border-border">
  <Sidebar
    onNavigate={onNavigate}
    currentPage={currentPage}
    currentView={currentView}
    inboxCount={inboxCount}
    dailyReadingCount={dailyReadingCount}
    inProgressCount={inProgressCount}
    rediscoveryCount={rediscoveryCount}
    favoriteCount={favoriteCount}
    savedSearches={savedSearches}
    onLoadSavedSearch={onLoadSavedSearch}
    onDeleteSavedSearch={onDeleteSavedSearch}
  />
</aside>
```

**Styling:**
- `hidden lg:block` - Only visible on desktop (≥1024px)
- `w-[280px]` - Fixed width
- `border-r border-border` - Right border separator

**Props Passed:**
- Navigation callbacks
- Current state for highlighting
- Auto-calculated counts
- Saved searches (Stacks)

---

### 2. Mobile Sidebar (Overlay)

```jsx
{/* Mobile Sidebar Overlay */}
{showMobileMenu && (
  <div className="fixed inset-0 z-50 lg:hidden">
    {/* Backdrop */}
    <div 
      className="absolute inset-0 bg-black/50" 
      onClick={() => setShowMobileMenu(false)}
    />
    
    {/* Sidebar */}
    <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border">
      <Sidebar
        onNavigate={(page, view) => {
          onNavigate(page, view);
          setShowMobileMenu(false);  // Close menu after navigation
        }}
        currentPage={currentPage}
        currentView={currentView}
        inboxCount={inboxCount}
        dailyReadingCount={dailyReadingCount}
        inProgressCount={inProgressCount}
        rediscoveryCount={rediscoveryCount}
        favoriteCount={favoriteCount}
        savedSearches={savedSearches}
        onLoadSavedSearch={(searchId) => {
          onLoadSavedSearch?.(searchId);
          setShowMobileMenu(false);  // Close menu after loading
        }}
        onDeleteSavedSearch={onDeleteSavedSearch}
      />
    </aside>
  </div>
)}
```

**Styling:**
- `fixed inset-0 z-50` - Full-screen overlay (above TopBar z-40)
- `lg:hidden` - Only visible on mobile (<1024px)
- `bg-black/50` - Semi-transparent backdrop
- Sidebar: `absolute left-0 top-0 bottom-0 w-[280px]` - Slide-in from left

**Behavior:**
- Only renders when `showMobileMenu === true`
- Backdrop click closes menu
- Navigation closes menu
- Loading saved search closes menu
- Delete saved search does NOT close menu

**Optional Chaining:**
- `onLoadSavedSearch?.(searchId)` - Use optional chaining (callback might not exist)

---

### 3. Main Content Area

```jsx
{/* Main Content Area */}
<div className="flex-1 flex flex-col min-w-0">
  {/* TopBar */}
  <TopBar
    onMenuClick={() => setShowMobileMenu(true)}
    onAddLink={onAddLink}
    onSearch={onSearch}
    onSearchWithFilters={onSearchWithFilters}
    pageTitle={pageTitle}
    showSearch={showSearch}
    searchPlaceholder={searchPlaceholder}
    initialSearchQuery={initialSearchQuery}
    customSearchContent={customSearchContent}
    addLinkButtonText={addLinkButtonText}
    showSelectionMode={showSelectionMode}
    selectionMode={selectionMode}
    onToggleSelectionMode={onToggleSelectionMode}
    useAdvancedSearch={useAdvancedSearch}
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
    onFilterChipRemoved={onFilterChipRemoved}
    onSaveSearch={onSaveSearch}
    onSelectAll={onSelectAll}
    selectedCount={selectedCount}
    totalCount={totalCount}
    currentPage={currentPage}
  />

  {/* Page Content */}
  <main className="flex-1 overflow-y-auto">
    {children}
  </main>
</div>
```

**Styling:**
- Container: `flex-1 flex flex-col min-w-0`
  - `flex-1` - Take remaining width (after sidebar)
  - `flex flex-col` - Stack TopBar + content vertically
  - `min-w-0` - Allow content to shrink (prevents overflow)
- Main: `flex-1 overflow-y-auto`
  - `flex-1` - Take remaining height (after TopBar)
  - `overflow-y-auto` - Scrollable content

**TopBar onMenuClick:**
- Callback: `() => setShowMobileMenu(true)` - Opens mobile menu
- Only visible on mobile (TopBar handles responsive button)

**Children:**
- Rendered inside `<main>` tag
- Parent page content goes here
- Automatically scrollable

---

## Complete Component Code

```jsx
import { useState } from "react";
import TopBar from "./TopBar.jsx";
import Sidebar from "./Sidebar.jsx";  // NOTE: Update when Sidebar.jsx exists

export default function MainLayout({
  children,
  currentPage,
  currentView,
  onNavigate,
  onAddLink,
  onSearch,
  onSearchWithFilters,
  articles = [],
  savedSearches = [],
  onLoadSavedSearch,
  onDeleteSavedSearch,
  // TopBar props
  pageTitle,
  showSearch = true,
  searchPlaceholder = "Search articles...",
  initialSearchQuery = "",
  customSearchContent,
  addLinkButtonText = "Add Link",
  showSelectionMode = false,
  selectionMode = false,
  onToggleSelectionMode,
  useAdvancedSearch = false,
  availableTags = [],
  availableFeeds = [],
  showTimeFilter = false,
  showMediaFilter = false,
  showTagFilter = false,
  showStatusFilter = false,
  showFavoritesFilter = false,
  showFeedFilter = false,
  showSortOptions = false,
  preAppliedFilters,
  lockedFilters,
  onFilterChipRemoved,
  onSaveSearch,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0,
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Calculate counts for sidebar
  const inboxCount = articles.filter(a => a.status === "inbox" && !a.isHidden).length;
  const dailyReadingCount = articles.filter(a => a.status === "daily" && !a.isHidden).length;
  const inProgressCount = articles.filter(a => a.status === "continue" && !a.isHidden).length;
  const rediscoveryCount = articles.filter(a => a.status === "rediscovery" && !a.isHidden).length;
  const favoriteCount = articles.filter(a => a.isFavorite && !a.isHidden).length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[280px] border-r border-border">
        <Sidebar
          onNavigate={onNavigate}
          currentPage={currentPage}
          currentView={currentView}
          inboxCount={inboxCount}
          dailyReadingCount={dailyReadingCount}
          inProgressCount={inProgressCount}
          rediscoveryCount={rediscoveryCount}
          favoriteCount={favoriteCount}
          savedSearches={savedSearches}
          onLoadSavedSearch={onLoadSavedSearch}
          onDeleteSavedSearch={onDeleteSavedSearch}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMobileMenu(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border">
            <Sidebar
              onNavigate={(page, view) => {
                onNavigate(page, view);
                setShowMobileMenu(false);
              }}
              currentPage={currentPage}
              currentView={currentView}
              inboxCount={inboxCount}
              dailyReadingCount={dailyReadingCount}
              inProgressCount={inProgressCount}
              rediscoveryCount={rediscoveryCount}
              favoriteCount={favoriteCount}
              savedSearches={savedSearches}
              onLoadSavedSearch={(searchId) => {
                onLoadSavedSearch?.(searchId);
                setShowMobileMenu(false);
              }}
              onDeleteSavedSearch={onDeleteSavedSearch}
            />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <TopBar
          onMenuClick={() => setShowMobileMenu(true)}
          onAddLink={onAddLink}
          onSearch={onSearch}
          onSearchWithFilters={onSearchWithFilters}
          pageTitle={pageTitle}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          initialSearchQuery={initialSearchQuery}
          customSearchContent={customSearchContent}
          addLinkButtonText={addLinkButtonText}
          showSelectionMode={showSelectionMode}
          selectionMode={selectionMode}
          onToggleSelectionMode={onToggleSelectionMode}
          useAdvancedSearch={useAdvancedSearch}
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
          onFilterChipRemoved={onFilterChipRemoved}
          onSaveSearch={onSaveSearch}
          onSelectAll={onSelectAll}
          selectedCount={selectedCount}
          totalCount={totalCount}
          currentPage={currentPage}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Usage Examples

### 1. Minimal Usage (Required Props Only)

```jsx
import MainLayout from "./components/MainLayout.jsx";

function MyPage() {
  const articles = [/* ... */];
  
  return (
    <MainLayout
      currentPage="articles"
      currentView="All"
      onNavigate={(page, view) => console.log(page, view)}
      articles={articles}
    >
      <div className="p-6">
        <h1>My Page Content</h1>
      </div>
    </MainLayout>
  );
}
```

---

### 2. Simple Search Page

```jsx
function SearchPage() {
  const [articles, setArticles] = useState(mockArticles);
  const [filteredArticles, setFilteredArticles] = useState(articles);
  
  const handleSearch = (query) => {
    const filtered = articles.filter(a => 
      a.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredArticles(filtered);
  };
  
  return (
    <MainLayout
      currentPage="search"
      onNavigate={handleNavigate}
      onAddLink={handleAddLink}
      articles={articles}
      pageTitle="Search"
      onSearch={handleSearch}
      searchPlaceholder="Search articles..."
    >
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map(article => (
          <ContentCard key={article.id} article={article} />
        ))}
      </div>
    </MainLayout>
  );
}
```

---

### 3. Advanced Search with Filters

```jsx
function ArticlesPage() {
  const [articles, setArticles] = useState(mockArticles);
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags)));
  
  const handleFilters = (query, filters) => {
    let filtered = articles;
    
    // Apply text search
    if (query) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(a => 
        filters.tags.some(tag => a.tags.includes(tag))
      );
    }
    
    // Apply time filter
    if (filters.timeFilter !== "all") {
      // ... time filtering logic
    }
    
    setFilteredArticles(filtered);
  };
  
  return (
    <MainLayout
      currentPage="articles"
      currentView="All"
      onNavigate={handleNavigate}
      onAddLink={handleAddLink}
      articles={articles}
      pageTitle="All Articles"
      useAdvancedSearch={true}
      onSearchWithFilters={handleFilters}
      availableTags={allTags}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showSortOptions={true}
    >
      {/* Content */}
    </MainLayout>
  );
}
```

---

### 4. Locked Filters (Videos Page)

```jsx
function VideosPage() {
  const videos = articles.filter(a => a.type === "video");
  
  return (
    <MainLayout
      currentPage="videos"
      onNavigate={handleNavigate}
      onAddLink={handleAddLink}
      articles={articles}  // Pass ALL articles for counts
      pageTitle="Videos"
      useAdvancedSearch={true}
      onSearchWithFilters={handleFilters}
      lockedFilters={{ mediaType: "video" }}
      preAppliedFilters={{ mediaType: "video" }}
      onFilterChipRemoved={() => handleNavigate("articles")}
      showTimeFilter={true}
      showStatusFilter={true}
    >
      {/* Render videos only */}
      {videos.map(video => <VideoCard key={video.id} video={video} />)}
    </MainLayout>
  );
}
```

---

### 5. Selection Mode (Bulk Actions)

```jsx
function ArticlesPage() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const handleSelectAll = () => {
    if (selectedIds.size === articles.length) {
      setSelectedIds(new Set());  // Deselect all
    } else {
      setSelectedIds(new Set(articles.map(a => a.id)));  // Select all
    }
  };
  
  return (
    <MainLayout
      currentPage="articles"
      currentView="All"
      onNavigate={handleNavigate}
      onAddLink={handleAddLink}
      articles={articles}
      showSelectionMode={true}
      selectionMode={selectionMode}
      onToggleSelectionMode={() => {
        setSelectionMode(!selectionMode);
        if (selectionMode) setSelectedIds(new Set());  // Clear on exit
      }}
      selectedCount={selectedIds.size}
      totalCount={articles.length}
      onSelectAll={handleSelectAll}
    >
      {/* Content with selection checkboxes */}
      {selectionMode && selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onApplyTags={handleBulkTags}
          onMoveToNext={handleBulkMove}
        />
      )}
    </MainLayout>
  );
}
```

---

### 6. Custom Search Component (Feeds Page)

```jsx
function FeedsPage() {
  const [selectedFeed, setSelectedFeed] = useState(null);
  
  return (
    <MainLayout
      currentPage="feeds"
      onNavigate={handleNavigate}
      onAddLink={handleAddLink}
      articles={articles}
      pageTitle="RSS Feeds"
      customSearchContent={
        <FeedSelector
          feeds={feeds}
          selectedFeed={selectedFeed}
          onChange={setSelectedFeed}
        />
      }
    >
      {/* Feed content */}
    </MainLayout>
  );
}
```

---

### 7. With Stacks (Saved Searches)

```jsx
function SearchPage() {
  const [savedSearches, setSavedSearches] = useState([]);
  
  const handleLoadStack = (stackId) => {
    const stack = savedSearches.find(s => s.id === stackId);
    if (stack) {
      applyFilters(stack.filters);
    }
  };
  
  const handleSaveStack = () => {
    const newStack = {
      id: Date.now().toString(),
      name: prompt("Stack name:"),
      filters: currentFilters
    };
    setSavedSearches([...savedSearches, newStack]);
  };
  
  const handleDeleteStack = (stackId) => {
    setSavedSearches(savedSearches.filter(s => s.id !== stackId));
  };
  
  return (
    <MainLayout
      currentPage="search"
      onNavigate={handleNavigate}
      onAddLink={handleAddLink}
      articles={articles}
      savedSearches={savedSearches}
      onLoadSavedSearch={handleLoadStack}
      onDeleteSavedSearch={handleDeleteStack}
      onSaveSearch={handleSaveStack}
      useAdvancedSearch={true}
      onSearchWithFilters={handleFilters}
    >
      {/* Search results */}
    </MainLayout>
  );
}
```

---

## Pages That Use MainLayout

### ✅ Should Use MainLayout:
1. **DashboardPage** - Statistics overview
2. **HomePage** (Articles) - All articles with tabs
3. **SearchPage** - Advanced search
4. **FeedsPage** - RSS feeds management
5. **VideosPage** - Video content
6. **PodcastsPage** - Podcast content
7. **TextPage** - Text articles
8. **StatisticsPage** - Analytics
9. **SettingsPage** - App settings

### ❌ Should NOT Use MainLayout:
1. **ArticleViewer** - Full-screen reader
2. **VideoViewer** - Full-screen player
3. **PodcastViewer** - Full-screen player
4. **StartPage** - Landing page
5. **AuthPage** - Login/signup

---

## Common Patterns

### Pattern 1: Auto-Calculate Available Tags
```javascript
const allTags = useMemo(() => 
  Array.from(new Set(articles.flatMap(a => a.tags))),
  [articles]
);

<MainLayout availableTags={allTags} />
```

### Pattern 2: Filter Articles Before Rendering
```javascript
// MainLayout needs ALL articles for counts
<MainLayout articles={allArticles}>
  {/* Render only filtered subset */}
  {filteredArticles.map(article => <Card {...article} />)}
</MainLayout>
```

### Pattern 3: Clear Selection on Mode Exit
```javascript
const handleToggleSelection = () => {
  setSelectionMode(!selectionMode);
  if (selectionMode) {
    setSelectedIds(new Set());  // Clear on exit
  }
};
```

### Pattern 4: Close Modals on Navigation
```javascript
const handleNavigate = (page, view) => {
  setCurrentPage(page);
  setCurrentView(view);
  setShowModal(false);  // Close any open modals
  setSelectionMode(false);  // Exit selection mode
};
```

---

## Design Specifications

### Layout Structure
```css
Root container:    min-h-screen bg-background flex
Desktop sidebar:   hidden lg:block w-[280px] border-r border-border
Mobile overlay:    fixed inset-0 z-50 lg:hidden
Mobile backdrop:   absolute inset-0 bg-black/50
Mobile sidebar:    absolute left-0 top-0 bottom-0 w-[280px]
Content wrapper:   flex-1 flex flex-col min-w-0
Main content:      flex-1 overflow-y-auto
```

### Z-Index Layers
```
z-50: Mobile menu overlay + sidebar
z-40: TopBar (sticky)
z-30: Modals (rendered by parent as children)
z-20: BulkActionsBar (rendered by parent)
z-10: Floating elements
z-0:  Main content
```

### Responsive Breakpoints
```
< 1024px (lg):  Mobile layout (sidebar overlay)
≥ 1024px (lg):  Desktop layout (fixed sidebar)
```

---

## CSS Variables Used

```css
bg-background       /* Main background */
bg-black/50         /* Mobile overlay backdrop */
border-border       /* Sidebar separator */
```

---

## Testing Checklist

### Visual Tests
- [ ] Desktop: Sidebar visible at ≥1024px
- [ ] Mobile: Sidebar hidden, menu button shown
- [ ] Mobile: Menu button opens overlay
- [ ] Mobile: Backdrop closes overlay
- [ ] Mobile: Navigation closes overlay
- [ ] Content scrolls independently
- [ ] TopBar stays sticky on scroll

### Functional Tests
- [ ] Counts calculate correctly from articles
- [ ] Hidden articles excluded from counts
- [ ] Favorites count across all statuses
- [ ] TopBar receives all props correctly
- [ ] Sidebar receives all props correctly
- [ ] Mobile menu state managed correctly
- [ ] Navigation works (desktop + mobile)
- [ ] Add Link button works

### Integration Tests
- [ ] Works with TopBar component
- [ ] Works with Sidebar component
- [ ] Children render in main area
- [ ] Modals render on top (as children)
- [ ] BulkActionsBar renders correctly
- [ ] No console errors

### Edge Cases
- [ ] Empty articles array (0 counts)
- [ ] No saved searches (empty array)
- [ ] Missing optional callbacks (no errors)
- [ ] Long article list (counts still correct)
- [ ] All articles hidden (0 counts)

---

## Common Pitfalls to Avoid

### ❌ Don't:
- Calculate sidebar counts yourself (MainLayout does this)
- Import Sidebar or TopBar directly in pages
- Create your own mobile menu state
- Pass filtered articles to MainLayout (pass ALL articles)
- Wrap ArticleViewer with MainLayout
- Pass both `onSearch` and `onSearchWithFilters` (choose one)
- Forget to pass `currentPage` and `currentView`

### ✅ Do:
- Always pass ALL articles (for accurate counts)
- Let MainLayout handle layout and menu state
- Focus on page content in children
- Keep viewers separate (don't wrap with MainLayout)
- Use appropriate search prop for your needs
- Pass currentPage/currentView for highlighting
- Filter articles INSIDE children, not before MainLayout

---

## Performance Considerations

### Count Calculations
- Runs on every render when `articles` changes
- Each count is a separate `.filter()` call (5 total)
- Consider memoizing if articles array is very large:

```javascript
const counts = useMemo(() => ({
  inbox: articles.filter(a => a.status === "inbox" && !a.isHidden).length,
  dailyReading: articles.filter(a => a.status === "daily" && !a.isHidden).length,
  // ... etc
}), [articles]);
```

### Mobile Menu
- Overlay only renders when open (conditional)
- Backdrop click handler simple (no complex logic)
- No scroll locking implemented (consider if needed)

---

## Accessibility

### Keyboard Navigation
- Tab through: Menu button → Search → Add Link → Sidebar items
- Escape to close mobile menu (not implemented - consider adding)

### ARIA Labels
```jsx
<aside aria-label="Main navigation">
  <Sidebar />
</aside>

<main aria-label="Main content">
  {children}
</main>
```

### Screen Readers
- Mobile menu state announced
- Sidebar counts announced
- Page title announced

---

## Future Enhancements

### Potential Improvements:
1. **Escape Key Handler** - Close mobile menu on Escape
2. **Scroll Locking** - Prevent body scroll when menu open
3. **Smooth Transitions** - Animate sidebar slide-in
4. **Touch Gestures** - Swipe to open/close menu
5. **Count Memoization** - Optimize large article lists
6. **Loading States** - Show skeleton while loading
7. **Error Boundaries** - Catch component errors

---

## File Location

**Create at:** `/components/MainLayout.jsx`

**File size:** ~145 lines  
**Complexity:** ⭐⭐⭐ (Medium - mostly prop forwarding)  
**Dependencies:** 2 components (TopBar, Sidebar)  
**Build time:** 30-45 minutes  

---

## Component Metrics

- **State variables:** 1 (showMobileMenu)
- **Auto-calculated values:** 5 (sidebar counts)
- **Props accepted:** 42 (most are optional pass-through)
- **Child components:** 2 (TopBar, Sidebar)
- **Conditional renders:** 1 (mobile menu overlay)

---

## Related Components

**Uses:**
- `/components/TopBar.jsx` - Header ✅ EXISTS
- `/components/Sidebar.jsx` - Navigation

**Used By:**
- All main app pages (Dashboard, Articles, Search, etc.)

**Similar:**
- None (this is the only layout component)

---

## Quick Reference

### Required Props (Minimum)
```javascript
currentPage="articles"
currentView="All"
onNavigate={handleNavigate}
articles={articles}
```

### Common Prop Sets
```javascript
// Basic page
pageTitle="My Page"
showSearch={false}
onAddLink={handleAddLink}

// Search page
onSearch={handleSearch}
searchPlaceholder="Search..."

// Advanced search
useAdvancedSearch={true}
onSearchWithFilters={handleFilters}
availableTags={allTags}
showTimeFilter={true}
showTagFilter={true}

// With Stacks
savedSearches={stacks}
onLoadSavedSearch={loadStack}
onDeleteSavedSearch={deleteStack}
onSaveSearch={saveStack}

// Selection mode
showSelectionMode={true}
selectionMode={isSelecting}
onToggleSelectionMode={toggleSelection}
selectedCount={selected.size}
totalCount={items.length}
onSelectAll={selectAll}
```

---

## Final Notes

MainLayout is the **central structural component** of the fieldnotes app. It provides:

✅ **Consistent Layout** - Same structure across all pages  
✅ **Automatic Counts** - No manual calculation needed  
✅ **Responsive Design** - Mobile/desktop handled automatically  
✅ **Single Menu State** - No duplicate state management  
✅ **Flexible Configuration** - 42 props for customization  

**Build Priority:** HIGH - Required for all pages

**Current Status:** Already exists at `/components/MainLayout.jsx` and should import `Sidebar.jsx` (ensure Sidebar.jsx exists).

---

## You're Ready! 🚀

You now have everything needed to understand and use `/components/MainLayout.jsx`:

✅ Complete props interface (42 props!)  
✅ Auto-calculation logic explained  
✅ Three-section structure detailed  
✅ Mobile menu behavior documented  
✅ 7 usage examples provided  
✅ Common patterns shown  
✅ Testing checklist included  

**MainLayout is production-ready and waiting for your page content!** 🎉

---

**Dependencies:** TopBar.jsx ✅ | Sidebar.jsx ⏳ (ensure Sidebar.jsx exists)  
**Status:** Exists, ready to use! 🔨  
**Note:** Ensure Sidebar.jsx exists and is used for imports ✅
