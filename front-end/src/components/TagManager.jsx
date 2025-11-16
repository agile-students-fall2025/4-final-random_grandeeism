import { useState, useRef, useEffect, useCallback } from "react";
import { Tag, X, Plus } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { tagsAPI, articlesAPI } from "../services/api.js";

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
  const [position, setPosition] = useState({ top: null, left: 0, fixed: false, above: false });
  const [availableTags, setAvailableTags] = useState([]); // backend tag objects [{id,name,...}]
  
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);
  const isMobile = useIsMobile();

  // Update local tags when currentTags prop changes
  useEffect(() => {
    setLocalTags(currentTags);
  }, [currentTags]);

  // Load available tags from backend when opened or when not provided via props
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await tagsAPI.getAll({ sort: 'alphabetical' });
        if (!cancelled) setAvailableTags(res?.data || []);
      } catch (e) {
        console.error('Failed to load available tags', e);
        if (!cancelled) setAvailableTags([]);
      }
    };
    if (isOpen) load();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Function to calculate and set position
  const calculatePosition = useCallback(() => {
    if (!isOpen || !buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = 280; // w-[280px]
    const modalHeight = 400; // approximate max height
    // On mobile, assume sidebar could be open (400px) or closed (40px) - account for max width
    // On desktop, sidebar is always 40px when minimized
    const sidebarWidth = isMobile ? 400 : 40;
    const padding = 16;
    
    // Calculate available space
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    // Determine vertical position (above or below)
    const positionAbove = spaceBelow < modalHeight && spaceAbove > spaceBelow;
    
    if (isMobile) {
      // On mobile, use fixed positioning
      // Calculate horizontal position to avoid sidebar - keep modal visible within viewport
      const maxLeft = Math.max(padding, viewportWidth - modalWidth - padding);
      const calculatedLeft = Math.max(padding, Math.min(maxLeft, buttonRect.left));
      const calculatedTop = positionAbove
        ? Math.max(padding, buttonRect.top - modalHeight - 8)
        : Math.min(viewportHeight - modalHeight - padding, buttonRect.bottom + 8);
      
      setPosition({ 
        top: calculatedTop,
        left: calculatedLeft,
        fixed: true,
        above: false
      });
    } else {
      // On desktop, use absolute positioning relative to button
      let leftOffset = 0;
      
      // Check if modal would go off right edge or behind sidebar
      if (buttonRect.left + modalWidth > viewportWidth - sidebarWidth) {
        // Shift left to avoid sidebar
        leftOffset = viewportWidth - sidebarWidth - modalWidth - buttonRect.left - padding;
      }
      
      // If button is too far left, align to left edge
      if (buttonRect.left + leftOffset < padding) {
        leftOffset = padding - buttonRect.left;
      }
      
      setPosition({ 
        top: null,
        left: leftOffset,
        fixed: false,
        above: positionAbove
      });
    }
  }, [isOpen, isMobile]);

  // Calculate position when modal opens or when window resizes
  useEffect(() => {
    calculatePosition();
    
    if (isOpen && isMobile) {
      // On mobile, recalculate on scroll/resize
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }
  }, [isOpen, isMobile, calculatePosition]);

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

  // Calculate suggested tags (use backend list if available, else fallback to prop)
  const allTagNames = (availableTags.length > 0 ? availableTags.map(t => t.name) : (allTags || []));
  const suggestedTags = allTagNames.filter(tag => !localTags.map(t => t.toLowerCase()).includes(String(tag).toLowerCase()));

  const toggleTag = async (tag) => {
    const isApplied = localTags.map(t => t.toLowerCase()).includes(String(tag).toLowerCase());
    const tagObj = (availableTags || []).find(t => t.name.toLowerCase() === String(tag).toLowerCase());

    try {
      if (isApplied) {
        // remove
        if (onUpdateTags) {
          await onUpdateTags(articleId, localTags.filter(t => t.toLowerCase() !== String(tag).toLowerCase()));
        } else {
          // backend accepts id or name
          await articlesAPI.removeTag(articleId, tagObj?.id ?? tag);
        }
        setLocalTags(prev => prev.filter(t => t.toLowerCase() !== String(tag).toLowerCase()));
      } else {
        // add (create if needed)
        let tagIdOrName = tag;
        if (!tagObj) {
          try {
            const created = await tagsAPI.create({ name: tag });
            if (created?.data) {
              tagIdOrName = created.data.id;
              setAvailableTags(prev => [...prev, created.data]);
            }
          } catch (e) {
            console.error('Create tag failed', e);
          }
        } else {
          tagIdOrName = tagObj.id;
        }
        if (onUpdateTags) {
          await onUpdateTags(articleId, [...localTags, String(tag)]);
        } else {
          await articlesAPI.addTag(articleId, tagIdOrName);
        }
        setLocalTags(prev => [...prev, String(tag)]);
      }
    } catch (e) {
      console.error('toggleTag failed', e);
    }
  };

  const addNewTag = async () => {
    const trimmedTag = newTag.trim();
    
    if (trimmedTag && !localTags.includes(trimmedTag)) {
      try {
        // create (if not exists) then add
        let tagIdOrName = trimmedTag;
        const existing = (availableTags || []).find(t => t.name.toLowerCase() === trimmedTag.toLowerCase());
        if (!existing) {
          try {
            const created = await tagsAPI.create({ name: trimmedTag });
            if (created?.data) {
              tagIdOrName = created.data.id;
              setAvailableTags(prev => [...prev, created.data]);
            }
          } catch (e) { console.error('Create tag failed', e); }
        } else {
          tagIdOrName = existing.id;
        }
        if (onUpdateTags) {
          await onUpdateTags(articleId, [...localTags, trimmedTag]);
        } else {
          await articlesAPI.addTag(articleId, tagIdOrName);
        }
        setLocalTags(prev => [...prev, trimmedTag]);
        setNewTag("");
      } catch (e) {
        console.error('addNewTag failed', e);
      }
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
      {isOpen && buttonRef.current && (
        <div
          ref={popoverRef}
          onClick={handlePopoverClick}
          className={`${position.fixed ? 'fixed' : 'absolute'} w-[280px] bg-card border border-border rounded-lg shadow-lg z-60 p-3 max-h-[80vh] overflow-y-auto`}
          style={
            position.fixed
              ? {
                  left: `${position.left}px`,
                  top: `${position.top}px`,
                }
              : {
                  left: `${position.left}px`,
                  top: position.above ? 'auto' : '100%',
                  bottom: position.above ? '100%' : 'auto',
                  marginTop: position.above ? '0' : '0.25rem',
                  marginBottom: position.above ? '0.25rem' : '0',
                }
          }
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