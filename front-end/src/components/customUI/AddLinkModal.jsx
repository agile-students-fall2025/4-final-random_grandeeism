/**
 * AddLinkModal.jsx
 * 
 * Description: Modal dialog for adding new articles/links to the application
 * Purpose: Provides form interface for saving links with metadata (URL, tags, status, favorite)
 * Features:
 *  - URL input with validation
 *  - Tag management with suggestions from existing tags
 *  - Status selection (Inbox, Daily Reading, Continue Reading, Rediscovery, Archive)
 *  - Favorite toggle
 *  - Form validation and reset
 *  - Responsive design for mobile and desktop
 */

import { useState } from "react";
import { Star, Tag, X, Inbox, Calendar, Archive, BookOpen, RotateCcw } from "lucide-react";
import { STATUS } from "../../constants/statuses.js";

export default function AddLinkModal({ 
  isOpen, 
  onClose, 
  onSave, 
  existingArticles = [] 
}) {
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTags, setNewLinkTags] = useState([]);
  const [newLinkStatus, setNewLinkStatus] = useState(STATUS.INBOX);
  const [newLinkFavorite, setNewLinkFavorite] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  // Get all existing tags from articles for suggestions
  const allExistingTags = Array.from(
    new Set(existingArticles.flatMap(a => a.tags || []))
  ).sort();

  const handleAddTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !newLinkTags.includes(trimmedTag)) {
      setNewLinkTags([...newLinkTags, trimmedTag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewLinkTags(newLinkTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      handleAddTag(newTagInput);
      setNewTagInput("");
    }
  };

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      const newArticle = {
        id: Date.now().toString(),
        title: "New Article",
        url: newLinkUrl,
        description: "Article description will appear here once the link is processed...",
        readingTime: 2,
        isFavorite: newLinkFavorite,
        status: newLinkStatus,
        tags: newLinkTags,
        dateAdded: new Date().toISOString(),
        isRead: false,
        hasAnnotations: false
      };
      
      onSave(newArticle);
      handleReset();
    }
  };

  const handleReset = () => {
    setNewLinkUrl("");
    setNewLinkTags([]);
  setNewLinkStatus(STATUS.INBOX);
    setNewLinkFavorite(false);
    setNewTagInput("");
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h3 className="text-xl font-semibold text-foreground mb-4">Add New Link</h3>

        {/* URL Input */}
        <div className="mb-6">
          <label className="block text-[14px] text-foreground mb-2">URL</label>
          <input
            type="url"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full p-3 border border-border bg-background text-foreground rounded text-[16px] outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Tags Section */}
        <div className="mb-6">
          <label className="block text-[14px] text-foreground mb-2">Tags</label>
          
          {/* Selected Tags Display */}
          {newLinkTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {newLinkTags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1 text-[12px] text-primary bg-primary/10 px-2 py-1 rounded"
                >
                  <Tag size={12} />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Tag Input */}
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Add tags (press Enter)"
            className="w-full p-2 border border-border bg-background text-foreground rounded text-[14px] outline-none focus:border-primary transition-colors"
          />
          
          {/* Existing Tags Suggestions */}
          {allExistingTags.length > 0 && (
            <div className="mt-2">
              <p className="text-[12px] text-muted-foreground mb-1">Existing tags:</p>
              <div className="flex flex-wrap gap-1">
                {allExistingTags
                  .filter(tag => !newLinkTags.includes(tag))
                  .slice(0, 10)
                  .map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      + {tag}
                    </button>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Status Selection */}
        <div className="mb-6">
          <label className="block text-[14px] text-foreground mb-2">Set Status</label>
          
          {/* Top Row: Inbox, Daily Reading, Continue Reading */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {/* Inbox */}
            <button
              onClick={() => setNewLinkStatus(STATUS.INBOX)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.INBOX
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-border bg-background hover:border-blue-500/50"
              }`}
            >
              <Inbox 
                size={20} 
                className={`mx-auto mb-1 ${
                  newLinkStatus === STATUS.INBOX ? "text-blue-500" : "text-muted-foreground"
                }`} 
              />
              <p className={`text-[12px] ${
                newLinkStatus === STATUS.INBOX ? "text-blue-500 font-medium" : "text-foreground"
              }`}>
                Inbox
              </p>
            </button>
            
            {/* Daily Reading */}
            <button
              onClick={() => setNewLinkStatus(STATUS.DAILY)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.DAILY
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-border bg-background hover:border-blue-500/50"
              }`}
            >
              <Calendar 
                size={20} 
                className={`mx-auto mb-1 ${
                  newLinkStatus === STATUS.DAILY ? "text-blue-500" : "text-muted-foreground"
                }`} 
              />
              <p className={`text-[12px] ${
                newLinkStatus === STATUS.DAILY ? "text-blue-500 font-medium" : "text-foreground"
              }`}>
                Daily Reading
              </p>
            </button>
            
            {/* Continue Reading */}
            <button
              onClick={() => setNewLinkStatus(STATUS.CONTINUE)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.CONTINUE
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-border bg-background hover:border-purple-500/50"
              }`}
            >
              <BookOpen 
                size={20} 
                className={`mx-auto mb-1 ${
                  newLinkStatus === STATUS.CONTINUE ? "text-purple-500" : "text-muted-foreground"
                }`} 
              />
              <p className={`text-[12px] ${
                newLinkStatus === STATUS.CONTINUE ? "text-purple-500 font-medium" : "text-foreground"
              }`}>
                Continue Reading
              </p>
            </button>
          </div>
          
          {/* Bottom Row: Rediscovery Queue, Archive */}
          <div className="grid grid-cols-2 gap-2">
            {/* Rediscovery Queue */}
            <button
              onClick={() => setNewLinkStatus(STATUS.REDISCOVERY)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.REDISCOVERY
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-border bg-background hover:border-orange-500/50"
              }`}
            >
              <RotateCcw 
                size={20} 
                className={`mx-auto mb-1 ${
                  newLinkStatus === STATUS.REDISCOVERY ? "text-orange-500" : "text-muted-foreground"
                }`} 
              />
              <p className={`text-[12px] ${
                newLinkStatus === STATUS.REDISCOVERY ? "text-orange-500 font-medium" : "text-foreground"
              }`}>
                Rediscovery Queue
              </p>
            </button>
            
            {/* Archive */}
            <button
              onClick={() => setNewLinkStatus(STATUS.ARCHIVED)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.ARCHIVED
                  ? "border-gray-500 bg-gray-500/10"
                  : "border-border bg-background hover:border-gray-500/50"
              }`}
            >
              <Archive 
                size={20} 
                className={`mx-auto mb-1 ${
                  newLinkStatus === STATUS.ARCHIVED ? "text-gray-500" : "text-muted-foreground"
                }`} 
              />
              <p className={`text-[12px] ${
                newLinkStatus === STATUS.ARCHIVED ? "text-gray-500 font-medium" : "text-foreground"
              }`}>
                Archive
              </p>
            </button>
          </div>
        </div>

        {/* Favorite Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setNewLinkFavorite(!newLinkFavorite)}
            className={`w-full p-3 rounded border-2 transition-all flex items-center justify-center gap-2 ${
              newLinkFavorite
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-border bg-background hover:border-yellow-500/50"
            }`}
          >
            <Star 
              size={18} 
              className={newLinkFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} 
            />
            <span className={`text-[14px] ${
              newLinkFavorite ? "text-yellow-500 font-medium" : "text-foreground"
            }`}>
              {newLinkFavorite ? "Favorited" : "Add to Favorites"}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-80 transition-opacity"
          >
            Cancel
          </button>
          
          {/* Add Link Button */}
          <button
            onClick={handleAddLink}
            disabled={!newLinkUrl.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Link
          </button>
        </div>
      </div>
    </div>
  );
}
