# VideoViewer Component Creation Prompt

## Overview
Create a `VideoViewer.jsx` component for the fieldnotes read-it-later app that provides a comprehensive video watching and annotation experience. This component integrates YouTube videos with timestamped notes, transcript navigation, and workflow management.

## Component Location
`/components/VideoViewer.jsx`

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
- Dynamically load YouTube IFrame API
- Extract video ID from various YouTube URL formats
- Embed video with custom controls disabled
- Control playback programmatically
- Track playback state and time

**Video ID Extraction**:
```jsx
const getVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : article.videoId || null;
};
```

**Supported URL Formats**:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- Direct video ID via `article.videoId`

#### 2. Custom Video Controls

**Desktop Controls**:
- Play/Pause button
- Progress bar with seek functionality
- Current time / Total duration display
- Volume control slider
- Mute/Unmute button
- Fullscreen button
- Speed control (optional)

**Mobile Controls**:
- Simplified bottom bar
- Large play/pause button
- Progress bar
- Time display
- Volume control
- Fullscreen toggle

**Playback Features**:
- Click progress bar to seek
- Drag progress bar thumb
- Keyboard shortcuts (Space = play/pause)
- Auto-hide controls on inactivity

#### 3. Timestamped Notes

**Note Structure**:
```jsx
interface VideoAnnotation {
  id: string;
  timestamp: number; // seconds
  note: string;
  createdAt: Date;
}
```

**Note Features**:
- Add note at current timestamp
- Click note to jump to timestamp
- Edit/delete existing notes
- Notes sorted by timestamp
- Visual timeline markers (optional)

**Adding Notes**:
1. Click "Add Note" button at current time
2. Modal opens with timestamp pre-filled
3. User enters note text
4. Note saved with timestamp
5. Note appears in notes list

**Note Interaction**:
- Click note → video seeks to timestamp
- Hover note → preview in timeline
- Edit note → modal with existing text
- Delete note → confirmation required

#### 4. Interactive Transcript

**Transcript Structure**:
```jsx
interface TranscriptSegment {
  id: string;
  timestamp: number;
  text: string;
  duration?: number;
}
```

**Transcript Features**:
- Auto-scroll to current segment
- Highlight active segment during playback
- Click segment to jump to timestamp
- Search transcript (optional)
- Show/hide transcript panel

**Transcript Display**:
- Scrollable panel (desktop: right side, mobile: bottom)
- Each segment shows timestamp + text
- Active segment highlighted with bg-accent
- Click anywhere in segment to seek

#### 5. Notes Panel

**Desktop Layout**:
- Fixed right panel
- Shows both notes and transcript
- Tabs to switch between views (optional)
- Scrollable list

**Mobile Layout**:
- Bottom sheet
- Swipeable tabs
- Collapsible panel
- Overlay when expanded

**Notes List**:
- Chronological order by timestamp
- Each note shows:
  - Timestamp (clickable)
  - Note text
  - Edit/delete buttons
  - Timestamp in human-readable format (MM:SS)

#### 6. Status Management

Same as ArticleViewer:
- Current status display with icon
- Status change menu
- Advance to next queue button
- Workflow: Inbox → Daily Reading → In Progress → Rediscovery → Archive

#### 7. Completion Detection

**Triggers**:
- Video playback ends (onEnded event)
- Shows CompletionModal once per video
- Prompts for reflection note
- Archives video with optional reflection

#### 8. Progress Tracking

**Auto-save Progress**:
- Update `readProgress` periodically during playback
- Save on pause, seek, or close
- Resume from last position on reopen (optional)

**Progress Calculation**:
```jsx
const progress = (currentTime / duration) * 100;
```

#### 9. Favorite & Tags

Same as ArticleViewer:
- Star icon to toggle favorite
- TagManager integration for tag editing
- Real-time updates

#### 10. Mobile Optimizations

**Mobile-Specific Features**:
- Larger touch targets for controls
- Swipe gestures for seeking (optional)
- Picture-in-Picture support (optional)
- Landscape mode optimization
- Safe area padding

## UI/UX Requirements

### Desktop Layout Structure
```
┌────────────────────────────────────────────────────────────────┐
│ [←] [★] Video Title                    [Archive] [Tags] [⋮]    │
├────────────────────────────────────────────────────────────────┤
│                                        ┌──────────────────────┐│
│  ┌──────────────────────────────────┐ │ [Notes] [Transcript] ││
│  │                                  │ │                      ││
│  │         YouTube Video            │ │ 0:45 "Key point..."  ││
│  │         Embedded Here            │ │ 2:30 "Important..."  ││
│  │                                  │ │                      ││
│  │  [Controls overlay on hover]     │ │ Click to jump →      ││
│  └──────────────────────────────────┘ │                      ││
│                                        │ [Transcript]         ││
│  [▶ 󠀠󠀠] ━━━●━━━━━━━ [🔊] [⛶]         │ 0:00 Welcome to...   ││
│  2:45 / 10:30                          │ 0:15 Today we'll...  ││
│                                        │ 0:30 First, let's... ││
│  [Add Note at 2:45] [Open Original]   └──────────────────────┘│
│                                       [Advance to Next →]      │
└────────────────────────────────────────────────────────────────┘
```

### Mobile Layout Structure
```
┌──────────────────────────────────┐
│ [←]  Video Title            [⋮]  │
├──────────────────────────────────┤
│                                   │
│  ┌──────────────────────────────┐│
│  │                              ││
│  │    YouTube Video             ││
│  │    Embedded Here             ││
│  │                              ││
│  └──────────────────────────────┘│
│                                   │
│  [▶] ━━━●━━━━━━━ 2:45 / 10:30    │
│                                   │
│  [Add Note] [Notes (3)] [Next→]  │
├──────────────────────────────────┤
│ [Bottom Sheet - Notes/Transcript]│
│ Drag handle                       │
│ ────────                          │
│ Notes (3)         Transcript      │
│ 0:45 Key point about...           │
│ 2:30 Important detail...          │
│ 4:15 Remember this...             │
└──────────────────────────────────┘
```

### Styling Guidelines

#### Desktop Styling
- **Layout**: Two-column (video + notes/transcript)
- **Video Container**: max-w-4xl, aspect-ratio 16:9
- **Controls**: Overlay on video, auto-hide after 3s
- **Notes Panel**: Fixed right, max-w-sm (384px)
- **Progress Bar**: Full width below video

#### Mobile Styling
- **Layout**: Single column, full width
- **Video**: Full width, maintains aspect ratio
- **Controls**: Fixed bottom bar
- **Notes**: Bottom sheet, swipeable
- **Touch Targets**: Minimum 44px

#### Grayscale Compliance
- **Base Theme**: Grayscale throughout
- **Controls**: Grayscale buttons and sliders
- **Active States**: bg-accent for highlighting
- **Flat Design**: Minimal shadows

#### Component Styling Details

**Header**:
- Fixed top-0, bg-background, border-b
- Padding: px-6 py-4
- Flex: items-center justify-between
- Same as ArticleViewer header

**Video Container**:
- Aspect ratio: 16:9 (aspect-video)
- Background: bg-black (for letterboxing)
- Rounded: rounded-lg
- Overflow: hidden
- Relative positioning for controls overlay

**YouTube IFrame**:
- Width: 100%
- Height: 100%
- Border: none
- Absolute positioning to fill container

**Controls Overlay**:
- Position: Absolute bottom-0, full width
- Background: bg-gradient-to-t from-black/80 to-transparent
- Padding: p-4
- Opacity: 1 on hover, 0 when idle (auto-hide)
- Transition: opacity 300ms

**Play/Pause Button**:
- Icon: Play or Pause (24px)
- Size: w-10 h-10
- Rounded: rounded-full
- Background: bg-background/20 hover:bg-background/40
- Color: text-white

**Progress Bar**:
- Height: h-2
- Background: bg-white/30
- Rounded: rounded-full
- Cursor: pointer
- Hover: h-3 (taller for easier clicking)

**Progress Thumb**:
- Width: w-3 h-3
- Background: bg-white
- Rounded: rounded-full
- Position: Absolute, top 50% transform -translate-y-1/2
- Drag: cursor-grab, active:cursor-grabbing

**Volume Slider**:
- Width: w-20 (desktop only)
- Height: h-2
- Same styling as progress bar

**Time Display**:
- Font: font-mono for alignment
- Size: text-[13px]
- Color: text-white
- Format: MM:SS / MM:SS

**Notes Panel**:
- Background: bg-accent/50
- Border: border-l border-border (desktop)
- Padding: p-4
- Height: Full viewport height minus header
- Overflow: overflow-y-auto

**Note Item**:
- Background: bg-background
- Border: border border-border
- Rounded: rounded-lg
- Padding: p-3
- Margin: mb-2
- Cursor: pointer
- Hover: bg-accent

**Timestamp Badge**:
- Font: font-mono
- Size: text-[12px]
- Color: text-primary (clickable)
- Format: MM:SS

**Transcript Segment**:
- Padding: p-2
- Border-left: 4px solid transparent (active: border-primary)
- Background: active ? bg-accent : transparent
- Cursor: pointer
- Hover: bg-accent/50

**Bottom Toolbar** (desktop):
- Fixed bottom-0
- Background: bg-background
- Border: border-t border-border
- Padding: px-6 py-4
- Flex: justify-between items-center

**Mobile Bottom Sheet**:
- Position: Fixed bottom-0
- Background: bg-background
- Border: border-t border-border
- Rounded: rounded-t-2xl
- Max height: 60vh
- Drag handle: Small horizontal bar at top

### Typography
- **Video Title**: 24px, font-['New_Spirit:Medium']
- **Note Text**: 14px, line-height: 1.6
- **Timestamp**: 12px, font-mono
- **Transcript Text**: 14px, line-height: 1.6

## Component Structure

### Props Interface
```jsx
interface VideoViewerProps {
  article: Article; // Article with video metadata
  onUpdateArticle: (article: Article) => void;
  onClose?: () => void;
}
```

### State Management
```jsx
// Playback
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [volume, setVolume] = useState(100);
const [isMuted, setIsMuted] = useState(false);

// Notes
const [showAddNote, setShowAddNote] = useState(false);
const [noteText, setNoteText] = useState("");
const [selectedAnnotation, setSelectedAnnotation] = useState<VideoAnnotation | null>(null);

// UI
const [showTranscript, setShowTranscript] = useState(true);
const [showStatusMenu, setShowStatusMenu] = useState(false);
const [showTagsMenu, setShowTagsMenu] = useState(false);
const [showCompletionModal, setShowCompletionModal] = useState(false);
const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);
const [isHoveringAdvance, setIsHoveringAdvance] = useState(false);

// Refs
const playerRef = useRef<any>(null);
const intervalRef = useRef<any>(null);

// Data
const videoAnnotations = article.videoAnnotations || [];
const transcript = article.transcript || [];
```

### Key Functions

#### YouTube Player Initialization
```jsx
useEffect(() => {
  if (!videoId) return;

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

  (window as any).onYouTubeIframeAPIReady = () => {
    playerRef.current = new (window as any).YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          setDuration(event.target.getDuration());
        },
        onStateChange: (event: any) => {
          if (event.data === (window as any).YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTimeTracking();
          } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopTimeTracking();
          } else if (event.data === (window as any).YT.PlayerState.ENDED && !hasShownCompletionModal) {
            setShowCompletionModal(true);
            setHasShownCompletionModal(true);
          }
        },
      },
    });
  };

  return () => stopTimeTracking();
}, [videoId]);
```

#### Time Tracking
```jsx
const startTimeTracking = () => {
  intervalRef.current = setInterval(() => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      setCurrentTime(playerRef.current.getCurrentTime());
    }
  }, 100);
};

const stopTimeTracking = () => {
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
};
```

#### Playback Controls
```jsx
const togglePlayPause = () => {
  if (!playerRef.current) return;
  
  if (isPlaying) {
    playerRef.current.pauseVideo();
  } else {
    playerRef.current.playVideo();
  }
};

const handleSeek = (time: number) => {
  if (!playerRef.current) return;
  playerRef.current.seekTo(time, true);
  setCurrentTime(time);
};

const handleVolumeChange = (newVolume: number) => {
  if (!playerRef.current) return;
  playerRef.current.setVolume(newVolume);
  setVolume(newVolume);
  setIsMuted(newVolume === 0);
};

const toggleMute = () => {
  if (!playerRef.current) return;
  
  if (isMuted) {
    playerRef.current.unMute();
    setIsMuted(false);
  } else {
    playerRef.current.mute();
    setIsMuted(true);
  }
};
```

#### Note Management
```jsx
const handleAddNote = () => {
  if (!noteText.trim()) return;
  
  const newAnnotation: VideoAnnotation = {
    id: Date.now().toString(),
    timestamp: currentTime,
    note: noteText,
    createdAt: new Date()
  };
  
  const updatedAnnotations = [...videoAnnotations, newAnnotation]
    .sort((a, b) => a.timestamp - b.timestamp);
  
  onUpdateArticle({
    ...article,
    videoAnnotations: updatedAnnotations,
    hasAnnotations: true
  });
  
  setNoteText("");
  setShowAddNote(false);
};

const handleDeleteNote = (annotationId: string) => {
  const updated = videoAnnotations.filter(a => a.id !== annotationId);
  onUpdateArticle({
    ...article,
    videoAnnotations: updated,
    hasAnnotations: updated.length > 0
  });
};

const handleEditNote = (annotationId: string, newText: string) => {
  const updated = videoAnnotations.map(a =>
    a.id === annotationId ? { ...a, note: newText } : a
  );
  onUpdateArticle({
    ...article,
    videoAnnotations: updated
  });
};

const jumpToTimestamp = (timestamp: number) => {
  handleSeek(timestamp);
};
```

#### Transcript Interaction
```jsx
const handleTranscriptClick = (segment: TranscriptSegment) => {
  handleSeek(segment.timestamp);
};

const getActiveTranscriptSegment = () => {
  return transcript.find((seg, index) => {
    const nextSeg = transcript[index + 1];
    return currentTime >= seg.timestamp && 
           (!nextSeg || currentTime < nextSeg.timestamp);
  });
};
```

#### Time Formatting
```jsx
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

## Behavior & Interactions

### Video Loading
1. Component extracts video ID from URL
2. Loads YouTube IFrame API script
3. Initializes player on API ready
4. Loads video into player
5. Sets duration when metadata loaded

### Playback Control
1. User clicks play button
2. YouTube player starts playback
3. Time tracking interval starts
4. Current time updates every 100ms
5. Progress bar updates position
6. Active transcript segment highlights

### Seeking
1. User clicks progress bar
2. Calculate time from click position
3. Call YouTube player seekTo()
4. Update currentTime state
5. Resume playback if was playing

### Adding Notes
1. User clicks "Add Note" button
2. Modal opens with current timestamp
3. User enters note text
4. Note saved with timestamp
5. Note appears in chronological list
6. hasAnnotations flag set to true

### Jumping to Timestamp
1. User clicks note or transcript segment
2. Extract timestamp
3. Seek video to timestamp
4. Optionally pause to read note
5. Highlight active segment

### Volume Control
1. User drags volume slider (desktop)
2. Update volume state
3. Call player.setVolume()
4. Mute icon toggles at 0 volume

### Completion
1. Video ends (onEnded event)
2. CompletionModal triggers (once)
3. User adds optional reflection
4. Video archived with reflection
5. Viewer closes (optional)

### Status Changes
Same as ArticleViewer:
- Status menu with contextual options
- Advance button for workflow progression
- Metadata updates (dates, progress, etc.)

## Dependencies

### Required Imports
```jsx
import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, StickyNote, X, 
  Clock, ChevronDown, ChevronUp, ArrowLeft, Star, Bookmark, 
  Tag, Calendar, Check, BookmarkPlus, BookOpen, RotateCcw, 
  Inbox, PanelBottomClose 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Article, VideoAnnotation, TranscriptSegment } from "../types/article";
import TagManager from "./TagManager";
import CompletionModal from "./CompletionModal";
```

### External Scripts
- YouTube IFrame API: `https://www.youtube.com/iframe_api`

### Type Definitions
```jsx
interface VideoAnnotation {
  id: string;
  timestamp: number;
  note: string;
  createdAt: Date;
}

interface TranscriptSegment {
  id: string;
  timestamp: number;
  text: string;
  duration?: number;
}
```

## Integration Notes

### Parent Component Integration
```jsx
import VideoViewer from "./VideoViewer";

const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

const handleUpdateArticle = (updatedArticle: Article) => {
  setArticles(articles.map(a => 
    a.id === updatedArticle.id ? updatedArticle : a
  ));
};

{selectedArticle && selectedArticle.mediaType === "video" && (
  <VideoViewer
    article={selectedArticle}
    onUpdateArticle={handleUpdateArticle}
    onClose={() => setSelectedArticle(null)}
  />
)}
```

### Routing from ArticleViewer
The ArticleViewer automatically routes to VideoViewer when it detects video content.

## Accessibility Considerations

1. **Keyboard Controls**:
   - Space: Play/pause
   - Arrow keys: Seek forward/backward
   - M: Mute/unmute
   - F: Fullscreen

2. **Screen Readers**:
   - ARIA labels for all controls
   - Announce playback state changes
   - Accessible time display

3. **Focus Management**:
   - Clear focus indicators
   - Logical tab order

4. **Captions**:
   - YouTube's built-in caption support
   - Transcript provides alternative

## Testing Checklist

### Video Playback
- [ ] Video loads correctly
- [ ] Play/pause works
- [ ] Seeking works (click and drag)
- [ ] Volume control works
- [ ] Mute/unmute works
- [ ] Fullscreen works
- [ ] Duration displays correctly
- [ ] Current time updates
- [ ] Video ends detection works

### Notes
- [ ] Add note button works
- [ ] Note saves with timestamp
- [ ] Notes list shows all notes
- [ ] Click note jumps to timestamp
- [ ] Edit note works
- [ ] Delete note works
- [ ] Notes sorted by timestamp

### Transcript
- [ ] Transcript displays correctly
- [ ] Active segment highlights
- [ ] Click segment seeks video
- [ ] Transcript scrolls with playback (if implemented)
- [ ] Toggle transcript panel works

### Status & Workflow
- [ ] Status display correct
- [ ] Status changes work
- [ ] Advance button works
- [ ] Metadata updates correctly

### Completion
- [ ] Modal triggers on video end
- [ ] Reflection saves correctly
- [ ] Video archives properly
- [ ] hasAnnotations updates

### Mobile
- [ ] Touch controls work
- [ ] Bottom sheet works
- [ ] Swipe gestures work (if implemented)
- [ ] Portrait/landscape handling
- [ ] Safe areas respected

## Known Issues / Edge Cases

1. **YouTube API Loading**: Handle API load failures
2. **Private/Deleted Videos**: Show error state
3. **Age-Restricted Videos**: May not embed
4. **Autoplay Policies**: Browser may block autoplay
5. **Multiple Viewers**: Only one player instance at a time

## Future Enhancements (Optional)

1. **Playback Speed**: 0.5x to 2x control
2. **Keyboard Shortcuts**: Full keyboard navigation
3. **Chapters**: Video chapters from description
4. **Picture-in-Picture**: Continue watching while browsing
5. **Playlists**: Queue multiple videos
6. **Download Transcript**: Export as text file
7. **AI Summary**: Auto-generate summary from transcript
8. **Collaborative Notes**: Share notes with others

## Implementation Notes

- Load YouTube API only once globally
- Clean up player on component unmount
- Handle player state changes properly
- Store progress periodically
- Use `playerRef` for YouTube player instance
- Implement auto-hide controls (3s timeout)
- Test with various video lengths
- Handle no transcript gracefully

## Related Components
Reference these components for consistency:
- `/components/ArticleViewer.jsx` - Routes to VideoViewer
- `/components/PodcastViewer.jsx` - Similar audio interface
- `/components/CompletionModal.jsx` - Completion flow
- `/components/TagManager.jsx` - Tag management
