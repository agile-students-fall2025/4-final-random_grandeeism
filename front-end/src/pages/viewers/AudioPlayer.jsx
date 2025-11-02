/**
 * AudioPlayer.jsx (PodcastViewer)
 * 
 * Description: Full-featured audio/podcast player with timestamped annotations
 * Purpose: Provides rich listening experience with notes and transcript
 */

import { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, Volume2, VolumeX, StickyNote, X, Clock, 
  ArrowLeft, Star, SkipBack, SkipForward, Tag, Calendar, 
  Check, BookOpen, RotateCcw, Inbox, ChevronDown, Edit2, Trash2,
  Music
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import TagManager from "../../components/TagManager";
import CompletionModal from "../../components/CompletionModal";
import { STATUS } from "../../constants/statuses";

const AudioPlayer = ({ article, onUpdateArticle, onClose }) => {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

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
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Refs
  const audioRef = useRef(null);

  // Data
  const videoAnnotations = article?.videoAnnotations || [];
  const transcript = article?.transcript || [];
  const audioUrl = article?.podcastUrl || article?.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  // Audio Element Setup
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
  }, [hasShownCompletionModal]);

  // Playback Controls
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

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    handleSeek(time);
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
      ...article,
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
      ...article,
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
      ...article,
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
    return statusFlow[article?.status] || STATUS.DAILY;
  };

  const handleStatusChange = (newStatus) => {
    const now = new Date();
    const updates = { status: newStatus };

    if (newStatus === STATUS.DAILY && article?.status === STATUS.INBOX) {
      updates.dateToRead = now;
    } else if (newStatus === STATUS.CONTINUE) {
      updates.dateToContinue = now;
    } else if (newStatus === STATUS.REDISCOVERY) {
      updates.dateToRediscover = now;
    } else if (newStatus === STATUS.ARCHIVED) {
      updates.dateArchived = now;
    }

    onUpdateArticle({ ...article, ...updates });
    setShowStatusMenu(false);
    toast.success(`Moved to ${newStatus}`);
  };

  const handleAdvanceStatus = () => {
    const nextStatus = getNextStatus();
    handleStatusChange(nextStatus);
  };

  const handleToggleFavorite = () => {
    onUpdateArticle({ ...article, isFavorite: !article?.isFavorite });
    toast.success(article?.isFavorite ? "Removed from favorites" : "Added to favorites");
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

    onUpdateArticle({ ...article, ...updates });
    setShowCompletionModal(false);
    toast.success("Podcast completed and moved to rediscovery");
    if (onClose) onClose();
  };

  // Transcript interaction
  const handleTranscriptClick = (segment) => {
    handleSeek(segment.timestamp);
  };

  const getActiveTranscriptSegment = () => {
    return transcript.find((seg, index) => {
      const nextSeg = transcript[index + 1];
      return currentTime >= seg.timestamp && 
             (!nextSeg || currentTime < nextSeg.timestamp);
    });
  };

  // Time formatting
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeSegment = getActiveTranscriptSegment();
  const nextStatus = getNextStatus();

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioUrl} />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <Star className={`w-5 h-5 ${article?.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
            <h1 className="text-[20px] font-['New_Spirit:Medium',_sans-serif]">
              {article?.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Menu */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-[14px] flex items-center gap-2"
              >
                <span>{article?.status}</span>
                <ChevronDown className="w-4 h-4" />
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
              className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-[14px] flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              Tags
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 flex">
        {/* Audio Player Area */}
        <div className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            {/* Cover Art */}
            <div className="w-full max-w-md mx-auto aspect-square bg-accent rounded-lg overflow-hidden mb-6 flex items-center justify-center border border-border">
              {article?.coverArt ? (
                <img src={article.coverArt} alt="Cover Art" className="w-full h-full object-cover" />
              ) : (
                <Music className="w-24 h-24 text-muted-foreground" />
              )}
            </div>

            {/* Episode Info */}
            <div className="text-center mb-8">
              <h2 className="text-[20px] font-['New_Spirit:Medium',_sans-serif] mb-2">
                {article?.title}
              </h2>
              <p className="text-[16px] text-muted-foreground mb-2">
                {article?.source || article?.author}
              </p>
              <div className="text-[14px] text-muted-foreground space-x-2">
                {article?.readingTime && <span>{article.readingTime}</span>}
                {article?.dateAdded && (
                  <>
                    <span>•</span>
                    <span>{new Date(article.dateAdded).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div
                  className="w-full h-2 bg-border rounded-full cursor-pointer hover:h-3 transition-all"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-foreground rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between font-mono text-[14px] text-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <button
                  onClick={() => handleSkip(-15)}
                  className="w-12 h-12 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-foreground text-background hover:scale-105 active:scale-95 flex items-center justify-center transition-transform"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button
                  onClick={() => handleSkip(15)}
                  className="w-12 h-12 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Volume and Speed Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <button onClick={toggleMute} className="p-2 hover:bg-accent rounded-lg">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-24 h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-[14px]"
                  >
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-32 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                      {speedOptions.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`w-full px-4 py-2 text-left hover:bg-accent text-[14px] ${
                            playbackRate === speed ? 'bg-accent' : ''
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setShowAddNote(true)}
                className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-[14px] flex items-center gap-2"
              >
                <StickyNote className="w-4 h-4" />
                Add Note at {formatTime(currentTime)}
              </button>

              <button
                onClick={handleAdvanceStatus}
                onMouseEnter={() => setIsHoveringAdvance(true)}
                onMouseLeave={() => setIsHoveringAdvance(false)}
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[14px] flex items-center gap-2"
              >
                Advance to {isHoveringAdvance ? nextStatus : 'Next'} →
              </button>
            </div>
          </div>
        </div>

        {/* Notes & Transcript Panel */}
        <div className="w-96 border-l border-border bg-accent/50 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="p-4">
            {/* Tab Headers */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowTranscript(false)}
                className={`flex-1 px-4 py-2 rounded-lg text-[14px] ${!showTranscript ? 'bg-background' : 'bg-transparent hover:bg-background/50'}`}
              >
                Notes ({videoAnnotations.length})
              </button>
              <button
                onClick={() => setShowTranscript(true)}
                className={`flex-1 px-4 py-2 rounded-lg text-[14px] ${showTranscript ? 'bg-background' : 'bg-transparent hover:bg-background/50'}`}
              >
                Transcript
              </button>
            </div>

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
                      className="bg-background border border-border rounded-lg p-3 cursor-pointer hover:bg-accent group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <button
                          onClick={() => jumpToTimestamp(annotation.timestamp)}
                          className="font-mono text-[12px] text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary/20"
                        >
                          {formatTime(annotation.timestamp)}
                        </button>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <p className="text-[14px] leading-relaxed">{annotation.note}</p>
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
                  transcript.map((segment) => (
                    <div
                      key={segment.id}
                      onClick={() => handleTranscriptClick(segment)}
                      className={`p-2 rounded cursor-pointer hover:bg-accent/50 border-l-4 ${
                        activeSegment?.id === segment.id ? 'border-primary bg-accent' : 'border-transparent'
                      }`}
                    >
                      <span className="font-mono text-[12px] text-muted-foreground mr-2">
                        {formatTime(segment.timestamp)}
                      </span>
                      <span className="text-[14px] leading-relaxed">{segment.text}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      <AnimatePresence>
        {(showAddNote || isEditingNote) && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAddNote(false);
              setIsEditingNote(false);
              setNoteText("");
              setSelectedAnnotation(null);
            }}
          >
            <div
              className="bg-background border border-border rounded-lg p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[18px] font-['New_Spirit:Medium',_sans-serif]">
                  {isEditingNote ? 'Edit Note' : 'Add Note'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddNote(false);
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
                  <span>Timestamp: {formatTime(isEditingNote ? selectedAnnotation?.timestamp : currentTime)}</span>
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
                      setShowAddNote(false);
                      setIsEditingNote(false);
                      setNoteText("");
                      setSelectedAnnotation(null);
                    }}
                    className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-[14px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isEditingNote ? handleEditNote : handleAddNote}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[14px] flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {isEditingNote ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Tags Manager */}
      {showTagsMenu && (
        <TagManager
          isOpen={showTagsMenu}
          onClose={() => setShowTagsMenu(false)}
          currentTags={article?.tags || []}
          onSave={(newTags) => {
            onUpdateArticle({ ...article, tags: newTags });
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
        itemTitle={article?.title}
      />
    </div>
  );
};

export default AudioPlayer;
