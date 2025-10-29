import { useState, useRef, useEffect } from "react";
import { Tag, X, Plus } from "lucide-react";

/**
 * TagManager component for managing tags on individual articles
 * @param {Object} props
 * @param {string} props.articleId - Unique identifier for the article
 * @param {string[]} props.currentTags - Array of tags currently applied to this article
 * @param {string[]} props.allTags - Array of all tags available in the system
 * @param {Function} props.onUpdateTags - Callback when tags change
 */
export default function TagManager({
  articleId,
  currentTags,
  allTags,
  onUpdateTags,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [localTags, setLocalTags] = useState(currentTags);
  
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Update local tags when currentTags prop changes
  useEffect(() => {
    setLocalTags(currentTags);
  }, [currentTags]);

  // Click outside detection
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

  // Calculate suggested tags (all tags not currently applied)
  const suggestedTags = allTags.filter(tag => !localTags.includes(tag));

  const toggleTag = (tag) => {
    const newTags = localTags.includes(tag)
      ? localTags.filter(t => t !== tag)
      : [...localTags, tag];
    
    setLocalTags(newTags);
    onUpdateTags(articleId, newTags);
  };

  const addNewTag = () => {
    const trimmedTag = newTag.trim();
    
    if (trimmedTag && !localTags.includes(trimmedTag)) {
      const newTags = [...localTags, trimmedTag];
      setLocalTags(newTags);
      onUpdateTags(articleId, newTags);
      setNewTag("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewTag();
    }
  };

  const handleInputChange = (e) => {
    setNewTag(e.target.value);
  };

  const handleToggleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handlePopoverClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={handleToggleOpen}
        className="flex items-center gap-1 px-3 py-1 text-[12px] text-muted-foreground hover:bg-accent rounded transition-colors"
      >
        <Tag size={14} />
        Manage Tags
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          ref={popoverRef}
          onClick={handlePopoverClick}
          className="absolute left-0 top-full mt-1 w-[280px] bg-card border border-border rounded-lg shadow-lg z-50 p-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-['Inter:Medium', sans-serif] text-[14px] text-foreground">
              Manage Tags
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-accent rounded transition-colors"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Add New Tag Section */}
          <div className="flex gap-1 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Add new tag..."
              className="flex-1 px-2 py-1.5 text-[13px] border border-border bg-background focus:border-primary rounded transition-colors outline-none"
            />
            <button
              onClick={addNewTag}
              disabled={!newTag.trim() || localTags.includes(newTag.trim())}
              className="px-2 py-1.5 bg-primary text-primary-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Current Tags Section */}
          {localTags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                CURRENT TAGS
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {localTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="group flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[12px] rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <span>{tag}</span>
                    <X size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Tags Section */}
          {suggestedTags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                SUGGESTED TAGS
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="flex items-center gap-1 px-2 py-1 bg-accent text-foreground text-[12px] rounded hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Plus size={12} />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {localTags.length === 0 && suggestedTags.length === 0 && (
            <div className="text-center py-2">
              <p className="text-[13px] text-muted-foreground">
                No tags yet. Add your first tag above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}