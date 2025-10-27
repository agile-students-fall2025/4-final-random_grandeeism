# BulkActionsBar Component Creation Prompt

## Overview
Create a `BulkActionsBar.tsx` component for the fieldnotes read-it-later app that provides bulk operations on selected articles, videos, and podcasts. This component appears as a fixed bottom toolbar when items are selected, allowing users to perform batch operations efficiently.

## Component Location
`/components/BulkActionsBar.tsx`

## Purpose
This component provides a context-sensitive action bar for performing bulk operations on multiple content items simultaneously. It should handle:
- Batch favoriting/unfavoriting
- Bulk tag management
- Mass status changes (moving items between queues)
- Advancing items to next queue in workflow
- Bulk deletion with confirmation

## Functional Requirements

### Visibility & Positioning
- Appears only when items are selected (selectedCount > 0)
- Fixed to bottom of screen across all pages
- Overlays content with high z-index (z-40)
- Spans full width with max-width constraint
- Includes border and shadow for visual separation

### Action Buttons

#### 1. Clear Selection (X Button)
- Icon: X (20px)
- Position: Far left
- Color: text-muted-foreground with hover:text-foreground
- Function: Clears all selections and hides bulk actions bar

#### 2. Selection Count Display
- Text: "{count} {item/items} selected"
- Font size: 14px
- Dynamic pluralization (1 item vs 2+ items)
- Position: Left side, next to X button

#### 3. Favorite Button
- Icon: Star (14px)
- Label: "Favorite"
- Variant: outline
- Size: sm
- Function: Adds favorite flag to all selected items

#### 4. Unfavorite Button
- Icon: Star (14px, filled with yellow-500)
- Label: "Unfavorite"
- Variant: outline
- Size: sm
- **Note**: In grayscale theme, star should use foreground colors, NOT yellow
- Function: Removes favorite flag from all selected items

#### 5. Add Tags Button
- Icon: Tag (14px)
- Label: "Add Tags"
- Variant: outline
- Size: sm
- Function: Opens BulkTagModal for batch tag management

#### 6. Change Status Dropdown
- Trigger: Button with "Change Status" label
- Type: DropdownMenu (ShadCN)
- Width: w-56 (224px)
- Alignment: align="end"
- Contains 6 menu items:

**Move to Next Queue**
- Icon: RotateCcw (16px)
- Label: "Move to Next Queue"
- Function: Advances each item to next status in workflow
- Workflow: inbox → dailyReading → inProgress → rediscovery → archived

**Move to Inbox**
- Icon: Inbox (16px)
- Label: "Move to Inbox"
- Function: Moves all selected items to inbox status

**Move to Daily Reading**
- Icon: Calendar (16px)
- Label: "Move to Daily Reading"
- Function: Moves all selected items to dailyReading status

**Move to Continue Reading**
- Icon: BookOpen (16px)
- Label: "Move to Continue Reading"
- Function: Moves all selected items to inProgress status

**Move to Rediscovery**
- Icon: RotateCcw (16px)
- Label: "Move to Rediscovery"
- Function: Moves all selected items to rediscovery status

**Archive**
- Icon: Archive (16px)
- Label: "Archive"
- Function: Moves all selected items to archived status

#### 7. Delete Button
- Icon: Trash2 (14px)
- Label: "Delete"
- Variant: outline
- Size: sm
- Color: text-destructive with hover:text-destructive
- Function: Triggers delete confirmation dialog

## UI/UX Requirements

### Layout Structure
```
┌──────────────────────────────────────────────────────────────┐
│  [X]  {count} items selected     [Favorite] [Unfavorite]    │
│                                   [Add Tags] [Change Status] │
│                                   [Delete]                    │
└──────────────────────────────────────────────────────────────┘
```

Mobile/Responsive Layout:
- Buttons wrap to multiple rows if needed (flex-wrap)
- Maintains readability on small screens
- Action buttons may stack vertically

### Styling Guidelines
- **Grayscale Only**: No colors except red for destructive actions
- **Flat Design**: Minimal shadows (only shadow-lg on bar itself)
- **Position**: fixed bottom-0 left-0 right-0
- **Background**: bg-background
- **Border**: border-t border-border
- **Shadow**: shadow-lg (for elevation effect)
- **z-index**: z-40 (above content, below modals)
- **Max Width**: max-w-7xl with mx-auto centering
- **Padding**: px-4 py-3
- **Gap**: gap-4 between main sections, gap-2 between buttons

### Component Styling Details

#### Container
```typescript
className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40"
```

#### Inner Container
```typescript
className="max-w-7xl mx-auto px-4 py-3"
```

#### Main Flex Layout
```typescript
className="flex items-center justify-between gap-4"
```

#### Left Section (Clear + Count)
```typescript
className="flex items-center gap-3"
```

#### Right Section (Action Buttons)
```typescript
className="flex items-center gap-2 flex-wrap"
```

#### Button Styling
- All action buttons: `variant="outline"` and `size="sm"`
- Text size: `className="text-[13px]"`
- Icons: 14px with `className="mr-1"`
- Delete button adds: `className="text-[13px] text-destructive hover:text-destructive"`

#### Dropdown Menu Items
- Icon size: 16px with `className="mr-2"`
- Width: `className="w-56"`
- Alignment: `align="end"`

### Typography
- **Selection Count**: 14px
- **Button Labels**: 13px
- **Dropdown Items**: Default (inherited from ShadCN)

### Responsive Design
- Desktop: Single row layout with all buttons visible
- Tablet: Buttons may wrap to second row
- Mobile: Vertical stacking of action buttons
- Touch targets: Minimum 44px for mobile usability

## Component Structure

### Props Interface
```typescript
interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkFavorite: () => void;
  onBulkUnfavorite: () => void;
  onBulkTag: () => void;
  onBulkStatusChange: (status: ArticleStatus) => void;
  onBulkAdvanceStatus: () => void;
  onBulkDelete: () => void;
}
```

### State Management
```typescript
// No local state required - all state is managed by parent
// Optional: const [showStatusMenu, setShowStatusMenu] = useState(false);
// But DropdownMenu handles this internally
```

### ArticleStatus Type
```typescript
type ArticleStatus = "inbox" | "dailyReading" | "inProgress" | "rediscovery" | "archived";
```

## Behavior & Interactions

### Visibility
1. Component renders only when selectedCount > 0
2. Parent component controls visibility via conditional rendering
3. Fixed positioning ensures it stays visible while scrolling

### Clear Selection
1. Click X button
2. Calls onClearSelection()
3. Parent resets selection state
4. Bar disappears when selectedCount becomes 0

### Favorite/Unfavorite
1. Click Favorite button → onBulkFavorite() → Parent sets isFavorite: true on all selected
2. Click Unfavorite button → onBulkUnfavorite() → Parent sets isFavorite: false on all selected
3. Toast notification confirms action
4. Selection is cleared after operation

### Add Tags
1. Click Add Tags button
2. Calls onBulkTag()
3. Parent opens BulkTagModal
4. BulkTagModal handles tag selection
5. Tags applied to all selected items
6. Selection cleared after operation

### Status Changes
1. Click Change Status dropdown trigger
2. Dropdown menu opens with 6 options
3. User selects desired status
4. Appropriate callback fires:
   - "Move to Next Queue" → onBulkAdvanceStatus()
   - Specific queue → onBulkStatusChange(status)
5. Parent updates status for all selected items
6. Toast notification confirms action
7. Selection cleared after operation

### Bulk Delete
1. Click Delete button
2. Calls onBulkDelete()
3. Parent shows confirmation AlertDialog
4. User confirms or cancels
5. If confirmed, items are deleted
6. Toast notification confirms deletion
7. Selection cleared after operation

## Dependencies

### Required Imports
```typescript
import { useState } from "react";
import { X, Star, Tag, Archive, Trash2, Inbox, Calendar, BookOpen, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { ArticleStatus } from "../types/article";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
```

### ShadCN Components Used
- `Button` - All action buttons
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger` - Status change menu

### Type Imports
- `ArticleStatus` - From `../types/article`

## Integration Notes

### Parent Component Requirements
The parent page (TextPage, VideosPage, PodcastsPage) must:

1. **Maintain Selection State**
```typescript
const [selectionMode, setSelectionMode] = useState(false);
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
```

2. **Provide Handler Functions**
```typescript
const handleBulkFavorite = () => {
  const updated = articles.map(article => 
    selectedItems.has(article.id) ? { ...article, isFavorite: true } : article
  );
  setArticles(updated);
  toast.success(`Favorited ${selectedItems.size} items`);
  clearSelection();
};

const handleBulkUnfavorite = () => {
  const updated = articles.map(article => 
    selectedItems.has(article.id) ? { ...article, isFavorite: false } : article
  );
  setArticles(updated);
  toast.success(`Unfavorited ${selectedItems.size} items`);
  clearSelection();
};

const handleBulkTag = () => {
  setShowBulkTagModal(true);
};

const handleBulkStatusChange = (newStatus: ArticleStatus) => {
  const updated = articles.map(article => {
    if (selectedItems.has(article.id)) {
      const updates: Partial<Article> = { status: newStatus };
      // Add metadata based on status
      if (newStatus === "archived") {
        updates.dateRead = new Date();
        updates.isRead = true;
      }
      if (newStatus === "dailyReading" && !article.scheduledDate) {
        updates.scheduledDate = new Date();
      }
      if (newStatus === "rediscovery") {
        const rediscoveryDate = new Date();
        rediscoveryDate.setDate(rediscoveryDate.getDate() + 7);
        updates.rediscoveryDate = rediscoveryDate;
        updates.isRead = true;
      }
      return { ...article, ...updates };
    }
    return article;
  });
  setArticles(updated);
  toast.success(`Moved ${selectedItems.size} items`);
  clearSelection();
};

const handleBulkAdvanceStatus = () => {
  const getNextStatus = (current: ArticleStatus): ArticleStatus | null => {
    switch (current) {
      case "inbox": return "dailyReading";
      case "dailyReading": return "inProgress";
      case "inProgress": return "rediscovery";
      case "rediscovery": return "archived";
      case "archived": return null;
      default: return null;
    }
  };

  const updated = articles.map(article => {
    if (selectedItems.has(article.id)) {
      const nextStatus = getNextStatus(article.status);
      if (!nextStatus) return article;
      
      const updates: Partial<Article> = { status: nextStatus };
      // Add metadata based on status (same as handleBulkStatusChange)
      return { ...article, ...updates };
    }
    return article;
  });
  setArticles(updated);
  toast.success(`Advanced ${selectedItems.size} items`);
  clearSelection();
};

const handleBulkDelete = () => {
  setShowDeleteDialog(true); // Shows confirmation AlertDialog
};

const confirmBulkDelete = () => {
  const updated = articles.filter(article => !selectedItems.has(article.id));
  setArticles(updated);
  toast.success(`Deleted ${selectedItems.size} items`);
  setShowDeleteDialog(false);
  clearSelection();
};

const clearSelection = () => {
  setSelectedItems(new Set());
  setSelectionMode(false);
};
```

3. **Conditional Rendering**
```typescript
{selectedItems.size > 0 && (
  <BulkActionsBar
    selectedCount={selectedItems.size}
    onClearSelection={clearSelection}
    onBulkFavorite={handleBulkFavorite}
    onBulkUnfavorite={handleBulkUnfavorite}
    onBulkTag={handleBulkTag}
    onBulkStatusChange={handleBulkStatusChange}
    onBulkAdvanceStatus={handleBulkAdvanceStatus}
    onBulkDelete={handleBulkDelete}
  />
)}
```

### Delete Confirmation Dialog
Use ShadCN AlertDialog component:
```typescript
<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete {selectedItems.size} items?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. The selected items will be permanently deleted.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={confirmBulkDelete} className="bg-destructive text-destructive-foreground">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### BulkTagModal Integration
```typescript
const [showBulkTagModal, setShowBulkTagModal] = useState(false);
const allTags = Array.from(new Set(articles.flatMap(a => a.tags)));

const handleApplyBulkTags = (tags: string[]) => {
  const updated = articles.map(article => {
    if (selectedItems.has(article.id)) {
      const newTags = Array.from(new Set([...article.tags, ...tags]));
      return { ...article, tags: newTags };
    }
    return article;
  });
  setArticles(updated);
  toast.success(`Added tags to ${selectedItems.size} items`);
  clearSelection();
};

// Modal rendering
<BulkTagModal
  isOpen={showBulkTagModal}
  onClose={() => setShowBulkTagModal(false)}
  selectedCount={selectedItems.size}
  allTags={allTags}
  onApplyTags={handleApplyBulkTags}
/>
```

## Accessibility Considerations

1. All buttons are keyboard accessible
2. Clear visual feedback on hover/focus states
3. Descriptive button labels for screen readers
4. Icon + text pattern for clarity
5. Adequate touch targets on mobile (minimum 44px)
6. Color contrast meets WCAG standards (grayscale theme)
7. Dropdown menu is keyboard navigable

## Grayscale Design Compliance

- **Background/Borders**: Use theme tokens (bg-background, border-border)
- **Text**: Use semantic colors (text-foreground, text-muted-foreground)
- **Buttons**: Use outline variant for consistency
- **Hover States**: Inherit from Button component
- **Destructive Action**: text-destructive for Delete button
- **WARNING**: Unfavorite button currently uses yellow-500 for star icon
  - Should be updated to use foreground colors for grayscale compliance
  - Example fix: Remove `fill-yellow-500 text-yellow-500` classes
- **No Shadows**: Only shadow-lg on main bar for elevation
- **Flat Design**: No rounded corners except minimal on buttons

## Status Metadata Logic

When changing status, update these fields:

### Moving to Archived
```typescript
{
  status: "archived",
  dateRead: new Date(),
  isRead: true
}
```

### Moving to Daily Reading
```typescript
{
  status: "dailyReading",
  scheduledDate: new Date() // Only if not already set
}
```

### Moving to Rediscovery
```typescript
{
  status: "rediscovery",
  rediscoveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
  isRead: true
}
```

### Advancing Status
Apply same metadata logic based on target status

## Toast Notifications

Use toast from `sonner@2.0.3`:

```typescript
// Favorite
toast.success(`Favorited ${count} items`);

// Unfavorite
toast.success(`Unfavorited ${count} items`);

// Add tags
toast.success(`Added tags to ${count} items`);

// Status change
toast.success(`Moved ${count} items to ${statusName}`);

// Advance status
toast.success(`Advanced ${count} items to next queue`);

// Delete
toast.success(`Deleted ${count} items`);
```

## Future Enhancements (Optional)

1. **Undo Functionality**: Allow reverting bulk operations
2. **Progress Indicator**: Show progress for large batch operations
3. **Selective Actions**: Only show relevant buttons based on selection
4. **Smart Status**: Hide "Move to Next Queue" if items are in different statuses
5. **Export Selected**: Add bulk export functionality
6. **Share Selected**: Batch sharing to social media or email
7. **Print Selected**: Batch print multiple articles
8. **Keyboard Shortcuts**: Cmd/Ctrl + shortcuts for common bulk actions
9. **Animation**: Smooth slide-up/down when appearing/disappearing
10. **Selection Counter Badge**: Visual badge on affected cards

## Testing Checklist

- [ ] Bar appears when items are selected
- [ ] Bar disappears when selection is cleared
- [ ] Selection count displays correctly (singular/plural)
- [ ] X button clears all selections
- [ ] Favorite button marks all selected items
- [ ] Unfavorite button removes favorite from all
- [ ] Add Tags button opens BulkTagModal
- [ ] Change Status dropdown opens/closes correctly
- [ ] All 6 status options work correctly
- [ ] Move to Next Queue advances each item properly
- [ ] Delete button triggers confirmation
- [ ] All operations clear selection after completion
- [ ] Toast notifications appear for all actions
- [ ] Responsive layout works on mobile
- [ ] Buttons wrap properly on small screens
- [ ] Touch targets are adequate on mobile
- [ ] Keyboard navigation works in dropdown
- [ ] Fixed positioning stays at bottom while scrolling
- [ ] z-index places bar above content but below modals

## Known Issues / Grayscale Violations

1. **Unfavorite Button Star Icon**: Currently uses yellow-500
   - Line 70: `fill-yellow-500 text-yellow-500`
   - Should be removed to maintain grayscale theme
   - Replace with standard foreground colors

## Implementation Notes

- Component is purely presentational - all logic in parent
- No local state needed except dropdown menu (handled by ShadCN)
- Fixed positioning ensures visibility during scroll
- Use semantic HTML and ARIA attributes for accessibility
- Ensure all callbacks are properly passed and invoked
- Test with various selection sizes (1, 5, 50+ items)
- Verify dropdown doesn't get cut off at screen edges
- Ensure shadow/border provides adequate visual separation

## Example Usage

```typescript
// In TextPage.tsx, VideosPage.tsx, or PodcastsPage.tsx
import BulkActionsBar from "./BulkActionsBar";
import BulkTagModal from "./BulkTagModal";
import { AlertDialog, ... } from "./ui/alert-dialog";

// Component state
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
const [showBulkTagModal, setShowBulkTagModal] = useState(false);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

// Render (at end of component, after main content)
{selectedItems.size > 0 && (
  <BulkActionsBar
    selectedCount={selectedItems.size}
    onClearSelection={clearSelection}
    onBulkFavorite={handleBulkFavorite}
    onBulkUnfavorite={handleBulkUnfavorite}
    onBulkTag={() => setShowBulkTagModal(true)}
    onBulkStatusChange={handleBulkStatusChange}
    onBulkAdvanceStatus={handleBulkAdvanceStatus}
    onBulkDelete={() => setShowDeleteDialog(true)}
  />
)}

<BulkTagModal
  isOpen={showBulkTagModal}
  onClose={() => setShowBulkTagModal(false)}
  selectedCount={selectedItems.size}
  allTags={allTags}
  onApplyTags={handleApplyBulkTags}
/>

<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
  {/* Delete confirmation content */}
</AlertDialog>
```

## Related Components
Reference these components for consistency:
- `/components/BulkTagModal.tsx` - Works in tandem with bulk actions
- `/components/TopBar.tsx` - Similar button styling patterns
- `/components/ContentCard.tsx` - Selection state management
- `/components/CompletionModal.tsx` - Modal patterns for confirmations
