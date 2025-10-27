# Add Link Modal - Component Creation Prompt

## Overview
Create an "Add Link" modal dialog that appears when users click the "Add" button in the TopBar. This modal allows users to save a new article/link with metadata including URL, tags, status, and favorite flag.

---

## Component Requirements

### **Modal Structure**
- **Type:** Full-screen overlay modal (fixed position)
- **Backdrop:** Black with 50% opacity (`bg-black bg-opacity-50`)
- **Z-index:** `z-50` (above all other content)
- **Positioning:** Centered (`flex items-center justify-center`)
- **Padding:** `p-4` (mobile safe area)

### **Modal Content Container**
- **Background:** `bg-card dark:bg-card`
- **Border Radius:** `rounded-lg`
- **Padding:** `p-6`
- **Width:** `w-full max-w-[600px]`
- **Max Height:** `max-h-[90vh]` with `overflow-y-auto` (scrollable on small screens)

---

## State Management

### **Required State Variables**
```javascript
const [showAddLinkDialog, setShowAddLinkDialog] = useState(false);
const [newLinkUrl, setNewLinkUrl] = useState("");
const [newLinkTags, setNewLinkTags] = useState([]);
const [newLinkStatus, setNewLinkStatus] = useState("inbox");
const [newLinkFavorite, setNewLinkFavorite] = useState(false);
const [newTagInput, setNewTagInput] = useState("");
```

### **Computed Values**
```javascript
// Get all existing tags from articles for suggestions
const allExistingTags = Array.from(new Set(articles.flatMap(a => a.tags))).sort();
```

---

## Modal Sections (Top to Bottom)

### **1. Header**
```jsx
<h3 className="text-foreground mb-4">Add New Link</h3>
```

---

### **2. URL Input Section**
```jsx
<div className="mb-6">
  <label className="block text-[14px] text-foreground mb-2">URL</label>
  <input
    type="url"
    value={newLinkUrl}
    onChange={(e) => setNewLinkUrl(e.target.value)}
    placeholder="https://example.com/article"
    className="w-full p-3 border border-border bg-background text-foreground rounded text-[16px] outline-none focus:border-primary"
  />
</div>
```

**Features:**
- Input type: `url` for mobile keyboard optimization
- Full-width input
- Border changes to primary color on focus
- Placeholder shows example URL

---

### **3. Tags Section**
```jsx
<div className="mb-6">
  <label className="block text-[14px] text-foreground mb-2">Tags</label>
  
  {/* Selected Tags Display */}
  <div className="flex flex-wrap gap-2 mb-2">
    {newLinkTags.map(tag => (
      <span key={tag} className="inline-flex items-center gap-1 text-[12px] text-primary bg-primary/10 px-2 py-1 rounded">
        <Tag size={12} />
        {tag}
        <button
          onClick={() => handleRemoveTag(tag)}
          className="ml-1 hover:text-destructive"
        >
          <X size={12} />
        </button>
      </span>
    ))}
  </div>
  
  {/* Tag Input */}
  <input
    type="text"
    value={newTagInput}
    onChange={(e) => setNewTagInput(e.target.value)}
    onKeyDown={handleTagInputKeyDown}
    placeholder="Add tags (press Enter)"
    className="w-full p-2 border border-border bg-background text-foreground rounded text-[14px] outline-none focus:border-primary"
  />
  
  {/* Existing Tags Suggestions */}
  {allExistingTags.length > 0 && (
    <div className="mt-2">
      <p className="text-[12px] text-muted-foreground mb-1">Existing tags:</p>
      <div className="flex flex-wrap gap-1">
        {allExistingTags
          .filter(tag => !newLinkTags.includes(tag))
          .slice(0, 10)
          .map(tag => (
            <button
              key={tag}
              onClick={() => handleAddTag(tag)}
              className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors"
            >
              + {tag}
            </button>
          ))
        }
      </div>
    </div>
  )}
</div>
```

**Features:**
- Shows currently selected tags as chips with remove buttons
- Input field for adding new tags (press Enter to add)
- Displays up to 10 existing tags as quick-add buttons
- Filters out already-selected tags from suggestions
- Tags shown with `<Tag>` icon from lucide-react

**Required Handlers:**
```javascript
const handleAddTag = (tag) => {
  const trimmedTag = tag.trim();
  if (trimmedTag && !newLinkTags.includes(trimmedTag)) {
    setNewLinkTags([...newLinkTags, trimmedTag]);
  }
};

const handleRemoveTag = (tagToRemove) => {
  setNewLinkTags(newLinkTags.filter(tag => tag !== tagToRemove));
};

const handleTagInputKeyDown = (e) => {
  if (e.key === "Enter" && newTagInput.trim()) {
    e.preventDefault();
    handleAddTag(newTagInput);
    setNewTagInput("");
  }
};
```

---

### **4. Status Selection Section**
```jsx
<div className="mb-6">
  <label className="block text-[14px] text-foreground mb-2">Set Status</label>
  
  {/* Top Row: Inbox, Daily Reading, Continue Reading */}
  <div className="grid grid-cols-3 gap-2 mb-2">
    {/* Inbox */}
    <button
      onClick={() => setNewLinkStatus("inbox")}
      className={`p-3 rounded border-2 transition-all ${
        newLinkStatus === "inbox"
          ? "border-blue-500 bg-blue-500/10"
          : "border-border bg-background hover:border-blue-500/50"
      }`}
    >
      <Inbox size={20} className={`mx-auto mb-1 ${newLinkStatus === "inbox" ? "text-blue-500" : "text-muted-foreground"}`} />
      <p className={`text-[12px] ${newLinkStatus === "inbox" ? "text-blue-500" : "text-foreground"}`}>Inbox</p>
    </button>
    
    {/* Daily Reading */}
    <button
      onClick={() => setNewLinkStatus("dailyReading")}
      className={`p-3 rounded border-2 transition-all ${
        newLinkStatus === "dailyReading"
          ? "border-blue-500 bg-blue-500/10"
          : "border-border bg-background hover:border-blue-500/50"
      }`}
    >
      <Calendar size={20} className={`mx-auto mb-1 ${newLinkStatus === "dailyReading" ? "text-blue-500" : "text-muted-foreground"}`} />
      <p className={`text-[12px] ${newLinkStatus === "dailyReading" ? "text-blue-500" : "text-foreground"}`}>Daily Reading</p>
    </button>
    
    {/* Continue Reading */}
    <button
      onClick={() => setNewLinkStatus("inProgress")}
      className={`p-3 rounded border-2 transition-all ${
        newLinkStatus === "inProgress"
          ? "border-purple-500 bg-purple-500/10"
          : "border-border bg-background hover:border-purple-500/50"
      }`}
    >
      <BookOpen size={20} className={`mx-auto mb-1 ${newLinkStatus === "inProgress" ? "text-purple-500" : "text-muted-foreground"}`} />
      <p className={`text-[12px] ${newLinkStatus === "inProgress" ? "text-purple-500" : "text-foreground"}`}>Continue Reading</p>
    </button>
  </div>
  
  {/* Bottom Row: Rediscovery Queue, Archive */}
  <div className="grid grid-cols-2 gap-2">
    {/* Rediscovery Queue */}
    <button
      onClick={() => setNewLinkStatus("rediscovery")}
      className={`p-3 rounded border-2 transition-all ${
        newLinkStatus === "rediscovery"
          ? "border-orange-500 bg-orange-500/10"
          : "border-border bg-background hover:border-orange-500/50"
      }`}
    >
      <RotateCcw size={20} className={`mx-auto mb-1 ${newLinkStatus === "rediscovery" ? "text-orange-500" : "text-muted-foreground"}`} />
      <p className={`text-[12px] ${newLinkStatus === "rediscovery" ? "text-orange-500" : "text-foreground"}`}>Rediscovery Queue</p>
    </button>
    
    {/* Archive */}
    <button
      onClick={() => setNewLinkStatus("archived")}
      className={`p-3 rounded border-2 transition-all ${
        newLinkStatus === "archived"
          ? "border-gray-500 bg-gray-500/10"
          : "border-border bg-background hover:border-gray-500/50"
      }`}
    >
      <Archive size={20} className={`mx-auto mb-1 ${newLinkStatus === "archived" ? "text-gray-500" : "text-muted-foreground"}`} />
      <p className={`text-[12px] ${newLinkStatus === "archived" ? "text-gray-500" : "text-foreground"}`}>Archive</p>
    </button>
  </div>
</div>
```

**Status Colors:**
- **Inbox:** Blue (`border-blue-500`, `bg-blue-500/10`, `text-blue-500`)
- **Daily Reading:** Blue (`border-blue-500`, `bg-blue-500/10`, `text-blue-500`)
- **Continue Reading:** Purple (`border-purple-500`, `bg-purple-500/10`, `text-purple-500`)
- **Rediscovery Queue:** Orange (`border-orange-500`, `bg-orange-500/10`, `text-orange-500`)
- **Archive:** Gray (`border-gray-500`, `bg-gray-500/10`, `text-gray-500`)

**Note:** These are **GRAYSCALE EXCEPTION** - status colors should remain as warning indicators per design system.

---

### **5. Favorite Toggle Section**
```jsx
<div className="mb-6">
  <button
    onClick={() => setNewLinkFavorite(!newLinkFavorite)}
    className={`w-full p-3 rounded border-2 transition-all flex items-center justify-center gap-2 ${
      newLinkFavorite
        ? "border-yellow-500 bg-yellow-500/10"
        : "border-border bg-background hover:border-yellow-500/50"
    }`}
  >
    <Star size={18} className={newLinkFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} />
    <span className={`text-[14px] ${newLinkFavorite ? "text-yellow-500" : "text-foreground"}`}>
      {newLinkFavorite ? "Favorited" : "Add to Favorites"}
    </span>
  </button>
</div>
```

**Features:**
- Full-width toggle button
- Star icon from lucide-react
- When active: filled yellow star + yellow text
- When inactive: outlined star + default text
- **Note:** Yellow is **GRAYSCALE EXCEPTION** for favorite indicator

---

### **6. Action Buttons (Footer)**
```jsx
<div className="flex gap-2 justify-end">
  {/* Cancel Button */}
  <button
    onClick={() => {
      setShowAddLinkDialog(false);
      setNewLinkUrl("");
      setNewLinkTags([]);
      setNewLinkStatus("inbox");
      setNewLinkFavorite(false);
      setNewTagInput("");
    }}
    className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-80 transition-opacity"
  >
    Cancel
  </button>
  
  {/* Add Link Button */}
  <button
    onClick={handleAddLink}
    disabled={!newLinkUrl.trim()}
    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Add Link
  </button>
</div>
```

**Features:**
- Right-aligned buttons
- Cancel button resets all form state and closes modal
- Add Link button disabled if URL is empty
- Disabled state shows reduced opacity and not-allowed cursor

---

## Core Logic

### **handleAddLink Function**
```javascript
const handleAddLink = () => {
  if (newLinkUrl) {
    const newArticle = {
      id: Date.now().toString(),
      title: "New Article",
      url: newLinkUrl,
      description: "Article description will appear here once the link is processed...",
      readingTime: "2 min",
      isFavorite: newLinkFavorite,
      status: newLinkStatus,
      tags: newLinkTags,
      dateAdded: new Date(),
      isRead: false,
      hasAnnotations: false
    };
    setArticles([newArticle, ...articles]);
    
    // Reset form and close dialog
    setNewLinkUrl("");
    setNewLinkTags([]);
    setNewLinkStatus("inbox");
    setNewLinkFavorite(false);
    setNewTagInput("");
    setShowAddLinkDialog(false);
  }
};
```

**Article Object Properties:**
- `id` - Unique timestamp-based ID
- `title` - Default placeholder "New Article"
- `url` - User-entered URL
- `description` - Placeholder text
- `readingTime` - Default "2 min"
- `isFavorite` - From toggle state
- `status` - From status selection
- `tags` - Array of selected tags
- `dateAdded` - Current timestamp
- `isRead` - Default `false`
- `hasAnnotations` - Default `false`

---

## Required Imports

```javascript
import { Star, Tag, X, Inbox, Calendar, Archive, BookOpen, RotateCcw } from "lucide-react";
```

**Icons Used:**
- `Star` - Favorite toggle
- `Tag` - Tag chips
- `X` - Remove tag buttons
- `Inbox` - Inbox status button
- `Calendar` - Daily Reading status button
- `Archive` - Archive status button
- `BookOpen` - Continue Reading status button
- `RotateCcw` - Rediscovery Queue status button

---

## Modal Trigger

The modal is opened from the TopBar component:

```javascript
onAddLink={() => setShowAddLinkDialog(true)}
```

This callback is passed down through props to any component that needs to trigger the Add Link modal.

---

## Responsive Behavior

### **Mobile (< 600px)**
- Modal content takes full available width with `p-4` padding
- Status buttons remain in grid layout (3 columns, then 2 columns)
- Scrollable if content exceeds viewport height

### **Desktop (≥ 600px)**
- Modal content capped at `max-w-[600px]`
- Centered on screen
- All interactions remain the same

---

## Accessibility Features

1. **Keyboard Support:**
   - Enter key adds tags
   - Tab navigation through all interactive elements
   - Disabled button cannot receive focus

2. **Labels:**
   - All form fields have associated labels
   - Clear placeholder text

3. **Visual Feedback:**
   - Border color changes on focus
   - Hover states on all interactive elements
   - Disabled state clearly indicated

4. **Screen Reader Support:**
   - Semantic HTML (`<label>`, `<button>`)
   - Icon-only buttons have text labels

---

## Styling Details

### **Color System (Grayscale with Exceptions)**

**Grayscale Colors (Use These):**
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `bg-background` - Input backgrounds
- `bg-card` - Modal background
- `border-border` - Default borders
- `bg-secondary` - Cancel button
- `bg-primary` - Add Link button

**Color Exceptions (Keep These):**
- Status indicators (blue, purple, orange, gray) - **Warning/status colors**
- Favorite star (yellow) - **Important UI indicator**
- Primary brand color in focused states
- Destructive (red) for remove/delete actions

### **Typography**
- Modal title: Default heading size (uses global typography)
- Labels: `text-[14px]`
- Input text: `text-[16px]` (prevents zoom on iOS)
- Tag input: `text-[14px]`
- Tag chips: `text-[12px]`
- Status labels: `text-[12px]`
- Suggestions: `text-[11px]` and `text-[12px]`

---

## Form Validation

### **URL Field**
- Required - Add Link button disabled if empty
- Uses `type="url"` for HTML5 validation
- Trimmed before validation: `!newLinkUrl.trim()`

### **Tags Field**
- Optional
- Prevents duplicate tags
- Trims whitespace
- No maximum limit

### **Status Field**
- Always has a value (defaults to "inbox")
- Cannot be empty

### **Favorite Field**
- Boolean toggle
- Defaults to `false`

---

## Complete Modal Code Template

```jsx
{/* Add Link Dialog */}
{showAddLinkDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-card dark:bg-card rounded-lg p-6 w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
      <h3 className="text-foreground mb-4">Add New Link</h3>
      
      {/* URL Input */}
      <div className="mb-6">
        {/* ... URL section ... */}
      </div>

      {/* Tags Section */}
      <div className="mb-6">
        {/* ... Tags section ... */}
      </div>

      {/* Status Selection */}
      <div className="mb-6">
        {/* ... Status section ... */}
      </div>

      {/* Favorite Toggle */}
      <div className="mb-6">
        {/* ... Favorite section ... */}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {/* ... Buttons ... */}
      </div>
    </div>
  </div>
)}
```

---

## Testing Checklist

- [ ] Modal opens when Add button clicked
- [ ] URL input accepts and stores text
- [ ] Enter key adds tags
- [ ] Tag suggestions show existing tags
- [ ] Clicking suggested tag adds it
- [ ] Removing tag works
- [ ] Duplicate tags prevented
- [ ] All status buttons work
- [ ] Favorite toggle works
- [ ] Cancel resets form and closes modal
- [ ] Add Link disabled when URL empty
- [ ] Add Link creates new article with correct data
- [ ] Form resets after successful add
- [ ] Modal closes after successful add
- [ ] Works on mobile and desktop
- [ ] Scrolls on small screens
- [ ] Dark mode styling works

---

## Notes

1. **This is NOT a separate component** - The modal is inline in App.tsx for direct state access
2. **Article ID generation** uses `Date.now().toString()` - simple but effective for client-side
3. **Default values** assume "new article" will be processed later (title, description, readingTime)
4. **No media type selection** - Assumes "article" type by default
5. **Status colors remain** - They serve as warning/organizational indicators (design exception)
6. **Favorite star yellow remains** - Important UI indicator (design exception)

---

## Future Enhancements (Not Implemented)

- Auto-fetch article title/description from URL
- Media type selection (article/video/podcast)
- Reading time estimation
- URL validation with error messages
- Duplicate URL detection
- Schedule date picker for Daily Reading
- Custom rediscovery date for Rediscovery Queue
- Tag autocomplete with fuzzy search
- Keyboard shortcut to open modal (e.g., Cmd+K)
- Remember last-used status preference

This modal provides a simple, fast workflow for adding links while maintaining the app's grayscale aesthetic with strategic color exceptions for important UI indicators!
