# TagManager Component Creation Prompt

## Overview
Create a TagManager component that provides a popover-based interface for managing tags on individual articles. This component allows users to add new tags, remove existing tags, and quickly apply suggested tags from other articles in the library.

## Component Location
- **File**: `/components/TagManager.tsx`
- **Type**: Reusable Component (used in ArticleViewer, ContentCard, and potentially other contexts)

## Props Interface

```typescript
interface TagManagerProps {
  articleId: string;           // Unique identifier for the article
  currentTags: string[];       // Array of tags currently applied to this article
  allTags: string[];          // Array of all tags available in the system
  onUpdateTags: (articleId: string, newTags: string[]) => void; // Callback when tags change
}
```

## Visual Design

### Trigger Button
- **Text**: "Manage Tags"
- **Icon**: Tag icon (from lucide-react) at 14px
- **Styling**: 
  - Text size: 12px
  - Padding: px-3 py-1
  - Rounded corners
  - Hover: bg-accent background
  - Flex layout with gap-1 between icon and text

### Popover Panel
- **Width**: 280px
- **Position**: Absolute, anchored to left of trigger button, opens downward (top-full mt-1)
- **Background**: bg-card with border-border and rounded-lg
- **Shadow**: shadow-lg
- **Z-index**: z-50
- **Padding**: p-3

## Popover Content Structure

### 1. Header Section
- **Layout**: Flex row with space-between
- **Left Side**: "Manage Tags" title
  - Font: Inter Medium at 14px
  - Color: text-foreground
- **Right Side**: X close button
  - Size: 14px
  - Hover: bg-accent background
  - Rounded with p-1 padding

### 2. Add New Tag Section
- **Input Field**:
  - Flex-1 width
  - Placeholder: "Add new tag..."
  - Font size: 13px
  - Border: border-border
  - Background: bg-background
  - Focus: border-primary
  - Padding: px-2 py-1.5
  - Rounded corners
- **Add Button**:
  - Plus icon (14px)
  - Background: bg-primary
  - Text color: text-primary-foreground
  - Padding: px-2 py-1.5
  - Disabled when input is empty
  - Disabled state: opacity-50, cursor-not-allowed
- **Layout**: Horizontal flex with gap-1

### 3. Current Tags Section (only shown when tags exist)
- **Header**: 
  - Text: "CURRENT TAGS"
  - Styling: 11px, uppercase, tracking-wider, text-muted-foreground
  - Margin bottom: mb-2
- **Tags Display**:
  - Flex wrap layout with gap-1.5
  - Each tag is a button with:
    - Background: bg-primary/10
    - Text: text-primary at 12px
    - Padding: px-2 py-1
    - Rounded corners
    - X icon (12px) that appears on hover (opacity-0 to opacity-100)
    - Hover state: bg-destructive/10, text-destructive
    - Transition: colors

### 4. Suggested Tags Section (only shown when suggestions exist)
- **Header**: 
  - Text: "SUGGESTED TAGS"
  - Styling: Same as Current Tags header
- **Tags Display**:
  - Flex wrap layout with gap-1.5
  - Max height: 120px with overflow-y-auto
  - Each tag is a button with:
    - Background: bg-accent
    - Text: text-foreground at 12px
    - Plus icon (12px) on left
    - Padding: px-2 py-1
    - Rounded corners
    - Hover: bg-primary/10, text-primary
    - Transition: colors

### 5. Empty State
- **Shown when**: No current tags AND no suggested tags
- **Message**: "No tags yet. Add your first tag above."
- **Styling**: 13px, text-muted-foreground, centered, py-2

## Behavior & Interactions

### Opening/Closing
1. Click trigger button to toggle popover open/closed
2. Click X button in header to close
3. Click outside popover to close (use click-outside detection)
4. All clicks inside popover should stop propagation to prevent closing

### Adding New Tags
1. Type tag name in input field
2. Press Enter OR click Plus button to add
3. Tag is trimmed of whitespace
4. Duplicate tags are prevented
5. Input field clears after adding
6. Tag is immediately added to current tags and callback is triggered

### Removing Tags
1. Click on a tag in "Current Tags" section
2. Tag is removed from current tags
3. Callback is triggered immediately
4. Tag appears in "Suggested Tags" if it exists in allTags

### Adding Suggested Tags
1. Click on a tag in "Suggested Tags" section
2. Tag is added to current tags
3. Callback is triggered immediately
4. Tag moves to "Current Tags" section

## State Management

### Local State
```typescript
const [isOpen, setIsOpen] = useState(false);           // Popover visibility
const [newTag, setNewTag] = useState("");              // New tag input value
const [localTags, setLocalTags] = useState<string[]>(currentTags); // Local copy of tags
```

### Refs
```typescript
const popoverRef = useRef<HTMLDivElement>(null);       // Popover element
const buttonRef = useRef<HTMLButtonElement>(null);     // Trigger button
```

## Key Functions

### toggleTag
- Adds tag if not present, removes if present
- Updates localTags state
- Calls onUpdateTags callback

### addNewTag
- Validates input (non-empty, trimmed, not duplicate)
- Adds to localTags
- Calls onUpdateTags callback
- Clears input

### handleKeyPress
- Listens for Enter key
- Prevents default behavior
- Calls addNewTag

### Suggested Tags Computation
```typescript
const suggestedTags = allTags.filter(tag => !localTags.includes(tag));
```

## Click-Outside Detection

Use useEffect to add/remove mousedown event listener:
```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  if (isOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isOpen]);
```

## Dependencies

### Required Imports
```typescript
import { useState, useRef, useEffect } from "react";
import { Tag, X, Plus, Check } from "lucide-react";
```

### ShadCN Components
- None (custom implementation)

## Integration Notes

### Usage in ArticleViewer
- Used in the article header/toolbar area
- Receives current article's tags
- Updates article tags through parent state management

### Usage in ContentCard
- Could be integrated into card menu/actions
- Allows quick tag management without opening article

### Parent Component Requirements
The parent component must:
1. Maintain a list of all tags across all articles
2. Provide onUpdateTags callback that updates the article's tags
3. Pass current article tags as currentTags prop
4. Pass articleId for identification in callback

## Accessibility Considerations

1. All interactive elements are buttons with proper click handlers
2. Input has placeholder text
3. Buttons have disabled states when appropriate
4. Stop propagation on interactive elements to prevent accidental closing

## Grayscale Design Compliance

- No colors used except for grayscale
- Warning/destructive elements use red shades (hover:bg-destructive/10, text-destructive)
- Primary elements use grayscale (bg-primary is configured as grayscale in theme)
- Borders and backgrounds follow the grayscale palette

## Future Enhancements (Optional)

1. Tag color coding (if design system allows)
2. Tag autocomplete
3. Tag usage statistics
4. Tag sorting/filtering
5. Bulk tag operations
6. Tag renaming/merging

## Testing Checklist

- [ ] Popover opens/closes correctly
- [ ] Click outside closes popover
- [ ] Can add new tags via Enter key
- [ ] Can add new tags via Plus button
- [ ] Duplicate tags are prevented
- [ ] Can remove tags from current tags
- [ ] Can add suggested tags
- [ ] Tags update parent state correctly
- [ ] Empty state displays when appropriate
- [ ] All interactive elements work on click
- [ ] Mobile responsive behavior
- [ ] Stop propagation prevents card/article clicks
