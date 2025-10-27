# PodcastViewer (AudioPlayer) Component Creation Prompt

## Overview
Create a `PodcastViewer.jsx` component for the fieldnotes read-it-later app that provides a comprehensive podcast/audio listening and annotation experience. This component uses the HTML5 Audio API to play audio content with timestamped notes, transcript navigation, and workflow management.

## Component Location
`/components/PodcastViewer.jsx`

## Purpose
This component serves as the primary podcast/audio listening interface with advanced annotation capabilities. It should:
- Play audio files using HTML5 Audio element
- Support timestamped notes synchronized with audio playback
- Display interactive transcript with clickable timestamps
- Integrate with workflow statuses (Inbox → Daily Reading → Continue Reading → Rediscovery → Archive)
- Track listen progress and prompt for reflections on completion
- Provide custom playback controls optimized for audio (desktop and mobile)

## Functional Requirements

### Main Features

#### 1. HTML5 Audio Integration

**Audio Element**:
- Use `<audio>` element with ref
- Support MP3, WAV, OGG formats
- Programmatic playback control
- Event listeners for state changes

**Audio Sources**:
- `article.podcastUrl` - Direct audio file URL
- RSS feed audio URLs
- Third-party podcast hosting
- Fallback sample audio for testing

**Audio Events**:
- `loadedmetadata` - Get duration
- `timeupdate` - Track current time
- `play` - Update playing state
- `pause` - Update playing state
- `ended` - Trigger completion modal

#### 2. Custom Audio Controls

**Desktop Controls**:
- Play/Pause button (large, center)
- Progress bar with seek functionality
- Current time / Total duration display
- Volume control slider
- Mute/Unmute button
- Skip backward 15s button
- Skip forward 15s button
- Playback speed control (0.5x - 2x)

**Mobile Controls**:
- Large play/pause button
- Progress bar with timestamp
- Skip backward/forward buttons (30s)
- Volume control
- Simplified bottom bar

**Playback Features**:
- Click/drag progress bar to seek
- Skip buttons for quick navigation
- Speed adjustment for efficient listening
- Keyboard shortcuts (Space, arrows)

#### 3. Timestamped Notes

**Note Structure**:
```jsx
// Example VideoAnnotation shape (JS)
// {
//   id: 'annotation-1',
//   timestamp: 45, // seconds
//   note: 'Key point about topic',
//   createdAt: '2024-03-15T12:00:00Z'
// }
```

**Note Features**:
- Add note at current timestamp
- Click note to jump to timestamp
- Edit/delete existing notes
- Notes sorted chronologically
- Visual timeline markers (optional)

**Adding Notes**:
1. Click "Add Note" button
2. Modal opens with current timestamp
3. User enters note text
4. Note saved with timestamp
5. Note appears in notes list

**Note Interaction**:
- Click note → audio seeks to timestamp
- Edit note → modal with existing text
- Delete note → confirmation (optional)
- Export notes → Plain text or Markdown

#### 4. Interactive Transcript

**Transcript Structure**:
```jsx
// Example TranscriptSegment shape (JS)
// {
//   id: 'seg-1',
//   timestamp: 0,
//   text: 'Welcome to the show...',
//   duration: 15
// }
```

**Transcript Features**:
- Auto-scroll to current segment
- Highlight active segment during playback
- Click segment to jump to timestamp
- Search transcript (optional)
- Toggle transcript visibility

**Transcript Display**:
- Scrollable panel (desktop: right side, mobile: bottom)
- Each segment shows timestamp + text
- Active segment highlighted with bg-accent
- Click anywhere in segment to seek

#### 5. Notes Panel

**Desktop Layout**:
- Fixed right panel below header
- Tabs for Notes / Transcript (optional)
- Scrollable list
- Width: max-w-sm (384px)

**Mobile Layout**:
- Bottom sheet
- Swipeable between Notes/Transcript
- Collapsible panel
- Drag handle for expand/collapse

**Notes List**:
- Chronological order by timestamp
- Each note shows:
  - Timestamp badge (MM:SS)
  - Note text
  - Edit/delete buttons
  - Created date (optional)

#### 6. Audio Player UI

**Waveform Visualization** (Optional):
- Visual representation of audio
- Click waveform to seek
- Highlight played section
- Show notes as markers

**Album Art** (Optional):
- Display podcast cover art
- Extract from RSS feed or article metadata
- Fallback to generic podcast icon

**Episode Information**:
- Podcast title
- Episode number/title
- Publication date
- Duration
- Description (collapsible)

#### 7. Playback Speed Control

**Speed Options**:
- 0.5x (Slow)
- 0.75x
- 1.0x (Normal, default)
- 1.25x
- 1.5x (Recommended for podcasts)
- 1.75x
- 2.0x (Fast)

**Speed Control UI**:
- Dropdown or buttons
- Shows current speed
- Persists preference (optional)

#### 8. Skip Controls

**Desktop Skip**:
- Skip backward: 15 seconds
- Skip forward: 15 seconds
- Icon buttons with labels

**Mobile Skip**:
- Skip backward: 30 seconds (easier for touch)
- Skip forward: 30 seconds
- Large icon buttons

**Keyboard Shortcuts**:
- Left arrow: Skip backward
- Right arrow: Skip forward
- Custom intervals in settings (optional)

#### 9. Status Management

Same as ArticleViewer and VideoViewer:
- Current status display with icon
- Status change menu
- Advance to next queue button
- Workflow: Inbox → Daily Reading → In Progress → Rediscovery → Archive

#### 10. Completion Detection

**Triggers**:
- Audio playback ends (ended event)
- Shows CompletionModal once per episode
- Prompts for reflection note
- Archives episode with optional reflection

#### 11. Progress Tracking

**Auto-save Progress**:
- Update `readProgress` every 10 seconds
- Save on pause or close
- Resume from last position on reopen (optional)

**Progress Calculation**:
```jsx
const progress = (currentTime / duration) * 100;
```

#### 12. Favorite & Tags

Same as ArticleViewer:
- Star icon to toggle favorite
- TagManager integration for tag editing
- Real-time updates

#### 13. Mobile Optimizations

**Mobile-Specific Features**:
- Larger touch targets for controls
- Swipe gestures for seeking (optional)
- Lock screen controls (Media Session API)
- Background playback (if supported)
- Picture-in-Picture audio (optional)
- Safe area padding

## UI/UX Requirements

### Desktop Layout Structure
```
┌────────────────────────────────────────────────────────────────┐
│ [←] [★] Podcast Episode Title          [Archive] [Tags] [⋮]    │
├────────────────────────────────────────────────────────────────┤
│                                        ┌──────────────────────┐│
│  ┌──────────────────────────────────┐ │ [Notes] [Transcript] ││
│  │                                  │ │                      ││
│  │  [Podcast Cover Art]             │ │ 0:45 "Key point..."  ││
│  │  or Placeholder                  │ │ 2:30 "Important..."  ││
│  │                                  │ │ 5:20 "Remember..."   ││
│  └──────────────────────────────────┘ │                      ││
│                                        │ Click to jump →      ││
│  The Science Show                      │                      ││
│  Episode 42: Future of AI              │ [Transcript]         ││
│  Published March 15, 2024 · 45m        │ 0:00 Welcome to...   ││
│                                        │ 0:15 Today we'll...  ││
│  [⏮ 15] [▶] [⏭ 15]    [1.5x]         │ 0:30 Our guest is... ││
│  ━━━━━●━━━━━━━━━━━━━━               └──────────────────────┘│
│  15:32 / 45:00                                                 │
│  [🔊] ━━━●━━━                                                 │
│                                                                 │
│  [Add Note at 15:32] [Open Original]     [Advance to Next →]  │
└────────────────────────────────────────────────────────────────┘
```

### Mobile Layout Structure
```
┌──────────────────────────────────┐
│ [←]  Episode Title          [⋮]  │
├──────────────────────────────────┤
│                                   │
│     ┌──────────────────┐         │
│     │                  │         │
│     │  Cover Art or    │         │
│     │  Podcast Icon    │         │
│     │                  │         │
│     └──────────────────┘         │
│                                   │
│  The Science Show                 │
│  Episode 42: Future of AI         │
│                                   │
│  ━━━━━●━━━━━━━━━━━━━━          │
│  15:32 / 45:00                    │
│                                   │
│  [⏮ 30] [▶ 󠀠󠀠] [⏭ 30]  [1.5x]   │
│                                   │
│  [Add Note] [Notes (3)] [Next→]  │
├──────────────────────────────────┤
│ [Bottom Sheet - Notes/Transcript]│
│ ════════                          │
│ Notes (3)         Transcript      │
│ 0:45 Key point about AI...        │
│ 2:30 Important statistic...       │
│ 5:20 Remember to research...      │
└──────────────────────────────────┘
```

### Styling Guidelines

#### Desktop Styling
- **Layout**: Two-column (player + notes/transcript)
- **Player Container**: max-w-2xl, centered
- **Cover Art**: Square, max 400px, rounded-lg
- **Controls**: Below player info
- **Notes Panel**: Fixed right, max-w-sm (384px)

#### Mobile Styling
- **Layout**: Single column, full width
- **Cover Art**: Smaller, centered
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
- Same as ArticleViewer/VideoViewer
- Fixed top-0, bg-background, border-b
- Padding: px-6 py-4

**Player Container**:
- Background: bg-background
- Max width: max-w-2xl
- Margin: mx-auto
- Padding: p-8 (desktop), p-4 (mobile)

**Cover Art**:
- Aspect ratio: 1:1 (square)
- Max size: 400px (desktop), 200px (mobile)
- Rounded: rounded-lg
- Border: border border-border
- Object-fit: cover
- Centered: mx-auto

**Episode Info**:
- Title: 20px, font-['New_Spirit:Medium']
- Subtitle: 16px, text-muted-foreground
- Meta: 14px, text-muted-foreground
- Separator: " · " between items

**Play/Pause Button**:
- Size: w-16 h-16 (desktop), w-20 h-20 (mobile)
- Rounded: rounded-full
- Background: bg-foreground
- Icon color: text-background
- Hover: scale-105
- Active: scale-95

**Skip Buttons**:
- Size: w-12 h-12 (desktop), w-14 h-14 (mobile)
- Rounded: rounded-full
- Background: bg-accent
- Icon: 20px
- Hover: bg-accent/80
- Label: Text below icon (optional)

**Progress Bar**:
- Height: h-2
- Background: bg-border
- Rounded: rounded-full
- Cursor: pointer
- Hover: h-3 (taller for easier clicking)
- Transition: height 200ms

**Progress Fill**:
- Background: bg-foreground
- Rounded: rounded-full
- Height: 100%

**Progress Thumb**:
- Width: w-4 h-4
- Background: bg-foreground
- Rounded: rounded-full
- Position: Absolute
- Transform: -translate-y-1/2
- Drag: cursor-grab

**Time Display**:
- Font: font-mono for digit alignment
- Size: text-[14px]
- Color: text-foreground
- Format: MM:SS / HH:MM:SS (if > 1 hour)

**Volume Slider**:
- Width: w-24 (desktop only)
- Height: h-2
- Same styling as progress bar
- Icon: Volume2 or VolumeX

**Speed Control**:
- Button showing current speed (e.g., "1.5x")
- Dropdown or modal on click
- Options list with radio buttons
- Current speed highlighted

**Notes Panel**:
- Background: bg-accent/50
- Border: border-l border-border (desktop)
- Padding: p-4
- Height: calc(100vh - header)
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
- Color: text-primary
- Background: bg-primary/10
- Padding: px-2 py-1
- Rounded: rounded
- Cursor: pointer

**Transcript Segment**:
- Padding: p-2
- Border-left: 4px solid transparent
- Active: border-l-primary bg-accent
- Cursor: pointer
- Hover: bg-accent/50

**Control Bar** (desktop):
- Flex row: items-center justify-center gap-4
- Margin: mt-6
- Play/pause in center
- Skip buttons on sides
- Speed control on right

**Mobile Bottom Bar**:
- Fixed bottom-0
- Background: bg-background
- Border: border-t border-border
- Padding: px-4 py-3
- Safe area: pb-safe

### Typography
- **Episode Title**: 20px, font-['New_Spirit:Medium']
- **Podcast Name**: 16px
- **Meta Info**: 14px, text-muted-foreground
- **Note Text**: 14px, line-height: 1.6
- **Timestamp**: 14px (time display), 12px (badges), font-mono
- **Transcript**: 14px, line-height: 1.6

## Component Structure

### Props Interface
```jsx
// Props shape (JS)
// {
//   article: { /* article with podcast metadata */ },
//   onUpdateArticle: (article) => void,
//   onClose?: () => void
// }
```

### State Management
```jsx
// Playback
const [isPlaying, setIsPlaying] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [volume, setVolume] = useState(100);
const [isMuted, setIsMuted] = useState(false);
const [playbackRate, setPlaybackRate] = useState(1.0);

// Notes
const [showAddNote, setShowAddNote] = useState(false);
const [noteText, setNoteText] = useState("");
const [selectedAnnotation, setSelectedAnnotation] = useState(null);

// UI
const [showTranscript, setShowTranscript] = useState(true);
const [showStatusMenu, setShowStatusMenu] = useState(false);
const [showTagsMenu, setShowTagsMenu] = useState(false);
const [showCompletionModal, setShowCompletionModal] = useState(false);
const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);
const [isHoveringAdvance, setIsHoveringAdvance] = useState(false);
const [showSpeedMenu, setShowSpeedMenu] = useState(false);

// Refs
const audioRef = useRef(null);

// Data
const videoAnnotations = article.videoAnnotations || [];
const transcript = article.transcript || [];
const audioUrl = article.podcastUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
```

### Key Functions

#### Audio Element Setup
```jsx
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleLoadedMetadata = () => {
    setDuration(audio.duration);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audio.currentTime);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    setIsPlaying(false);
    if (!hasShownCompletionModal) {
      setShowCompletionModal(true);
      setHasShownCompletionModal(true);
    }
  };

  audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  audio.addEventListener('timeupdate', handleTimeUpdate);
  audio.addEventListener('play', handlePlay);
  audio.addEventListener('pause', handlePause);
  audio.addEventListener('ended', handleEnded);

  return () => {
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('play', handlePlay);
    audio.removeEventListener('pause', handlePause);
    audio.removeEventListener('ended', handleEnded);
  };
}, []);
```

#### Playback Controls
```jsx
const togglePlayPause = () => {
  const audio = audioRef.current;
  if (!audio) return;

  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }
};

const handleSeek = (time) => {
  const audio = audioRef.current;
  if (audio) {
    audio.currentTime = time;
    setCurrentTime(time);
  }
};

const handleSkip = (seconds) => {
  const audio = audioRef.current;
  if (audio) {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }
};

const handleVolumeChange = (newVolume) => {
  const audio = audioRef.current;
  if (audio) {
    audio.volume = newVolume / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }
};

const toggleMute = () => {
  const audio = audioRef.current;
  if (audio) {
    if (isMuted) {
      audio.volume = volume / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }
};

const handleSpeedChange = (speed) => {
  const audio = audioRef.current;
  if (audio) {
    audio.playbackRate = speed;
    setPlaybackRate(speed);
  }
  setShowSpeedMenu(false);
};
```

#### Note Management
Same as VideoViewer - see VideoViewer prompt for details.

#### Time Formatting
```jsx
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

## Behavior & Interactions

### Audio Loading
1. Component receives article with podcastUrl
2. Audio element loads from URL
3. Duration extracted from metadata
4. Player ready to play

### Playback Control
1. User clicks play button
2. Audio starts playing
3. isPlaying state updates
4. Time updates every frame
5. Progress bar animates

### Seeking
1. User clicks/drags progress bar
2. Calculate time from position
3. Set audio.currentTime
4. Update state
5. Continue playback if was playing

### Skip Controls
1. User clicks skip button (backward/forward)
2. Calculate new time (current ± skip interval)
3. Clamp to valid range [0, duration]
4. Set audio.currentTime
5. Update current time display

### Speed Control
1. User clicks speed button
2. Menu/dropdown opens
3. User selects speed (0.5x - 2x)
4. Set audio.playbackRate
5. Speed display updates
6. Menu closes

### Adding Notes
Same as VideoViewer:
1. Click "Add Note"
2. Modal opens with timestamp
3. Enter note text
4. Save with timestamp
5. Appears in list

### Jumping to Timestamp
1. Click note or transcript segment
2. Extract timestamp
3. Seek audio to timestamp
4. Optionally pause

### Completion
1. Audio ends (ended event)
2. CompletionModal triggers (once)
3. User adds reflection
4. Episode archived
5. Viewer closes (optional)

## Dependencies

### Required Imports
```jsx
import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, Volume2, VolumeX, StickyNote, X, Clock, 
  ArrowLeft, Star, SkipBack, SkipForward, Tag, Calendar, 
  Check, BookmarkPlus, BookOpen, RotateCcw, Inbox, PanelBottomClose 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TagManager from "./TagManager";
import CompletionModal from "./CompletionModal";
```

### HTML5 Audio
- Native `<audio>` element
- No external dependencies
- Works offline (if audio cached)

## Integration Notes

### Parent Component Integration
```jsx
import PodcastViewer from "./PodcastViewer";

{selectedArticle && selectedArticle.mediaType === "podcast" && (
  <PodcastViewer
    article={selectedArticle}
    onUpdateArticle={handleUpdateArticle}
    onClose={() => setSelectedArticle(null)}
  />
)}
```

### Routing from ArticleViewer
The ArticleViewer automatically routes to PodcastViewer when it detects podcast content.

## Accessibility Considerations

1. **Keyboard Controls**:
   - Space: Play/pause
   - Left/Right arrows: Skip backward/forward
   - M: Mute/unmute
   - +/- : Increase/decrease speed

2. **Screen Readers**:
   - ARIA labels for all controls
   - Announce playback state
   - Accessible time display

3. **Media Session API** (optional):
   - Lock screen controls
   - Notification controls
   - Metadata display

## Testing Checklist

### Audio Playback
- [ ] Audio loads correctly
- [ ] Play/pause works
- [ ] Seeking works (click and drag)
- [ ] Skip backward works (15s/30s)
- [ ] Skip forward works (15s/30s)
- [ ] Volume control works
- [ ] Mute/unmute works
- [ ] Speed control works (0.5x - 2x)
- [ ] Duration displays correctly
- [ ] Current time updates smoothly
- [ ] Audio ends detection works

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
- [ ] Click segment seeks audio
- [ ] Toggle transcript works

### Status & Workflow
- [ ] Status display correct
- [ ] Status changes work
- [ ] Advance button works
- [ ] Metadata updates

### Completion
- [ ] Modal triggers on audio end
- [ ] Reflection saves
- [ ] Episode archives
- [ ] hasAnnotations updates

### Mobile
- [ ] Touch controls work
- [ ] Bottom sheet works
- [ ] Safe areas respected
- [ ] Background playback (if implemented)

## Known Issues / Edge Cases

1. **CORS Issues**: Audio files may have cross-origin restrictions
2. **Format Support**: Not all browsers support all audio formats
3. **Autoplay Policies**: Browser may block autoplay
4. **Background Playback**: Limited on iOS Safari
5. **Memory Leaks**: Clean up audio element properly

## Future Enhancements (Optional)

1. **Sleep Timer**: Auto-pause after duration
2. **Chapters**: Navigate by chapter markers
3. **Bookmarks**: Save specific positions
4. **Queue Management**: Playlist of episodes
5. **Offline Mode**: Download for offline listening
6. **Smart Speed**: Auto-adjust for voice/music
7. **Noise Reduction**: Audio enhancement
8. **Sync Across Devices**: Resume on any device

## Implementation Notes

- Use `<audio ref={audioRef}>` with src attribute
- Clean up event listeners on unmount
- Handle audio errors gracefully
- Test with various audio formats (MP3, WAV, OGG)
- Implement buffering indicator (optional)
- Store playback position periodically
- Use Media Session API for lock screen controls
- Test on mobile Safari (iOS restrictions)

## Related Components
Reference these components for consistency:
- `/components/ArticleViewer.jsx` - Routes to PodcastViewer
- `/components/VideoViewer.jsx` - Similar video interface
- `/components/CompletionModal.jsx` - Completion flow
- `/components/TagManager.jsx` - Tag management
