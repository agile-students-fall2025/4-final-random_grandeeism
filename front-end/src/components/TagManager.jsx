/**
 * TagManager.jsx
 * 
 * Description: Popover-based interface for managing tags on individual articles
 * Purpose: Allows users to add new tags, remove existing tags, and apply suggested tags
 */

import { useState, useRef, useEffect } from "react";
import { Tag, X, Plus } from "lucide-react";

export default function TagManager({
  articleId,
  currentTags = [],
  allTags = [],
  onUpdateTags,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [localTags, setLocalTags] = useState(currentTags);
  
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Sync local tags with prop changes
  useEffect(() => {
    setLocalTags(currentTags);
  }, [currentTags]);

  // Click-outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
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

  // Add new tag
  const addNewTag = () => {
    const trimmedTag = newTag.trim();
    
    if (trimmedTag && !localTags.includes(trimmedTag)) {
      const updatedTags = [...localTags, trimmedTag];
      setLocalTags(updatedTags);
      onUpdateTags(articleId, updatedTags);
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    const updatedTags = localTags.filter(tag => tag !== tagToRemove);
    setLocalTags(updatedTags);
    onUpdateTags(articleId, updatedTags);
  };

  // Add suggested tag
  const addSuggestedTag = (tagToAdd) => {
    if (!localTags.includes(tagToAdd)) {
      const updatedTags = [...localTags, tagToAdd];
      setLocalTags(updatedTags);
      onUpdateTags(articleId, updatedTags);
    }
  };

  // Handle Enter key in input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewTag();
    }
  };

  // Calculate suggested tags
  const suggestedTags = allTags.filter(tag => !localTags.includes(tag));

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-accent hover:bg-accent/80 rounded transition-colors"
      >
        <Tag size={14} />
        Manage Tags
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1 w-[280px] bg-card border border-border rounded-lg shadow-lg z-50 p-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-[14px] text-foreground">
              Manage Tags
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Add New Tag Input */}
          <div className="flex items-center gap-1 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add new tag..."
              className="flex-1 px-2 py-1.5 text-[13px] bg-background border border-border rounded focus:border-primary focus:outline-none"
            />
            <button
              onClick={addNewTag}
              disabled={!newTag.trim()}
              className="px-2 py-1.5 bg-primary text-primary-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Current Tags Section */}
          {localTags.length > 0 && (
            <div className="mb-3">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                CURRENT TAGS
              </div>
              <div className="flex flex-wrap gap-1.5">
                {localTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => removeTag(tag)}
                    className="group relative px-2 py-1 text-[12px] bg-primary/10 text-primary rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    {tag}
                    <X 
                      size={12} 
                      className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity" 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Tags Section */}
          {suggestedTags.length > 0 && (
            <div className="mb-2">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                SUGGESTED TAGS
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addSuggestedTag(tag)}
                    className="flex items-center gap-1 px-2 py-1 text-[12px] bg-accent text-foreground rounded hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Plus size={12} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {localTags.length === 0 && suggestedTags.length === 0 && (
            <div className="text-center py-2 text-[13px] text-muted-foreground">
              No tags yet. Add your first tag above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
