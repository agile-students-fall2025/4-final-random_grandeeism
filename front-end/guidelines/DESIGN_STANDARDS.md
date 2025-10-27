# Design Standards & UI Guidelines

## Icon Standards

### Status Change Actions

**REQUIRED**: Any UI element for MANUAL status changes MUST use the `PanelBottomClose` icon from Lucide.

**When to use `PanelBottomClose`:**
- Manual status change buttons (e.g., "Move to Archive")
- Status selection dropdowns
- Bulk status change operations
- Drag-and-drop status change indicators

**When NOT to use `PanelBottomClose`:**
- **Automatic queue advancement**: The status icon hover state should show the NEXT STATUS icon (e.g., Calendar for Daily Reading) to clearly indicate where the item will move. This provides visual clarity about the destination queue.

**Examples:**

✅ **Correct - Manual status change:**
```jsx
import { PanelBottomClose } from 'lucide-react';

// Status change dropdown or button
<button onClick={() => changeStatus(itemId, 'archived')}>
  <PanelBottomClose size={16} />
  Change Status
</button>
```

❌ **Incorrect - Automatic queue advancement:**
```jsx
// DON'T use PanelBottomClose for status icon hover
// Instead, show the next status's icon for clarity
const NextStatusIcon = PanelBottomClose; // ❌ Wrong

// ✅ Correct: Show destination queue icon
const nextStatusInfo = getStatusIconInfo(nextStatus);
const NextStatusIcon = nextStatusInfo?.icon; // Shows Calendar, BookOpen, etc.
```

**Why this matters:**
- Manual actions: `PanelBottomClose` signals user control
- Automatic advancement: Destination icon shows where item will go
- Reduces cognitive load when navigating different views

### Other Standard Icons

| Action | Icon | Notes |
|--------|------|-------|
| Favorite/Star | `Star` | Fill yellow when active |
| Archive | `Archive` | Use for completed/archived items |
| Delete | `Trash2` | Always use destructive variant styling |
| Tag Management | `Tag` | For adding/managing tags |
| Export | `FileDown` | For downloading/exporting content |
| External Link | `ExternalLink` | For opening original source |
| More Actions | `ChevronDown` | For dropdown menus |

## Status-Specific Icons

Each status has a specific icon for **display** purposes (not for change actions):

| Status | Icon | Color |
|--------|------|-------|
| Inbox | `Inbox` | Foreground |
| Daily Reading | `Calendar` | Foreground |
| Continue Reading | `BookOpen` | Foreground |
| Rediscovery | `RotateCcw` | Foreground |
| Archived | `Archive` | Muted |

**Important:** These icons are ONLY for showing the current status. For changing status, always use `PanelBottomClose`.

## Branding Standards

### Application Name
- Always use: **"fieldnotes."** (lowercase with period)
- Never use: "FieldNotes", "Field Notes", "fieldnotes" (without period)

### Logo
- Primary icon: `NotebookPen` from Lucide
- Used in: favicon, loading screens, empty states

### Theme
- Support three modes: Light, Dark, Auto (follows system preference)
- Use ThemeContext for theme management
- All components must respect dark mode classes

## Color Standards

### Grayscale Approach
- Default to grayscale for most UI elements
- Use Tailwind's semantic color variables:
  - `text-foreground` - Primary text
  - `text-muted-foreground` - Secondary text
  - `bg-card` - Card backgrounds
  - `bg-accent` - Interactive elements
  - `border-border` - Borders

### Color Exceptions (Purposeful Color Usage)
1. **Status Indicators** - Subtle background colors for status badges
2. **Yellow Star** - Favorite/starred items (`fill-yellow-500 text-yellow-500`)
3. **Primary Blue** - Selected states, active filters, CTAs (`border-primary`, `bg-primary`)
4. **Destructive Red** - Delete actions, errors (`text-destructive`, `variant="destructive"`)

## Component Standards

### Buttons
- Use shadcn/ui `Button` component
- Variants: `default`, `destructive`, `outline`, `ghost`
- Always include icon + text for clarity
- Icon size: 14-16px for buttons

### Cards
- Use `bg-card` with `border border-border`
- Rounded corners: `rounded-lg`
- Hover state: `hover:border-primary/50`
- Padding: `p-4` for content, `p-6` for settings sections

### Modals
- Max width: `max-w-[600px]` for forms
- Max height: `max-h-[90vh]` with `overflow-y-auto`
- Use shadcn/ui `Dialog` component
- Close on overlay click (default behavior)

### Typography
- Headings: Use semantic HTML (`h1`, `h2`, etc.)
- Body text: 16px minimum for readability
- Line clamping: Use `line-clamp-2` for titles, `line-clamp-3` for descriptions
- Font family: System font stack (via Tailwind)

## Interaction Standards

### Touch Targets
- Minimum size: 44x44px for mobile
- Add `touch-none` class for draggable elements
- Support both mouse and touch events

### Hover States
- Always provide visual feedback on interactive elements
- Use `transition-colors` or `transition-all` for smooth animations
- Opacity changes: 80-90% for subtle feedback

### Loading States
- Show loading indicators for async operations
- Disable buttons during submission
- Provide success/error feedback after operations

## Accessibility Standards

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use semantic HTML (`button`, not `div` with onClick)
- Support Tab, Enter, Escape keys

### ARIA Labels
- Add `aria-label` for icon-only buttons
- Use `title` attribute for tooltips
- Proper heading hierarchy

### Color Contrast
- Ensure WCAG AA compliance minimum
- Test in both light and dark modes
- Don't rely on color alone for information

## File Organization Standards

### Component Files
- One component per file
- File name matches component name
- Include JSDoc header comment with description and purpose

### Import Order
1. React imports
2. Third-party libraries
3. UI components (shadcn/ui)
4. Custom components
5. Utilities/hooks
6. Icons (Lucide)
7. Styles (if any)

### Naming Conventions
- Components: PascalCase (`ArticleCard.jsx`)
- Utilities/Hooks: camelCase (`useTheme.js`)
- Constants: UPPER_SNAKE_CASE
- CSS classes: kebab-case (via Tailwind)

---

**Last Updated:** October 26, 2025  
**Maintained By:** Development Team  
**Questions?** Reference this document before implementing new features.
