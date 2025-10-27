# TagCard Component Creation Prompt

## Overview
Create a `TagCard.jsx` component for the fieldnotes read-it-later app. This is a reusable component that displays individual tags in a Tags view/page, showing tag metadata and providing quick actions for tag management.

## Component Location
`/components/TagCard.jsx`

## Purpose
The TagCard is the primary interface for browsing and managing tags. It must:
- Display tag name and article count
- Show visual representation of tag usage
- Provide quick actions (filter by tag, rename, delete)
- Enable click-to-filter functionality to view tagged articles
- Support hover states with revealed actions
- Integrate with the grayscale, flat design system

## Dependencies & Imports

### Required Imports
```javascript
import { Tag, Filter, Edit2, Trash2, FileText, Video, Headphones } from "lucide-react";
```

## Props

```javascript
/**
 * @param {Object} props
 * @param {string} props.tag - The tag name/label
 * @param {number} props.articleCount - Total number of items with this tag
 * @param {number} props.maxCount - Maximum count across all tags (for usage bar calculation)
 * @param {Object} [props.mediaBreakdown] - Optional breakdown by media type
 * @param {number} [props.mediaBreakdown.articles] - Number of articles
 * @param {number} [props.mediaBreakdown.videos] - Number of videos
 * @param {number} [props.mediaBreakdown.podcasts] - Number of podcasts
 * @param {Function} props.onTagClick - Handler when card is clicked (filters content by this tag)
 * @param {Function} [props.onRename] - Optional handler to rename the tag
 * @param {Function} [props.onDelete] - Optional handler to delete the tag from all items
 */
```

### Props Description
- **tag**: The tag name/label
- **articleCount**: Total number of items with this tag
- **maxCount**: Maximum count across all tags (for usage bar calculation)
- **mediaBreakdown**: Optional breakdown by media type (articles/videos/podcasts)
- **onTagClick**: Handler when card is clicked (filters content by this tag)
- **onRename**: Optional handler to rename the tag
- **onDelete**: Optional handler to delete the tag from all items

## Visual Design & Layout

### Card Structure
```
┌─────────────────────────────────────────────────────────────┐
│  #  Tag Name                               [✏️] [🗑️]  ← hover │
│                                                              │
│     42 items                                                 │
│     📄 35 articles • 🎬 5 videos • 🎧 2 podcasts             │
│                                                              │
│     ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░  (usage bar)                      │
└─────────────────────────────────────────────────────────────┘
```

### Styling Guidelines
- **Container**: `bg-card border border-border rounded-[8px] p-4`
- **Hover State**: `hover:border-primary/50 transition-all`
- **Actions**: Hidden by default, shown on hover with `opacity-0 group-hover:opacity-100`
- **Grayscale Only**: All colors in grayscale except red for delete button
- **Flat Design**: Minimal rounded corners (`rounded-[8px]`), no drop shadows

### Typography
- **Tag Name**: `font-['Inter:Medium', sans-serif] text-[18px] text-foreground`
- **Tag Name (Hover)**: `group-hover:text-primary transition-colors`
- **Item Count**: `text-[24px] font-['Inter:SemiBold', sans-serif] text-foreground`
- **Breakdown**: `text-[12px] text-muted-foreground`

## Key Features

### 1. Tag Icon & Name Display

Show a hash symbol before the tag name:

```javascript
<div className="flex items-center gap-2 mb-3">
  <Tag size={20} className="text-muted-foreground" />
  <h3 className="font-['Inter:Medium', sans-serif] text-[18px] text-foreground group-hover:text-primary transition-colors">
    {tag}
  </h3>
</div>
```

### 2. Article Count Display

Prominent display of total items with this tag:

```javascript
<div className="mb-3">
  <div className="text-[24px] font-['Inter:SemiBold', sans-serif] text-foreground">
    {articleCount} {articleCount === 1 ? 'item' : 'items'}
  </div>
</div>
```

### 3. Media Type Breakdown (Optional)

If `mediaBreakdown` is provided, show distribution across content types:

```javascript
{mediaBreakdown && (
  <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-3 flex-wrap">
    {mediaBreakdown.articles > 0 && (
      <span className="flex items-center gap-1">
        <FileText size={14} />
        {mediaBreakdown.articles} {mediaBreakdown.articles === 1 ? 'article' : 'articles'}
      </span>
    )}
    {mediaBreakdown.videos > 0 && (
      <>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Video size={14} />
          {mediaBreakdown.videos} {mediaBreakdown.videos === 1 ? 'video' : 'videos'}
        </span>
      </>
    )}
    {mediaBreakdown.podcasts > 0 && (
      <>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Headphones size={14} />
          {mediaBreakdown.podcasts} {mediaBreakdown.podcasts === 1 ? 'podcast' : 'podcasts'}
        </span>
      </>
    )}
  </div>
)}
```

**Rules**:
- Only show media types with count > 0
- Use bullet separators between types
- Include appropriate icons for each type
- Proper pluralization ("1 article" vs "2 articles")

### 4. Usage Visualization Bar

Visual indicator showing relative usage of this tag compared to the most-used tag:

```javascript
{/* This requires knowing the max count across all tags */}
<div className="w-full bg-accent rounded-full h-2">
  <div 
    className="bg-foreground/70 h-2 rounded-full transition-all duration-300"
    style={{ width: `${(articleCount / maxCount) * 100}%` }}
  />
</div>
```

**Note**: The parent component needs to calculate `maxCount` (the highest article count among all tags) and pass it as a prop (already included in props above).

### 5. Action Buttons (Hover-Revealed)

Two action buttons appear on hover in the top-right:

#### Rename Button (Edit)
- **Icon**: Edit2
- **Purpose**: Rename the tag across all items
- **Styling**: `p-2 hover:bg-accent rounded-lg transition-colors`
- **Color**: `text-muted-foreground`
- **Tooltip/Title**: "Rename tag"
- **Implementation**: Show prompt or inline editor

#### Delete Button
- **Icon**: Trash2
- **Purpose**: Remove this tag from all items
- **Styling**: `p-2 hover:bg-destructive/10 rounded-lg transition-colors`
- **Color**: `text-destructive` (RED - exception to grayscale)
- **Tooltip/Title**: "Delete tag"
- **Confirmation**: Should trigger confirmation dialog

### 6. Hover States & Animations

The card uses CSS group hover pattern:

```jsx
<div className="... group">
  {/* Main content with hover effects */}
  <h3 className="... group-hover:text-primary transition-colors">
    {tag}
  </h3>
  
  {/* Actions revealed on hover */}
  <div className="... opacity-0 group-hover:opacity-100 transition-opacity">
    {/* Action buttons */}
  </div>
</div>
```

**Key Behaviors**:
- Card border changes to `border-primary/50` on hover
- Tag name changes to `text-primary` on hover
- Action buttons fade in with smooth transition
- All transitions use `transition-all` or `transition-colors`/`transition-opacity`

### 7. Click Handling

The main card area should be clickable to filter by tag:

```javascript
<div 
  className="flex-1 cursor-pointer" 
  onClick={() => onTagClick(tag)}
>
  {/* Tag content */}
</div>
```

**Important**: Action buttons must stop propagation:
```javascript
onClick={(e) => {
  e.stopPropagation();
  // action handler
}}
```

### 8. Rename Functionality

The rename button should show a prompt or modal:

```javascript
const handleRename = (e) => {
  e.stopPropagation();
  const newTag = prompt(`Rename tag "${tag}" to:`, tag);
  
  if (newTag && newTag.trim() !== '' && newTag !== tag) {
    onRename?.(tag, newTag.trim());
  }
};
```

**Alternative**: Use a proper modal/dialog instead of browser prompt for better UX.

### 9. Delete Confirmation

The delete button should show a confirmation dialog:

```javascript
const handleDelete = (e) => {
  e.stopPropagation();
  if (confirm(`Delete tag "${tag}"? This will remove it from ${articleCount} ${articleCount === 1 ? 'item' : 'items'}.`)) {
    onDelete?.(tag);
  }
};
```

**Confirmation Message Template**:
```
Delete tag "[Tag Name]"? This will remove it from [N] items.
```

## Complete Component Structure

```javascript
export default function TagCard({
  tag,
  articleCount,
  maxCount,
  mediaBreakdown,
  onTagClick,
  onRename,
  onDelete,
}) {
  const handleRename = (e) => {
    e.stopPropagation();
    const newTag = prompt(`Rename tag "${tag}" to:`, tag);
    
    if (newTag && newTag.trim() !== '' && newTag !== tag) {
      onRename?.(tag, newTag.trim());
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete tag "${tag}"? This will remove it from ${articleCount} ${articleCount === 1 ? 'item' : 'items'}.`)) {
      onDelete?.(tag);
    }
  };

  return (
    <div className="bg-card border border-border rounded-[8px] p-4 hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between gap-3">
        {/* Main clickable area */}
        <div 
          className="flex-1 cursor-pointer" 
          onClick={() => onTagClick(tag)}
        >
          {/* Tag Icon & Name */}
          <div className="flex items-center gap-2 mb-3">
            <Tag size={20} className="text-muted-foreground" />
            <h3 className="font-['Inter:Medium', sans-serif] text-[18px] text-foreground group-hover:text-primary transition-colors">
              {tag}
            </h3>
          </div>
          
          {/* Article Count */}
          <div className="mb-3">
            <div className="text-[24px] font-['Inter:SemiBold', sans-serif] text-foreground">
              {articleCount} {articleCount === 1 ? 'item' : 'items'}
            </div>
          </div>
          
          {/* Media Breakdown */}
          {mediaBreakdown && (
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-3 flex-wrap">
              {mediaBreakdown.articles > 0 && (
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  {mediaBreakdown.articles} {mediaBreakdown.articles === 1 ? 'article' : 'articles'}
                </span>
              )}
              {mediaBreakdown.videos > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Video size={14} />
                    {mediaBreakdown.videos} {mediaBreakdown.videos === 1 ? 'video' : 'videos'}
                  </span>
                </>
              )}
              {mediaBreakdown.podcasts > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Headphones size={14} />
                    {mediaBreakdown.podcasts} {mediaBreakdown.podcasts === 1 ? 'podcast' : 'podcasts'}
                  </span>
                </>
              )}
            </div>
          )}
          
          {/* Usage Bar */}
          <div className="w-full bg-accent rounded-full h-2">
            <div 
              className="bg-foreground/70 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(articleCount / maxCount) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Action Buttons (hover-revealed) */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Rename */}
          {onRename && (
            <button
              onClick={handleRename}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Rename tag"
            >
              <Edit2 size={16} className="text-muted-foreground" />
            </button>
          )}
          
          {/* Delete */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
              title="Delete tag"
            >
              <Trash2 size={16} className="text-destructive" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

## State Management

This component is **stateless** - all state is managed by the parent component (TagsPage or ArticlesPage).

No local state needed (unless implementing inline editing instead of prompt).

## Accessibility Requirements

- All buttons must have `title` attributes for tooltips
- Action buttons should stop propagation with `e.stopPropagation()`
- Delete and rename actions must show confirmation before proceeding
- Clickable areas should have `cursor-pointer`
- Keyboard navigation support (focus states)
- Color contrast meets WCAG AA standards
- Screen reader friendly (semantic HTML)

## Responsive Design

### Desktop (Default)
- Full card layout as shown
- Actions visible on hover
- All metadata visible

### Mobile
- Same layout (inherently responsive)
- Consider making actions always visible (no hover on mobile)
- Ensure touch targets are at least 44px
- Media breakdown may wrap to multiple lines
- Long tag names should wrap properly

### Grid Layout Recommendation

Tags should be displayed in a responsive grid:

```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {tags.map(tagData => (
    <TagCard key={tagData.tag} {...tagData} />
  ))}
</div>
```

## Integration with Tags View

### Usage Example

```javascript
// In TagsPage.jsx or ArticlesPage.jsx (Tags view)
import { useMemo } from 'react';

// Calculate tag statistics
const tagStats = useMemo(() => {
  const stats = new Map();
  
  articles.forEach(article => {
    article.tags.forEach(tag => {
      const existing = stats.get(tag) || { count: 0, articles: 0, videos: 0, podcasts: 0 };
      existing.count++;
      if (article.mediaType === 'article') existing.articles++;
      if (article.mediaType === 'video') existing.videos++;
      if (article.mediaType === 'podcast') existing.podcasts++;
      stats.set(tag, existing);
    });
  });
  
  return Array.from(stats.entries())
    .map(([tag, data]) => ({
      tag,
      articleCount: data.count,
      mediaBreakdown: {
        articles: data.articles,
        videos: data.videos,
        podcasts: data.podcasts,
      },
    }))
    .sort((a, b) => b.articleCount - a.articleCount);
}, [articles]);

const maxCount = Math.max(...tagStats.map(t => t.articleCount), 1);

// Render
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {tagStats.map(({ tag, articleCount, mediaBreakdown }) => (
    <TagCard
      key={tag}
      tag={tag}
      articleCount={articleCount}
      maxCount={maxCount}
      mediaBreakdown={mediaBreakdown}
      onTagClick={(tag) => {
        // Filter articles by this tag
        setSearchQuery(`tag:"${tag}"`);
        setCurrentView('Search');
      }}
      onRename={(oldTag, newTag) => {
        // Rename tag across all articles
        setArticles(articles.map(a => ({
          ...a,
          tags: a.tags.map(t => t === oldTag ? newTag : t)
        })));
      }}
      onDelete={(tag) => {
        // Remove tag from all articles
        setArticles(articles.map(a => ({
          ...a,
          tags: a.tags.filter(t => t !== tag)
        })));
      }}
    />
  ))}
</div>
```

## Empty States

The TagCard itself doesn't handle empty states. These are handled by the parent Tags view:

```jsx
{tagStats.length === 0 ? (
  <div className="text-center py-12">
    <Tag size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
    <p className="text-muted-foreground text-[16px] mb-2">No tags yet</p>
    <p className="text-muted-foreground text-[14px]">
      Tags will appear here as you add them to your content
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {tagStats.map(/* ... */)}
  </div>
)}
```

## Sorting Options

The parent component should provide sorting options:

- **By Usage** (default): Most-used tags first
- **Alphabetical**: A-Z
- **Recent**: Recently added/modified tags first

```jsx
const sortedTags = useMemo(() => {
  const sorted = [...tagStats];
  
  switch (sortBy) {
    case 'usage':
      return sorted.sort((a, b) => b.articleCount - a.articleCount);
    case 'alphabetical':
      return sorted.sort((a, b) => a.tag.localeCompare(b.tag));
    case 'recent':
      // Would need dateAdded/dateModified in tag data
      return sorted;
    default:
      return sorted;
  }
}, [tagStats, sortBy]);
```

## Edge Cases & Error Handling

### Single Item
Use proper singular form: "1 item" not "1 items"

### Zero Items (Orphaned Tag)
Should not happen in practice, but handle gracefully:
```jsx
{articleCount} {articleCount === 1 ? 'item' : 'items'}
```

### Empty Tag Name
Prevent empty tags during rename:
```jsx
if (newTag && newTag.trim() !== '' && newTag !== tag) {
  onRename?.(tag, newTag.trim());
}
```

### Duplicate Tag on Rename
Parent component should check for duplicates:
```jsx
onRename={(oldTag, newTag) => {
  if (tagStats.some(t => t.tag === newTag)) {
    alert('A tag with that name already exists');
    return;
  }
  // Proceed with rename
}
```

### No Media Breakdown
Component handles this gracefully - mediaBreakdown is optional

### maxCount = 0
Prevent division by zero:
```jsx
const maxCount = Math.max(...tagStats.map(t => t.articleCount), 1);
```

## Performance Considerations

- Use React.memo for large tag lists
- Ensure proper key usage: `key={tag}` (tag names should be unique)
- Consider virtualization for 1000+ tags (use react-window)

## Visual Indicators Summary

The card provides these visual indicators:
1. **Tag Icon** - Hash symbol (#) representing a tag
2. **Item Count** - Large, prominent number
3. **Media Breakdown** - Distribution across content types (optional)
4. **Usage Bar** - Visual representation of relative usage
5. **Hover Border** - Primary color border on hover
6. **Hover Title** - Primary color text on hover
7. **Action Buttons** - Fade in on hover
8. **Delete Color** - Red color for destructive action

## Testing Checklist

- [ ] Card displays tag name correctly
- [ ] Tag icon shows hash symbol
- [ ] Item count displays correctly
- [ ] Singular/plural forms correct ("1 item" vs "2 items")
- [ ] Media breakdown shows when provided
- [ ] Media breakdown hidden when not provided
- [ ] Only shows media types with count > 0
- [ ] Proper pluralization in media breakdown
- [ ] Usage bar displays correctly
- [ ] Usage bar width calculated correctly
- [ ] Card hover changes border color
- [ ] Tag name hover changes text color
- [ ] Action buttons fade in on hover
- [ ] Rename button shows prompt
- [ ] Rename validates input (not empty, different from current)
- [ ] Rename calls onRename handler
- [ ] Delete button shows confirmation dialog
- [ ] Delete confirmation includes tag name and item count
- [ ] Delete button calls onDelete after confirmation
- [ ] Delete button styled in red (destructive)
- [ ] All action buttons stop propagation
- [ ] Main card area is clickable
- [ ] Main card click calls onTagClick
- [ ] Cursor changes to pointer on hover
- [ ] Action buttons only show if handlers provided
- [ ] Responsive on mobile and desktop
- [ ] Dark mode displays correctly
- [ ] Keyboard navigation works

## Common Pitfalls to Avoid

1. **Don't** forget `e.stopPropagation()` on action buttons
2. **Don't** hardcode colors - use CSS variables from globals.css
3. **Don't** add drop shadows (flat design)
4. **Don't** use bright colors (grayscale only, except red for delete)
5. **Don't** forget confirmation dialogs for destructive actions
6. **Don't** forget to validate rename input (empty, whitespace)
7. **Don't** allow duplicate tag names on rename
8. **Don't** forget singular/plural forms
9. **Don't** render media breakdown if not provided
10. **Don't** divide by zero when calculating usage bar percentage

## File Organization

After creation, the file structure should be:
```
/components
  ├── TagCard.jsx           ← New component
  ├── ContentCard.jsx       ← Existing (articles)
  ├── FeedCard.jsx          ← Existing (feeds)
  ├── pages
  │   ├── TagsPage.jsx      ← New page (if creating dedicated tags page)
  │   └── ...
```

## Related Components

Study these components for consistency:
- `/components/ContentCard.jsx` - Similar card pattern
- `/components/FeedCard.jsx` - Similar card pattern
- `/components/TagManager.jsx` - Tag editing interface
/types/article.js` - Article and tag shape (JS)

## Alternative: Inline Rename with Input

Instead of browser prompt, use inline editing:

```jsx
const [isEditing, setIsEditing] = useState(false);
const [editValue, setEditValue] = useState(tag);

const handleRename = (e) => {
  e.stopPropagation();
  setIsEditing(true);
};

const handleSaveRename = () => {
  if (editValue.trim() !== '' && editValue !== tag) {
    onRename?.(tag, editValue.trim());
  }
  setIsEditing(false);
};

// In render:
{isEditing ? (
  <input
    value={editValue}
    onChange={(e) => setEditValue(e.target.value)}
    onBlur={handleSaveRename}
    onKeyDown={(e) => {
      if (e.key === 'Enter') handleSaveRename();
      if (e.key === 'Escape') {
        setEditValue(tag);
        setIsEditing(false);
      }
    }}
    className="..."
    autoFocus
  />
) : (
  <h3>{tag}</h3>
)}
```

This provides better UX than browser prompt, but requires local state.

## Future Enhancements (Not Required Initially)

- Tag descriptions
- Tag colors/badges
- Tag hierarchies/nesting
- Tag merge functionality
- Tag aliases
- Tag usage over time chart
- Bulk tag operations
- Tag import/export
- Tag suggestions based on content
- Related tags recommendations
