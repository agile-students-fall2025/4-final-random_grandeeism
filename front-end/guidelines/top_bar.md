# TopBar.jsx Creation Prompt - COMPLETE GUIDE

## Task
Create `/components/TopBar.jsx` - the sticky header navigation component for the fieldnotes read-it-later app.

---

## Component Overview

TopBar is the main navigation header that appears at the top of every page via MainLayout. It provides:
- 🔘 Mobile menu toggle (hamburger)
- 📝 App logo and branding
- 🔍 Simple or advanced search functionality
- ✅ Selection mode toggle (bulk actions)
- ➕ Add Link button (icon on mobile, text on desktop)
- 📄 Page title display (below main row)
- 🎛️ Advanced filter integration via SearchFilter component

---

## Design Specifications

### Visual Design System
✅ **Completely Grayscale** - No color except red for warnings/errors  
✅ **Flat Design** - No drop shadows  
✅ **Minimal Rounding** - Use `rounded-[2px]` or `rounded-lg` only  
✅ **Single Pixel Borders** - `border border-border`  
✅ **Sticky Positioning** - `sticky top-0 z-40`  

### Layout Structure
```
┌──────────────────────────────────────────────────────────────┐
│ TopBar Container (sticky, z-40)                              │
├──────────────────────────────────────────────────────────────┤
│ Row 1: [≡]  fieldnotes.           [Select] [🔍] [+ Add Link] │
├──────────────────────────────────────────────────────────────┤
│ Row 2: [Page Title / Custom Content]         (desktop only)  │
├──────────────────────────────────────────────────────────────┤
│ Row 3: [Advanced Search Filter Component]    (if enabled)    │
├──────────────────────────────────────────────────────────────┤
│ Row 4: [Mobile Expanded Search]              (mobile only)   │
└──────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

**Mobile (< 768px):**
- ✅ Menu button visible (except on Settings page)
- ✅ Logo left-aligned
- ✅ Search icon button (expands to Row 4 below when clicked)
- ✅ Add Link shows Plus icon only
- ✅ Page title hidden
- ✅ Selection button shows icon + "Select"/"Cancel" text (hidden on very small screens)

**Desktop (≥ 768px):**
- ✅ Menu button hidden
- ✅ Logo left-aligned
- ✅ Inline search bar (280px → 320px on large screens)
- ✅ Add Link shows text label
- ✅ Page title shown in separate row below
- ✅ Selection button shows icon + full text

---

## Props Interface

```javascript
export default function TopBar({
  // Navigation
  onMenuClick,              // () => void - Toggle mobile sidebar
  onNavigate,               // (page: string) => void - Navigate to page
  currentPage,              // string - Current page identifier
  showBackButton,           // boolean - Show back button (Settings page)
  
  // Page Configuration
  pageTitle,                // string - Page title (shown below main row on desktop)
  
  // Search - Basic Mode
  showSearch = true,        // boolean - Show search functionality
  searchPlaceholder = "Search articles...",  // string - Input placeholder
  initialSearchQuery = "",  // string - Initial search value
  onSearch,                 // (query: string) => void - Simple search callback
  customSearchContent,      // React.ReactNode - Replace title with custom content
  
  // Search - Advanced Mode
  useAdvancedSearch = false,  // boolean - Use SearchFilter component
  onSearchWithFilters,      // (query: string, filters: SearchFilters) => void
  availableTags = [],       // string[] - Tags for filter dropdown
  showTimeFilter = false,   // boolean - Show reading time filter
  showMediaFilter = false,  // boolean - Show media type filter
  showTagFilter = false,    // boolean - Show tag filter
  showStatusFilter = false, // boolean - Show status filter
  showFavoritesFilter = false, // boolean - Show favorites filter
  showSortOptions = false,  // boolean - Show sort options
  preAppliedFilters,        // SearchFilters - Pre-applied filter state
  lockedFilters = {},       // {status?, mediaType?, favoritesFilter?} - Locked filters
  onFilterChipRemoved,      // () => void - When locked filter chip removed
  onSaveSearch,             // () => void - Save current search as Stack
  
  // Actions
  onAddLink,                // () => void - Open Add Link dialog
  addLinkButtonText = "Add Link",  // string - Button label
  
  // Selection Mode (Bulk Actions)
  showSelectionMode = false, // boolean - Show selection toggle
  selectionMode = false,    // boolean - Current selection state
  onToggleSelectionMode,    // () => void - Toggle selection mode
  onSelectAll,              // () => void - Select all items (passed to SearchFilter)
  selectedCount = 0,        // number - Count of selected items
  totalCount = 0            // number - Total items count
}) {
  // Component implementation
}
```

---

## Dependencies & Imports

```javascript
import { useState } from "react";
import { 
  Menu,           // Hamburger menu icon
  Plus,           // Add link icon
  Search,         // Search icon
  X,              // Clear search icon
  NotebookPen,    // Logo icon
  CheckSquare     // Selection mode icon
} from "lucide-react";

import { Button } from "./ui/button.jsx";
import SearchFilter from "./SearchFilter.jsx";
```

### Required Files
✅ **Custom Components:**
- `/components/ui/button.jsx` - ShadCN button component ✅ EXISTS
- `/components/SearchFilter.jsx` - Advanced search component ✅ JUST CREATED

✅ **NO OTHER DEPENDENCIES!**

---

## State Management

```javascript
// Internal state
const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
const [isSearchExpanded, setIsSearchExpanded] = useState(false);
```

**State Variables:**
1. `searchQuery` - Current search input value (initialized from `initialSearchQuery` prop)
2. `isSearchExpanded` - Mobile search expansion state (true = search bar visible below)

---

## Component Structure

### Row 1: Main TopBar Row

```jsx
<div className="flex items-center justify-between px-4 py-3 md:px-6">
  {/* LEFT SIDE */}
  <button 
    onClick={onMenuClick}
    className={`lg:hidden p-2 -ml-2 hover:opacity-70 transition-opacity ${
      currentPage === "settings" ? "invisible" : ""
    }`}
  >
    <Menu size={24} />
  </button>

  <div className="flex items-center gap-2">
    <NotebookPen className="w-[24px] h-[24px] md:w-[30px] md:h-[30px] text-foreground" />
    <p className="font-['New_Spirit:SemiBold',_sans-serif] leading-[normal] text-[22px] md:text-[26px] text-foreground">
      fieldnotes.
    </p>
  </div>

  {/* RIGHT SIDE */}
  <div className="flex items-center gap-2">
    {/* Selection Mode Button */}
    {/* Search (Simple Mode) */}
    {/* Add Link Button */}
  </div>
</div>
```

#### 1. Mobile Menu Button
```jsx
<button 
  onClick={onMenuClick}
  className={`lg:hidden p-2 -ml-2 hover:opacity-70 transition-opacity ${
    currentPage === "settings" ? "invisible" : ""
  }`}
>
  <Menu size={24} />
</button>
```

**Key Details:**
- Only visible on mobile/tablet: `lg:hidden`
- Invisible on Settings page (not just hidden, so layout doesn't shift)
- Negative margin to align properly: `-ml-2`
- Hover effect: `hover:opacity-70`

#### 2. Logo
```jsx
<div className="flex items-center gap-2">
  <NotebookPen className="w-[24px] h-[24px] md:w-[30px] md:h-[30px] text-foreground" />
  <p className="font-['New_Spirit:SemiBold',_sans-serif] leading-[normal] text-[22px] md:text-[26px] text-foreground">
    fieldnotes.
  </p>
</div>
```

**Key Details:**
- Icon size: 24px mobile → 30px desktop
- Font: New Spirit SemiBold
- Font size: 22px mobile → 26px desktop
- Color: `text-foreground` (uses CSS variable)

#### 3. Selection Mode Button
```jsx
{showSelectionMode && onToggleSelectionMode && (
  <Button
    variant={selectionMode ? "default" : "outline"}
    size="sm"
    onClick={onToggleSelectionMode}
    className="text-[13px]"
  >
    <CheckSquare size={16} className="mr-1" />
    <span className="hidden sm:inline">
      {selectionMode ? "Cancel" : "Select"}
    </span>
  </Button>
)}
```

**Key Details:**
- Only rendered if `showSelectionMode={true}` AND callback provided
- Variant changes: `default` when active, `outline` when inactive
- Text hidden on very small screens: `hidden sm:inline`
- Icon always visible with right margin: `mr-1`

#### 4. Simple Search (Desktop)
```jsx
{showSearch && !useAdvancedSearch && currentPage !== "settings" && (
  <div className="hidden md:flex items-center gap-2 bg-input-background border border-border rounded-lg px-3 py-2 w-[280px] lg:w-[320px]">
    <Search size={18} className="text-muted-foreground flex-shrink-0" />
    <input
      type="text"
      value={searchQuery}
      onChange={handleSearchChange}
      placeholder={searchPlaceholder}
      className="flex-1 bg-transparent text-foreground text-[14px] outline-none placeholder:text-muted-foreground"
    />
    {searchQuery && (
      <button onClick={clearSearch} className="p-1 hover:opacity-70 transition-opacity">
        <X size={14} className="text-muted-foreground" />
      </button>
    )}
  </div>
)}
```

**Key Details:**
- Hidden on mobile: `hidden md:flex`
- Width: 280px on medium screens, 320px on large screens
- Background: `bg-input-background`
- Clear button only shows when `searchQuery` has value
- `flex-shrink-0` on icon prevents squishing

#### 5. Simple Search (Mobile Icon)
```jsx
{showSearch && !useAdvancedSearch && currentPage !== "settings" && (
  <button
    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
    className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
  >
    {isSearchExpanded ? (
      <X size={20} className="text-foreground" />
    ) : (
      <Search size={20} className="text-foreground" />
    )}
  </button>
)}
```

**Key Details:**
- Only visible on mobile: `md:hidden`
- Icon switches between Search and X based on `isSearchExpanded`
- Toggles `isSearchExpanded` state
- Hover effect: `hover:bg-accent`

#### 6. Add Link Button
```jsx
{onAddLink && (
  <button 
    onClick={onAddLink}
    className="bg-[#1a1a1a] h-[36px] md:h-[34px] px-3 md:px-5 rounded-[2px] cursor-pointer hover:bg-[#2a2a2a] transition-colors border border-[#404040] flex items-center gap-1"
  >
    <Plus size={16} className="text-white md:hidden" />
    <p className="hidden md:block font-['Inter:Medium',_sans-serif] font-medium text-[14px] text-white">
      {addLinkButtonText}
    </p>
  </button>
)}
```

**Key Details:**
- **Mobile:** Shows Plus icon only (36px height, 3px horizontal padding)
- **Desktop:** Shows text only (34px height, 5px horizontal padding)
- Background: Dark gray `#1a1a1a`
- Border: `#404040`
- Hover: `#2a2a2a`
- Minimal rounding: `rounded-[2px]`
- Font: Inter Medium, 14px
- Only renders if `onAddLink` callback provided

---

### Row 2: Page Title Section

```jsx
{(pageTitle || customSearchContent) && (
  <div className="border-t border-border px-4 py-3 md:px-6">
    {customSearchContent ? (
      <div className="hidden md:block">
        {customSearchContent}
      </div>
    ) : (
      <p className="hidden md:block font-['New_Spirit:Medium',_sans-serif] leading-[normal] text-[18px] text-foreground">
        {pageTitle}
      </p>
    )}
  </div>
)}
```

**Key Details:**
- Only renders if `pageTitle` or `customSearchContent` provided
- Separated from main row with top border: `border-t border-border`
- Hidden on mobile: `hidden md:block`
- Custom content takes precedence over page title
- Font: New Spirit Medium, 18px
- Same horizontal padding as main row

---

### Row 3: Advanced Search Filter

```jsx
{useAdvancedSearch && onSearchWithFilters && (
  <SearchFilter
    onSearch={onSearchWithFilters}
    placeholder={searchPlaceholder}
    availableTags={availableTags}
    showTimeFilter={showTimeFilter}
    showMediaFilter={showMediaFilter}
    showTagFilter={showTagFilter}
    showStatusFilter={showStatusFilter}
    showFavoritesFilter={showFavoritesFilter}
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
)}
```

**Key Details:**
- Only renders when `useAdvancedSearch={true}` AND callback provided
- Completely replaces simple search (simple search hidden when this is enabled)
- Passes through all filter-related props
- SearchFilter handles its own styling/borders
- Includes selection mode props for "Select All" button integration

---

### Row 4: Mobile Expanded Search

```jsx
{showSearch && isSearchExpanded && !customSearchContent && !useAdvancedSearch && (
  <div className="md:hidden px-4 pb-3">
    <div className="flex items-center gap-2 bg-input-background border border-border rounded-lg px-3 py-2">
      <Search size={18} className="text-muted-foreground flex-shrink-0" />
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder={searchPlaceholder}
        className="flex-1 bg-transparent text-foreground text-[14px] outline-none placeholder:text-muted-foreground"
        autoFocus
      />
      {searchQuery && (
        <button onClick={clearSearch} className="p-1 hover:opacity-70 transition-opacity">
          <X size={14} className="text-muted-foreground" />
        </button>
      )}
    </div>
  </div>
)}
```

**Key Details:**
- Only visible on mobile: `md:hidden`
- Only shown when `isSearchExpanded={true}`
- Hidden if custom content or advanced search enabled
- **Auto-focuses** when expanded: `autoFocus`
- Same styling as desktop search bar
- Controlled by mobile search icon toggle

---

## Event Handlers

### 1. Search Change Handler
```javascript
const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchQuery(value);
  if (onSearch) {
    onSearch(value);
  }
};
```

**Behavior:**
- Updates local state immediately
- Calls `onSearch` callback with new value (live search)
- Only calls callback if it exists (optional prop)

### 2. Clear Search Handler
```javascript
const clearSearch = () => {
  setSearchQuery("");
  if (onSearch) {
    onSearch("");
  }
};
```

**Behavior:**
- Clears local state
- Calls `onSearch("")` to clear results
- Triggered by X button click

---

## Complete Component Code Structure

```jsx
import { useState } from "react";
import { Menu, Plus, Search, X, NotebookPen, CheckSquare } from "lucide-react";
import { Button } from "./ui/button.jsx";
import SearchFilter from "./SearchFilter.jsx";

export default function TopBar({
  onMenuClick,
  onAddLink,
  onSearch,
  onSearchWithFilters,
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
  showTimeFilter = false,
  showMediaFilter = false,
  showTagFilter = false,
  showStatusFilter = false,
  showFavoritesFilter = false,
  showSortOptions = false,
  preAppliedFilters,
  lockedFilters,
  onFilterChipRemoved,
  onSaveSearch,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0,
  currentPage,
  showBackButton,
  onNavigate
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className="bg-background border-b border-border sticky top-0 z-40">
      {/* ROW 1: Main TopBar */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Mobile Menu Button */}
        {/* Logo */}
        {/* Right Side: Selection, Search, Add Link */}
      </div>

      {/* ROW 2: Page Title (optional) */}
      {/* ROW 3: Advanced Search Filter (optional) */}
      {/* ROW 4: Mobile Expanded Search (optional) */}
    </div>
  );
}
```

---

## Styling Requirements

### CSS Variables (from `/styles/global.css`)
```css
bg-background           /* Main background */
bg-input-background     /* Input field background */
bg-accent              /* Hover states */
text-foreground        /* Primary text color */
text-muted-foreground  /* Secondary/placeholder text */
border-border          /* Border color */
```

### Fixed Colors (Grayscale)
```css
bg-[#1a1a1a]    /* Add Link button background */
bg-[#2a2a2a]    /* Add Link button hover */
border-[#404040] /* Add Link button border */
text-white       /* Add Link button text */
```

### Typography
```css
/* Logo */
font-['New_Spirit:SemiBold',_sans-serif]
text-[22px] md:text-[26px]

/* Page Title */
font-['New_Spirit:Medium',_sans-serif]
text-[18px]

/* Add Link Button */
font-['Inter:Medium',_sans-serif]
font-medium
text-[14px]

/* Search Input */
text-[14px]

/* Selection Button */
text-[13px]
```

### Spacing & Sizing
```css
/* Container padding */
px-4 py-3 md:px-6

/* Search bar width */
w-[280px] lg:w-[320px]

/* Add Link button height */
h-[36px] md:h-[34px]

/* Icon sizes */
Menu: 24px
Logo: 24px → 30px
Search: 18px (in bar), 20px (mobile icon)
Clear X: 14px
Plus: 16px
CheckSquare: 16px
```

### Z-Index Hierarchy
```css
TopBar container: z-40
SearchFilter dropdowns: z-50 (internal to SearchFilter)
Modals/Dialogs: z-50+
```

---

## Behavior & Interactions

### 1. Search Modes

**Simple Search (Default):**
- Desktop: Inline search bar always visible
- Mobile: Search icon → Click to expand below → Type → Click X to collapse
- Live search: Calls `onSearch(query)` on every keystroke
- Hidden on Settings page (`currentPage === "settings"`)

**Advanced Search:**
- Renders `SearchFilter` component below main row
- Hides simple search completely
- SearchFilter manages all filter state internally
- Calls `onSearchWithFilters(query, filters)` when filters change

**Custom Content:**
- Replaces page title section with custom React node
- Used for specialized pages (e.g., FeedsPage custom toolbar)
- Only shown on desktop (`hidden md:block`)

### 2. Menu Button Visibility

```javascript
className={`lg:hidden p-2 -ml-2 hover:opacity-70 transition-opacity ${
  currentPage === "settings" ? "invisible" : ""
}`}
```

- **Mobile/Tablet:** Visible
- **Desktop (≥1024px):** Hidden
- **Settings Page:** Invisible (maintains layout spacing)

### 3. Selection Mode

When `showSelectionMode={true}`:
- Button appears before search
- Variant changes when active: `default` vs `outline`
- Text changes: "Select" → "Cancel"
- Text hidden on very small screens: `hidden sm:inline`
- Integration with SearchFilter: "Select All" button appears in SearchFilter

### 4. Add Link Button

**Conditional Rendering:**
- Only renders if `onAddLink` callback provided

**Mobile (< 768px):**
- Plus icon only (`md:hidden`)
- 36px height, 3px horizontal padding
- No text label

**Desktop (≥ 768px):**
- Text label only (`hidden md:block`)
- 34px height, 5px horizontal padding
- No icon

**Note:** No floating button! Everything is inline in the TopBar.

---

## Responsive Breakpoints

```javascript
// Tailwind breakpoints
sm:  640px   // Very small text/buttons hidden below this
md:  768px   // Main mobile/desktop split
lg:  1024px  // Hide menu button, wider search bar
```

**Key Responsive Classes:**
```css
lg:hidden              /* Hide on desktop (menu button) */
md:hidden              /* Hide on tablet+ (mobile search icon) */
hidden md:flex         /* Show on tablet+ (desktop search) */
hidden md:block        /* Show on tablet+ (page title, Add Link text) */
hidden sm:inline       /* Show on small+ (selection button text) */
w-[280px] lg:w-[320px] /* Responsive width (search bar) */
```

---

## Edge Cases & Conditionals

### 1. Settings Page Special Behavior
```javascript
currentPage === "settings"
```
- Menu button invisible (not hidden)
- Search completely hidden
- Only shows logo and Add Link button

### 2. No Search Scenario
```javascript
showSearch={false}
```
- No search bar rendered
- More space for other controls

### 3. No Add Link Callback
```javascript
if (!onAddLink) // Don't render button
```

### 4. Custom Content Precedence
```javascript
customSearchContent ? renderCustom : renderPageTitle
```

### 5. Advanced vs Simple Search
```javascript
useAdvancedSearch ? <SearchFilter /> : <SimpleSearch />
```
- Mutually exclusive - never render both
- Simple search checks `!useAdvancedSearch`

---

## Integration Points

### MainLayout Integration
```jsx
<MainLayout
  currentPage="articles"
  onNavigate={handleNavigate}
  topBarProps={{
    pageTitle: "Inbox",
    onSearch: handleSearch,
    onAddLink: () => setShowAddLinkModal(true),
    // ... other props
  }}
>
  {/* Page content */}
</MainLayout>
```

### SearchFilter Integration
```jsx
// TopBar passes all filter props to SearchFilter
<SearchFilter
  onSearch={onSearchWithFilters}  // Different callback for filters
  // ... all filter configuration props
  selectionMode={selectionMode}   // Bulk selection state
  onSelectAll={onSelectAll}       // "Select All" button
/>
```

---

## Example Usage Patterns

### 1. Simple Page (Inbox)
```jsx
<TopBar
  onMenuClick={toggleSidebar}
  pageTitle="Inbox"
  onSearch={handleSimpleSearch}
  onAddLink={openAddLinkDialog}
  currentPage="inbox"
/>
```

### 2. Advanced Search Page
```jsx
<TopBar
  onMenuClick={toggleSidebar}
  pageTitle="Search"
  useAdvancedSearch={true}
  onSearchWithFilters={handleSearchWithFilters}
  availableTags={allTags}
  showTimeFilter={true}
  showMediaFilter={true}
  showTagFilter={true}
  showStatusFilter={true}
  showSortOptions={true}
  onSaveSearch={handleSaveAsStack}
  currentPage="search"
/>
```

### 3. Pre-Filtered Page (Videos)
```jsx
<TopBar
  onMenuClick={toggleSidebar}
  pageTitle="Videos"
  useAdvancedSearch={true}
  onSearchWithFilters={handleSearchWithFilters}
  preAppliedFilters={{
    mediaType: "video",
    status: "all",
    // ... other defaults
  }}
  lockedFilters={{
    mediaType: "video"  // User can't change this
  }}
  onFilterChipRemoved={goToAllArticles}
  showTimeFilter={true}
  showStatusFilter={true}
  showSelectionMode={true}
  selectionMode={isSelecting}
  onToggleSelectionMode={toggleBulkSelection}
  addLinkButtonText="Add Video"
  currentPage="videos"
/>
```

### 4. Settings Page (No Search)
```jsx
<TopBar
  pageTitle="Settings"
  showSearch={false}
  currentPage="settings"
  onNavigate={goBack}
/>
```

### 5. Custom Content Page (Feeds)
```jsx
<TopBar
  onMenuClick={toggleSidebar}
  customSearchContent={
    <div className="flex items-center gap-4">
      <input placeholder="Search feeds..." />
      <button>Add Feed</button>
    </div>
  }
  currentPage="feeds"
/>
```

---

## Accessibility

### ARIA Labels
```jsx
// Mobile search toggle
<button aria-label={isSearchExpanded ? "Close search" : "Open search"}>

// Add Link button (implicit from text or add explicit label)
<button aria-label={addLinkButtonText}>
```

### Focus Management
```jsx
// Auto-focus mobile search when expanded
<input autoFocus />
```

### Keyboard Navigation
- All interactive elements are buttons or inputs
- Tab order: Menu → Selection → Search → Add Link
- Enter key works on all buttons

### Screen Reader Friendly
- Icon buttons have text alternatives
- State changes announced (selection mode toggle)

---

## Performance Considerations

### 1. Live Search
```javascript
// Search triggers on every keystroke
onChange={(e) => onSearch(e.target.value)}
```
**Recommendation:** Parent component should debounce if needed

### 2. Conditional Rendering
- Uses short-circuit evaluation for optional sections
- No unnecessary re-renders when props don't change

### 3. State Updates
- Minimal local state (only 2 variables)
- State updates are immediate and cheap

---

## Testing Checklist

### Visual Tests
- [ ] Logo displays correctly at all screen sizes
- [ ] All colors are grayscale (except white text on dark button)
- [ ] No drop shadows anywhere
- [ ] Minimal rounded corners (2px or lg only)
- [ ] Border at bottom of TopBar
- [ ] Sticky positioning works when scrolling

### Functional Tests
- [ ] Mobile menu button clicks trigger `onMenuClick()`
- [ ] Mobile menu button invisible on Settings page
- [ ] Desktop search bar types and clears correctly
- [ ] Mobile search icon toggles expansion
- [ ] Mobile expanded search auto-focuses
- [ ] Clear button appears/disappears with text
- [ ] Selection mode button toggles variant
- [ ] Add Link button shows icon on mobile, text on desktop
- [ ] Page title displays on desktop only
- [ ] Custom content replaces page title when provided
- [ ] Advanced search renders SearchFilter correctly
- [ ] Simple search hidden when advanced search enabled
- [ ] Search hidden on Settings page

### Responsive Tests
- [ ] Menu button: visible mobile, hidden desktop
- [ ] Desktop search: hidden mobile, visible desktop
- [ ] Mobile search icon: visible mobile, hidden desktop
- [ ] Add Link icon: visible mobile, hidden desktop
- [ ] Add Link text: hidden mobile, visible desktop
- [ ] Page title: hidden mobile, visible desktop
- [ ] Selection text: hidden xs, visible sm+
- [ ] Search bar width: 280px md, 320px lg

### Integration Tests
- [ ] Works with MainLayout wrapper
- [ ] SearchFilter receives all correct props
- [ ] Callbacks fire correctly
- [ ] State updates propagate to parent
- [ ] No console errors or warnings

---

### Common Pitfalls to Avoid

### ❌ Don't:
- Use JSX syntax (this is pure JSX)
- Add any colors (except grayscale and white)
- Add drop shadows (except SearchFilter dropdowns)
- Use large rounded corners (rounded-xl, rounded-2xl)
- Render both simple and advanced search simultaneously
- Forget the `invisible` class on Settings page menu button
- Hardcode mobile breakpoints (use Tailwind classes)
- Forget `autoFocus` on mobile expanded search
- Miss the negative margin on menu button (`-ml-2`)

### ✅ Do:
- Use CSS variables for colors
- Keep rounding minimal (rounded-[2px], rounded-lg max)
- Handle all optional props with defaults
- Test at all breakpoints (sm, md, lg)
- Use proper font syntax: `font-['FontName:Weight',_sans-serif]`
- Add `flex-shrink-0` to icons in flex containers
- Use optional chaining for callbacks (`onSearch?.(value)`)
- Maintain consistent spacing (px-4 md:px-6)

---

## File Location

**Create at:** `/components/TopBar.jsx`

**File size:** ~240 lines  
**Complexity:** ⭐⭐⭐ (Medium)  
**Dependencies:** 2 components (Button, SearchFilter)  
**Build time:** 45-60 minutes  

---

## Related Components

**Used By:**
- `/components/MainLayout.jsx` - Wrapper that includes TopBar

**Uses:**
- `/components/ui/button.jsx` - ShadCN Button
- `/components/SearchFilter.jsx` - Advanced filter component

**Related:**
- `/components/Sidebar.jsx` - Vertical navigation (toggled by menu button)
- `/components/BulkActionsBar.jsx` - Appears when selectionMode active

---

## Quick Reference

### Key Classes
```css
Container:     sticky top-0 z-40 border-b
Main row:      justify-between px-4 py-3 md:px-6
Logo mobile:   text-[22px] w-[24px]
Logo desktop:  text-[26px] w-[30px]
Search width:  w-[280px] lg:w-[320px]
Add Link:      bg-[#1a1a1a] border-[#404040]
Page title:    text-[18px] hidden md:block
```

### Key Icons
```javascript
Menu:        Menu size={24}
Logo:        NotebookPen w-[24px] md:w-[30px]
Search:      Search size={18} (bar) / size={20} (mobile)
Clear:       X size={14}
Add:         Plus size={16}
Selection:   CheckSquare size={16}
```

### Key Props
```javascript
// Most common
onMenuClick     // Required for mobile
pageTitle       // Shows below main row
onSearch        // Simple search callback
onAddLink       // Add Link button

// Advanced search
useAdvancedSearch      // Enable SearchFilter
onSearchWithFilters    // Filter callback
showTimeFilter         // Enable time filter
showMediaFilter        // Enable media filter

// Pre-filtering
preAppliedFilters      // Initial filter state
lockedFilters          // Non-removable filters

// Bulk actions
showSelectionMode      // Show Select button
selectionMode          // Current state
onToggleSelectionMode  // Toggle callback
```

---

## Final Notes

### Design Philosophy
The TopBar follows fieldnotes' design principles:
- **Minimal & Functional** - Only essential controls
- **Grayscale Only** - No color distractions
- **Flat Design** - No shadows or depth effects
- **Responsive First** - Mobile and desktop equally important
- **Keyboard Accessible** - All actions keyboard-reachable

### Future Enhancements
Potential additions (not in current scope):
- Breadcrumb navigation
- Notifications icon
- User account dropdown
- Theme toggle
- Keyboard shortcut hints

### Performance Notes
- Component re-renders only when props/state change
- No heavy computations or effects
- Search is live (consider debouncing in parent)
- Minimal DOM nodes for fast rendering

---

## You're Ready! 🚀

You now have everything needed to create `/components/TopBar.jsx`:

✅ Complete component structure  
✅ All props documented with defaults  
✅ Exact styling requirements  
✅ Responsive behavior defined  
✅ Event handlers implemented  
✅ Integration patterns shown  
✅ Edge cases covered  
✅ Testing checklist provided  

**Just follow this prompt step-by-step and you'll have a production-ready TopBar component!** 🎉

---

**Last Updated:** Based on actual TopBar.jsx implementation  
**Dependencies:** Button.jsx ✅ | SearchFilter.jsx ✅  
**Status:** Ready to build! 🔨
