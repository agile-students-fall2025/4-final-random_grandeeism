# BulkFeedsModal Component Creation Prompt

## Overview
Create a `BulkFeedsModal.tsx` component for the fieldnotes read-it-later app that allows users to manage multiple RSS/podcast feeds simultaneously. This modal enables batch operations like refreshing, organizing, or removing multiple feeds at once.

## Component Location
`/components/BulkFeedsModal.tsx`

## Purpose
This modal provides an interface for bulk feed management operations. It should handle:
- Selecting multiple feeds for batch operations
- Refreshing multiple feeds simultaneously
- Adding feeds to folders/categories
- Changing feed update frequency for multiple feeds
- Bulk deletion with confirmation
- Preview of affected feeds before applying changes

## Functional Requirements

### Modal Trigger
- Opened from FeedsPage when multiple feeds are selected
- Only shown when feeds are selected (selectedCount > 0)
- Triggered by "Bulk Actions" button in feeds toolbar
- Managed by parent component's state

### Bulk Operations Supported

#### 1. Refresh Feeds
- Refresh all selected feeds simultaneously
- Show progress indicator during refresh
- Display success/failure count after refresh
- Update last fetched timestamp

#### 2. Organize into Folders
- Create new folder
- Assign selected feeds to existing folder
- Remove from current folder
- Support nested folder structure

#### 3. Update Frequency Settings
- Set update interval for multiple feeds
- Options: Every hour, Every 6 hours, Daily, Weekly, Manual
- Apply same setting to all selected feeds

#### 4. Pause/Resume Feeds
- Temporarily pause automatic updates
- Resume paused feeds
- Maintain feed subscription without updates

#### 5. Delete Feeds
- Remove multiple feeds at once
- Show confirmation with count
- Option to keep or delete associated articles
- Warning for feeds with unread items

### Selected Feeds Display

#### Selected Count Summary
- Shows: "Managing {count} selected {feed/feeds}"
- Highlighted count with medium font weight
- Background: bg-accent with padding
- Dynamic pluralization

#### Feed List Preview
- Shows all selected feeds with:
  - Feed icon/favicon
  - Feed name
  - Feed type (article/video/podcast)
  - Item count
  - Last updated timestamp
- Max height with scrolling
- Option to deselect individual feeds

### Action Categories

#### Category 1: Refresh & Sync
- **Refresh All Now**: Immediate update of all feeds
- **Reset Update Schedule**: Clear custom schedules

#### Category 2: Organization
- **Add to Folder**: Dropdown with existing folders + "Create New"
- **Remove from Folder**: Unassign from current folder
- **Change Update Frequency**: Dropdown with time intervals

#### Category 3: Feed Status
- **Pause Updates**: Stop automatic fetching
- **Resume Updates**: Restart automatic fetching
- **Mark All as Read**: For all items in selected feeds

#### Category 4: Cleanup
- **Delete Feeds**: Remove feeds with options:
  - Keep articles (orphan the articles)
  - Delete articles (remove all associated content)
  - Delete only read articles

## UI/UX Requirements

### Layout Structure
```
┌───────────────────────────────────────────────┐
│  [Rss Icon] Manage Feeds                 [X]  │
├───────────────────────────────────────────────┤
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │ Managing 5 selected feeds               │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Selected Feeds:                              │
│  ┌─────────────────────────────────────────┐ │
│  │ [icon] Tech Blog (12 items) · 2h ago    │ │
│  │ [icon] Design Weekly (8 items) · 1d ago │ │
│  │ [icon] Dev Podcast (5 items) · 3h ago   │ │
│  │ ... (scrollable)                        │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  Actions:                                     │
│                                               │
│  Refresh & Sync                               │
│  [Refresh All Now] [Reset Schedule]           │
│                                               │
│  Organization                                 │
│  Add to folder: [Select Folder ▼]            │
│  Update frequency: [Every 6 hours ▼]          │
│                                               │
│  Feed Status                                  │
│  [Pause Updates] [Mark All as Read]           │
│                                               │
│  Cleanup                                      │
│  [Delete Feeds]                               │
│                                               │
├───────────────────────────────────────────────┤
│                              [Cancel] [Apply] │
└───────────────────────────────────────────────┘
```

### Delete Confirmation Dialog
```
┌───────────────────────────────────────────────┐
│  [!] Delete 5 Feeds?                     [X]  │
├───────────────────────────────────────────────┤
│                                               │
│  You are about to delete 5 feeds with a      │
│  total of 42 articles.                        │
│                                               │
│  What would you like to do with the           │
│  articles?                                    │
│                                               │
│  ( ) Keep all articles (orphaned)             │
│  ( ) Delete only read articles (28 items)     │
│  (•) Delete all articles (42 items)           │
│                                               │
│  ⚠ This action cannot be undone.              │
│                                               │
│                        [Cancel] [Delete Feeds]│
└───────────────────────────────────────────────┘
```

### Styling Guidelines
- **Grayscale Only**: No colors except for warning/error states (red shades)
- **Flat Design**: Minimal shadows, simplified visual style
- **Max Width**: max-w-2xl (672px) - wider than standard modals
- **Max Height**: max-h-[90vh] with overflow-y-auto
- **Modal Positioning**: Centered on screen
- **Backdrop**: bg-black/50 with fixed positioning
- **z-index**: z-50

### Component Styling Details

#### Modal Container
- Position: fixed inset-0
- Display: flex items-center justify-center
- z-index: z-50

#### Backdrop
- Position: absolute inset-0
- Background: bg-black/50
- Click to close modal

#### Modal Content
- Position: relative
- Background: bg-background
- Border: border border-border
- Rounded: rounded-lg
- Shadow: shadow-lg
- Width: w-full max-w-2xl
- Margin: mx-4
- Max height: max-h-[90vh]
- Overflow: overflow-y-auto

#### Header
- Background: bg-background
- Border: border-b border-border
- Padding: px-6 py-4
- Sticky: top-0
- Icon: Rss (20px)
- Title: "Manage Feeds" (18px)
- Close button: X icon (20px)

#### Content Area
- Padding: px-6 py-6
- Gap between sections: space-y-6

#### Selected Count Display
- Padding: p-3
- Background: bg-accent
- Rounded: rounded-lg
- Text: 13px, text-muted-foreground
- Count: text-foreground with font-['Inter:Medium']

#### Feed List Preview
- Background: bg-accent/50
- Border: border border-border
- Rounded: rounded-lg
- Padding: p-3
- Max height: max-h-48
- Overflow: overflow-y-auto
- Gap between items: space-y-2

#### Feed Item
- Flex layout: items-center gap-2
- Padding: p-2
- Hover: hover:bg-background/50
- Rounded: rounded
- Feed icon: 16px
- Feed name: 14px
- Meta info: 12px, text-muted-foreground
- Type badge: Small badge component

#### Action Sections
- Section title: 13px, text-muted-foreground, uppercase, tracking-wider, mb-2
- Section content: space-y-2
- Grouped by category with visual separation

#### Buttons and Controls
- Regular buttons: variant="outline", size="sm"
- Dropdowns: ShadCN Select component
- Delete button: text-destructive
- Apply button: Primary button

#### Footer
- Background: bg-background
- Border: border-t border-border
- Padding: px-6 py-4
- Sticky: bottom-0
- Layout: Flex row, justify-end, gap-3

### Typography
- **Modal Title**: 18px
- **Section Titles**: 13px, uppercase, tracking-wider
- **Selected Count**: 13px with count at text-foreground
- **Feed Names**: 14px
- **Feed Meta**: 12px
- **Helper Text**: 12px, text-muted-foreground

### Responsive Design
- Desktop: Centered modal with max-w-2xl
- Tablet: Full width with mx-4 margins
- Mobile: Adapt layout to stack controls vertically
- Scrollable content area on overflow

## Component Structure

### Props Interface
```typescript
interface BulkFeedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFeeds: Feed[];
  allFolders: string[];
  onApplyActions: (actions: BulkFeedActions) => void;
}

interface BulkFeedActions {
  refresh?: boolean;
  folder?: string | null;
  updateFrequency?: FeedUpdateFrequency;
  pause?: boolean;
  resume?: boolean;
  markAllRead?: boolean;
  delete?: {
    deleteType: "keep" | "delete-read" | "delete-all";
  };
}

type FeedUpdateFrequency = "hourly" | "6hours" | "daily" | "weekly" | "manual";
```

### State Management
```typescript
const [refreshing, setRefreshing] = useState(false);
const [selectedFolder, setSelectedFolder] = useState<string>("");
const [selectedFrequency, setSelectedFrequency] = useState<FeedUpdateFrequency | "">("");
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [deleteOption, setDeleteOption] = useState<"keep" | "delete-read" | "delete-all">("delete-all");
const [actionsToApply, setActionsToApply] = useState<Set<string>>(new Set());
```

### Key Functions

#### handleRefreshAll
```typescript
const handleRefreshAll = async () => {
  setRefreshing(true);
  // Trigger refresh for all selected feeds
  setActionsToApply(prev => new Set(prev).add("refresh"));
  setRefreshing(false);
};
```

#### handleApplyActions
```typescript
const handleApplyActions = () => {
  const actions: BulkFeedActions = {};
  
  if (actionsToApply.has("refresh")) actions.refresh = true;
  if (selectedFolder) actions.folder = selectedFolder;
  if (selectedFrequency) actions.updateFrequency = selectedFrequency;
  // ... build actions object
  
  onApplyActions(actions);
  resetState();
  onClose();
};
```

#### handleDelete
```typescript
const handleDelete = () => {
  setShowDeleteConfirm(true);
};

const confirmDelete = () => {
  onApplyActions({
    delete: { deleteType: deleteOption }
  });
  setShowDeleteConfirm(false);
  resetState();
  onClose();
};
```

## Behavior & Interactions

### Opening/Closing
1. Modal opens when isOpen is true
2. Returns null when isOpen is false
3. Backdrop click closes modal
4. X button closes modal
5. Cancel button closes modal
6. Apply button executes actions and closes

### Action Selection
1. User can select multiple actions to apply
2. Actions are tracked in state
3. Preview shows what will change
4. Apply button executes all selected actions at once

### Refresh All
1. User clicks "Refresh All Now"
2. Loading state shows progress
3. Parent triggers refresh for each feed
4. Success/failure count displayed
5. Last updated timestamps updated

### Folder Assignment
1. User selects folder from dropdown
2. Dropdown shows existing folders + "Create New" option
3. If "Create New" selected, prompt for folder name
4. Selected folder tracked in state
5. Applied when user clicks Apply button

### Update Frequency
1. User selects interval from dropdown
2. Options: Hourly, Every 6 hours, Daily, Weekly, Manual
3. Selection tracked in state
4. Applied to all selected feeds on Apply

### Pause/Resume
1. Separate buttons for pause and resume
2. Only one can be active at a time
3. Shows current pause/active count in preview
4. Applied when user clicks Apply button

### Delete Feeds
1. User clicks "Delete Feeds" button
2. Confirmation dialog opens
3. Shows total article count across feeds
4. Radio options for article handling:
   - Keep all articles (orphaned)
   - Delete only read articles (with count)
   - Delete all articles (with count)
5. Warning message about irreversibility
6. User confirms or cancels
7. If confirmed, delete action applied

### Apply Actions
1. User clicks Apply button
2. All selected actions execute
3. Parent component handles actual operations
4. Success/error toasts shown
5. Modal closes
6. State resets

## Dependencies

### Required Imports
```typescript
import { useState } from "react";
import { X, Rss, RefreshCw, Folder, Clock, Pause, Play, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
```

### ShadCN Components Used
- `Button` - All action buttons
- `Select` - Folder and frequency dropdowns
- `RadioGroup`, `RadioGroupItem` - Delete options
- `Label` - Form labels
- `Badge` - Feed type indicators
- `AlertDialog` - Delete confirmation

### Type Imports
- `Feed`, `FeedType` - From `../types/article`

## Integration Notes

### Parent Component (FeedsPage) Integration

```typescript
import BulkFeedsModal from "./BulkFeedsModal";
import { toast } from "sonner@2.0.3";

// State
const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set());
const [showBulkFeedsModal, setShowBulkFeedsModal] = useState(false);

// Get selected feed objects
const selectedFeedObjects = feeds.filter(f => selectedFeeds.has(f.id));

// Get all unique folders
const allFolders = Array.from(new Set(feeds.map(f => f.folder).filter(Boolean)));

// Handler
const handleBulkFeedActions = async (actions: BulkFeedActions) => {
  let updatedFeeds = [...feeds];
  
  // Refresh
  if (actions.refresh) {
    // Trigger refresh for selected feeds
    toast.info("Refreshing feeds...");
    // await refreshFeeds(selectedFeedObjects);
  }
  
  // Folder assignment
  if (actions.folder !== undefined) {
    updatedFeeds = updatedFeeds.map(feed => 
      selectedFeeds.has(feed.id) 
        ? { ...feed, folder: actions.folder }
        : feed
    );
  }
  
  // Update frequency
  if (actions.updateFrequency) {
    updatedFeeds = updatedFeeds.map(feed =>
      selectedFeeds.has(feed.id)
        ? { ...feed, updateFrequency: actions.updateFrequency }
        : feed
    );
  }
  
  // Pause/Resume
  if (actions.pause) {
    updatedFeeds = updatedFeeds.map(feed =>
      selectedFeeds.has(feed.id)
        ? { ...feed, isPaused: true }
        : feed
    );
  }
  
  if (actions.resume) {
    updatedFeeds = updatedFeeds.map(feed =>
      selectedFeeds.has(feed.id)
        ? { ...feed, isPaused: false }
        : feed
    );
  }
  
  // Delete
  if (actions.delete) {
    const feedIdsToDelete = Array.from(selectedFeeds);
    
    if (actions.delete.deleteType === "delete-all") {
      // Delete all articles from these feeds
      setArticles(articles.filter(a => !feedIdsToDelete.includes(a.feedId || "")));
    } else if (actions.delete.deleteType === "delete-read") {
      // Delete only read articles
      setArticles(articles.filter(a => 
        !feedIdsToDelete.includes(a.feedId || "") || !a.isRead
      ));
    }
    // Keep articles if "keep" option
    
    // Delete feeds
    updatedFeeds = updatedFeeds.filter(f => !selectedFeeds.has(f.id));
    toast.success(`Deleted ${selectedFeeds.size} feeds`);
  }
  
  setFeeds(updatedFeeds);
  setSelectedFeeds(new Set());
  
  if (!actions.delete) {
    toast.success("Feed settings updated");
  }
};

// Render
<BulkFeedsModal
  isOpen={showBulkFeedsModal}
  onClose={() => setShowBulkFeedsModal(false)}
  selectedFeeds={selectedFeedObjects}
  allFolders={allFolders}
  onApplyActions={handleBulkFeedActions}
/>
```

## Accessibility Considerations

1. Modal backdrop is clickable to close
2. X button is keyboard accessible
3. All dropdowns are keyboard navigable
4. Radio buttons work with keyboard
5. Focus management when modal opens
6. ARIA labels for all controls
7. Clear visual hierarchy
8. Confirmation for destructive actions

## Grayscale Design Compliance

- **Background/Borders**: Use theme tokens (bg-background, bg-accent, border-border)
- **Text**: Use semantic colors (text-foreground, text-muted-foreground)
- **Buttons**: Use grayscale variants
- **Hover States**: Use grayscale hover effects
- **Exception**: Delete button uses text-destructive (red)
- **Exception**: Warning icons in delete dialog use yellow-600
- **Flat Design**: Minimal shadows, no drop shadows

## Feed Type Indicators

Show feed type with badges:
```typescript
<Badge variant="outline" className="text-[10px]">
  {feed.type === "article" && <FileText size={10} className="mr-1" />}
  {feed.type === "video" && <Play size={10} className="mr-1" />}
  {feed.type === "podcast" && <Headphones size={10} className="mr-1" />}
  {feed.type}
</Badge>
```

## Future Enhancements (Optional)

1. **Progress Tracking**: Show real-time progress for bulk refresh
2. **Action Preview**: Show before/after comparison
3. **Undo Functionality**: Allow reverting bulk actions
4. **Export Feeds**: Export OPML of selected feeds
5. **Import to Folder**: Import OPML and add to folder
6. **Duplicate Detection**: Warn about duplicate feeds
7. **Feed Health**: Show error status, response times
8. **Batch Import**: Add multiple feeds from list
9. **Feed Merge**: Combine similar feeds
10. **Smart Folders**: Auto-folder based on content

## Testing Checklist

- [ ] Modal opens when isOpen is true
- [ ] Modal closes on backdrop click
- [ ] Modal closes on X button
- [ ] Modal closes on Cancel button
- [ ] Selected count displays correctly
- [ ] Feed list shows all selected feeds
- [ ] Feed type badges display correctly
- [ ] Refresh All button triggers refresh
- [ ] Folder dropdown populates correctly
- [ ] Update frequency dropdown works
- [ ] Pause/Resume buttons work
- [ ] Delete button shows confirmation
- [ ] Delete confirmation shows correct counts
- [ ] Radio buttons for delete options work
- [ ] Apply button executes all actions
- [ ] Actions applied correctly to parent
- [ ] State resets after apply
- [ ] Toast notifications appear
- [ ] Responsive on mobile and desktop
- [ ] Scrolling works with many feeds

## Implementation Notes

- Track multiple action selections in Set
- Build actions object before applying
- Handle async operations (refresh) separately
- Validate folder names when creating new
- Calculate article counts for delete preview
- Reset all state when modal closes
- Use confirmation for destructive actions
- Show loading states for async operations
- Handle errors gracefully with toasts
- Prevent applying when no actions selected

## Example Usage

```typescript
// In FeedsPage.tsx
import BulkFeedsModal from "./BulkFeedsModal";

const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set());
const [showBulkModal, setShowBulkModal] = useState(false);

const selectedFeedObjects = feeds.filter(f => selectedFeeds.has(f.id));
const allFolders = Array.from(new Set(feeds.map(f => f.folder).filter(Boolean)));

<BulkFeedsModal
  isOpen={showBulkModal}
  onClose={() => setShowBulkModal(false)}
  selectedFeeds={selectedFeedObjects}
  allFolders={allFolders}
  onApplyActions={handleBulkFeedActions}
/>
```

## Related Components
Reference these components for consistency:
- `/components/BulkActionsBar.tsx` - Similar bulk operation patterns
- `/components/BulkTagModal.tsx` - Bulk modal structure
- `/components/ExportNotesModal.tsx` - Modal styling and layout
- `/components/pages/FeedsPage.tsx` - Integration context
