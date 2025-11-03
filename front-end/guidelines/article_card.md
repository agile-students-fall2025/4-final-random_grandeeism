# ContentCard Component Creation Prompt

## Overview
Create a `ContentCard.jsx` component for the fieldnotes read-it-later app. This is a fundamental reusable component that displays individual articles, videos, and podcasts throughout the application in various queue views (Inbox, Daily Reading, Continue Reading, Rediscovery Queue, and Archive).

## Component Location
`/components/ContentCard.jsx`

## Purpose
The ContentCard is the primary interface for interacting with saved content items. It must:
- Display article metadata in a scannable, organized format
- Provide quick actions for workflow management
- Support bulk selection mode
- Show visual indicators for status, favorites, annotations, and progress
- Enable seamless workflow advancement through status transitions
- Integrate with the unified tag system
- Support all content types (articles, videos, podcasts)

## Dependencies & Imports

### Required Imports
```jsx
import { useState } from "react";
import { 
  Star, 
  Tag, 
  Calendar, 
  Check, 
  Archive, 
  Inbox, 
  BookOpen, 
  StickyNote, 
  RotateCcw, 
  FileDown, 
  ChevronDown, 
  Trash2, 
  ExternalLink,
  PanelBottomClose  // REQUIRED: Standard icon for status change actions
} from "lucide-react";
import { Article, ArticleStatus } from "../types/article";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { motion, AnimatePresence } from "motion/react";
import TagManager from "./TagManager";
import ExportNotesModal from "./ExportNotesModal";
import Favicon from "./Favicon";
```

## Props Interface

```jsx
interface ContentCardProps {
  article: Article;
  allTags: string[];
  onArticleClick: (article: Article) => void;
  onToggleFavorite: (articleId: string) => void;
  onUpdateTags: (articleId: string, newTags: string[]) => void;
  onStatusChange: (articleId: string, newStatus: ArticleStatus) => void;
  onDelete?: (articleId: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (articleId: string) => void;
}
```

### Props Description
- **article**: The Article object containing all content metadata
- **allTags**: Array of all available tags in the system (for TagManager)
- **onArticleClick**: Handler when card is clicked (opens ArticleViewer)
- **onToggleFavorite**: Handler to star/unstar the article
- **onUpdateTags**: Handler for tag changes from TagManager
- **onStatusChange**: Handler for workflow status transitions
- **onDelete**: Optional handler for deleting the article
- **selectionMode**: Boolean indicating if bulk selection mode is active
- **isSelected**: Boolean indicating if this card is currently selected
- **onToggleSelect**: Handler for selecting/deselecting in bulk mode

## Visual Design & Layout

### Card Structure
```
┌─────────────────────────────────────────────────┐
│                              [Status Icon] ←──┐ │  Top-right corner
│  [✓] Title of the Article                   │ │  (if selection mode)
│      Goes on two lines max...               │ │
│                                              │ │
│      🌐 example.com | Author | 5 min read   │ │  Metadata row
│                                              │ │
│      [tag1] [tag2] [tag3]                   │ │  Tags (if present)
│                                              │ │
│      [Progress: 45%] ▓▓▓▓▓▓░░░░             │ │  (if in progress)
├──────────────────────────────────────────────┤
│  [★ Favorite] [🏷 Tags] [...More Actions]    │  Actions row
│  [Mark as Completed]  (status-specific)      │  Status actions row
└──────────────────────────────────────────────┘
```

### Styling Guidelines
- **Container**: `bg-card border rounded-lg overflow-hidden`
- **Border**: `border-border` (default), `border-primary ring-2 ring-primary/20` (selected)
- **Hover State**: `hover:border-primary/50 transition-colors`
- **Padding**: Main content `p-4`, actions section `px-4 pt-4 pb-2`
- **Grayscale Only**: No colors except red shades for warnings/delete
- **Flat Design**: Minimal rounded corners (`rounded-lg`), no drop shadows except for tooltips

### Typography
- **Title**: Default h4 styling from globals.css, `line-clamp-2 pr-12` (room for icon)
- **Metadata**: `text-[12px] text-muted-foreground`
- **Action Buttons**: `text-[12px]`
- **Tag Badges**: `text-[11px]`
- **Progress Text**: `text-[11px] text-foreground/80`

## Key Features

### 1. Status Icon (Top Right Corner)

**DESIGN STANDARD:** Use the NEXT STATUS icon for automatic queue advancement (not `PanelBottomClose`).

The status icon is a critical workflow advancement feature with animated transitions:

#### For Active Statuses (Inbox → Daily → Continue → Rediscovery)
- Show an interactive button that advances to next status
- On hover, animate transition from current status icon to NEXT QUEUE's icon
- Use tooltip to show "Send to [Next Queue]?"
- Click advances to next status immediately
- **IMPORTANT:** Show the destination queue's icon (Calendar, BookOpen, etc.) so users know where the item will go
- **NOTE:** `PanelBottomClose` is reserved for manual status change buttons/dropdowns, NOT automatic advancement

#### Status Flow
```
Inbox → Daily Reading → Continue Reading → Rediscovery Queue → Archive
```

#### Icon Mapping
```jsx
const getStatusIconInfo = (status?: ArticleStatus) => {
  switch (status) {
    case "inbox":
      return { 
        icon: Inbox, 
        color: "text-foreground", 
        bgColor: "bg-foreground/10",
        label: "Inbox"
      };
  case "daily":
      return { 
        icon: Calendar, 
        color: "text-foreground", 
        bgColor: "bg-foreground/10",
        label: "Daily Reading"
      };
  case "continue":
      return { 
        icon: BookOpen, 
        color: "text-foreground", 
        bgColor: "bg-foreground/10",
        label: "Continue Reading"
      };
    case "rediscovery":
      return { 
        icon: RotateCcw, 
        color: "text-foreground", 
        bgColor: "bg-foreground/10",
        label: "Rediscovery Queue"
      };
    case "archived":
      return { 
        icon: Archive, 
        color: "text-muted-foreground", 
        bgColor: "bg-muted/50",
        label: "Archive"
      };
  }
};
```

#### Animation Implementation
Use Motion/React (formerly Framer Motion) for smooth icon transitions:
```jsx
<AnimatePresence mode="wait">
  {!isStatusHovered ? (
    <motion.div
      key="current"
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <StatusIcon size={16} />
    </motion.div>
  ) : (
    <motion.div
      key="next"
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <NextStatusIcon size={16} />
    </motion.div>
  )}
</AnimatePresence>
```

#### For Archived Status
- Show static, semi-transparent archive icon
- No hover effect or click action
- Opacity: `opacity-60`

### 2. Bulk Selection Mode

When `selectionMode={true}`:
- Show checkbox on the left side of the card
- Card click toggles selection (doesn't open article)
- Selected cards show `border-primary ring-2 ring-primary/20`
- Checkbox should be clickable independently

```jsx
const handleCardClick = () => {
  if (selectionMode && onToggleSelect) {
    onToggleSelect(article.id);
  } else {
    onArticleClick(article);
  }
};
```

### 3. Content Metadata Display

#### Favicon + Source URL
- Use the `Favicon` component to show site icon
- Display shortened URL (remove "www.", show just hostname)
- Make URL clickable with external link icon
- Opens in new tab with `target="_blank" rel="noopener noreferrer"`
- Click should NOT propagate to card click

```jsx
const getShortenedUrl = () => {
  try {
    const urlObj = new URL(article.url);
    return urlObj.hostname.replace('www.', '');
  } catch (e) {
    return article.url;
  }
};
```

#### Metadata Row Format
```
[Favicon] example.com ↗ | Author Name | 5 min read
```
- Separator: `|` between elements
- If no author, skip that section
- Reading time always shown

#### Tags Display
- Only show if `article.tags.length > 0`
- Use ShadCN Badge component with `variant="secondary"`
- Display as flex wrap: `flex flex-wrap gap-1`
- Size: `text-[11px]`

### 4. Progress Bar (Continue Reading Only)

For articles with `status === "continue"` and `readProgress` defined:
- Show percentage text: "45% Complete"
- Visual progress bar with grayscale colors
- Bar container: `bg-accent rounded-full h-2`
- Fill: `bg-foreground/70 h-2 rounded-full`
- Smooth transitions: `transition-all duration-300`

```jsx
{article.status === "continue" && article.readProgress !== undefined && (
  <div className="mt-2">
    <div className="flex items-center justify-between mb-1">
      <span className="font-['Inter:Medium', sans-serif] text-[11px] text-foreground/80">
        {article.readProgress}% Complete
      </span>
    </div>
    <div className="w-full bg-accent rounded-full h-2">
      <div 
        className="bg-foreground/70 h-2 rounded-full transition-all duration-300"
        style={{ width: `${article.readProgress}%` }}
      />
    </div>
  </div>
)}
```

### 5. Action Buttons Section

The bottom section contains two rows of actions:

#### First Row (Always Visible)
1. **Favorite Button**
   - Icon: Star (filled if favorited)
   - Text: "Favorite" or "Unfavorite"
   - Stops propagation to prevent card click

2. **Tag Manager**
   - Integrated TagManager component
   - Button format only (not inline tags)
   - Shows "Manage Tags" or similar

3. **More Actions Dropdown**
   - Export notes option (opens ExportNotesModal)
   - Delete option (if onDelete handler provided)
   - Other contextual actions

#### Second Row (Status-Specific Actions)

**Inbox Status:**
- No additional buttons (use status icon for advancement)

**Daily Reading Status:**
- "Mark as Completed" button → Archives
- "Continue Reading" button → Moves to continue

**Continue Reading (continue) Status:**
- "Mark as Completed" button → Archives

**Rediscovery Queue Status:**
- "Archive" button → Archives

**Archived Status:**
- "Unarchive" button → Returns to Inbox

```jsx
const renderStatusButtons = () => {
  switch (article.status) {
  case "daily":
      return (
        <>
          <button onClick={() => onStatusChange(article.id, "archived")}>
            <Check size={14} />
            Mark as Completed
          </button>
          <button onClick={() => onStatusChange(article.id, "continue")}>
            <BookOpen size={14} />
            Continue Reading
          </button>
        </>
      );
  case "continue":
      return (
        <button onClick={() => onStatusChange(article.id, "archived")}>
          <Check size={14} />
          Mark as Completed
        </button>
      );
    case "rediscovery":
      return (
        <button onClick={() => onStatusChange(article.id, "archived")}>
          <Archive size={14} />
          Archive
        </button>
      );
    case "archived":
      return (
        <button onClick={() => onStatusChange(article.id, "inbox")}>
          <Inbox size={14} />
          Unarchive
        </button>
      );
    default:
      return null;
  }
};
```

### 6. Export Notes Integration

The card should integrate with the ExportNotesModal:
- Show "Export Notes" in the more actions dropdown
- Only if article has annotations or highlights
- Opens ExportNotesModal component
- Passes article data to modal

```jsx
const [showExportModal, setShowExportModal] = useState(false);

// In dropdown menu:
<DropdownMenuItem onClick={() => setShowExportModal(true)}>
  <FileDown size={14} />
  Export Notes
</DropdownMenuItem>

// At end of component:
<ExportNotesModal
  isOpen={showExportModal}
  onClose={() => setShowExportModal(false)}
  article={article}
  onExport={handleExport}
/>
```

## Content Type Support

The card must properly handle different media types:

### Article Type
- Standard display with all features
- Use article favicon

### Video Type
- Show video-specific favicon (YouTube, Vimeo, etc.)
- Same card structure
- Opens VideoViewer when clicked

### Podcast Type
- Show podcast-specific favicon
- Duration instead of reading time
- Opens PodcastViewer when clicked

Reference the `article.mediaType` property and pass it to the Favicon component.

## State Management

### Local State
```jsx
const [showExportModal, setShowExportModal] = useState(false);
const [isStatusHovered, setIsStatusHovered] = useState(false);
```

### Derived State
```jsx
const statusIconInfo = getStatusIconInfo();
const StatusIcon = statusIconInfo.icon;
const nextStatus = getNextStatus();
const nextStatusIconInfo = nextStatus ? getStatusIconInfo(nextStatus) : null;
// Show next queue's icon for automatic advancement (not PanelBottomClose)
const NextStatusIcon = nextStatusIconInfo?.icon;
```

## Accessibility Requirements

- All buttons must have proper click handlers with `e.stopPropagation()`
- Tooltips for status icons with clear descriptions
- Keyboard navigation support for all interactive elements
- Semantic HTML structure
- External links must have `rel="noopener noreferrer"`
- Color contrast meets WCAG AA standards in both light and dark modes

## Responsive Design

### Desktop (Default)
- Full card width with all features visible
- Actions displayed in rows

### Mobile
- Same layout (component is inherently responsive)
- Tag badges may wrap to multiple lines
- Action buttons may wrap if needed
- Touch targets should be at least 44px

## Integration with Other Components

### Required Component Integrations
1. **TagManager** - For tag editing
2. **Favicon** - For site/media icons
3. **ExportNotesModal** - For exporting notes
4. **ShadCN Components**:
   - Badge (for tags)
   - Checkbox (for selection)
   - DropdownMenu (for more actions)
   - Tooltip (for status hints)

### Type Dependencies
- Must use `Article` and `ArticleStatus` from `/types/article`
- All handlers must match expected signatures

## Usage Example

```jsx
<ContentCard
  article={article}
  allTags={allTags}
  onArticleClick={(article) => setSelectedArticle(article)}
  onToggleFavorite={(id) => handleToggleFavorite(id)}
  onUpdateTags={(id, tags) => handleUpdateTags(id, tags)}
  onStatusChange={(id, status) => handleStatusChange(id, status)}
  onDelete={(id) => handleDeleteArticle(id)}
  selectionMode={bulkSelectionMode}
  isSelected={selectedIds.includes(article.id)}
  onToggleSelect={(id) => handleToggleSelect(id)}
/>
```

## Implementation Notes

### Click Event Handling
All action buttons MUST stop propagation:
```jsx
onClick={(e) => {
  e.stopPropagation();
  // action handler
}}
```

### Status Advancement Logic
The status icon should intelligently determine the next status in workflow:
```jsx
const getNextStatus = () => {
  switch (article.status) {
    case "inbox": return "daily";
    case "daily": return "continue";
    case "continue": return "rediscovery";
    case "rediscovery": return "archived";
    case "archived": return null;
    default: return null;
  }
};
```

### Performance Considerations
- Use React.memo if cards are in large lists
- Lazy load ExportNotesModal (code splitting)
- Minimize re-renders with proper event handlers

## Visual Indicators Summary

The card provides these visual indicators:
1. **Status Icon** (top right) - Current queue + hover for next queue
2. **Selection Border** - Primary blue ring when selected in bulk mode
3. **Favorite Star** - Filled star icon when favorited
4. **Progress Bar** - Percentage completion for in-progress items
5. **Tags** - Gray badges showing article tags
6. **Hover State** - Border color change on card hover
7. **Annotation Indicator** - Notes icon in export dropdown if annotations exist

## Reference Files

Study these files for implementation details:
- `/types/article` - Article type definition
- `/components/TagManager.jsx` - Tag management integration
- `/components/ExportNotesModal.jsx` - Export modal integration
- `/components/Favicon.jsx` - Favicon display
- `/components/ui/badge.jsx` - Badge component
- `/components/ui/checkbox.jsx` - Checkbox component
- `/components/ui/dropdown-menu.jsx` - Dropdown menu
- `/components/ui/tooltip.jsx` - Tooltip component
- `/styles/globals.css` - Typography and color tokens

## Testing Checklist

- [ ] Card displays all article metadata correctly
- [ ] Status icon shows correct icon for each status
- [ ] Status icon hover animation works smoothly
- [ ] Status icon click advances to next queue
- [ ] Tooltip shows on status icon hover
- [ ] Bulk selection mode toggles selection on click
- [ ] Checkbox works independently in selection mode
- [ ] Normal click opens article viewer (when not in selection mode)
- [ ] Favorite button toggles star state
- [ ] Tag manager opens and updates tags
- [ ] More actions dropdown shows all options
- [ ] Export modal opens when option clicked
- [ ] Delete option calls handler (if provided)
- [ ] Status-specific buttons appear for each queue
- [ ] Status buttons change status correctly
- [ ] Progress bar displays for in-progress items
- [ ] Progress bar width matches percentage
- [ ] URL link opens in new tab
- [ ] All action buttons stop propagation
- [ ] Archived items show static icon (no hover)
- [ ] Card works with article, video, and podcast types
- [ ] Responsive on mobile and desktop
- [ ] Dark mode displays correctly
- [ ] Keyboard navigation works

## Common Pitfalls to Avoid

1. **Don't** forget `e.stopPropagation()` on action buttons
2. **Don't** hardcode colors - use CSS variables from globals.css
3. **Don't** add drop shadows (flat design)
4. **Don't** use bright colors (grayscale only, except red for warnings)
5. **Don't** forget to handle archived state (no next status)
6. **Don't** make the entire card clickable in selection mode without checkbox
7. **Don't** forget to pass `mediaType` to Favicon component
8. **Don't** render status buttons for inbox (they use status icon)
9. **Don't** forget conditional rendering for tags (only if tags exist)
10. **Don't** forget conditional rendering for progress bar (only continue)

## Future Enhancements (Not Required Initially)

- Swipe gestures for mobile status advancement
- Drag and drop to change status
- Preview tooltip on hover with first few lines
- Read later count badge
- Last read date display
- Duplicate detection visual indicator
- Share to social media options
- Print/PDF individual articles
