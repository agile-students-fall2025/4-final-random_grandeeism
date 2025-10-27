# BulkTagModal Component Creation Prompt

## Overview
Create a `BulkTagModal.jsx` component for the fieldnotes read-it-later app that allows users to add tags to multiple selected items simultaneously. This modal works in conjunction with the BulkActionsBar to provide efficient batch tag management.

## Component Location
`/components/BulkTagModal.jsx`

## Purpose
This modal provides an interface for users to add tags to multiple selected articles, videos, or podcasts at once. It should handle:
- Creating and adding new tags
- Selecting from existing tags
- Displaying selected tags before applying
- Managing tag state locally before applying changes

## Functional Requirements

### Modal Trigger
- Opened from BulkActionsBar's "Add Tags" button
- Only shown when items are selected (selectedCount > 0)
- Managed by parent component's state

### Tag Management Features

#### 1. Selected Count Display
- Shows how many items will receive the tags
- Format: "Adding tags to {count} selected {item/items}"
- Highlighted count number with medium font weight
- Background: bg-accent with padding
- Dynamic pluralization

#### 2. Tags to Add Section (Conditional)
- Only visible when selectedTags.length > 0
- Label: "Tags to add:" (13px, text-muted-foreground)
- Shows selected tags as removable badges
- Badge styling: variant="secondary", 12px text
- Click badge to remove from selection
- X icon (12px) appears next to tag name
- Flex wrap layout with gap-2

#### 3. Add New Tag Input
- Label: "Add new tag" (13px)
- Text input with:
  - Placeholder: "Type and press Enter..."
  - Full width input with border-border
  - Focus ring: ring-2 ring-primary
  - Background: bg-background
  - Padding: px-3 py-2
  - Text size: 14px
- Plus button:
  - Size: sm
  - Icon: Plus (16px)
  - Disabled when input is empty
- Enter key triggers tag addition
- Input clears after adding tag
- Prevents duplicate tags
- Trims whitespace

#### 4. Existing Tags Selection
- Only visible when allTags.length > 0
- Label: "Or select from existing tags:" (13px, text-muted-foreground)
- Shows all available tags as clickable badges
- Badge styling:
  - Selected: variant="default"
  - Unselected: variant="outline"
  - Text size: 12px
  - Cursor: pointer
  - Hover: hover:bg-primary/90
- Click to toggle selection
- Flex wrap layout with gap-2

### Actions
- **Cancel** button: Closes modal without applying tags
- **Add Tags** button:
  - Icon: Tag (16px)
  - Label: "Add {count} Tag{s}" (dynamic count and pluralization)
  - Disabled when no tags selected
  - Applies selected tags to all selected items
  - Closes modal after applying

## UI/UX Requirements

### Layout Structure
```
┌───────────────────────────────────────────┐
│  [Tag Icon] Add Tags to Items        [X]  │
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Adding tags to 5 selected items     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Tags to add:                             │
│  [Technology ×] [Design ×]                │
│                                           │
│  Add new tag                              │
│  ┌────────────────────────────┬────────┐ │
│  │ Type and press Enter...    │ [+]    │ │
│  └────────────────────────────┴────────┘ │
│                                           │
│  Or select from existing tags:            │
│  [React] [JavaScript] [CSS] [Web Dev]    │
│  [Tutorial] [Reference]                   │
│                                           │
├───────────────────────────────────────────┤
│                        [Cancel] [Add Tags]│
└───────────────────────────────────────────┘
```

### Styling Guidelines
- **Grayscale Only**: No colors except grayscale theme tokens
- **Flat Design**: Minimal shadows, simplified visual style
- **Max Width**: max-w-md (448px)
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
- Width: w-full max-w-md
- Margin: mx-4 (on mobile)
- Max height: max-h-[90vh]
- Overflow: overflow-y-auto

#### Header
- Background: bg-background
- Border: border-b border-border
- Padding: px-6 py-4
- Sticky: top-0
- Layout: Flex row with space-between
- Icon: Tag (20px, text-primary)
- Title: "Add Tags to Items" (18px)
- Close button: X icon (20px)

#### Content Area
- Padding: px-6 py-6
- Gap between sections: space-y-6

#### Selected Count Display
- Padding: p-3
- Background: bg-accent
- Rounded: rounded-lg
- Text: 13px, text-muted-foreground
- Count number: text-foreground with font-['Inter:Medium']

#### Tags to Add Section
- Label: 13px, text-muted-foreground, mb-2
- Badges: flex flex-wrap gap-2
- Badge text: 12px
- Badge hover: hover:bg-secondary/80

#### New Tag Input Section
- Label: 13px, mb-2
- Input container: flex gap-2
- Input: flex-1 with standard form styling
- Button: ShadCN Button component, size="sm"

#### Existing Tags Section
- Label: 13px, text-muted-foreground, mb-2
- Badges: flex flex-wrap gap-2
- Selected badge: variant="default"
- Unselected badge: variant="outline"

#### Footer
- Background: bg-background
- Border: border-t border-border
- Padding: px-6 py-4
- Sticky: bottom-0
- Layout: Flex row, justify-end, gap-3

### Typography
- **Modal Title**: 18px
- **Section Labels**: 13px
- **Count Display**: 13px, with count at text-foreground
- **Input Text**: 14px
- **Badge Text**: 12px

### Responsive Design
- Desktop: Centered modal with max-width
- Mobile: Full width with mx-4 margins
- Scrollable content area on overflow
- Touch-friendly tap targets

## Component Structure

### Props (example)
```jsx
// Example props shape for BulkTagModal (JS/JSX)
const BulkTagModalProps = {
  isOpen: false,
  onClose: () => {},
  selectedCount: 0,
  allTags: [],
  onApplyTags: (tags) => {}
};
```

### State Management
```jsx
const [selectedTags, setSelectedTags] = useState([]);
const [newTagInput, setNewTagInput] = useState("");
```

### Key Functions

#### handleAddNewTag
```jsx
const handleAddNewTag = () => {
  const trimmedTag = newTagInput.trim();
  if (trimmedTag && !selectedTags.includes(trimmedTag)) {
    setSelectedTags([...selectedTags, trimmedTag]);
    setNewTagInput("");
  }
};
```

#### handleToggleTag
```jsx
const handleToggleTag = (tag) => {
  if (selectedTags.includes(tag)) {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  } else {
    setSelectedTags([...selectedTags, tag]);
  }
};
```

#### handleRemoveTag
```jsx
const handleRemoveTag = (tag) => {
  setSelectedTags(selectedTags.filter(t => t !== tag));
};
```

#### handleApply
```jsx
const handleApply = () => {
  onApplyTags(selectedTags);
  setSelectedTags([]);
  setNewTagInput("");
  onClose();
};
```

## Behavior & Interactions

### Opening/Closing
1. Modal opens when isOpen prop is true
2. Returns null when isOpen is false
3. Backdrop click closes modal (calls onClose)
4. X button closes modal
5. Cancel button closes modal
6. Successful apply closes modal

### Adding New Tags
1. User types tag name in input
2. Press Enter OR click Plus button
3. Tag is trimmed and validated
4. Duplicate check prevents adding same tag twice
5. Tag added to selectedTags state
6. Input field clears
7. Tag appears in "Tags to add" section
8. User can click to remove before applying

### Selecting Existing Tags
1. User clicks tag badge from existing tags
2. Toggle behavior: click to select, click again to deselect
3. Selected tags show variant="default" styling
4. Unselected tags show variant="outline" styling
5. Selected tags appear in "Tags to add" section

### Removing Tags from Selection
1. Click badge in "Tags to add" section
2. Tag removed from selectedTags state
3. If tag exists in allTags, it returns to unselected state in existing tags

### Applying Tags
1. User clicks "Add Tags" button
2. onApplyTags callback fires with selectedTags array
3. Parent handles adding tags to selected articles
4. Modal state resets (selectedTags and newTagInput clear)
5. Modal closes via onClose
6. Parent shows success toast

## Dependencies

### Required Imports
```jsx
import { useState } from "react";
import { X, Tag, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
```

### ShadCN Components Used
- `Button` - For Cancel, Apply, and Plus buttons
- `Badge` - For tag display and selection

## Integration Notes

### Parent Component Requirements
The parent page must:

1. **Maintain Modal State**
```jsx
const [showBulkTagModal, setShowBulkTagModal] = useState(false);
const [selectedItems, setSelectedItems] = useState(new Set());
```

2. **Generate All Tags List**
```jsx
const allTags = Array.from(new Set(articles.flatMap(a => a.tags)));
```

3. **Provide Apply Handler**
```jsx
const handleApplyBulkTags = (tags) => {
  const updatedArticles = articles.map(article => {
    if (selectedItems.has(article.id)) {
      // Merge new tags with existing, removing duplicates
      const newTags = Array.from(new Set([...article.tags, ...tags]));
      return { ...article, tags: newTags };
    }
    return article;
  });
  setArticles(updatedArticles);
  toast.success(`Added tags to ${selectedItems.size} items`);
  setShowBulkTagModal(false);
  clearSelection();
};
```

4. **Render Modal**
```jsx
<BulkTagModal
  isOpen={showBulkTagModal}
  onClose={() => setShowBulkTagModal(false)}
  selectedCount={selectedItems.size}
  allTags={allTags}
  onApplyTags={handleApplyBulkTags}
/>
```

### Integration with BulkActionsBar
```jsx
// In BulkActionsBar
<Button
  variant="outline"
  size="sm"
  onClick={onBulkTag}
  className="text-[13px]"
>
  <Tag size={14} className="mr-1" />
  Add Tags
</Button>

// In parent page
<BulkActionsBar
  selectedCount={selectedItems.size}
  onBulkTag={() => setShowBulkTagModal(true)}
  // ... other props
/>
```

## Accessibility Considerations

1. Modal backdrop is clickable to close
2. X button is keyboard accessible
3. Input field supports Enter key for adding tags
4. All badges are clickable buttons
5. Focus management when modal opens
6. ARIA labels where appropriate
7. Button states (disabled) are clear

## Grayscale Design Compliance

- **Background/Borders**: Use theme tokens (bg-background, bg-accent, border-border)
- **Text**: Use semantic colors (text-foreground, text-muted-foreground)
- **Badges**: Use ShadCN Badge variants (default, secondary, outline)
- **Hover States**: Use grayscale hover effects
- **Icon Color**: text-primary for header icon (grayscale in theme)
- **No Colors**: Pure grayscale throughout
- **Flat Design**: Minimal shadow-lg, no drop shadows

## Tag Deduplication Logic

When applying tags:
```jsx
// In parent component
const newTags = Array.from(new Set([...article.tags, ...tags]));
```

This ensures:
- Existing tags are preserved
- New tags are added
- No duplicates exist
- Order may not be preserved (Set behavior)

## Validation Rules

1. **Empty Tags**: Prevented by trim() and empty check
2. **Duplicate New Tags**: Checked before adding to selectedTags
3. **Whitespace**: Trimmed from input
4. **Case Sensitivity**: Tags are case-sensitive (consider toLowerCase() if needed)
5. **Special Characters**: No validation (allows all characters)

## Future Enhancements (Optional)

1. **Tag Autocomplete**: Suggest tags as user types
2. **Tag Categories**: Group tags by category
3. **Tag Colors**: Assign colors to tags (would require removing grayscale restriction)
4. **Tag Usage Count**: Show how many items use each tag
5. **Tag Search**: Filter existing tags list
6. **Bulk Remove Tags**: Option to remove tags from selected items
7. **Tag Renaming**: Rename tags across all items
8. **Tag Merging**: Combine similar tags
9. **Recent Tags**: Show recently used tags for quick access
10. **Tag Import/Export**: Import tag lists from files

## Testing Checklist

- [ ] Modal opens when isOpen is true
- [ ] Modal closes when backdrop is clicked
- [ ] Modal closes when X button is clicked
- [ ] Modal closes when Cancel is clicked
- [ ] Selected count displays correctly with pluralization
- [ ] Can add new tag via Enter key
- [ ] Can add new tag via Plus button
- [ ] Duplicate tags are prevented
- [ ] Whitespace is trimmed from new tags
- [ ] Input clears after adding tag
- [ ] Can select existing tags by clicking
- [ ] Can deselect tags by clicking again
- [ ] Selected tags show correct variant styling
- [ ] Can remove tags from "Tags to add" section
- [ ] Add Tags button is disabled when no tags selected
- [ ] Add Tags button shows correct count and pluralization
- [ ] Tags are applied correctly to parent
- [ ] Modal state resets after applying
- [ ] Responsive on mobile and desktop
- [ ] Scrollable when content overflows
- [ ] All interactive elements have proper hover states

## Known Issues / Edge Cases

1. **Empty allTags Array**: Modal works but only allows creating new tags
2. **Very Long Tag Names**: May overflow badges, consider text truncation
3. **Many Tags**: Scrolling works but may be cumbersome, consider pagination or search
4. **Tag Case Sensitivity**: "Design" and "design" are treated as different tags

## Implementation Notes

- Keep tag selection state local to modal
- Only update parent state on apply
- Reset local state when modal closes
- Use Set for deduplication in parent
- Validate input before adding to state
- Prevent empty or whitespace-only tags
- Use consistent spacing (gap-2 for badges, space-y-6 for sections)
- Ensure badges wrap properly on small screens
- Test with various tag counts (0, 1, 10, 50+)

## Example Usage

```jsx
// In TextPage.jsx, VideosPage.jsx, or PodcastsPage.jsx
import BulkTagModal from "./BulkTagModal";
import { toast } from "sonner@2.0.3";

// Component state
const [selectedItems, setSelectedItems] = useState(new Set());
const [showBulkTagModal, setShowBulkTagModal] = useState(false);

// Get all unique tags from articles
const allTags = useMemo(() => 
  Array.from(new Set(articles.flatMap(a => a.tags))),
  [articles]
);

// Handler
const handleApplyBulkTags = (tags) => {
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

// Render
<BulkTagModal
  isOpen={showBulkTagModal}
  onClose={() => setShowBulkTagModal(false)}
  selectedCount={selectedItems.size}
  allTags={allTags}
  onApplyTags={handleApplyBulkTags}
/>
```

## Related Components
Reference these components for consistency:
- `/components/BulkActionsBar.jsx` - Triggers this modal
- `/components/TagManager.jsx` - Similar tag management for single items
- `/components/ExportNotesModal.jsx` - Similar modal structure and styling
- `/components/CompletionModal.jsx` - Modal interaction patterns
