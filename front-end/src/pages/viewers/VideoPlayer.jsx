/**
 * VideoPlayer.jsx (VideoViewer)
 * 
 * Description: Full-featured YouTube video player with timestamped annotations
 * Purpose: Provides rich video watching experience with notes and transcript
 */

import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, StickyNote, X, 
  Clock, ArrowLeft, Star, Tag, Calendar, Check, 
  BookOpen, RotateCcw, Inbox, ChevronDown, Edit2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import TagManager from "../../components/TagManager";
import CompletionModal from "../../components/CompletionModal";
import { STATUS } from "../../constants/statuses";

const VideoPlayer = ({ article, onUpdateArticle, onClose }) => {
  // Default example video if no article provided
  const defaultArticle = {
    id: 'default-video',
    title: 'Example Video - React Tutorial',
    url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
    videoId: 'TNhaISOUy6Q',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['example', 'tutorial'],
    videoAnnotations: [],
    transcript: [],
    hasAnnotations: false,
    readProgress: 0
  };

  const currentArticle = article || defaultArticle;

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  // Notes state
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);

  // UI state
  const [showTranscript, setShowTranscript] = useState(true);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);
  const [isHoveringAdvance, setIsHoveringAdvance] = useState(false);

  // Refs
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // Data
  const videoAnnotations = currentArticle?.videoAnnotations || [];
  const transcript = currentArticle?.transcript || [];
  const videoId = getVideoId(currentArticle?.url || currentArticle?.videoUrl || currentArticle?.videoId);

  // Extract YouTube video ID from URL
  function getVideoId(url) {
    if (!url) return currentArticle?.videoId || null;
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url?.match(regex);
    return match ? match[1] : currentArticle?.videoId || null;
  }

  // Initialize YouTube Player
  useEffect(() => {
    if (!videoId) return;

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            setDuration(event.target.getDuration());
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTimeTracking();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopTimeTracking();
            } else if (event.data === window.YT.PlayerState.ENDED && !hasShownCompletionModal) {
              setShowCompletionModal(true);
              setHasShownCompletionModal(true);
            }
          },
        },
      });
    };

    return () => stopTimeTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Time tracking
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

  // Playback controls
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeek = (time) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(time, true);
    setCurrentTime(time);
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    handleSeek(time);
  };

  const handleVolumeChange = (newVolume) => {
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

  // Note management
  const handleAddNote = () => {
    if (!noteText.trim()) return;
    
    const newAnnotation = {
      id: Date.now().toString(),
      timestamp: currentTime,
      note: noteText,
      createdAt: new Date()
    };
    
    const updatedAnnotations = [...videoAnnotations, newAnnotation]
      .sort((a, b) => a.timestamp - b.timestamp);
    
    onUpdateArticle({
      ...currentArticle,
      videoAnnotations: updatedAnnotations,
      hasAnnotations: true
    });
    
    setNoteText("");
    setShowAddNote(false);
    toast.success("Note added successfully");
  };

  const handleEditNote = () => {
    if (!noteText.trim() || !selectedAnnotation) return;
    
    const updated = videoAnnotations.map(a =>
      a.id === selectedAnnotation.id ? { ...a, note: noteText } : a
    );
    
    onUpdateArticle({
      ...currentArticle,
      videoAnnotations: updated
    });
    
    setNoteText("");
    setSelectedAnnotation(null);
    setIsEditingNote(false);
    toast.success("Note updated");
  };

  const handleDeleteNote = (annotationId) => {
    const updated = videoAnnotations.filter(a => a.id !== annotationId);
    onUpdateArticle({
      ...currentArticle,
      videoAnnotations: updated,
      hasAnnotations: updated.length > 0
    });
    toast.success("Note deleted");
  };

  const jumpToTimestamp = (timestamp) => {
    handleSeek(timestamp);
  };

  const openEditNote = (annotation) => {
    setSelectedAnnotation(annotation);
    setNoteText(annotation.note);
    setIsEditingNote(true);
  };

  // Status management
  const getNextStatus = () => {
    const statusFlow = {
      [STATUS.INBOX]: STATUS.DAILY,
      [STATUS.DAILY]: STATUS.CONTINUE,
      [STATUS.CONTINUE]: STATUS.REDISCOVERY,
      [STATUS.REDISCOVERY]: STATUS.ARCHIVED,
      [STATUS.ARCHIVED]: STATUS.ARCHIVED,
    };
    return statusFlow[currentArticle?.status] || STATUS.DAILY;
  };

  const handleStatusChange = (newStatus) => {
    const now = new Date();
    const updates = { status: newStatus };

    if (newStatus === STATUS.DAILY && currentArticle?.status === STATUS.INBOX) {
      updates.dateToRead = now;
    } else if (newStatus === STATUS.CONTINUE) {
      updates.dateToContinue = now;
    } else if (newStatus === STATUS.REDISCOVERY) {
      updates.dateToRediscover = now;
    } else if (newStatus === STATUS.ARCHIVED) {
      updates.dateArchived = now;
    }

    onUpdateArticle({ ...currentArticle, ...updates });
    setShowStatusMenu(false);
    toast.success(`Moved to ${newStatus}`);
  };

  const handleAdvanceStatus = () => {
    const nextStatus = getNextStatus();
    handleStatusChange(nextStatus);
  };

  const handleToggleFavorite = () => {
    onUpdateArticle({ ...currentArticle, isFavorite: !currentArticle?.isFavorite });
    toast.success(currentArticle?.isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleCompletion = (reflection) => {
    const updates = {
      status: STATUS.REDISCOVERY,
      dateToRediscover: new Date(),
      readProgress: 100
    };

    if (reflection) {
      const reflectionNote = {
        id: Date.now().toString(),
        timestamp: duration,
        note: `Reflection: ${reflection}`,
        createdAt: new Date()
      };
      updates.videoAnnotations = [...videoAnnotations, reflectionNote];
      updates.hasAnnotations = true;
    }

    onUpdateArticle({ ...currentArticle, ...updates });
    setShowCompletionModal(false);
    toast.success("Video completed and moved to rediscovery");
    if (onClose) onClose();
  };

  // Transcript interaction
  const handleTranscriptClick = (segment) => {
    handleSeek(segment.timestamp || segment.start);
  };

  const getActiveTranscriptSegment = () => {
    return transcript.find((seg, index) => {
      const nextSeg = transcript[index + 1];
      const start = seg.timestamp || seg.start;
      const end = nextSeg ? (nextSeg.timestamp || nextSeg.start) : duration;
      return currentTime >= start && currentTime < end;
    });
  };

  // Time formatting
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeSegment = getActiveTranscriptSegment();
  const nextStatus = getNextStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-accent rounded-lg transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-1.5 sm:p-2 hover:bg-accent rounded-lg transition-colors shrink-0"
            >
              <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${currentArticle?.isFavorite ? 'fill-foreground text-foreground' : ''}`} />
            </button>
            <h1 className="text-[14px] sm:text-[16px] lg:text-[20px] font-['New_Spirit:Medium',sans-serif] truncate">
              {currentArticle?.title}
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Status Menu */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 bg-accent hover:bg-accent/80 rounded-lg text-[11px] sm:text-[12px] lg:text-[14px] flex items-center gap-1 sm:gap-2"
              >
                <span className="hidden sm:inline">{currentArticle?.status}</span>
                <span className="sm:hidden">{currentArticle?.status?.slice(0,4)}</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
                  <button
                    onClick={() => handleStatusChange(STATUS.INBOX)}
                    className="w-full px-4 py-2 text-left hover:bg-accent text-[14px] flex items-center gap-2"
                  >
                    <Inbox className="w-4 h-4" />
                    Inbox
                  </button>
                  <button
                    onClick={() => handleStatusChange(STATUS.DAILY)}
                    className="w-full px-4 py-2 text-left hover:bg-accent text-[14px] flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Daily Reading
                  </button>
                  <button
                    onClick={() => handleStatusChange(STATUS.CONTINUE)}
                    className="w-full px-4 py-2 text-left hover:bg-accent text-[14px] flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Continue Reading
                  </button>
                  <button
                    onClick={() => handleStatusChange(STATUS.REDISCOVERY)}
                    className="w-full px-4 py-2 text-left hover:bg-accent text-[14px] flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rediscovery
                  </button>
                  <button
                    onClick={() => handleStatusChange(STATUS.ARCHIVED)}
                    className="w-full px-4 py-2 text-left hover:bg-accent text-[14px] flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Archive
                  </button>
                </div>
              )}
            </div>

            {/* Tags Button */}
            <button
              onClick={() => setShowTagsMenu(!showTagsMenu)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 bg-accent hover:bg-accent/80 rounded-lg text-[11px] sm:text-[12px] lg:text-[14px] flex items-center gap-1 sm:gap-2"
            >
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tags</span>
            </button>

            {/* Advance Button */}
            <button
              onClick={handleAdvanceStatus}
              onMouseEnter={() => setIsHoveringAdvance(true)}
              onMouseLeave={() => setIsHoveringAdvance(false)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[11px] sm:text-[12px] lg:text-[14px] flex items-center gap-1 sm:gap-2"
            >
              <span className="hidden sm:inline">{isHoveringAdvance ? `→ ${nextStatus}` : 'Advance →'}</span>
              <span className="sm:hidden">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-y-auto lg:overflow-hidden flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex flex-col lg:h-full">
            {/* Video Container */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border mb-2 sm:mb-3 shrink-0">
              <div id="youtube-player" className="w-full h-full"></div>

              {/* Annotation Markers on Progress Bar - shown above video */}
              {duration > 0 && (
                <div className="absolute bottom-14 left-0 right-0 h-1 pointer-events-none">
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
                </div>
              )}
            </div>

            {/* Custom Controls */}
            <div className="bg-card border border-border rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 shrink-0">
              {/* Progress Bar */}
              <div
                className="w-full h-2 bg-muted rounded-lg cursor-pointer hover:h-3 transition-all mb-2 sm:mb-3 relative"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-foreground rounded-lg relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full"></div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={togglePlayPause}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
                  </button>
                  <span className="font-mono text-[11px] sm:text-[12px] text-muted-foreground">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={toggleMute}
                    className="hover:opacity-80"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-16 sm:w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <button className="hover:opacity-80 hidden sm:block">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add Note Button */}
            {!showAddNote && (
              <button
                onClick={() => setShowAddNote(true)}
                className="px-3 py-2 sm:px-4 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20 rounded-lg text-[13px] sm:text-[14px] flex items-center gap-2 shrink-0"
              >
                <StickyNote className="w-4 h-4" />
                <span className="hidden sm:inline">Add Note at {formatTime(currentTime)}</span>
                <span className="sm:hidden">Add Note</span>
              </button>
            )}

            {/* Add Note Form */}
            {showAddNote && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-3 shrink-0">
                <div className="flex items-center gap-2 text-[14px] text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Timestamp: {formatTime(currentTime)}</span>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter your note..."
                  className="w-full h-16 sm:h-20 px-2 py-2 sm:px-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-[13px] sm:text-[14px] mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAddNote(false);
                      setNoteText("");
                    }}
                    className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-[14px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[14px] flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes & Transcript Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-accent/30 lg:sticky lg:top-0 lg:h-[calc(100vh-73px)] flex flex-col">
          <div className="flex flex-col h-full lg:h-auto lg:sticky lg:top-20">
            {/* Tab Headers */}
            <div className="flex border-b border-border bg-background shrink-0">
              <button
                onClick={() => setShowTranscript(false)}
                className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 text-[13px] sm:text-[14px] transition-colors ${!showTranscript ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
              >
                Notes ({videoAnnotations.length})
              </button>
              <button
                onClick={() => setShowTranscript(true)}
                className={`flex-1 px-3 py-2 sm:px-4 sm:py-3 text-[13px] sm:text-[14px] transition-colors ${showTranscript ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
              >
                Transcript
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 max-h-[40vh] lg:max-h-none">
              {/* Notes List */}
              {!showTranscript && (
                <div className="space-y-2">
                  {videoAnnotations.length === 0 ? (
                    <p className="text-[14px] text-muted-foreground text-center py-8">
                      No notes yet. Add your first note!
                    </p>
                  ) : (
                    videoAnnotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2 sm:p-3 group"
                      >
                        <div className="flex items-start justify-between mb-1 sm:mb-2">
                          <button
                            onClick={() => jumpToTimestamp(annotation.timestamp)}
                            className="font-mono text-[10px] sm:text-[11px] text-foreground bg-accent px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-accent/80"
                          >
                            {formatTime(annotation.timestamp)}
                          </button>
                          <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditNote(annotation)}
                              className="p-1 hover:bg-accent rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(annotation.id)}
                              className="p-1 hover:bg-accent rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[13px] sm:text-[14px] leading-relaxed">{annotation.note}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Transcript List */}
              {showTranscript && (
                <div className="space-y-1">
                  {transcript.length === 0 ? (
                    <p className="text-[14px] text-muted-foreground text-center py-8">
                      No transcript available
                    </p>
                  ) : (
                    transcript.map((segment, index) => {
                      const segmentStart = segment.timestamp || segment.start;
                      const isActive = activeSegment?.id === segment.id || (
                        activeSegment && 
                        (activeSegment.timestamp === segmentStart || activeSegment.start === segmentStart)
                      );
                      
                      return (
                        <div
                          key={segment.id || index}
                          onClick={() => handleTranscriptClick(segment)}
                          className={`p-1.5 sm:p-2 rounded cursor-pointer hover:bg-accent transition-colors border-l-2 sm:border-l-4 ${
                            isActive ? 'border-primary bg-accent' : 'border-transparent'
                          }`}
                        >
                          <span className="font-mono text-[10px] sm:text-[11px] text-muted-foreground mr-1 sm:mr-2">
                            {formatTime(segmentStart)}
                          </span>
                          <span className="text-[13px] sm:text-[14px] leading-relaxed">{segment.text}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Note Modal */}
      {isEditingNote && selectedAnnotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-['New_Spirit:Medium',sans-serif]">
                Edit Note
              </h3>
              <button
                onClick={() => {
                  setIsEditingNote(false);
                  setNoteText("");
                  setSelectedAnnotation(null);
                }}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Timestamp: {formatTime(selectedAnnotation.timestamp)}</span>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note..."
                className="w-full h-32 px-3 py-2 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-[14px]"
                autoFocus
              />

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setIsEditingNote(false);
                    setNoteText("");
                    setSelectedAnnotation(null);
                  }}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-[14px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditNote}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[14px] flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tags Manager */}
      {showTagsMenu && (
        <TagManager
          isOpen={showTagsMenu}
          onClose={() => setShowTagsMenu(false)}
          currentTags={currentArticle?.tags || []}
          onSave={(newTags) => {
            onUpdateArticle({ ...currentArticle, tags: newTags });
            setShowTagsMenu(false);
          }}
        />
      )}

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onComplete={handleCompletion}
        onSkip={() => {
          handleStatusChange(STATUS.REDISCOVERY);
          setShowCompletionModal(false);
        }}
        itemTitle={currentArticle?.title}
      />
    </div>
  );
};

export default VideoPlayer;
