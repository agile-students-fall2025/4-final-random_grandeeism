# ArticleViewer Component Creation Prompt

## Overview
Create an `ArticleViewer.tsx` component for the fieldnotes read-it-later app that provides a distraction-free, feature-rich reading experience for text articles. This component is the core reading interface with support for multi-color highlighting, annotations, reader customization, and workflow management.

## Component Location
`/components/ArticleViewer.tsx`

## Purpose
This component serves as the primary text article reading interface with advanced annotation capabilities. It should:
- Display articles in a clean, distraction-free layout
- Support multi-color text highlighting
- Enable timestamped annotations and notes
- Provide reader customization (font size, family, theme)
- Integrate with workflow statuses (Inbox → Daily Reading → Continue Reading → Rediscovery → Archive)
- Track reading progress and prompt for reflections on completion
- Route to VideoViewer or PodcastViewer for non-text content

## Functional Requirements

### Content Type Detection & Routing

The ArticleViewer performs content type detection and routes accordingly:

#### Video Detection
```typescript
const isVideo = article.mediaType === "video" || 
  article.url.includes("youtube.com") || 
  article.url.includes("youtu.be") ||
  article.videoId;

if (isVideo) {
  return <VideoViewer article={article} onUpdateArticle={onUpdateArticle} onClose={onClose} />;
}
```

#### Podcast Detection
```typescript
const isPodcast = article.mediaType === "podcast" || article.podcastUrl;

if (isPodcast) {
  return <PodcastViewer article={article} onUpdateArticle={onUpdateArticle} onClose={onClose} />;
}
```

### Main Features

#### 1. Reader Display
- Full-screen distraction-free reading view
- Article title, author, publication date, domain
- Reading time estimate
- Body content with proper paragraph formatting
- Optional images (toggleable)
- Scrollable content area

#### 2. Multi-Color Text Highlighting

**Color Palette** (Exception to grayscale theme):
```typescript
const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: 'yellow', light: '#fef08a', dark: '#854d0e' },
  { name: 'Green', value: 'green', light: '#86efac', dark: '#166534' },
  { name: 'Blue', value: 'blue', light: '#93c5fd', dark: '#1e40af' },
  { name: 'Pink', value: 'pink', light: '#f9a8d4', dark: '#9f1239' },
  { name: 'Purple', value: 'purple', light: '#d8b4fe', dark: '#6b21a8' },
];
```

**Highlighting Features**:
- Text selection triggers highlight toolbar
- Toolbar shows 5 color options
- Click color to apply highlight
- Option to add note to highlight
- Highlights persist across sessions
- Click highlighted text to view/edit note

**Highlight Data Structure**:
```typescript
interface Highlight {
  id: string;
  text: string;
  color: string;
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
  note?: string;
  timestamp: Date;
}
```

#### 3. Annotations Panel
- Toggleable side panel (desktop) or bottom panel (mobile)
- Full-article notes (separate from highlight notes)
- Timestamp for all annotations
- Edit/delete annotations
- Markdown support (optional)
- Auto-save on blur

#### 4. Highlights Panel
- Shows all highlights in order
- Color-coded list
- Click to jump to highlight in article
- Add/edit notes for each highlight
- Delete individual highlights
- Filter by color (optional)

#### 5. Reader Customization (ReaderSettingsModal)

**Font Size**:
- Small: 16px
- Medium: 18px (default)
- Large: 20px

**Font Family**:
- Serif: Literata (default, best for reading)
- Sans-serif: Inter
- Monospace: Courier New

**Theme** (Reader-specific, not global):
- Light (default)
- Dark (inverts colors for reading)

**Images**:
- Show images (default)
- Hide images (text only)

#### 6. Status Management

**Current Status Display**:
- Shows icon + label for current queue
- Icons: Inbox, Calendar, BookOpen, RotateCcw, Archive

**Status Change Menu**:
- Context-aware options based on current status
- Quick actions to move between queues
- Metadata updates (scheduledDate, readProgress, etc.)

**Status Options by Current State**:
- **Inbox**: Schedule for Daily Reading, Mark as Unfinished, Archive
- **Daily Reading**: Move to Inbox, Mark as Unfinished, Archive
- **In Progress**: Move to Inbox, Schedule for Daily Reading, Archive
- **Rediscovery**: Move to Inbox, Schedule for Daily Reading, Archive
- **Archived**: Move to Inbox, Schedule for Daily Reading, Continue Reading

**Advance to Next Queue Button**:
- One-click progression through workflow
- Workflow: Inbox → Daily Reading → In Progress → Rediscovery → Archive
- Hidden when in Archive (no next status)
- Hover state shows next queue name

#### 7. Tag Management
- TagManager component integration
- Add/remove/edit tags
- Tag display in header
- Updates article tags in real-time

#### 8. Completion Detection & Modal
- Detects when user scrolls to bottom (within 100px)
- Triggers CompletionModal on first reach
- Prompts for reflection note
- Option to skip or add reflection
- Archives article with optional reflection
- Only shows once per article

#### 9. Favorite Toggle
- Star icon in header
- Filled star when favorited
- Click to toggle favorite status
- Updates article immediately

#### 10. External Actions
- Open original URL in new tab
- Close viewer (return to list)
- Archive button
- Delete button (optional)

## UI/UX Requirements

### Desktop Layout Structure
```
┌────────────────────────────────────────────────────────────────┐
│ [←] [★] Article Title                    [Archive] [Tags] [⋮] │
├────────────────────────────────────────────────────────────────┤
│ Author · Domain · Date · Reading Time                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Article Content                      ┌──────────────────────┐│
│  Lorem ipsum dolor sit amet,          │ Highlights           ││
│  consectetur adipiscing elit.         │                      ││
│  This is highlighted text with        │ [Yellow] "This is..."││
│  a note attached.                     │ Note: Important...   ││
│                                       │                      ││
│  More paragraphs here...              │ [Green] "Another..." ││
│                                       │                      ││
│  [Highlight Toolbar on selection]     │ [Blue] "Third..."    ││
│  [🟡] [🟢] [🔵] [🔴] [🟣]            │                      ││
│                                       └──────────────────────┘│
│                                                                 │
│ [Open Original] [Font Size] [Settings]  [Advance to Next →]   │
└────────────────────────────────────────────────────────────────┘
```

### Mobile Layout Structure
```
┌──────────────────────────────────┐
│ [←]  Article Title          [⋮]  │
├──────────────────────────────────┤
│ Author · Date · 5 min             │
├──────────────────────────────────┤
│                                   │
│  Article Content                  │
│  Lorem ipsum dolor sit amet,      │
│  consectetur adipiscing elit.     │
│                                   │
│  This is highlighted text.        │
│                                   │
│  More paragraphs...               │
│                                   │
│  [Selection → Toolbar appears]    │
│                                   │
├──────────────────────────────────┤
│ [Actions] [Font] [Notes] [Next→] │
└──────────────────────────────────┘

[Bottom Sheet - Highlights]
┌──────────────────────────────────┐
│ Highlights              [Close ×]│
├──────────────────────────────────┤
│ [Yellow] "This is highlighted..."│
│ Note: Important point            │
├──────────────────────────────────┤
│ [Green] "Another highlight..."   │
│ No note                          │
└──────────────────────────────────┘
```

### Styling Guidelines

#### Desktop Styling
- **Layout**: Two-column on wide screens (content + highlights panel)
- **Content Width**: max-w-3xl (768px) for optimal reading
- **Line Height**: Generous (1.8-2.0) for readability
- **Margins**: Ample whitespace around content
- **Highlights Panel**: Fixed right side, max-w-sm (384px)
- **Scroll**: Content area scrollable, header fixed

#### Mobile Styling
- **Layout**: Single column, full width
- **Font Size**: Slightly larger for mobile readability
- **Highlights**: Bottom sheet or modal
- **Actions**: Fixed bottom toolbar
- **Touch Targets**: Minimum 44px for buttons

#### Grayscale Compliance (with exceptions)
- **Base Theme**: Grayscale (bg-background, text-foreground, etc.)
- **Exception**: Highlight colors (5 distinct colors for UX clarity)
- **Reader Theme**: Optional light/dark mode for reading comfort
- **Buttons**: Grayscale except destructive actions (red)
- **Flat Design**: Minimal shadows, simplified UI

#### Component Styling Details

**Header**:
- Fixed top position with border-b border-border
- Padding: px-6 py-4
- Background: bg-background
- Flex layout: items-center justify-between
- Back button (←): Icon button, text-muted-foreground
- Title: Truncate with ellipsis if too long
- Actions: Icon buttons with hover states

**Meta Information**:
- Font size: 14px
- Color: text-muted-foreground
- Separator: " · " between items
- Domain extraction from URL

**Content Area**:
- Background: bg-background
- Padding: px-8 py-12 (desktop), px-4 py-6 (mobile)
- Max width: max-w-3xl mx-auto
- Line height: leading-relaxed

**Paragraphs**:
- Margin: mb-4 between paragraphs
- Font size: Based on fontSize state (16px/18px/20px)
- Font family: Based on fontFamily state
- Text color: text-foreground

**Highlighted Text**:
- Background: Color from highlight.color (light variant)
- Border-radius: rounded-sm
- Cursor: pointer
- Hover: Slightly darker background
- Note indicator: Small icon or underline

**Highlight Toolbar** (appears on text selection):
- Position: Absolute, above selection
- Background: bg-background
- Border: border border-border
- Shadow: shadow-lg
- Rounded: rounded-lg
- Padding: p-2
- Display: Flex row of color buttons
- z-index: z-50

**Color Buttons** (in highlight toolbar):
- Size: w-8 h-8
- Border-radius: rounded-full
- Background: Respective highlight color
- Border: 2px solid when selected
- Hover: Scale slightly (transform scale-105)
- Click: Apply highlight

**Highlights Panel**:
- Position: Fixed right (desktop) or bottom sheet (mobile)
- Width: max-w-sm (desktop)
- Background: bg-accent/50
- Border: border-l border-border
- Padding: p-4
- Scroll: overflow-y-auto
- Max height: calc(100vh - header)

**Highlight List Item**:
- Background: bg-background
- Border: border border-border
- Rounded: rounded-lg
- Padding: p-3
- Margin: mb-2
- Color indicator: Left border (4px solid [color])
- Hover: bg-accent
- Cursor: pointer

**Bottom Toolbar** (desktop):
- Fixed bottom-0
- Background: bg-background
- Border: border-t border-border
- Padding: px-6 py-4
- Flex layout: justify-between items-center
- Buttons: Outline variant, size sm

**Mobile Actions Bar**:
- Fixed bottom-0
- Background: bg-background
- Border: border-t border-border
- Safe area padding
- Icon buttons with labels
- Even spacing

### Typography
- **Article Title**: 28px-32px, font-['New_Spirit:Medium']
- **Meta Info**: 14px, text-muted-foreground
- **Body Text**: 16px/18px/20px (based on setting), line-height: 1.8
- **Highlight Note**: 13px, text-muted-foreground
- **Panel Headers**: 16px, font-['Inter:Medium']

### Responsive Breakpoints
- **Desktop**: > 1024px (two-column layout)
- **Tablet**: 768px - 1024px (single column, wider)
- **Mobile**: < 768px (single column, bottom sheets)

## Component Structure

### Props Interface
```typescript
interface ArticleViewerProps {
  article: Article;
  onClose: () => void;
  onNavigate: (page: string, view?: string) => void;
  onUpdateArticle?: (article: Article) => void;
  onStatusChange?: (articleId: string, newStatus: "inProgress" | "archived") => void;
}
```

### State Management
```typescript
// Reader settings
const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
const [fontFamily, setFontFamily] = useState<'serif' | 'sans-serif' | 'mono'>('serif');
const [showImages, setShowImages] = useState(true);
const [readerTheme, setReaderTheme] = useState<'light' | 'dark'>('light');

// Annotations
const [annotations, setAnnotations] = useState(article.annotations || "");
const [isEditingAnnotations, setIsEditingAnnotations] = useState(false);
const [showAnnotations, setShowAnnotations] = useState(false);

// Highlights
const [highlights, setHighlights] = useState<Highlight[]>(article.highlights || []);
const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);
const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
const [selectedText, setSelectedText] = useState<{
  text: string;
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
} | null>(null);
const [showHighlightsPanel, setShowHighlightsPanel] = useState(false);
const [editingHighlight, setEditingHighlight] = useState<string | null>(null);
const [highlightNote, setHighlightNote] = useState("");

// Modals
const [showNoteModal, setShowNoteModal] = useState(false);
const [showArticleNoteModal, setShowArticleNoteModal] = useState(false);
const [showCompletionModal, setShowCompletionModal] = useState(false);
const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);
const [showReaderSettings, setShowReaderSettings] = useState(false);
const [showStatusMenu, setShowStatusMenu] = useState(false);
const [showTagsMenu, setShowTagsMenu] = useState(false);
const [showMobileActions, setShowMobileActions] = useState(false);

// Workflow
const [isHoveringAdvance, setIsHoveringAdvance] = useState(false);

// Refs
const contentRef = useRef<HTMLDivElement>(null);
```

### Key Functions

#### Content Type Detection
```typescript
const isVideo = article.mediaType === "video" || 
  article.url.includes("youtube.com") || 
  article.url.includes("youtu.be") ||
  article.videoId;

const isPodcast = article.mediaType === "podcast" || article.podcastUrl;

if (isVideo) return <VideoViewer ... />;
if (isPodcast) return <PodcastViewer ... />;
```

#### Scroll Detection for Completion
```typescript
useEffect(() => {
  const handleScroll = () => {
    if (hasShownCompletionModal) return;
    
    const scrollContainer = document.querySelector('[data-name="Article Viewer"] main');
    if (!scrollContainer) return;

    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
    
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && !hasShownCompletionModal) {
      setShowCompletionModal(true);
      setHasShownCompletionModal(true);
    }
  };

  const scrollContainer = document.querySelector('[data-name="Article Viewer"] main');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }
}, [hasShownCompletionModal]);
```

#### Text Selection & Highlighting
```typescript
const handleTextSelection = () => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    setShowHighlightToolbar(false);
    return;
  }

  const selectedText = selection.toString().trim();
  if (!selectedText) return;

  // Calculate position for toolbar
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  setToolbarPosition({
    top: rect.top - 50, // Above selection
    left: rect.left + (rect.width / 2)
  });
  
  // Store selection info
  setSelectedText({
    text: selectedText,
    paragraphIndex: /* calculate */,
    startOffset: /* calculate */,
    endOffset: /* calculate */
  });
  
  setShowHighlightToolbar(true);
};

const applyHighlight = (color: string) => {
  if (!selectedText) return;
  
  const newHighlight: Highlight = {
    id: Date.now().toString(),
    text: selectedText.text,
    color,
    paragraphIndex: selectedText.paragraphIndex,
    startOffset: selectedText.startOffset,
    endOffset: selectedText.endOffset,
    timestamp: new Date()
  };
  
  setHighlights([...highlights, newHighlight]);
  
  // Update article
  if (onUpdateArticle) {
    onUpdateArticle({
      ...article,
      highlights: [...highlights, newHighlight],
      hasAnnotations: true
    });
  }
  
  setShowHighlightToolbar(false);
  window.getSelection()?.removeAllRanges();
};
```

#### Status Management
```typescript
const handleStatusChange = (newStatus: Article["status"]) => {
  if (onUpdateArticle) {
    const updates: Partial<Article> = { status: newStatus };
    
    if (newStatus === "dailyReading") {
      updates.scheduledDate = new Date();
    }
    
    if (newStatus === "inProgress") {
      updates.readProgress = 30;
    }
    
    if (newStatus === "archived") {
      updates.isRead = true;
      updates.dateRead = new Date();
    }
    
    if (newStatus === "rediscovery") {
      const rediscoveryDate = new Date();
      rediscoveryDate.setDate(rediscoveryDate.getDate() + 7);
      updates.rediscoveryDate = rediscoveryDate;
      updates.isRead = true;
    }
    
    onUpdateArticle({ ...article, ...updates });
  }
  setShowStatusMenu(false);
};

const handleStatusAdvance = () => {
  const nextStatus = getNextStatus();
  if (nextStatus) {
    handleStatusChange(nextStatus);
  }
};

const getNextStatus = () => {
  switch (article.status) {
    case "inbox": return "dailyReading";
    case "dailyReading": return "inProgress";
    case "inProgress": return "rediscovery";
    case "rediscovery": return "archived";
    case "archived": return null;
    default: return null;
  }
};
```

#### Completion Handling
```typescript
const handleComplete = (reflection: string) => {
  if (onUpdateArticle) {
    onUpdateArticle({
      ...article,
      status: "archived",
      isRead: true,
      dateRead: new Date(),
      completionReflection: reflection,
      hasAnnotations: reflection ? true : article.hasAnnotations,
    });
  }
  setShowCompletionModal(false);
  setTimeout(() => onClose(), 300);
};

const handleSkipCompletion = () => {
  setShowCompletionModal(false);
};
```

## Behavior & Interactions

### Opening Article
1. Component receives article prop
2. Detects content type (article/video/podcast)
3. Routes to appropriate viewer if not text
4. If text, displays article content
5. Loads saved highlights and annotations
6. Sets default reader settings (or loads from preferences)

### Text Selection & Highlighting
1. User selects text with mouse/touch
2. Highlight toolbar appears above selection
3. User clicks color button
4. Highlight applied with background color
5. Highlight saved to state and article
6. Toolbar closes
7. Selection cleared

### Adding Notes to Highlights
1. User clicks highlighted text
2. Note modal opens
3. User enters note text
4. Note saved to highlight
5. Visual indicator shows highlight has note
6. Note visible in highlights panel

### Highlights Panel
1. Shows all highlights in document order
2. Each item shows:
   - Highlighted text excerpt
   - Color indicator
   - Note (if exists)
   - Timestamp
3. Click highlight to:
   - Jump to location in article
   - Edit note
   - Delete highlight

### Annotations
1. User clicks annotations button
2. Panel opens (side on desktop, bottom on mobile)
3. User can write/edit full-article notes
4. Auto-saves on blur
5. Stored separately from highlight notes

### Reader Settings
1. User clicks settings button
2. ReaderSettingsModal opens
3. User adjusts:
   - Font size (3 options)
   - Font family (3 options)
   - Images visibility (on/off)
   - Reader theme (light/dark)
4. Changes apply immediately
5. Settings saved to preferences (optional)

### Status Changes
1. User clicks status button or dropdown
2. Menu shows available status transitions
3. User selects new status
4. Article metadata updated accordingly
5. Toast notification confirms change
6. Article appears in new queue

### Advancing to Next Queue
1. User clicks "Advance" button
2. Article moves to next status in workflow
3. Metadata updated (scheduled date, read progress, etc.)
4. Toast confirms movement
5. Hover shows next queue name

### Completion Flow
1. User scrolls to bottom of article
2. CompletionModal triggers (first time only)
3. User prompted for reflection
4. Options:
   - Skip: Archive without reflection
   - Add reflection: Archive with note
5. Article archived
6. Viewer closes (optional)

### Favorite Toggle
1. User clicks star icon
2. Icon fills/unfills
3. Article isFavorite updated
4. Toast confirms (optional)

### Tag Management
1. User clicks tags button
2. TagManager modal opens
3. User adds/removes tags
4. Tags update in real-time
5. Changes saved to article

### External Link
1. User clicks "Open Original" button
2. Article URL opens in new tab
3. Viewer remains open

### Close Viewer
1. User clicks back/close button
2. All changes saved
3. Returns to article list

## Dependencies

### Required Imports
```typescript
import { useState, useRef, useEffect } from "react";
import { 
  X, ExternalLink, Edit, Archive, Star, Home, Search, Tag, 
  BarChart3, Save, StickyNote, Highlighter, Trash2, BookmarkPlus, 
  BookOpen, ChevronDown, Calendar, Clock, Check, NotebookPen, 
  MoreVertical, Settings, Inbox, RotateCcw, PanelBottomClose 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Article, Highlight } from "../types/article";
import VideoViewer from "./VideoViewer";
import PodcastViewer from "./PodcastViewer";
import TagManager from "./TagManager";
import CompletionModal from "./CompletionModal";
import ReaderSettingsModal from "./ReaderSettingsModal";
```

### Type Definitions
```typescript
interface Article {
  id: string;
  title: string;
  url: string;
  description: string;
  content?: string;
  author?: string;
  publishedDate?: Date;
  readingTime: string;
  status: "inbox" | "dailyReading" | "inProgress" | "rediscovery" | "archived";
  isFavorite: boolean;
  tags: string[];
  dateAdded: Date;
  isRead: boolean;
  hasAnnotations: boolean;
  highlights?: Highlight[];
  annotations?: string;
  completionReflection?: string;
  readProgress?: number;
  scheduledDate?: Date;
  dateRead?: Date;
  rediscoveryDate?: Date;
  mediaType?: "article" | "video" | "podcast";
  videoId?: string;
  podcastUrl?: string;
}

interface Highlight {
  id: string;
  text: string;
  color: string;
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
  note?: string;
  timestamp: Date;
}
```

## Integration Notes

### Parent Component (TextPage) Integration
```typescript
import ArticleViewer from "./ArticleViewer";

const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

const handleUpdateArticle = (updatedArticle: Article) => {
  setArticles(articles.map(a => 
    a.id === updatedArticle.id ? updatedArticle : a
  ));
};

{selectedArticle && (
  <ArticleViewer
    article={selectedArticle}
    onClose={() => setSelectedArticle(null)}
    onNavigate={handleNavigate}
    onUpdateArticle={handleUpdateArticle}
  />
)}
```

### Routing to Video/Podcast Viewers
The ArticleViewer automatically detects content type and routes:
- If video: Renders `<VideoViewer />`
- If podcast: Renders `<PodcastViewer />`
- If article: Renders article reading interface

This makes ArticleViewer the universal entry point for all content types.

## Accessibility Considerations

1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Arrow keys for scrolling
   - Escape to close modals/panels
   - Keyboard shortcuts for common actions

2. **Screen Readers**:
   - Semantic HTML structure
   - ARIA labels for icon buttons
   - Alt text for images
   - Announce state changes

3. **Focus Management**:
   - Focus trap in modals
   - Return focus after modal close
   - Visible focus indicators

4. **Text Selection**:
   - Works with keyboard (Shift + arrows)
   - Accessible highlight toolbar

5. **Color Contrast**:
   - Highlights maintain readable contrast
   - Text meets WCAG AA standards
   - Dark mode option for low-light reading

## Highlight Colors Justification

**Exception to Grayscale Theme**:
The ArticleViewer uses 5 distinct highlight colors (yellow, green, blue, pink, purple) intentionally:

1. **Cognitive Load**: Different colors help categorize information mentally
2. **Visual Scanning**: Colors enable quick scanning for specific highlights
3. **Annotation System**: Standard practice in digital reading (Kindle, Apple Books, etc.)
4. **User Expectation**: Readers expect color-based highlighting
5. **Information Hierarchy**: Colors convey meaning (e.g., yellow = important, green = definition)

These colors are:
- Limited to highlighting feature only
- Carefully chosen for accessibility
- Consistent with standard e-reader patterns
- Optional (users can stick to one color)

## Testing Checklist

### Display & Layout
- [ ] Article content renders correctly
- [ ] Title, author, date, domain display
- [ ] Reading time estimate shown
- [ ] Responsive layout (desktop/tablet/mobile)
- [ ] Two-column layout on wide screens
- [ ] Single column on narrow screens
- [ ] Images display when enabled
- [ ] Images hide when disabled

### Reader Settings
- [ ] Font size changes work (small/medium/large)
- [ ] Font family changes work (serif/sans/mono)
- [ ] Images toggle works
- [ ] Reader theme toggle works (light/dark)
- [ ] Settings persist across reopens (if implemented)

### Highlighting
- [ ] Text selection triggers toolbar
- [ ] Toolbar positioned correctly above selection
- [ ] All 5 color buttons work
- [ ] Highlights apply correctly
- [ ] Highlights persist after save
- [ ] Multiple highlights on same paragraph
- [ ] Overlapping highlights handled
- [ ] Click highlight to edit note
- [ ] Delete highlight works

### Highlights Panel
- [ ] Panel toggles open/close
- [ ] All highlights listed
- [ ] Color indicators shown
- [ ] Notes display correctly
- [ ] Click highlight jumps to location
- [ ] Edit note works
- [ ] Delete works
- [ ] Empty state shows when no highlights

### Annotations
- [ ] Annotations panel toggles
- [ ] Can write/edit annotations
- [ ] Auto-save works
- [ ] Annotations persist
- [ ] Character count (if implemented)

### Status Management
- [ ] Current status displays correctly
- [ ] Status menu shows correct options
- [ ] Status changes update article
- [ ] Metadata updates correctly (dates, progress)
- [ ] Advance button works
- [ ] Advance button hidden when in Archive
- [ ] Hover shows next queue name

### Completion
- [ ] Scroll detection triggers modal
- [ ] Modal only shows once per article
- [ ] Skip archives without note
- [ ] Add reflection archives with note
- [ ] hasAnnotations flag updates
- [ ] Viewer closes after completion (if implemented)

### Favorite
- [ ] Star icon toggles filled/unfilled
- [ ] isFavorite updates correctly
- [ ] Visual state matches data

### Tags
- [ ] TagManager opens
- [ ] Tags update in real-time
- [ ] Changes save correctly

### Navigation
- [ ] Back button returns to list
- [ ] Close button works
- [ ] External link opens in new tab
- [ ] Routes to VideoViewer for videos
- [ ] Routes to PodcastViewer for podcasts

### Mobile
- [ ] Touch selection works
- [ ] Bottom action bar visible
- [ ] Panels slide up from bottom
- [ ] All actions accessible
- [ ] Safe area respected

## Known Issues / Edge Cases

1. **Overlapping Highlights**: Complex logic needed for nested/overlapping highlights
2. **Long Articles**: Performance with thousands of paragraphs
3. **Text Selection on Mobile**: May be tricky with custom toolbar
4. **Highlight Position Tracking**: Content changes may break highlight positions
5. **Undo Highlight**: No undo functionality currently
6. **Export Highlights**: No export feature currently

## Future Enhancements (Optional)

1. **Reading Progress Bar**: Visual indicator of scroll position
2. **Estimated Time Remaining**: Dynamic calculation
3. **Read Aloud**: Text-to-speech integration
4. **Dictionary Lookup**: Define words inline
5. **Translation**: Translate selected text
6. **Share Highlight**: Share specific highlights to social media
7. **Export Annotations**: Export all notes/highlights to Markdown/PDF
8. **Collaborative Annotations**: Share annotations with others
9. **Smart Highlighting**: AI-suggested highlights
10. **Reading Streaks**: Track consecutive days reading

## Implementation Notes

- Use `data-name="Article Viewer"` for scroll container targeting
- Store highlights with paragraph indices for stability
- Recalculate highlight positions if content changes
- Debounce auto-save for annotations
- Use portal for modals to avoid z-index issues
- Optimize re-renders with React.memo on sub-components
- Handle edge cases: empty content, missing metadata
- Test with various article lengths and formats

## Related Components
Reference these components for consistency:
- `/components/VideoViewer.tsx` - Similar viewer for videos
- `/components/PodcastViewer.tsx` - Similar viewer for podcasts
- `/components/TagManager.tsx` - Tag management integration
- `/components/CompletionModal.tsx` - Completion flow
- `/components/ReaderSettingsModal.tsx` - Reader customization
- `/components/ContentCard.tsx` - Article preview in lists
