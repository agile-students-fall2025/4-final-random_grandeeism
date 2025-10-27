# HomePage Tab Views Description

## Overview
The HomePage component in **fieldnotes** uses a **view-based navigation system** rather than traditional tabs. Different views are accessed through the Sidebar, and each view displays a filtered/organized collection of articles with view-specific functionality.

---

## Navigation Structure

### **Access Method**
- Views are accessed via the **Sidebar** (left navigation panel)
- Desktop: Always visible sidebar (280px width)
- Mobile: Hamburger menu that slides in from left
- Current view is highlighted in the sidebar with `bg-accent` background

### **View State Management**
- Controlled by `currentView` state prop
- Passed from parent App component
- Updated via `onNavigate(page, view)` callback

---

## Available Views

### **1. HOME**
- **Icon:** Home icon
- **Location:** Top of sidebar
- **Purpose:** Dashboard/overview page
- **Page:** `"home"` (different page, not a view of HomePage)

---

### **2. SEARCH**
- **Icon:** Search icon  
- **Location:** Second item in sidebar
- **View Name:** `"Search"`
- **Purpose:** Global search across all articles
- **Features:**
  - Full search functionality via TopBar
  - Advanced filters (tags, time, media type, status, favorites, sort)
  - Ability to save searches as "Stacks"
  - No pre-applied filters

---

## Status Section (Workflow Queue System)

These views represent the **article management workflow** - articles move through these statuses:

### **3. INBOX** ⭐
- **Icon:** Inbox icon
- **View Name:** `"Inbox"`
- **Filter:** `status: "inbox"`
- **Count Badge:** Shows number of inbox articles
- **Purpose:** New/unread articles waiting to be triaged
- **Features:**
  - Default landing view for new articles
  - Status filter is **locked** to "inbox"
  - Articles can be moved to Daily Reading, Continue Reading, or Archive

---

### **4. DAILY READING** 📅
- **Icon:** Calendar icon
- **View Name:** `"Daily Reading"`
- **Filter:** `status: "dailyReading"`
- **Count Badge:** Shows number of scheduled articles
- **Purpose:** Articles scheduled for today's reading session
- **Features:**
  - Status filter is **locked** to "dailyReading"
  - Articles get a `scheduledDate` when moved here
  - Designed for daily review workflow

---

### **5. CONTINUE READING** 📖
- **Icon:** BookOpen icon
- **View Name:** `"Continue Reading"`
- **Filter:** `status: "inProgress"`
- **Count Badge:** Shows number of in-progress articles
- **Purpose:** Articles you've started but haven't finished
- **Features:**
  - Status filter is **locked** to "inProgress"
  - Shows `readProgress` percentage if available
  - Tracks `lastReadDate`

---

### **6. REDISCOVERY QUEUE** 🔄
- **Icon:** RotateCcw icon
- **View Name:** `"Rediscovery"`
- **Filter:** `status: "rediscovery"`
- **Count Badge:** Shows number of articles in rediscovery queue
- **Purpose:** Completed articles scheduled to be re-read later
- **Features:**
  - Status filter is **locked** to "rediscovery"
  - Requires notes/annotations (shows CompletionModal if missing)
  - Articles get a `rediscoveryDate` (default: 7 days from completion)
  - Marked as `isRead: true`

---

### **7. ARCHIVE** 🗄️
- **Icon:** Archive icon
- **View Name:** `"Archive"`
- **Filter:** `status: "archived"`
- **No Count Badge**
- **Purpose:** Long-term storage for completed articles
- **Features:**
  - Status filter is **locked** to "archived"
  - Articles marked as `isRead: true`
  - Gets `dateRead` timestamp when archived

---

## Shelves Section (Content Organization)

### **8. FAVORITES** ⭐
- **Icon:** Star icon
- **View Name:** `"Favorites"`
- **Filter:** `favoritesFilter: "favorites"`
- **Location:** First item in "Shelves" section
- **Purpose:** Quick access to favorited/starred articles
- **Features:**
  - Favorites filter is **locked** to "favorites"
  - Shows articles with `isFavorite: true`
  - Articles from ANY status can be favorited

---

### **9. FEEDS** 📡
- **Icon:** Rss icon
- **Page:** `"feeds"` (separate page)
- **Purpose:** Manage RSS feeds for articles
- **Not a HomePage view** - navigates to FeedsPage

---

### **10. VIDEOS** 🎥
- **Icon:** Video icon
- **Page:** `"videos"` (separate page)
- **Purpose:** Video content management
- **Not a HomePage view** - navigates to VideosPage

---

### **11. AUDIOS** 🎧
- **Icon:** Headphones icon
- **Page:** `"podcasts"` (separate page)
- **Purpose:** Podcast/audio content management
- **Not a HomePage view** - navigates to PodcastsPage

---

### **12. TEXT** 📄
- **Icon:** FileText icon
- **Page:** `"text"` (separate page)
- **Purpose:** Text-only articles/notes
- **Not a HomePage view** - navigates to TextPage

---

## Other Section

### **13. TAGS** 🏷️
- **Icon:** Tag icon
- **View Name:** `"Tags"`
- **Purpose:** Tag management and browsing
- **Features:**
  - **Two Modes:**
    1. **Tag Library View** (when no tag selected):
       - Shows all tags as grid of cards
       - Displays article count per tag
       - Search tags functionality
       - Create new tags
       - Delete tags (removes from all articles)
    2. **Tag Filter View** (when tag selected):
       - Shows articles with specific tag
       - "Back to all tags" button
       - Normal article list with filtering
  - **Custom TopBar Content:**
    - In Tag Library mode: Shows tag search + "Create Tag" button
    - In Tag Filter mode: Shows normal search with tag pre-filter

---

### **14. STATISTICS** 📊
- **Icon:** BarChart3 icon
- **Page:** `"statistics"` (separate page)
- **Purpose:** Reading statistics and analytics
- **Not a HomePage view** - navigates to StatisticsPage

---

## View-Specific Features

### **Filter System**
Each view has **pre-applied filters** and **locked filters**:

```javascript
// Example: Inbox view
currentFilters: {
  status: "inbox",        // Locked - user can't change
  tags: [],
  timeFilter: "all",
  mediaType: "all",
  sortBy: "dateAdded",
  favoritesFilter: "all"  // Can be changed
}
```

### **Locked Filters** (Cannot be changed in TopBar):
- **Inbox** → `status: "inbox"`
- **Daily Reading** → `status: "dailyReading"`
- **Continue Reading** → `status: "inProgress"`
- **Rediscovery** → `status: "rediscovery"`
- **Archive** → `status: "archived"`
- **Favorites** → `favoritesFilter: "favorites"`

### **Available Filters** (Shown in TopBar):
| View | Time | Media | Tags | Status | Favorites | Sort |
|------|------|-------|------|--------|-----------|------|
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inbox | ✅ | ✅ | ✅ | 🔒 | ✅ | ✅ |
| Daily Reading | ✅ | ✅ | ✅ | 🔒 | ✅ | ✅ |
| Continue Reading | ✅ | ✅ | ✅ | 🔒 | ✅ | ✅ |
| Rediscovery | ✅ | ✅ | ✅ | 🔒 | ✅ | ✅ |
| Archive | ✅ | ✅ | ✅ | 🔒 | ✅ | ✅ |
| Favorites | ✅ | ✅ | ✅ | ✅ | 🔒 | ✅ |
| Tags (library) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tags (filtered) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

🔒 = Locked (pre-applied, cannot be changed)

---

## Article Display

### **Common to All Views:**
- Articles displayed as **ContentCard** components
- Vertical list layout (max-width: 900px, centered)
- Shows: title, description, reading time, tags, favorite status, workflow status
- Actions: favorite, tag, status change, delete
- Click to open in ArticleViewer

### **Selection Mode:**
- Available in all views (except Tags library mode)
- Toggle via TopBar button
- Allows bulk actions:
  - Bulk tag management
  - Bulk delete
  - Bulk status change (Move to Next Queue)
  - Select All / Deselect All

### **Empty States:**
Each view shows custom empty state messages:
- **Inbox:** "New articles will appear here automatically"
- **Daily Reading:** "Schedule articles for your daily reading session"
- **Archive:** "Completed articles with annotations will be stored here"
- **Tags (filtered):** "No articles with the tag '[tagname]'"

---

## Special View Behaviors

### **Tags View - Library Mode**
```jsx
{currentView === "Tags" && !selectedTag ? (
  // Shows tag grid instead of article list
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {tags.map(tag => (
      <TagCard 
        name={tag}
        count={articleCount}
        onClick={() => setSelectedTag(tag)}
        onDelete={() => deleteTag(tag)}
      />
    ))}
  </div>
)}
```

### **Tags View - Filter Mode**
When a tag is selected:
1. Sets `selectedTag` state
2. Shows "Back to all tags" button
3. Displays normal article list filtered by tag
4. TopBar shows tag in search placeholder: "Search in [tagname]..."

### **Rediscovery Queue - Completion Modal**
When moving article to rediscovery:
```javascript
if (newStatus === "rediscovery") {
  const article = articles.find(a => a.id === articleId);
  if (article && !article.hasAnnotations && !article.completionReflection) {
    // Shows CompletionModal to require notes
    setPendingArchiveArticle(article);
    setShowCompletionModal(true);
    return; // Blocks status change until notes added
  }
}
```

---

## View Routing/Navigation

### **From Sidebar:**
```javascript
onNavigate('articles', 'Inbox')
onNavigate('articles', 'Daily Reading')
onNavigate('articles', 'Continue Reading')
// etc.
```

### **From Tag Click:**
```javascript
onSearchByTag(tagName) 
// → Sets currentView to "Tags" and selectedTag
```

### **From Saved Search (Stack):**
```javascript
onLoadSavedSearch(searchId)
// → Sets currentView to "Search" and applies saved filters
```

---

## Mobile Adaptations

### **Responsive Changes:**
- **Mobile:** Sidebar in overlay (slide-in drawer)
- **Desktop:** Persistent sidebar (280px)
- **Mobile:** Page title shown above content
- **Desktop:** Page title in TopBar
- **Mobile:** Create Tag button below search
- **Desktop:** Create Tag button in TopBar

### **Mobile Menu:**
```jsx
{showMobileMenu && (
  <>
    {/* Backdrop */}
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
    
    {/* Slide-in Sidebar */}
    <aside className="fixed left-0 top-0 bottom-0 w-[280px] z-50">
      <Sidebar onNavigate={(page, view) => {
        onNavigate(page, view);
        setShowMobileMenu(false); // Auto-close on selection
      }} />
    </aside>
  </>
)}
```

---

## View Count Badges

Real-time counts displayed in sidebar:

```javascript
const inboxCount = articles.filter(a => !a.isHidden && a.status === "inbox").length;
const dailyReadingCount = articles.filter(a => !a.isHidden && a.status === "dailyReading").length;
const inProgressCount = articles.filter(a => !a.isHidden && a.status === "inProgress").length;
const rediscoveryCount = articles.filter(a => !a.isHidden && a.status === "rediscovery").length;
const favoriteCount = articles.filter(a => !a.isHidden && a.isFavorite).length;
```

Displayed as:
```jsx
<span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[11px]">
  {count}
</span>
```

---

## Summary Table

| View | Type | Filter Lock | Count Badge | Special Features |
|------|------|-------------|-------------|------------------|
| Home | Page | N/A | ❌ | Dashboard overview |
| Search | View | None | ❌ | Save as Stack, full filters |
| Inbox | View | status="inbox" | ✅ | Workflow entry point |
| Daily Reading | View | status="dailyReading" | ✅ | Scheduled reading |
| Continue Reading | View | status="inProgress" | ✅ | Progress tracking |
| Rediscovery | View | status="rediscovery" | ✅ | Requires notes, spaced repetition |
| Archive | View | status="archived" | ❌ | Long-term storage |
| Favorites | View | favorites=true | ❌ | Cross-status favorites |
| Tags (Library) | View | N/A | ❌ | Tag management, grid view |
| Tags (Filter) | View | tag=[selected] | ❌ | Tag-filtered articles |
| Feeds | Page | N/A | ❌ | RSS feed management |
| Videos | Page | N/A | ❌ | Video content |
| Audios | Page | N/A | ❌ | Podcast content |
| Text | Page | N/A | ❌ | Text-only content |
| Statistics | Page | N/A | ❌ | Analytics dashboard |

---

## Key Takeaways

✅ **View-based, not tab-based** - Sidebar navigation, not horizontal tabs  
✅ **7 main article views** - Search, Inbox, Daily Reading, Continue Reading, Rediscovery, Archive, Favorites  
✅ **Workflow-driven** - Articles move through status pipeline  
✅ **Smart filtering** - Each view has locked + available filters  
✅ **Tags are special** - Dual-mode (library + filter)  
✅ **Real-time counts** - Badge indicators for workflow queues  
✅ **Responsive** - Adapts sidebar/layout for mobile/desktop  
✅ **Bulk operations** - Selection mode across all article views  

The system is designed around a **read-it-later workflow** rather than traditional tabs, with views representing stages in the article lifecycle!
