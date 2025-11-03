# ExportNotesModal Component Creation Prompt

## Overview
Create an `ExportNotesModal.jsx` component for the fieldnotes read-it-later app that allows users to export their annotations, highlights, and notes from articles, videos, and podcasts to various formats and destinations. This is a ReactJS component (JSX) without TypeScript type annotations.

## Component Location
`/components/ExportNotesModal.jsx`

## Purpose
This modal provides a streamlined interface for users to export their notes and annotations from individual content items. It handles:
- Multiple export formats (Markdown, PDF, Plain Text)
- Multiple export destinations (Download, PKM integrations)
- Connected PKM tool detection
- Export confirmation and success feedback

## Design System Compliance

### Grayscale Design System
This component follows the **completely grayscale design system** with these specific exceptions:
- ❌ **NO colors** except for warning/error states (red shades only)
- ❌ **NO blue CheckCircle2 icons** - use grayscale muted-foreground instead
- ✅ **All backgrounds**: bg-background, bg-accent (grayscale tokens only)
- ✅ **All text**: text-foreground, text-muted-foreground, text-primary (grayscale)
- ✅ **All borders**: border-border (grayscale)
- ✅ **Hover states**: hover:bg-accent, hover:text-foreground (grayscale)

### Flat Design System
- **NO drop shadows** (shadow-lg should not be used, rely on borders only)
- **Minimal rounded corners**: Use rounded-lg consistently
- **Flat borders**: Single-pixel borders with border-border
- **No gradients**: Solid backgrounds only
- **Clean separation**: Use borders and spacing, not shadows

## Functional Requirements

### Modal Trigger
- Triggered from article/video/podcast viewer components
- Accessible via "Export Notes" button in content viewer toolbars
- Only enabled when content has annotations/highlights/notes

### Export Options

#### 1. Export Format Selection (Required)
Radio group with three options:

**Markdown (.md)** - Default Selected
- Icon: FileText (16px, text-muted-foreground)
- Label: "Markdown (.md)"
- Description: "Best for note-taking apps"
- Value: "markdown"
- State: Default selected

**PDF (.pdf)**
- Icon: FileText (16px, text-muted-foreground)
- Label: "PDF (.pdf)"
- Description: "Universal format, read-only"
- Value: "pdf"

**Plain Text (.txt)**
- Icon: FileText (16px, text-muted-foreground)
- Label: "Plain Text (.txt)"
- Description: "Simple, unformatted text"
- Value: "txt"

#### 2. Export Destination Selection (Required)
Radio group with dynamic options:

**Download File** (Always available) - Default Selected
- Icon: FileDown (16px, text-muted-foreground)
- Label: "Download File"
- Description: "Save to your device"
- Value: "download"
- State: Default selected

**PKM Integration Options** (Conditional)
- Only shown if user has connected integrations
- Each integration shows:
  - Icon: CheckCircle2 (16px, **text-muted-foreground** - grayscale only!)
  - Label: Integration name (e.g., "Notion", "Obsidian")
  - Description: "Export to your {name} workspace"
  - Value: integration.id

**No Integrations Message** (Conditional)
- Shown when no PKM tools are connected
- Background: bg-accent
- Text size: 13px, text-muted-foreground
- Contains link to "Settings → Knowledge & Linking"
- Link styling: text-primary hover:underline (grayscale)
- Button component wrapped in text for inline link

### Supported PKM Integrations
The component recognizes these integrations (from settings/state):
- Notion
- Obsidian
- Logseq
- Zotero

### Actions
- **Cancel** button (variant="outline"): Closes modal without exporting
- **Export** button (default variant): 
  - Icon: FileDown (16px)
  - Triggers export with selected format/destination
  - Shows success toast
  - Closes modal

## UI/UX Requirements

### Layout Structure
```
┌───────────────────────────────────────────┐
│  [FileDown Icon] Export Notes        [X]  │  ← Sticky Header
├───────────────────────────────────────────┤
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ Exporting notes from:               │ │  ← Article Title Box
│  │ {Article Title (line-clamp-2)}      │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Export Format                            │  ← Section Label
│  ┌─────────────────────────────────────┐ │
│  │ (•) [FileText] Markdown (.md)       │ │  ← Selected
│  │     Best for note-taking apps       │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ ( ) [FileText] PDF (.pdf)           │ │
│  │     Universal format, read-only     │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ ( ) [FileText] Plain Text (.txt)    │ │
│  │     Simple, unformatted text        │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Export To                                │  ← Section Label
│  ┌─────────────────────────────────────┐ │
│  │ (•) [FileDown] Download File        │ │  ← Selected
│  │     Save to your device             │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ ( ) [CheckCircle2] Notion           │ │  ← If connected
│  │     Export to your Notion workspace │ │    (icon is grayscale!)
│  └─────────────────────────────────────┘ │
│                                           │
│  OR (if no integrations):                 │
│  ┌─────────────────────────────────────┐ │
│  │ No PKM integrations connected.      │ │  ← Info box
│  │ Visit Settings → Knowledge & Link.. │ │
│  └─────────────────────────────────────┘ │
│                                           │
├───────────────────────────────────────────┤
│                        [Cancel] [Export]  │  ← Sticky Footer
└───────────────────────────────────────────┘
```

### Styling Guidelines

#### Overall Modal
- **Fixed positioning**: `fixed inset-0 z-50 flex items-center justify-center`
- **Backdrop**: `absolute inset-0 bg-black/50` (semi-transparent black)
- **Modal container**: `relative bg-background border border-border rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto`
- **NO shadow-lg**: Remove all drop shadows, use border only for separation
- **Max Width**: max-w-md (28rem / 448px)
- **Mobile margins**: mx-4 for safe spacing
- **Scrollable**: max-h-[90vh] overflow-y-auto for long content

#### Header (Sticky)
- **Position**: `sticky top-0 bg-background`
- **Border**: `border-b border-border`
- **Padding**: `px-6 py-4`
- **Layout**: `flex items-center justify-between`
- **Left section**: 
  - Flex container with gap-2
  - FileDown icon: 20px, text-primary (grayscale primary)
  - Title: text-[18px], no font size/weight classes
- **Right section**:
  - X button: text-muted-foreground hover:text-foreground transition-colors
  - X icon: 20px

#### Content Area
- **Padding**: `px-6 py-6`
- **Spacing**: `space-y-6` between sections

#### Article Title Display Box
- **Background**: `bg-accent` (light gray)
- **Padding**: `p-3`
- **Rounded**: `rounded-lg`
- **Label**: 
  - "Exporting notes from:"
  - Size: text-[12px]
  - Color: text-muted-foreground
  - Margin: mb-1
- **Title text**:
  - Size: text-[14px]
  - Truncation: line-clamp-2 (max 2 lines)
  - Color: Default foreground

#### Section Labels
- **Component**: ShadCN Label component
- **Size**: text-[14px]
- **Margin**: mb-3
- **Display**: block

#### Radio Group Options
Each radio option container:
- **Border**: `border border-border`
- **Padding**: `p-3`
- **Rounded**: `rounded-lg`
- **Hover**: `hover:bg-accent transition-colors`
- **Layout**: `flex items-center space-x-3`
- **RadioGroupItem**: Standard ShadCN component
- **Label**: 
  - `flex-1 cursor-pointer text-[14px]`
  - Contains icon + text + description

Icon + Text structure:
- **Icon container**: `flex items-center gap-2`
- **Icon**: 16px, text-muted-foreground (grayscale!)
- **Text**: Default foreground
- **Description**: 
  - `text-[12px] text-muted-foreground mt-0.5`
  - Sits below the main label

#### No Integrations Info Box
- **Container**: `p-4 bg-accent rounded-lg`
- **Text**: `text-[13px] text-muted-foreground`
- **Link button**: 
  - Inline button element
  - Class: `text-primary hover:underline`
  - Text: "Settings → Knowledge & Linking"

#### Footer (Sticky)
- **Position**: `sticky bottom-0 bg-background`
- **Border**: `border-t border-border`
- **Padding**: `px-6 py-4`
- **Layout**: `flex items-center justify-end gap-3`
- **Cancel button**: `<Button variant="outline">Cancel</Button>`
- **Export button**: 
  - `<Button>...</Button>` (default variant)
  - Contains FileDown icon (16px) with mr-2

### Typography Scale
- **Modal Title**: 18px (text-[18px])
- **Section Labels**: 14px (text-[14px])
- **Option Labels**: 14px (text-[14px])
- **Option Descriptions**: 12px (text-[12px])
- **Article Title Label**: 12px (text-[12px])
- **Article Title**: 14px (text-[14px])
- **No Integration Message**: 13px (text-[13px])

**IMPORTANT**: Do not use Tailwind typography classes like text-lg, font-bold, etc. Use exact pixel values only (text-[14px], text-[12px], etc.)

### Responsive Design
- **Desktop**: Centered modal with max-width
- **Tablet**: Same as desktop
- **Mobile**: 
  - Modal with mx-4 margins
  - max-h-[90vh] with overflow-y-auto
  - Touch-friendly tap targets (44px+ height)
  - Radio options stack vertically with space-y-2

## Component Structure

### Props
```javascript
// Function component props (no TypeScript)
// isOpen: boolean
// onClose: function
// articleTitle: string
// onExport: function(format, destination)
```

### State Management
```javascript
const [selectedFormat, setSelectedFormat] = useState("markdown");
const [selectedDestination, setSelectedDestination] = useState("download");
```

### Integration Detection
```javascript
// Mock data for PKM integrations (in production, from global state/context)
const connectedIntegrations = [
  { id: "notion", name: "Notion", connected: false },
  { id: "obsidian", name: "Obsidian", connected: false },
  { id: "logseq", name: "Logseq", connected: false },
  { id: "zotero", name: "Zotero", connected: false },
];

const activeIntegrations = connectedIntegrations.filter(i => i.connected);
```

## Behavior & Interactions

### Opening/Closing
1. Modal renders when `isOpen` prop is `true`
2. Returns `null` when `isOpen` is `false` (conditional rendering)
3. **Backdrop click** calls `onClose` (click on backdrop div)
4. **X button click** calls `onClose`
5. **Cancel button click** calls `onClose`

### Export Process Flow
1. User selects export format (radio group updates selectedFormat state)
2. User selects export destination (radio group updates selectedDestination state)
3. User clicks Export button
4. `handleExport` function executes:
   - Calls `onExport(selectedFormat, selectedDestination)` callback
   - Generates success toast message with format/destination details
   - Calls `onClose()` to dismiss modal

### Toast Message Format
```javascript
const handleExport = () => {
  onExport(selectedFormat, selectedDestination);
  
  // Generate toast message
  const formatName = selectedFormat.toUpperCase();
  const destinationName = selectedDestination === "download" 
    ? "your device" 
    : connectedIntegrations.find(i => i.id === selectedDestination)?.name || selectedDestination;
  
  toast.success(`Notes exported successfully!`, {
    description: `Exported as ${formatName} to ${destinationName}`,
  });
  
  onClose();
};
```

Example toast outputs:
- "Exported as MARKDOWN to your device"
- "Exported as PDF to Notion"
- "Exported as TXT to Obsidian"

## Dependencies

### Required Imports
```javascript
import { useState } from "react";
import { X, FileText, FileDown, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
```

### ShadCN Components Used
- `Button` (`/components/ui/button.jsx`) - Cancel and Export buttons
- `RadioGroup` & `RadioGroupItem` (`/components/ui/radio-group.jsx`) - Format and destination selection
- `Label` (`/components/ui/label.jsx`) - Section headers and radio labels

### External Libraries
- `sonner@2.0.3` - Toast notifications (must import with version: `from "sonner@2.0.3"`)
- `lucide-react` - Icons (X, FileText, FileDown, CheckCircle2)

### Icon Usage
All icons from `lucide-react`:
- **FileDown** (20px) - Modal header icon, download option, export button
- **FileText** (16px) - Format options (Markdown, PDF, TXT)
- **CheckCircle2** (16px, **text-muted-foreground**) - Connected integrations (grayscale!)
- **X** (20px) - Close button

## Integration Notes

### Usage in Content Viewers
The modal is used in:
- `ArticleViewer.jsx` - Text articles
- `VideoViewer.jsx` - Video content  
- `PodcastViewer.jsx` - Audio content

Each viewer should:
1. Maintain modal open/close state with useState
2. Pass current content title as articleTitle prop
3. Implement onExport handler function
4. Only show "Export Notes" button when content has annotations/highlights/notes

### Example Implementation in Viewer
```javascript
import { useState } from "react";
import { FileDown } from "lucide-react";
import ExportNotesModal from "./ExportNotesModal";

export default function ArticleViewer({ article }) {
  const [showExportModal, setShowExportModal] = useState(false);
  
  const handleExport = (format, destination) => {
    // Implementation depends on destination
    if (destination === "download") {
      // Generate and download file
      downloadNotesFile(article, format);
    } else {
      // Send to PKM integration API
      exportToPKM(article, format, destination);
    }
  };
  
  return (
    <div>
      {/* Viewer toolbar */}
      <button 
        onClick={() => setShowExportModal(true)}
        className="flex items-center gap-2"
      >
        <FileDown size={16} />
        Export Notes
      </button>
      
      {/* Export modal */}
      <ExportNotesModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        articleTitle={article.title}
        onExport={handleExport}
      />
    </div>
  );
}
```

### Future Backend Integration
When implementing actual export functionality:

1. **Markdown Export**:
   - Generate markdown with frontmatter (title, date, tags)
   - Include all highlights with color annotations
   - Include all notes with timestamps
   - Format for note-taking apps (Obsidian, Logseq syntax)

2. **PDF Export**:
   - Use library like jsPDF or browser print API
   - Format highlights with background colors
   - Include notes as annotations or sidebar
   - Maintain reading flow and structure

3. **Plain Text Export**:
   - Strip all formatting
   - Use simple separators (---, ***, etc.)
   - Include highlights and notes inline
   - Maximum compatibility

4. **Download Implementation**:
   ```javascript
   function downloadNotesFile(article, format) {
     const content = generateExportContent(article, format);
     const blob = new Blob([content], { type: getMimeType(format) });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `${sanitizeFilename(article.title)}.${format}`;
     a.click();
     URL.revokeObjectURL(url);
   }
   ```

5. **PKM Integration**:
   - Call respective API endpoints (Notion API, Obsidian Local REST, etc.)
   - Handle authentication tokens
   - Map fieldnotes structure to destination format
   - Handle rate limits and errors

## Accessibility Considerations

1. **Keyboard Navigation**:
   - Modal backdrop is clickable
   - X button is keyboard accessible (button element)
   - Radio groups are keyboard navigable (arrow keys)
   - Tab order: Close button → Format options → Destination options → Cancel → Export

2. **Screen Readers**:
   - RadioGroup and RadioGroupItem have built-in ARIA labels
   - Label components properly associate with form controls
   - Modal title is readable
   - Button labels are descriptive

3. **Focus Management**:
   - Focus should move to modal when opened (implement with useEffect + ref)
   - Focus should return to trigger button when closed
   - Tab trapping within modal

4. **Visual Feedback**:
   - Hover states on all interactive elements
   - Selected radio buttons are visually distinct
   - Focus rings on keyboard navigation
   - Button states (hover, active) are clear

## Grayscale Design Compliance Checklist

✅ **Backgrounds**: Only bg-background, bg-accent
✅ **Text Colors**: Only text-foreground, text-muted-foreground, text-primary
✅ **Borders**: Only border-border
✅ **Icons**: All icons use text-muted-foreground (including CheckCircle2!)
✅ **Hover States**: Only hover:bg-accent, hover:text-foreground
✅ **No Blue**: CheckCircle2 is NOT text-blue-500, it's text-muted-foreground
✅ **No Shadows**: Removed shadow-lg, using borders only
✅ **Minimal Rounding**: Consistent rounded-lg
✅ **Links**: text-primary with hover:underline (grayscale primary token)
✅ **Exception**: Only warning/error toasts can use red shades

**CRITICAL**: The CheckCircle2 icon for connected integrations must be `text-muted-foreground` (grayscale), NOT `text-blue-500`. This is a requirement of the grayscale design system.

## Flat Design Compliance Checklist

✅ **No Drop Shadows**: Removed all shadow classes (shadow-lg, etc.)
✅ **Border Separation**: Using border-border for visual separation
✅ **Minimal Rounding**: Consistent rounded-lg (not rounded-2xl or rounded-full)
✅ **No Gradients**: All backgrounds are solid colors
✅ **Clean Hierarchy**: Using padding and borders, not shadows
✅ **Simple Borders**: Single-pixel borders with border class

## Error Handling

### Potential Errors
- Export fails due to network issues
- PKM integration API not accessible
- File generation fails (out of memory, etc.)
- Invalid content/no annotations to export

### Error Display
Use `toast.error()` for all errors:

```javascript
// Network error example
toast.error("Export failed", {
  description: "Could not connect to server. Please check your connection.",
});

// PKM integration error example
toast.error("Export to Notion failed", {
  description: "Your Notion integration may have expired. Reconnect in Settings.",
});

// No content error example
toast.error("Nothing to export", {
  description: "This article has no highlights or notes yet.",
});
```

Error toast styling:
- Uses red shades (allowed exception to grayscale rule)
- Standard sonner error styling
- Descriptive error messages with actionable next steps

## Testing Checklist

### Functionality
- [ ] Modal opens when isOpen is true
- [ ] Modal returns null when isOpen is false
- [ ] Backdrop click closes modal (calls onClose)
- [ ] X button click closes modal (calls onClose)
- [ ] Cancel button click closes modal (calls onClose)
- [ ] Format radio selection updates selectedFormat state
- [ ] Destination radio selection updates selectedDestination state
- [ ] Only one format can be selected at a time
- [ ] Only one destination can be selected at a time
- [ ] Export button triggers onExport with correct (format, destination)
- [ ] Success toast appears after export with correct message
- [ ] Modal closes automatically after successful export

### Content Display
- [ ] Article title displays correctly
- [ ] Article title truncates after 2 lines (line-clamp-2)
- [ ] Long article titles don't break layout
- [ ] All format options render with correct icons and text
- [ ] All destination options render when integrations connected
- [ ] No integrations message shows when none connected
- [ ] Settings link in no integrations message is clickable

### Visual Design
- [ ] Modal is centered on screen
- [ ] Backdrop is semi-transparent black (bg-black/50)
- [ ] NO drop shadows on modal (border only)
- [ ] All colors are grayscale (no blue CheckCircle2!)
- [ ] CheckCircle2 icon is text-muted-foreground
- [ ] Hover states work on all radio options
- [ ] Hover states work on buttons
- [ ] All rounded corners are rounded-lg
- [ ] Borders are single-pixel border-border

### Responsive Design
- [ ] Modal has mx-4 margins on mobile
- [ ] Modal is scrollable when content exceeds viewport
- [ ] max-h-[90vh] prevents modal from exceeding screen
- [ ] Radio options are touch-friendly on mobile
- [ ] Buttons are touch-friendly on mobile
- [ ] Layout doesn't break on small screens

### Accessibility
- [ ] Keyboard navigation works (Tab key)
- [ ] Radio groups navigable with arrow keys
- [ ] Escape key closes modal (if implemented)
- [ ] Focus is visible on all interactive elements
- [ ] Screen reader announces modal content
- [ ] ARIA labels are correct

### Integration
- [ ] Works correctly in ArticleViewer
- [ ] Works correctly in VideoViewer
- [ ] Works correctly in PodcastViewer
- [ ] onExport callback receives correct parameters
- [ ] Toast messages display correct format names
- [ ] Toast messages display correct destination names

## Implementation Notes

### State Management
- Keep format and destination state separate (two useState calls)
- Default format: "markdown"
- Default destination: "download"
- State resets not needed (modal recreates on each open)

### RadioGroup Usage
```javascript
<RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
  <div className="space-y-2">
    {/* Radio options */}
  </div>
</RadioGroup>
```

The RadioGroup component handles:
- Mutual exclusion (only one selected)
- Value updates via onValueChange callback
- Keyboard navigation
- ARIA attributes

### Backdrop Scrolling
- Modal uses fixed positioning
- Backdrop covers full viewport
- Consider adding body scroll lock when modal is open (optional enhancement)

### Modal Scrolling
- Content area scrolls with `overflow-y-auto`
- Header and footer are sticky
- Works well with long content or small screens

## Related Components
Reference these components for consistency:
- `/components/CompletionModal.jsx` - Modal structure, sticky header/footer pattern
- `/components/ReaderSettingsModal.jsx` - Radio group patterns, modal interactions
- `/components/BulkTagModal.jsx` - Modal interaction patterns, button layouts
- `/components/TagManager.jsx` - Popover/modal closing behavior, backdrop clicks

## Future Enhancements (Optional)

1. **Export Preview**: Show preview of exported content before saving
2. **Custom Templates**: Allow users to customize export format templates in Settings
3. **Batch Export**: Export notes from multiple articles at once (from Dashboard)
4. **Cloud Storage**: Add Dropbox, Google Drive, OneDrive destinations
5. **Email Export**: Send notes directly to email address
6. **Scheduled Exports**: Automatic periodic exports (daily digest)
7. **Export History**: Track what's been exported, when, and to where
8. **Filter Export Content**: Checkboxes to choose which annotations/highlights to include
9. **Include Article Text**: Option to include original article text with notes
10. **Export Statistics**: Show counts (X highlights, Y notes) before export

## Code Example (Full Structure)

```javascript
import { useState } from "react";
import { X, FileText, FileDown, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";

export default function ExportNotesModal({
  isOpen,
  onClose,
  articleTitle,
  onExport,
}) {
  const [selectedFormat, setSelectedFormat] = useState("markdown");
  const [selectedDestination, setSelectedDestination] = useState("download");

  // Mock integration data (from global state in production)
  const connectedIntegrations = [
    { id: "notion", name: "Notion", connected: false },
    { id: "obsidian", name: "Obsidian", connected: false },
    { id: "logseq", name: "Logseq", connected: false },
    { id: "zotero", name: "Zotero", connected: false },
  ];

  const activeIntegrations = connectedIntegrations.filter(i => i.connected);

  const handleExport = () => {
    onExport(selectedFormat, selectedDestination);
    
    const formatName = selectedFormat.toUpperCase();
    const destinationName = selectedDestination === "download" 
      ? "your device" 
      : connectedIntegrations.find(i => i.id === selectedDestination)?.name || selectedDestination;
    
    toast.success(`Notes exported successfully!`, {
      description: `Exported as ${formatName} to ${destinationName}`,
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal (NO shadow-lg!) */}
      <div className="relative bg-background border border-border rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDown size={20} className="text-primary" />
            <h2 className="text-[18px]">Export Notes</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Article Title */}
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-[12px] text-muted-foreground mb-1">Exporting notes from:</p>
            <p className="text-[14px] line-clamp-2">{articleTitle}</p>
          </div>

          {/* Export Format */}
          <div>
            <Label className="text-[14px] mb-3 block">Export Format</Label>
            <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
              <div className="space-y-2">
                {/* Format options... */}
              </div>
            </RadioGroup>
          </div>

          {/* Export Destination */}
          <div>
            <Label className="text-[14px] mb-3 block">Export To</Label>
            <RadioGroup value={selectedDestination} onValueChange={setSelectedDestination}>
              <div className="space-y-2">
                {/* Destination options... */}
                {activeIntegrations.length === 0 && (
                  <div className="p-4 bg-accent rounded-lg">
                    <p className="text-[13px] text-muted-foreground">
                      No PKM integrations connected. Visit{" "}
                      <button className="text-primary hover:underline">
                        Settings → Knowledge & Linking
                      </button>{" "}
                      to connect Notion, Obsidian, Logseq, or Zotero.
                    </p>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <FileDown size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Summary

The ExportNotesModal is a focused, single-purpose modal that:
- Provides clear export options (format + destination)
- Follows the grayscale, flat design system strictly
- Works consistently across all content viewers
- Gives immediate feedback via toast notifications
- Is fully keyboard accessible
- Handles both local downloads and PKM integrations
- Has a clean, professional appearance with no colors except grayscale (and red for errors)
- Uses borders for separation instead of drop shadows
- Maintains consistency with other modals in the app

The component is production-ready but will need backend integration for actual file generation and PKM API calls.
