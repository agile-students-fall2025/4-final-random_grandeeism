# Sidebar.jsx Creation Prompt

## Task
Create `/components/Sidebar.jsx` - the navigation sidebar for the fieldnotes read-it-later app.

---

## Component Overview

The Sidebar is a vertical navigation component that provides access to all major sections of the app, including:
- **Home** - Dashboard/overview
- **Search** - Advanced search interface
- **Status Section** - Workflow categories (Inbox, Daily Reading, Continue Reading, Rediscovery, Archive)
- **Shelves Section** - Content organization (Favorites, Feeds, Videos, Audios, Text) + expandable Stacks
- **Other Items** - Tags, Statistics
- **Settings** - App configuration

---

## Props Interface

```javascript
// Component accepts these props:
{
  onNavigate: (page, view) => void,        // Navigation callback
  currentPage: string,                      // Current active page
  currentView: string | undefined,          // Current active view (optional)
  inboxCount: number,                       // Count badge for Inbox
  dailyReadingCount: number,                // Count badge for Daily Reading
  inProgressCount: number,                  // Count badge for Continue Reading
  rediscoveryCount: number,                 // Count badge for Rediscovery
  favoriteCount: number,                    // Count for Favorites (future use)
  savedSearches: SavedSearch[],             // Array of saved search filters (Stacks)
  onLoadSavedSearch: (searchId) => void,    // Callback to load a saved search
  onDeleteSavedSearch: (searchId) => void   // Callback to delete a saved search
}

// SavedSearch structure:
{
  id: string,
  name: string,
  filters: {
    query: string,
    tags: string[],
    timeFilter: string,
    mediaType: string,
    sortBy: string,
    status: string,
    favoritesFilter: string,
    feedFilter: string | undefined
  },
  dateCreated: Date
}
```

---

## Import Requirements

```javascript
import { useState } from "react";
import { 
  Home, 
  Inbox, 
  Calendar, 
  BookOpen, 
  RotateCcw, 
  Archive, 
  Star, 
  Tag, 
  BarChart3, 
  Settings, 
  Rss, 
  Video, 
  FileText, 
  Headphones, 
  Search, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  X 
} from "lucide-react";
```

**NO OTHER CUSTOM COMPONENTS NEEDED** - This component has zero custom dependencies! ✅

---

## Navigation Structure

### 1. **Home Item** (Top Level)
```javascript
{
  name: "Home",
  icon: Home,
  page: "home",
  view: null,
  action: () => onNavigate('home')
}
```

### 2. **Search Item** (Top Level)
```javascript
{
  name: "Search",
  icon: Search,
  page: "articles",
  view: "Search",
  action: () => onNavigate('articles', 'Search')
}
```

### 3. **Status Section** (Workflow)
```javascript
[
  { 
    name: "Inbox", 
    icon: Inbox, 
    page: "articles", 
    view: "Inbox", 
    action: () => onNavigate('articles', 'Inbox'), 
    count: inboxCount 
  },
  { 
    name: "Daily Reading", 
    icon: Calendar, 
    page: "articles", 
    view: "Daily Reading", 
    action: () => onNavigate('articles', 'Daily Reading'), 
    count: dailyReadingCount 
  },
  { 
    name: "Continue Reading", 
    icon: BookOpen, 
    page: "articles", 
    view: "Continue Reading", 
    action: () => onNavigate('articles', 'Continue Reading'), 
    count: inProgressCount 
  },
  { 
    name: "Rediscovery", 
    icon: RotateCcw, 
    page: "articles", 
    view: "Rediscovery", 
    action: () => onNavigate('articles', 'Rediscovery'), 
    count: rediscoveryCount 
  },
  { 
    name: "Archive", 
    icon: Archive, 
    page: "articles", 
    view: "Archive", 
    action: () => onNavigate('articles', 'Archive') 
  }
]
```

### 4. **Shelves Section**
```javascript
[
  { 
    name: "Favorites", 
    icon: Star, 
    page: "articles", 
    view: "Favorites", 
    action: () => onNavigate('articles', 'Favorites') 
  },
  { 
    name: "Feeds", 
    icon: Rss, 
    page: "feeds", 
    view: null, 
    action: () => onNavigate('feeds') 
  },
  { 
    name: "Videos", 
    icon: Video, 
    page: "videos", 
    view: null, 
    action: () => onNavigate('videos') 
  },
  { 
    name: "Audios", 
    icon: Headphones, 
    page: "podcasts", 
    view: null, 
    action: () => onNavigate('podcasts') 
  },
  { 
    name: "Text", 
    icon: FileText, 
    page: "text", 
    view: null, 
    action: () => onNavigate('text') 
  }
]
```

**Special: Stacks Sub-Section** (Within Shelves)
- Collapsible section that displays saved searches
- Shows **before** the shelves items (Favorites, Feeds, etc.)
- Expandable/collapsible with ChevronDown/ChevronRight icon
- Each stack item has:
  - Click to load: `onLoadSavedSearch(savedSearch.id)`
  - Delete button (X icon): `onDeleteSavedSearch(savedSearch.id)` - shows on hover
- Indented with `pl-6` class

### 5. **Other Items Section**
```javascript
[
  { 
    name: "Tags", 
    icon: Tag, 
    page: "articles", 
    view: "Tags", 
    action: () => onNavigate('articles', 'Tags') 
  },
  { 
    name: "Statistics", 
    icon: BarChart3, 
    page: "statistics", 
    view: null, 
    action: () => onNavigate('statistics') 
  }
]
```

### 6. **Settings Button** (Bottom)
```javascript
{
  name: "Settings",
  icon: Settings,
  page: "settings",
  view: null,
  action: () => onNavigate('settings')
}
```

---

## State Management

### Local State
```javascript
const [isStacksExpanded, setIsStacksExpanded] = useState(true);
```

**Purpose:** Controls whether the Stacks (saved searches) section is expanded or collapsed.

---

## Active State Logic

```javascript
const getIsActive = (item) => {
  // Direct page matches (no view needed)
  if (currentPage === 'home' && item.page === 'home') return true;
  if (currentPage === 'statistics' && item.page === 'statistics') return true;
  if (currentPage === 'feeds' && item.page === 'feeds') return true;
  if (currentPage === 'videos' && item.page === 'videos') return true;
  if (currentPage === 'podcasts' && item.page === 'podcasts') return true;
  if (currentPage === 'text' && item.page === 'text') return true;
  
  // Page + view matches (for articles page with different views)
  if (currentPage === 'articles' && item.view === currentView) return true;
  
  return false;
};
```

---

## Rendering Logic

### Navigation Item Renderer
```javascript
const renderNavItem = (item) => {
  const isActive = getIsActive(item);
  
  return (
    <button
      key={item.name}
      onClick={item.action}
      className={`flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-lg transition-colors h-[44px] ${
        isActive
          ? 'bg-accent text-foreground'
          : 'hover:bg-white/50 dark:hover:bg-white/10 text-foreground'
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon size={20} className="flex-shrink-0" />
        <span className={`font-['Inter:${isActive ? 'Bold' : 'Regular'}',_sans-serif] text-[15px]`}>
          {item.name}
        </span>
      </div>
      
      {/* Count Badge - only show if count exists and > 0 */}
      {item.count !== undefined && item.count > 0 && (
        <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[11px] min-w-[20px] text-center flex-shrink-0">
          {item.count}
        </span>
      )}
    </button>
  );
};
```

---

## Layout Structure

```jsx
<nav className="flex-1 overflow-y-auto pb-4">
  {/* 1. Home (no section header) */}
  <div className="space-y-1">
    {renderNavItem(homeItem)}
  </div>

  {/* 2. Search (no section header) */}
  <div className="space-y-1">
    {renderNavItem(searchItem)}
  </div>

  {/* 3. Status Section */}
  <div className="space-y-2 pt-4 mt-4 border-t border-border">
    <p className="px-3 text-[12px] text-muted-foreground uppercase tracking-wider">
      Status
    </p>
    <div className="space-y-1">
      {statusItems.map((item) => renderNavItem(item))}
    </div>
  </div>

  {/* 4. Shelves Section */}
  <div className="space-y-2 pt-4 mt-4 border-t border-border">
    <p className="px-3 text-[12px] text-muted-foreground uppercase tracking-wider">
      Shelves
    </p>
    <div className="space-y-1">
      {/* 4a. Stacks (if any saved searches exist) */}
      {savedSearches.length > 0 && (
        <div className="space-y-1">
          {/* Stacks Header Button */}
          <button
            onClick={() => setIsStacksExpanded(!isStacksExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors h-[44px]"
          >
            <div className="flex items-center gap-3">
              <Layers size={20} className="flex-shrink-0" />
              <span className="font-['Inter:Regular',_sans-serif] text-[15px] text-foreground">
                Stacks
              </span>
            </div>
            {isStacksExpanded ? (
              <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
            )}
          </button>
          
          {/* Stacks List (when expanded) */}
          {isStacksExpanded && (
            <div className="space-y-1 pl-6">
              {savedSearches.map((savedSearch) => (
                <div
                  key={savedSearch.id}
                  className="group flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors h-[44px]"
                >
                  {/* Click to Load Stack */}
                  <button
                    onClick={() => onLoadSavedSearch?.(savedSearch.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <span className="font-['Inter:Regular',_sans-serif] text-[14px] text-foreground line-clamp-1">
                      {savedSearch.name}
                    </span>
                  </button>
                  
                  {/* Delete Stack Button (shows on hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSavedSearch?.(savedSearch.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded flex-shrink-0"
                  >
                    <X size={14} className="text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* 4b. Regular Shelves Items */}
      {shelvesItems.map((item) => renderNavItem(item))}
    </div>
  </div>

  {/* 5. Other Items Section */}
  <div className="space-y-1 pt-4 mt-4 border-t border-border">
    {otherItems.map((item) => renderNavItem(item))}
  </div>

  {/* 6. Settings Button */}
  <div className="pt-4 mt-4 border-t border-border">
    <button
      onClick={() => onNavigate('settings')}
      className={`flex items-center gap-3 hover:bg-white/50 dark:hover:bg-white/10 transition-colors w-full px-3 py-2.5 rounded-lg h-[44px] ${
        currentPage === 'settings' ? 'bg-accent' : ''
      }`}
    >
      <Settings size={20} className="flex-shrink-0 text-foreground" />
      <p className="font-['Inter:Medium',_sans-serif] text-[15px] text-foreground">Settings</p>
    </button>
  </div>
</nav>
```

---

## Styling Requirements

### App Design System (Grayscale + Red Warnings)
✅ **Color Palette:**
- Background: `bg-background`
- Borders: `border-border`
- Text: `text-foreground`
- Muted text: `text-muted-foreground`
- Active state: `bg-accent text-foreground`
- Hover state: `hover:bg-white/50 dark:hover:bg-white/10`
- Count badges: `bg-primary text-primary-foreground`
- Destructive (delete): `hover:bg-destructive/10` + `hover:text-destructive`

✅ **No Shadows** - Flat design
✅ **Minimal Rounded Corners** - `rounded-lg` for buttons/cards
✅ **No Color Except Red** - All grayscale except destructive/warning elements

### Typography
- **Section Headers:** `text-[12px] uppercase tracking-wider text-muted-foreground`
- **Nav Items:** `text-[15px]`
  - Active: `font-['Inter:Bold',_sans-serif]`
  - Inactive: `font-['Inter:Regular',_sans-serif]`
- **Stack Items:** `text-[14px]`
- **Count Badges:** `text-[11px]`

### Spacing
- **Item Height:** Fixed `h-[44px]` for consistency
- **Padding:** `px-3 py-2.5` for nav items
- **Gaps:** `gap-3` between icon and text, `gap-2` in layouts
- **Stack Indent:** `pl-6` for nested items
- **Section Spacing:** `pt-4 mt-4 border-t border-border`

---

## Component Behavior

### Navigation
- **Click handler:** `onClick={item.action}`
- **Callback:** `onNavigate(page, view)`
  - `page`: Required - destination page
  - `view`: Optional - specific view within page

### Active State
- **Background:** `bg-accent` when active
- **Font weight:** Bold when active
- **Logic:** Match both `currentPage` AND `currentView` (if applicable)

### Count Badges
- **Visibility:** Only show if `count > 0`
- **Items with counts:** Inbox, Daily Reading, Continue Reading, Rediscovery
- **Position:** Right side of nav item
- **Styling:** Small circular badge with primary colors

### Stacks (Saved Searches)
- **Visibility:** Only render if `savedSearches.length > 0`
- **Expand/Collapse:** Toggle with chevron icon
- **Default State:** Expanded (`isStacksExpanded = true`)
- **Nested Items:** Indented with `pl-6`
- **Hover Behavior:**
  - Show delete button on hover (`.opacity-0 .group-hover:opacity-100`)
  - `e.stopPropagation()` on delete to prevent loading search
- **Optional Chaining:** Use `?.` for callbacks (`onLoadSavedSearch?.()`, `onDeleteSavedSearch?.()`)

---

## Important Notes

### ⚠️ Key Implementation Details

1. **JSX only:** Pure JSX component
2. **NO Custom Imports:** Only React and lucide-react icons
3. **Font Syntax:** Use exact syntax `font-['Inter:Bold',_sans-serif]` for Inter font weights
4. **Flex-shrink:** Add `flex-shrink-0` to icons and badges
5. **Line Clamp:** Stack names use `line-clamp-1` to prevent overflow
6. **Optional Callbacks:** Use optional chaining `?.()` for all callbacks
7. **Group Hover:** Use `group` and `group-hover:` for nested hover effects
8. **Stop Propagation:** `e.stopPropagation()` on delete button to prevent parent click

### 🎨 Design Consistency

- **All nav items:** Same height (`h-[44px]`)
- **All icons:** Same size (`size={20}`)
- **Chevrons:** Smaller size (`size={16}`)
- **Delete icon:** Even smaller (`size={14}`)
- **Consistent borders:** `border-t border-border` for section dividers
- **Consistent spacing:** `space-y-1` for items, `space-y-2` for sections

### 🔄 State Flow

```
Parent Component
  ↓
  onNavigate(page, view) → Update currentPage/currentView
  ↓
  Sidebar re-renders → getIsActive() → Update active states
```

---

## Default Prop Values

```javascript
export default function Sidebar({
  onNavigate,
  currentPage,
  currentView,
  inboxCount,
  dailyReadingCount,
  inProgressCount,
  rediscoveryCount,
  favoriteCount,
  savedSearches = [],              // Default to empty array
  onLoadSavedSearch,
  onDeleteSavedSearch
}) {
  // Component logic
}
```

---

## Example Usage

```jsx
<Sidebar
  onNavigate={(page, view) => {
    setCurrentPage(page);
    setCurrentView(view);
  }}
  currentPage="articles"
  currentView="Inbox"
  inboxCount={12}
  dailyReadingCount={5}
  inProgressCount={3}
  rediscoveryCount={8}
  favoriteCount={0}
  savedSearches={[
    {
      id: "stack-1",
      name: "Design Articles",
      filters: {
        query: "design",
        tags: ["UI", "UX"],
        timeFilter: "all",
        mediaType: "article",
        sortBy: "dateAdded",
        status: "all",
        favoritesFilter: "all"
      },
      dateCreated: new Date()
    }
  ]}
  onLoadSavedSearch={(searchId) => loadSearchFilters(searchId)}
  onDeleteSavedSearch={(searchId) => removeStack(searchId)}
/>
```

---

## Testing Checklist

After creating the component, verify:

✅ **Navigation:**
- [ ] All nav items clickable
- [ ] Correct page/view passed to `onNavigate()`
- [ ] Active state highlights correct item

✅ **Counts:**
- [ ] Count badges show on correct items
- [ ] Badges hidden when count is 0
- [ ] Badges display correct numbers

✅ **Stacks:**
- [ ] Stacks section only shows when `savedSearches.length > 0`
- [ ] Expand/collapse toggle works
- [ ] Chevron icon changes direction
- [ ] Stack items indented properly
- [ ] Click stack item loads search
- [ ] Delete button shows on hover
- [ ] Delete doesn't trigger load (stopPropagation)

✅ **Styling:**
- [ ] All grayscale (no color except red)
- [ ] Consistent item heights (44px)
- [ ] Proper hover states
- [ ] Section headers styled correctly
- [ ] Font weights change on active state
- [ ] No shadows
- [ ] Rounded corners consistent

✅ **Responsive:**
- [ ] Scrollable when content overflows
- [ ] Text truncates properly
- [ ] Icons don't shrink

---

## File Location

Create at: `/components/Sidebar.jsx`

---

## Estimated Complexity

- **Lines of Code:** ~200
- **Dependencies:** 0 custom components (only React + lucide-react)
- **Time to Build:** 30-45 minutes
- **Difficulty:** ⭐⭐⭐ (Medium - lots of items but simple logic)

---

## Related Components

- ✅ **TopBar.jsx** - Horizontal navigation/actions
- ✅ **SearchFilter.jsx** - Used in Search view
- 🔲 **MainLayout.jsx** - Will contain Sidebar + TopBar + page content
- 🔲 **HomePage.jsx** - Will use Sidebar for navigation

---

## Next Steps After Creation

1. **Test Standalone:** Import in App.jsx with mock data
2. **Test Navigation:** Verify all routes work
3. **Test Stacks:** Create/load/delete saved searches
4. **Integrate with MainLayout:** Combine with TopBar
5. **Connect to Router:** Link navigation to actual pages

---

## Quick Reference

### Key Classes
```
Nav wrapper:       flex-1 overflow-y-auto pb-4
Nav item:          px-3 py-2.5 rounded-lg h-[44px]
Active:            bg-accent text-foreground
Hover:             hover:bg-white/50 dark:hover:bg-white/10
Section header:    text-[12px] uppercase tracking-wider
Section divider:   pt-4 mt-4 border-t border-border
Stack indent:      pl-6
```

### Key Icons
```
Home:              Home
Search:            Search
Inbox:             Inbox
Daily Reading:     Calendar
Continue Reading:  BookOpen
Rediscovery:       RotateCcw
Archive:           Archive
Favorites:         Star
Feeds:             Rss
Videos:            Video
Audios:            Headphones
Text:              FileText
Stacks:            Layers
Tags:              Tag
Statistics:        BarChart3
Settings:          Settings
Expand:            ChevronDown
Collapse:          ChevronRight
Delete:            X
```

---

## Ready to Build! 🚀

You now have everything needed to create `/components/Sidebar.jsx`:
- ✅ Complete props interface
- ✅ All navigation items defined
- ✅ Active state logic
- ✅ Stacks collapsible section
- ✅ Exact styling requirements
- ✅ Zero custom dependencies
- ✅ Full JSX syntax

**No external files needed - just copy this prompt and build!** 🎉
