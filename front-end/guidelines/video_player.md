# VideoViewer Component Creation Prompt

## Overview
Create a `VideoViewer.tsx` component for the fieldnotes read-it-later app that provides a comprehensive video watching and annotation experience. This component integrates YouTube videos with timestamped notes, transcript navigation, and workflow management.

## Component Location
`/components/VideoViewer.tsx`

## Example Video Content

**Example YouTube Video ID**: `TNhaISOUy6Q`

This video ID should be used as the default content for all mock video articles in the app. The video ID can be loaded from:
- Full URL: `https://www.youtube.com/watch?v=TNhaISOUy6Q`
- Short URL: `https://youtu.be/TNhaISOUy6Q`
- Direct videoId property: `videoId: "TNhaISOUy6Q"`

**In Mock Data**: All articles with `mediaType: "video"` should use this `videoId` for consistent testing and demonstration.

## Purpose
This component serves as the primary video viewing interface with advanced annotation capabilities. It should:
- Embed and control YouTube videos using YouTube IFrame API
- Support timestamped notes synchronized with video playback
- Display interactive transcript with clickable timestamps
- Integrate with workflow statuses (Inbox → Daily Reading → Continue Reading → Rediscovery → Archive)
- Track watch progress and prompt for reflections on completion
- Provide custom playback controls (desktop and mobile)

## Functional Requirements

### Main Features

#### 1. YouTube Video Integration

**YouTube IFrame API**:
- Dynamically load YouTube IFrame API from `https://www.youtube.com/iframe_api`
- Extract video ID from various YouTube URL formats
- Embed video with custom controls disabled
- Control playback programmatically
- Track playback state and time

**Video ID Extraction**:
```typescript
const getVideoId = (url: string): string | null => {
  const regex = /(?:youtube\\.com\\/(?:[^\\/]+\\/.+\\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\\.be\\/)([^"&?\\/\\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : article.videoId || null;
};
```

**Supported URL Formats**:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- Direct video ID via `article.videoId` property

**Example Implementation**:
```typescript
// In the component
const videoId = getVideoId(article.url);
// For the example: videoId will be "TNhaISOUy6Q"

// YouTube Player initialization
useEffect(() => {
  if (!videoId) return;

  // Load YouTube IFrame API script dynamically
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  // Initialize player when API is ready
  (window as any).onYouTubeIframeAPIReady = () => {
    playerRef.current = new (window as any).YT.Player('youtube-player', {
      videoId: videoId, // "TNhaISOUy6Q" for example video
      playerVars: {
        controls: 0,      // Hide default controls (we build custom ones)
        modestbranding: 1, // Minimal YouTube branding
        rel: 0,           // Don't show related videos
      },
      events: {
        onReady: (event: any) => {
          setDuration(event.target.getDuration());
        },
        onStateChange: handlePlayerStateChange,
      },
    });
  };
}, [videoId]);
```

**Video Container in JSX**:
```typescript
{/* YouTube Player Container */}
<div className="relative aspect-video bg-black">
  <div id="youtube-player" className="w-full h-full"></div>
</div>
```

#### 2. Custom Video Controls

**Desktop Controls**:
- Play/Pause button (large circular button)
- Progress bar with seek functionality
- Current time / Total duration display (MM:SS format)
- Volume control slider (0-100)
- Mute/Unmute button
- Fullscreen button
- Speed control (optional enhancement)

**Mobile Controls**:
- Simplified bottom bar
- Large play/pause button (touch-friendly)
- Progress bar
- Time display
- Volume control
- Fullscreen toggle

**Playback Features**:
- Click progress bar to seek
- Drag progress bar thumb
- Keyboard shortcuts (Space = play/pause)
- Auto-hide controls on inactivity (optional)

#### 3. Timestamped Notes

**Note Structure**:
```typescript
interface VideoAnnotation {
  id: string;
  timestamp: number; // seconds from start
  note: string;
  dateCreated: Date;
}
```

**Note Features**:
- Add note at current timestamp (pauses video)
- Click note to jump to timestamp
- Edit/delete existing notes
- Notes sorted by timestamp automatically
- Visual timeline markers on progress bar (yellow dots)

**Adding Notes Flow**:
1. User clicks "Add Note" button
2. Video pauses (optional)
3. Modal/form opens with current timestamp pre-filled
4. User enters note text
5. Note saved with timestamp to `article.videoAnnotations`
6. Note appears in notes list
7. Yellow marker appears on progress bar
8. `hasAnnotations` flag set to `true`

**Note Interaction**:
- Click note → video seeks to timestamp
- Hover note → shows timestamp tooltip
- Edit note → inline editing or modal
- Delete note → confirmation optional for quick workflow

#### 4. Interactive Transcript

**Transcript Structure**:
```typescript
interface TranscriptSegment {
  start: number;    // start time in seconds
  end: number;      // end time in seconds
  text: string;     // transcript text
}
```

**Transcript Features**:
- Auto-scroll to current segment (optional)
- Highlight active segment during playback
- Click segment to jump to timestamp
- Search transcript (optional enhancement)
- Show/hide transcript panel (tab toggle)

**Transcript Display**:
- Scrollable panel (desktop: right sidebar, mobile: bottom sheet)
- Each segment shows timestamp + text
- Active segment highlighted with `bg-primary/10 border-primary/20`
- Segments with notes highlighted with yellow background
- Click anywhere in segment to seek to start time

**Active Transcript Detection**:
```typescript
const getActiveTranscriptIndex = (): number => {
  return transcript.findIndex(
    (segment) => currentTime >= segment.start && currentTime < segment.end
  );
};
```

#### 5. Notes & Transcript Panel

**Desktop Layout**:
- Fixed right panel (sticky)
- Tabbed interface: "Notes" and "Transcript" tabs
- Shows count on Notes tab: "Notes (3)"
- Scrollable list with `overflow-y-auto`
- Height: `h-[600px]` or similar

**Mobile Layout**:
- Bottom sheet (optional)
- Swipeable tabs
- Collapsible panel
- Overlay when expanded

**Notes List**:
- Chronological order by timestamp
- Each note shows:
  - Timestamp (clickable, font-mono, text-[11px])
  - Note text (text-[14px])
  - Edit/delete buttons (on hover or always visible)
  - Formatted timestamp (MM:SS)

**Note Item Styling**:
```typescript
<div 
  className="group cursor-pointer p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
  onClick={() => jumpToAnnotation(annotation.timestamp)}
>
  <div className="flex items-start justify-between mb-1">
    <span className="text-[11px] text-muted-foreground font-mono">
      {formatTime(annotation.timestamp)}
    </span>
    <button onClick={() => deleteAnnotation(annotation.id)}>
      <X size={14} />
    </button>
  </div>
  <p className="text-[14px] text-foreground">{annotation.note}</p>
</div>
```

#### 6. Status Management

Same workflow as ArticleViewer:
- Current status display with icon
- Status change dropdown menu
- Advance to next queue button with icon animation
- Workflow progression: Inbox → Daily Reading → In Progress → Rediscovery → Archive
- Metadata updates (dates, progress, etc.)

#### 7. Completion Detection

**Triggers**:
- Video playback ends (`YT.PlayerState.ENDED` event)
- Shows `CompletionModal` once per video session
- Prompts for reflection note
- Archives video with optional reflection
- Updates `dateRead`, `isRead`, and `status: "archived"`

**Implementation**:
```typescript
onStateChange: (event: any) => {
  if (event.data === (window as any).YT.PlayerState.ENDED && !hasShownCompletionModal) {
    setShowCompletionModal(true);
    setHasShownCompletionModal(true);
  }
}
```

#### 8. Progress Tracking

**Auto-save Progress**:
- Update `readProgress` periodically during playback
- Save on pause, seek, or close
- Resume from last position on reopen (optional enhancement)

**Progress Calculation**:
```typescript
const progress = (currentTime / duration) * 100;
// Update article progress periodically
onUpdateArticle({
  ...article,
  readProgress: progress
});
```

#### 9. Favorite & Tags

Same as ArticleViewer:
- Star icon to toggle `isFavorite`
- TagManager integration for tag editing
- Real-time updates via `onUpdateArticle`

#### 10. Mobile Optimizations

**Mobile-Specific Features**:
- Larger touch targets for controls (minimum 44px)
- Swipe gestures for seeking (optional)
- Picture-in-Picture support (optional)
- Landscape mode optimization
- Safe area padding for notched devices

## UI/UX Requirements

### Desktop Layout Structure
```
┌────────────────────────────────────────────────────────────────┐
│ [←] Video Title                    [★] [Tags] [Status] [⋮]     │
├────────────────────────────────────────┬───────────────────────┤
│                                        │ ┌─────────────────┐   │
│  ┌──────────────────────────────────┐ │ │ Notes │Transcript│   │
│  │                                  │ │ └─────────────────┘   │
│  │      YouTube Video Player        │ │                       │
│  │      (TNhaISOUy6Q example)       │ │ 0:45 "Key point..."   │
│  │                                  │ │ 2:30 "Important..."   │
│  │  ─●───────── (progress markers)  │ │                       │
│  └──────────────────────────────────┘ │ Click note to jump →  │
│                                        │                       │
│  [▶] ━━━●━━━━━━━━ [🔊] ───── [⛶]    │ [Transcript View]     │
│  2:45 / 10:30                          │ 0:00 Welcome to...    │
│                                        │ 0:15 Today we'll...   │
│  [📝 Add Note at 2:45]                │ 0:30 First, let's...  │
│                                        │                       │
│  Video Title & Description             │ (scrollable)          │
│  Tags: [react] [tutorial]              │                       │
└────────────────────────────────────────┴───────────────────────┘
```

### Mobile Layout Structure
```
┌──────────────────────────────────┐
│ [←]  Video Title            [★]  │
├──────────────────────────────────┤
│                                   │
│  ┌──────────────────────────────┐│
│  │                              ││
│  │   YouTube Video Player       ││
│  │   (TNhaISOUy6Q example)      ││
│  │                              ││
│  └──────────────────────────────┘│
│                                   │
│  [▶] ━━━●━━━━━━━ 2:45 / 10:30    │
│  [🔊] ───── [⛶]                  │
│                                   │
│  [📝 Add Note]  [Notes (3)]  [→] │
│                                   │
│  Video Info & Tags                │
├──────────────────────────────────┤
│ ──── (drag handle)                │
│ [Notes (3)]    [Transcript]       │
│                                   │
│ 0:45 Key point about...           │
│ 2:30 Important detail...          │
│ 4:15 Remember this...             │
└──────────────────────────────────┘
```

### Styling Guidelines

#### Component Styling Details

**Header** (Sticky Top Bar):
- Position: `sticky top-0 z-50`
- Background: `bg-background`
- Border: `border-b border-border`
- Padding: `px-4 md:px-6 py-4`
- Layout: `flex items-center justify-between`
- Same structure as ArticleViewer header

**Video Container**:
- Aspect ratio: `aspect-video` (16:9)
- Background: `bg-black` (for letterboxing)
- Rounded: `rounded-lg`
- Overflow: `overflow-hidden`
- Border: `border border-border`
- Position: `relative` (for overlay controls)

**YouTube IFrame Embed**:
```jsx
<div id="youtube-player" className="w-full h-full"></div>
```
The YouTube API will replace this div with the actual player.

**Custom Controls Panel**:
- Background: `bg-card`
- Border: `border-t border-border`
- Padding: `p-4`
- Layout: Stacked vertically (progress bar, then controls)

**Play/Pause Button**:
- Size: `w-10 h-10`
- Rounded: `rounded-full`
- Background: `bg-primary text-primary-foreground`
- Hover: `hover:opacity-90`
- Icon size: 20px

**Progress Bar**:
- Height: `h-2`
- Background: `bg-muted`
- Rounded: `rounded-lg`
- Cursor: `cursor-pointer`
- Active color: `accent-primary`
- Input range: `appearance-none`

**Annotation Markers on Progress Bar**:
```jsx
{videoAnnotations.map((annotation) => (
  <div
    key={annotation.id}
    className="absolute top-0 w-1 h-full bg-yellow-500"
    style={{
      left: `${(annotation.timestamp / duration) * 100}%`,
    }}
    title={`Note at ${formatTime(annotation.timestamp)}`}
  />
))}
```

**Volume Slider**:
- Width: `w-20` (desktop only)
- Height: `h-1`
- Same styling as progress bar
- Input range component

**Time Display**:
- Font: `font-mono` for alignment
- Size: `text-[12px]`
- Color: `text-muted-foreground`
- Format: `MM:SS / MM:SS`

**Add Note Button**:
- Background: `bg-yellow-500/10 text-yellow-700 dark:text-yellow-400`
- Hover: `hover:bg-yellow-500/20`
- Rounded: `rounded-lg`
- Padding: `px-4 py-2`
- Icon: StickyNote (16px)

**Add Note Form** (when active):
- Background: `bg-yellow-50 dark:bg-yellow-900/20`
- Border: `border-t border-yellow-200 dark:border-yellow-800`
- Padding: `p-4`
- Contains:
  - Timestamp display
  - Textarea for note
  - Cancel/Save buttons

**Notes Panel**:
- Width: `lg:col-span-1` (1/3 of grid on desktop)
- Background: `bg-card`
- Border: `border border-border`
- Rounded: `rounded-lg`
- Position: `sticky top-4` (stays visible while scrolling)

**Tabs (Notes/Transcript)**:
- Layout: `flex border-b border-border`
- Each tab: `flex-1 px-4 py-3`
- Active: `bg-primary text-primary-foreground`
- Inactive: `text-muted-foreground hover:bg-accent`
- Size: `text-[14px]`

**Note Item**:
- Background: `bg-yellow-50 dark:bg-yellow-900/20`
- Border: `border border-yellow-200 dark:border-yellow-800`
- Rounded: `rounded-lg`
- Padding: `p-3`
- Margin: `mb-2` (spacing between notes)
- Cursor: `cursor-pointer`
- Hover: `hover:bg-yellow-100 dark:hover:bg-yellow-900/30`

**Transcript Segment**:
- Padding: `p-3`
- Border: `border border-transparent` (active: `border-primary/20`)
- Background: active ? `bg-primary/10` : `hover:bg-accent`
- Cursor: `cursor-pointer`
- Rounded: `rounded-lg`
- With note: `bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200`

**Timestamp Badge**:
- Font: `font-mono`
- Size: `text-[11px]`
- Color: `text-muted-foreground`
- Format: MM:SS

### Typography
- **Video Title**: `text-[24px] md:text-[28px]`, `font-['New_Spirit:Medium']`
- **Note Text**: `text-[14px]`, `line-height: 1.6`
- **Timestamp**: `text-[11px]` or `text-[12px]`, `font-mono`
- **Transcript Text**: `text-[14px]`, `line-height: 1.6`
- **Control Labels**: `text-[14px]`

### Grayscale Design Compliance

**IMPORTANT**: This component follows the **completely grayscale design system** with these exceptions:
- ✅ **Yellow highlights**: Notes use yellow backgrounds and borders (yellow-500, yellow-50, yellow-900/20)
- ✅ **Yellow markers**: Annotation markers on progress bar are yellow (bg-yellow-500)
- ❌ **NO other colors**: All other UI elements must be grayscale
- ❌ **NO blue, green, or other accent colors**
- ✅ **Exception**: Warning/error states can use red shades

**Allowed Yellow Styles** (for notes only):
- `bg-yellow-50` / `dark:bg-yellow-900/20` - Note backgrounds
- `border-yellow-200` / `dark:border-yellow-800` - Note borders
- `bg-yellow-500/10` - Add note button background
- `text-yellow-700` / `dark:text-yellow-400` - Note button text
- `hover:bg-yellow-500/20` - Add note button hover
- `bg-yellow-500` - Timeline markers

**All Other Elements** (grayscale only):
- Backgrounds: `bg-background`, `bg-card`, `bg-accent`
- Text: `text-foreground`, `text-muted-foreground`, `text-primary`
- Borders: `border-border`
- Hover: `hover:bg-accent`
- Active states: `bg-primary` (grayscale primary)

### Flat Design Compliance
- **NO drop shadows**: Use borders for separation
- **Minimal rounded corners**: `rounded-lg` consistently
- **No gradients**: Solid backgrounds only
- **Clean separation**: Borders and spacing, not shadows

## Component Structure

### Props Interface
```typescript
interface VideoViewerProps {
  article: Article; // Article with video metadata
  onUpdateArticle: (article: Article) => void;
  onClose?: () => void;
}
```

### State Management
```typescript
// Playback state
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [volume, setVolume] = useState(100);
const [isMuted, setIsMuted] = useState(false);

// Notes state
const [showAddNote, setShowAddNote] = useState(false);
const [noteText, setNoteText] = useState("");
const [selectedAnnotation, setSelectedAnnotation] = useState<VideoAnnotation | null>(null);

// UI state
const [showTranscript, setShowTranscript] = useState(true);
const [showStatusMenu, setShowStatusMenu] = useState(false);
const [showTagsMenu, setShowTagsMenu] = useState(false);
const [showCompletionModal, setShowCompletionModal] = useState(false);
const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);
const [isHoveringAdvance, setIsHoveringAdvance] = useState(false);

// Refs
const playerRef = useRef<any>(null);
const intervalRef = useRef<any>(null);

// Data from article
const videoAnnotations = article.videoAnnotations || [];
const transcript = article.transcript || [];
const videoId = getVideoId(article.url);
```

### Key Functions

#### Time Tracking
```typescript
const startTimeTracking = () => {
  intervalRef.current = setInterval(() => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      setCurrentTime(playerRef.current.getCurrentTime());
    }
  }, 100); // Update every 100ms
};

const stopTimeTracking = () => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
};
```

#### Playback Controls
```typescript
const togglePlayPause = () => {
  if (!playerRef.current) return;
  
  if (isPlaying) {
    playerRef.current.pauseVideo();
  } else {
    playerRef.current.playVideo();
  }
};

const handleSeek = (time: number) => {
  if (playerRef.current) {
    playerRef.current.seekTo(time);
    setCurrentTime(time);
  }
};

const handleVolumeChange = (newVolume: number) => {
  setVolume(newVolume);
  if (playerRef.current) {
    playerRef.current.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }
};

const toggleMute = () => {
  if (playerRef.current) {
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }
};
```

#### Note Management
```typescript
const handleAddNote = () => {
  if (!noteText.trim()) return;

  const newAnnotation: VideoAnnotation = {
    id: Date.now().toString(),
    timestamp: currentTime,
    note: noteText,
    dateCreated: new Date(),
  };

  const updatedAnnotations = [...videoAnnotations, newAnnotation].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  onUpdateArticle({
    ...article,
    videoAnnotations: updatedAnnotations,
    hasAnnotations: true,
  });

  setNoteText("");
  setShowAddNote(false);
};

const handlePauseToNote = () => {
  if (playerRef.current) {
    playerRef.current.pauseVideo();
  }
  setShowAddNote(true);
};

const deleteAnnotation = (annotationId: string) => {
  const updatedAnnotations = videoAnnotations.filter(a => a.id !== annotationId);
  onUpdateArticle({
    ...article,
    videoAnnotations: updatedAnnotations,
    hasAnnotations: updatedAnnotations.length > 0,
  });
  setSelectedAnnotation(null);
};

const jumpToAnnotation = (timestamp: number) => {
  handleSeek(timestamp);
};
```

#### Transcript Interaction
```typescript
const getActiveTranscriptIndex = (): number => {
  return transcript.findIndex(
    (segment) => currentTime >= segment.start && currentTime < segment.end
  );
};

const getSegmentAnnotation = (segmentIndex: number): VideoAnnotation | undefined => {
  const segment = transcript[segmentIndex];
  if (!segment) return undefined;

  return videoAnnotations.find(
    (annotation) =>
      annotation.timestamp >= segment.start && annotation.timestamp < segment.end
  );
};
```

#### Time Formatting
```typescript
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

## Behavior & Interactions

### Video Loading Sequence
1. Component mounts with article containing `videoId: "TNhaISOUy6Q"`
2. `getVideoId()` extracts video ID from URL or uses `article.videoId`
3. YouTube IFrame API script loaded dynamically
4. `onYouTubeIframeAPIReady` callback fires when API ready
5. Player initialized with video ID
6. Video metadata loads (duration, thumbnail, etc.)
7. Player ready to accept commands

### Playback Control Flow
1. User clicks play button
2. `togglePlayPause()` called
3. YouTube player API: `playerRef.current.playVideo()`
4. `onStateChange` event fires with `PLAYING` state
5. `setIsPlaying(true)`
6. `startTimeTracking()` begins interval
7. Current time updates every 100ms
8. Progress bar updates position
9. Active transcript segment highlights

### Seeking Flow
1. User clicks on progress bar
2. Calculate time from click position: `(clickX / barWidth) * duration`
3. Call `handleSeek(time)`
4. YouTube player: `playerRef.current.seekTo(time)`
5. Update `currentTime` state
6. Progress bar thumb moves
7. Video jumps to new position
8. Resume playback if was playing

### Adding Notes Flow
1. User clicks "Add Note" button
2. `handlePauseToNote()` pauses video
3. `setShowAddNote(true)` shows note form
4. Note form displays with current timestamp
5. User types note text
6. User clicks "Save Note"
7. `handleAddNote()` creates new annotation
8. Annotation added to sorted list
9. Yellow marker appears on progress bar
10. Note appears in Notes panel
11. Form closes, video can resume

### Jumping to Timestamp Flow
1. User clicks note or transcript segment
2. Extract timestamp from clicked item
3. Call `jumpToAnnotation(timestamp)` or `handleSeek(segment.start)`
4. Video seeks to timestamp
5. Optionally pause to read note
6. Highlight active segment/note

### Completion Flow
1. Video playback reaches end
2. YouTube API fires `onStateChange` with `ENDED` state
3. Check `!hasShownCompletionModal`
4. `setShowCompletionModal(true)`
5. CompletionModal displays
6. User adds optional reflection
7. `handleComplete()` updates article:
   - `status: "archived"`
   - `isRead: true`
   - `dateRead: new Date()`
   - `completionReflection: text`
8. Modal closes
9. Viewer closes (optional)

## Dependencies

### Required Imports
```typescript
import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, StickyNote, X, 
  Clock, ChevronDown, ChevronUp, ArrowLeft, Star, Bookmark, 
  Tag, Calendar, Check, BookmarkPlus, BookOpen, RotateCcw, 
  Inbox, PanelBottomClose, Archive
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Article, VideoAnnotation, TranscriptSegment } from "../types/article";
import TagManager from "./TagManager";
import CompletionModal from "./CompletionModal";
```

### External Scripts
- **YouTube IFrame API**: `https://www.youtube.com/iframe_api`
- Loaded dynamically in useEffect

### Type Definitions
Already defined in `/types/article.ts`:
```typescript
interface VideoAnnotation {
  id: string;
  timestamp: number;
  note: string;
  dateCreated: Date;
}

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}
```

## Mock Data Setup

All video articles in `/data/mockArticles.js` should use the example video ID:

```javascript
{
  id: "14",
  title: "React Hooks Complete Guide - Video Tutorial",
  url: "https://www.youtube.com/watch?v=TNhaISOUy6Q",
  description: "Comprehensive tutorial on React Hooks...",
  readingTime: "45 min",
  isFavorite: true,
  status: "dailyReading",
  tags: ["react", "javascript", "tutorial", "video"],
  dateAdded: new Date(Date.now() - 86400000),
  scheduledDate: new Date(),
  isRead: false,
  hasAnnotations: true,
  mediaType: "video",
  videoId: "TNhaISOUy6Q", // Example video ID
  videoAnnotations: [
    {
      id: "v1",
      timestamp: 45,
      note: "Important: Always use hooks at the top level of components",
      dateCreated: new Date(Date.now() - 3600000)
    },
    {
      id: "v2",
      timestamp: 120,
      note: "useState returns an array with current state and setter function",
      dateCreated: new Date(Date.now() - 3000000)
    }
  ],
  transcript: [
    { start: 0, end: 30, text: "Welcome to this comprehensive guide on React Hooks. Today we'll cover everything you need to know." },
    { start: 30, end: 60, text: "React Hooks were introduced in React 16.8 and completely changed how we write components." },
    { start: 60, end: 95, text: "The most commonly used hook is useState, which lets you add state to functional components." },
    // ... more transcript segments
  ]
}
```

**ALL video type articles** should have:
- `mediaType: "video"`
- `videoId: "TNhaISOUy6Q"`
- Optional: `videoAnnotations` array
- Optional: `transcript` array

## Integration Notes

### Parent Component Integration
```typescript
import VideoViewer from "./VideoViewer";

// In parent component
const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

const handleUpdateArticle = (updatedArticle: Article) => {
  setArticles(articles.map(a => 
    a.id === updatedArticle.id ? updatedArticle : a
  ));
};

// Render VideoViewer when video article selected
{selectedArticle && selectedArticle.mediaType === "video" && (
  <VideoViewer
    article={selectedArticle}
    onUpdateArticle={handleUpdateArticle}
    onClose={() => setSelectedArticle(null)}
  />
)}
```

### Routing from ArticleViewer
The ArticleViewer automatically detects video content and can route to VideoViewer, or VideoViewer can be shown as a standalone component.

## Accessibility Considerations

1. **Keyboard Controls**:
   - Space: Play/pause
   - Arrow keys: Seek forward/backward (optional)
   - M: Mute/unmute (optional)
   - F: Fullscreen (optional)
   - Tab: Navigate controls

2. **Screen Readers**:
   - ARIA labels for all controls
   - Announce playback state changes
   - Accessible time display
   - Note content readable

3. **Focus Management**:
   - Clear focus indicators on all interactive elements
   - Logical tab order
   - Focus trap in modals

4. **Captions**:
   - YouTube's built-in caption support
   - Transcript provides text alternative

## Testing Checklist

### Video Playback
- [ ] Example video (TNhaISOUy6Q) loads correctly
- [ ] Play/pause button works
- [ ] Seeking works (click progress bar)
- [ ] Volume slider works
- [ ] Mute/unmute button works
- [ ] Duration displays correctly
- [ ] Current time updates smoothly
- [ ] Video ends detection triggers completion modal

### Notes
- [ ] "Add Note" button pauses video
- [ ] Note form shows current timestamp
- [ ] Note saves with correct timestamp
- [ ] Notes list shows all notes sorted by time
- [ ] Click note jumps to timestamp
- [ ] Delete note removes from list
- [ ] Yellow markers appear on progress bar
- [ ] hasAnnotations flag updates

### Transcript
- [ ] Transcript displays all segments
- [ ] Active segment highlights during playback
- [ ] Click segment seeks video to start time
- [ ] Segments with notes show yellow background
- [ ] Toggle between Notes/Transcript tabs works

### Status & Workflow
- [ ] Status display shows current status
- [ ] Status change menu works
- [ ] Advance button progresses workflow
- [ ] Metadata updates correctly (dates, progress)

### Completion
- [ ] Modal triggers when video ends
- [ ] Reflection saves correctly
- [ ] Video archives properly
- [ ] Only shows once per session

### Mobile
- [ ] Touch controls work on mobile
- [ ] Video responsive on small screens
- [ ] Controls accessible on mobile
- [ ] Safe areas respected

## Known Issues / Edge Cases

1. **YouTube API Loading**: Handle API load failures gracefully
2. **Private/Deleted Videos**: Show error state if video unavailable
3. **Age-Restricted Videos**: May not embed, show message
4. **Autoplay Policies**: Browser may block autoplay with sound
5. **Multiple Viewers**: Only one YouTube player instance at a time
6. **Network Issues**: Handle buffering and loading states

## Future Enhancements (Optional)

1. **Playback Speed**: 0.5x to 2x speed control
2. **Keyboard Shortcuts**: Full keyboard navigation
3. **Chapters**: Extract chapters from video description
4. **Picture-in-Picture**: Continue watching while browsing
5. **Playlists**: Queue multiple videos
6. **Download Transcript**: Export transcript as text file
7. **AI Summary**: Auto-generate summary from transcript
8. **Collaborative Notes**: Share notes with others
9. **Auto-scroll Transcript**: Sync scroll with playback
10. **Note Export**: Export notes in various formats

## Implementation Notes

- Clean up YouTube player on component unmount
- Handle player state changes properly
- Store progress periodically (every 30 seconds)
- Use `playerRef` for YouTube player instance
- Test with various video lengths
- Handle missing transcript gracefully
- Validate video ID before loading
- Show loading state while API loads

## Related Components
Reference these components for consistency:
- `/components/ArticleViewer.tsx` - Similar viewer structure
- `/components/PodcastViewer.tsx` - Similar audio interface
- `/components/CompletionModal.tsx` - Completion flow
- `/components/TagManager.tsx` - Tag management
- `/components/BulkActionsBar.tsx` - Action patterns

## Summary

The VideoViewer component provides a rich video watching experience with:
- YouTube video playback using IFrame API
- Custom controls matching the app's grayscale design
- Timestamped notes with yellow highlighting
- Interactive transcript navigation
- Full workflow integration
- Progress tracking and completion detection
- Mobile-responsive design

**Example Video**: All mock videos use YouTube ID `TNhaISOUy6Q` for consistent testing and demonstration.
