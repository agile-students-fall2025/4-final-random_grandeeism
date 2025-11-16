/**
 * TagManagerModal.jsx
 * 
 * Modal for managing tags on articles with autocomplete dropdown functionality
 * This component is self-contained and manages its own state for real-time updates
 */

import { useState, useEffect, useRef } from "react";
import { X, Plus, Minus, Tag } from "lucide-react";
import { tagsAPI, articlesAPI } from "../services/api.js";

export default function TagManagerModal({ 
  isOpen, 
  onClose, 
  article: initialArticle,
  availableTags: initialAvailableTags = [], 
  onAddTag, 
  onRemoveTag,
  onCreateTag // New prop for creating tags
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [currentArticleTags, setCurrentArticleTags] = useState(article?.tags || []);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Internal state for article and tags - this is the source of truth
  const [article, setArticle] = useState(initialArticle);
  const [availableTags, setAvailableTags] = useState(initialAvailableTags);

  // Sync with props when modal opens or article changes
  useEffect(() => {
    if (isOpen && initialArticle) {
      setArticle(initialArticle);
    }
  }, [isOpen, initialArticle]);

  // Sync available tags
  useEffect(() => {
    setAvailableTags(initialAvailableTags);
  }, [initialAvailableTags]);

  // Helper: determine if a tag (id or name) is already on the article to avoid duplicate API calls
  const isTagAlreadyOnArticle = (art, tagIdentifier) => {
    if (!art) return false;
    const tagArray = Array.isArray(art.tags) ? art.tags : [];
    if (tagIdentifier == null) return false;
    const idStr = String(tagIdentifier);
    // Tag may be stored as numeric id or as name string after resolution
    return tagArray.some(t => String(t) === idStr);
  };

  // Update local article tags when the article prop changes
  useEffect(() => {
    setCurrentArticleTags(article?.tags || []);
  }, [article]);

  // Get current tag IDs and resolve them to tag objects
  // Handle both cases: tags as IDs or tags as names (after resolution)
  const currentTags = availableTags.filter(tag => {
    // Check if current article tags contain either the tag ID or tag name
    return currentArticleTags.includes(tag.id) || currentArticleTags.includes(tag.name);
  });

  // Filter available tags based on search term and exclude already added tags
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTags([]);
      setShowDropdown(false);
      return;
    }

    const filtered = availableTags.filter(tag => {
      // Check if tag is already added (by ID or name)
      const isAlreadyAdded = currentArticleTags.includes(tag.id) || currentArticleTags.includes(tag.name);
      // Check if tag name matches search term
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase());
      return !isAlreadyAdded && matchesSearch;
    });
    
    // Check if search term exactly matches any existing tag
    const exactMatch = availableTags.find(tag => 
      tag.name.toLowerCase() === searchTerm.toLowerCase()
    );

    // Build options; prefer showing "Create new" at the top when applicable
    let optionsToShow = filtered;
    if (!exactMatch && searchTerm.trim().length >= 2) {
      const createNewOption = {
        id: `create-new-${searchTerm.trim().toLowerCase()}`,
        name: searchTerm.trim(),
        isCreateNew: true,
        color: '#6b7280' // Default color
      };
      optionsToShow = [createNewOption, ...filtered];
    }
    
    setFilteredTags(optionsToShow);
    setShowDropdown(optionsToShow.length > 0);
    setSelectedIndex(-1);
  }, [searchTerm, availableTags, currentArticleTags]);

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
        // Try to create the tag
        const newTagData = {
          name: tag.name,
          color: tag.color || '#6b7280',
          description: `Tag for ${tag.name}`
        };

        try {
          const createResponse = await tagsAPI.create(newTagData);
          if (createResponse.success && createResponse.data) {
            const newTag = createResponse.data;
            
            // Add to available tags list immediately
            setAvailableTags(prev => {
              const exists = prev.some(t => t.id === newTag.id || t.name.toLowerCase() === newTag.name.toLowerCase());
              return exists ? prev : [...prev, newTag];
            });
            
            // Add the new tag to the article
            if (!isTagAlreadyOnArticle(article, newTag.id) && !isTagAlreadyOnArticle(article, newTag.name)) {
              if (onAddTag) {
                try { 
                  await onAddTag(article.id, newTag.id);
                } catch (e) {
                  const em = String(e?.message || '').toLowerCase();
                  if (!em.includes('already')) throw e;
                }
              } else {
                try { 
                  await articlesAPI.addTag(article.id, newTag.id);
                } catch (e) {
                  const em = String(e?.message || '').toLowerCase();
                  if (!em.includes('already')) throw e;
                }
              }
              
              // Update internal article state immediately
              setArticle(prev => ({
                ...prev,
                tags: [...(prev.tags || []), newTag.id]
              }));
            }
            
            // Notify parent
            onCreateTag && onCreateTag(newTag);
          }
        } catch (err) {
          // If tag already exists in system, fetch it and attach
          const msg = String(err?.message || '').toLowerCase();
          if (msg.includes('already exists') && !msg.includes('already on article')) {
            console.log('Tag exists in system, fetching and attaching...');
            const list = await tagsAPI.getAll({ search: tag.name });
            const existing = Array.isArray(list?.data)
              ? list.data.find(t => t.name.toLowerCase() === tag.name.toLowerCase())
              : null;
            if (existing) {
              // Add to available tags if not already there
              setAvailableTags(prev => {
                const exists = prev.some(t => t.id === existing.id);
                return exists ? prev : [...prev, existing];
              });
              
              if (!isTagAlreadyOnArticle(article, existing.id) && !isTagAlreadyOnArticle(article, existing.name)) {
                if (onAddTag) {
                  try { 
                    await onAddTag(article.id, existing.id);
                  } catch (e2) {
                    const em2 = String(e2?.message || '').toLowerCase();
                    if (!em2.includes('already')) throw e2;
                  }
                } else {
                  try { 
                    await articlesAPI.addTag(article.id, existing.id);
                  } catch (e2) {
                    const em2 = String(e2?.message || '').toLowerCase();
                    if (!em2.includes('already')) throw e2;
                  }
                }
                
                // Update internal article state immediately
                setArticle(prev => ({
                  ...prev,
                  tags: [...(prev.tags || []), existing.id]
                }));
              }
              
              onCreateTag && onCreateTag(existing);
            } else {
              throw err;
            }
          } else {
            throw err;
          }
        }
      } else {
        // Add existing tag
        if (!isTagAlreadyOnArticle(article, tag.id) && !isTagAlreadyOnArticle(article, tag.name)) {
          if (onAddTag) {
            try { 
              await onAddTag(article.id, tag.id);
            } catch (e) {
              const em = String(e?.message || '').toLowerCase();
              if (!em.includes('already')) throw e;
            }
          } else {
            try { 
              await articlesAPI.addTag(article.id, tag.id);
            } catch (e) {
              const em = String(e?.message || '').toLowerCase();
              if (!em.includes('already')) throw e;
            }
          }
          
          // Update internal article state immediately
          setArticle(prev => ({
            ...prev,
            tags: [...(prev.tags || []), tag.id]
          }));
        }
        // Update local state to immediately show the new tag
        setCurrentArticleTags(prev => [...prev, tag.id]);
      }

      setSearchTerm('');
      setShowDropdown(false);
      setSelectedIndex(-1);
    } catch (error) {
      // Only log true errors
      const errorMsg = String(error?.message || '').toLowerCase();
      if (!errorMsg.includes('already on article') && !errorMsg.includes('already exists') && !errorMsg.includes('duplicate')) {
        console.error('Failed to add tag:', error);
        alert(`Failed to add tag: ${error.message}`);
      } else {
        console.debug('Suppressed duplicate tag add error:', error.message);
      }
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      if (onRemoveTag) {
        await onRemoveTag(article.id, tag.id);
      } else {
        await articlesAPI.removeTag(article.id, tag.id);
      }
      
      // Update internal article state immediately
      setArticle(prev => ({
        ...prev,
        tags: (prev.tags || []).filter(t => String(t) !== String(tag.id) && String(t) !== String(tag.name))
      }));
    } catch (error) {
      console.error('Failed to remove tag:', error);
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
                    key={tag.id}
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
                      key={tag.id}
                      onClick={() => handleAddTag(tag)}
                      className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 ${
                        index === selectedIndex ? 'bg-accent' : ''
                      } ${tag.isCreateNew ? 'border-t border-border bg-muted/20' : ''}`}
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