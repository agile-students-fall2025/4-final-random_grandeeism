/**
 * TagManagerModal.jsx
 * 
 * Modal for managing tags on articles with autocomplete dropdown functionality
 * This component is self-contained and manages its own state for real-time updates
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Plus, Minus, Tag } from "lucide-react";

export default function TagManagerModal({ 
  isOpen, 
  onClose, 
  article,
  availableTags = [], 
  onAddTag, 
  onRemoveTag,
  onCreateTag
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Local state for immediate UI updates - tracks tag IDs for the current article
  const [currentArticleTags, setCurrentArticleTags] = useState([]);

  // Update local state when article or availableTags props change
  useEffect(() => {
    if (article?.tags) {
      setCurrentArticleTags(Array.isArray(article.tags) ? [...article.tags] : []);
    } else {
      setCurrentArticleTags([]);
    }
  }, [article?.tags]);

  // Get current tag objects by matching currentArticleTags (IDs) with availableTags
  const currentTags = useMemo(() => {
    return availableTags.filter(tag => {
      return currentArticleTags.some(artTagId => String(artTagId) === String(tag.id));
    });
  }, [availableTags, currentArticleTags]);

  // Get set of current tag IDs for faster lookup
  const currentTagIds = useMemo(() => {
    return new Set(currentTags.map(tag => String(tag.id)));
  }, [currentTags]);

  // Filter available tags based on search term and exclude already added tags
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTags([]);
      setShowDropdown(false);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    const filtered = availableTags.filter(tag => {
      // Check if tag is already added (by ID)
      const isAlreadyAdded = currentTagIds.has(String(tag.id));
      // Check if tag name matches search term
      const matchesSearch = tag.name.toLowerCase().includes(searchLower);
      return !isAlreadyAdded && matchesSearch;
    });
    
    // Check if search term exactly matches any existing tag
    const exactMatch = availableTags.find(tag => 
      tag.name.toLowerCase() === searchLower
    );

    // Build options; prefer showing "Create new" at the top when applicable
    let optionsToShow = filtered;
    if (!exactMatch && searchTerm.trim().length >= 2) {
      const createNewOption = {
        id: `create-new-${searchLower}`,
        name: searchTerm.trim(),
        isCreateNew: true,
      };
      optionsToShow = [createNewOption, ...filtered];
    }
    
    setFilteredTags(optionsToShow);
    setShowDropdown(optionsToShow.length > 0);
    setSelectedIndex(-1);
  }, [searchTerm, availableTags, currentTagIds]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredTags.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredTags[selectedIndex]) {
          handleAddTag(filteredTags[selectedIndex]);
        } else if (filteredTags.length > 0) {
          // Default to first option (usually "Create new") when nothing selected
          handleAddTag(filteredTags[0]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleAddTag = async (tag) => {
    try {
      if (tag.isCreateNew) {
        // Delegate tag creation to parent - parent will handle everything
        if (onCreateTag) {
          const createdTag = await onCreateTag(tag.name);
          // Update local state if we get the created tag back
          if (createdTag && createdTag.id) {
            setCurrentArticleTags(prev => [...prev, createdTag.id]);
          }
        }
      } else {
        // Update local state immediately for instant UI feedback
        setCurrentArticleTags(prev => [...prev, tag.id]);
        
        // Add existing tag via parent callback
        if (onAddTag) {
          await onAddTag(article.id, tag.id);
        }
      }

      // Clear search after successful add
      setSearchTerm('');
      setShowDropdown(false);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Failed to add tag:', error);
      
      // Revert local state on error (only for existing tags, not newly created ones)
      if (!tag.isCreateNew) {
        setCurrentArticleTags(prev => prev.filter(tagId => String(tagId) !== String(tag.id)));
      }
      
      const errorMsg = String(error?.message || 'Unknown error');
      // Don't show alert for duplicate errors
      if (!errorMsg.toLowerCase().includes('already')) {
        alert(`Failed to add tag: ${errorMsg}`);
      }
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      // Update local state immediately for instant UI feedback
      setCurrentArticleTags(prev => prev.filter(tagId => String(tagId) !== String(tag.id)));
      
      // Then call the parent's remove handler
      if (onRemoveTag) {
        await onRemoveTag(article.id, tag.id);
      }
    } catch (error) {
      console.error('Failed to remove tag:', error);
      // Revert local state on error
      setCurrentArticleTags(prev => [...prev, tag.id]);
      alert(`Failed to remove tag: ${error.message}`);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md mx-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Manage Tags</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Article Info */}
          <div className="mb-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-1">Article:</h3>
            <p className="text-sm truncate">{article?.title}</p>
          </div>

          {/* Current Tags */}
          <div className="mb-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Current Tags:</h3>
            {currentTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentTags.map(tag => (
                  <div 
                    key={`current-tag-${tag.id}`}
                    className="flex items-center gap-1 px-2 py-1 bg-accent rounded-md text-sm"
                  >
                    <Tag size={12} />
                    <span>{tag.name}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 p-0.5 hover:bg-accent-foreground/10 rounded transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tags assigned</p>
            )}
          </div>

          {/* Add New Tag */}
          <div className="mb-4">
            <h3 className="font-medium text-sm text-muted-foreground mb-2">Add Tag:</h3>
            <div className="relative" ref={dropdownRef}>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search tags..."
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              
              {/* Dropdown */}
              {showDropdown && filteredTags.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
                  {filteredTags.map((tag, index) => (
                    <button
                      key={tag.isCreateNew ? tag.id : `dropdown-tag-${tag.id}`}
                      onClick={() => handleAddTag(tag)}
                      className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 ${
                        index === selectedIndex ? 'bg-accent' : ''
                      } ${tag.isCreateNew ? 'border-b border-border bg-muted/20 font-medium' : ''}`}
                    >
                      <Plus size={14} />
                      <span>
                        {tag.isCreateNew ? (
                          <>Create new tag: <strong>{tag.name}</strong></>
                        ) : (
                          tag.name
                        )}
                      </span>
                      {!tag.isCreateNew && (
                        <span className="text-xs text-muted-foreground ml-auto">#{tag.id}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {/* No results message */}
              {showDropdown && filteredTags.length === 0 && searchTerm.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg px-3 py-2 text-sm text-muted-foreground">
                  No tags found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}