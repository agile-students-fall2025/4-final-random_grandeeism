/**
 * AddLinkModal.jsx
 * 
 * Description: Modal dialog for adding new links/articles to the read-it-later collection
 * Purpose: Provides a comprehensive form to add URLs with metadata (tags, status, favorite)
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  Tag, 
  X, 
  Inbox, 
  Calendar, 
  Archive, 
  BookOpen, 
  RotateCcw,
  CheckCircle,
  Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, SelectLabel } from './ui/select.jsx';
import { STATUS } from "../constants/statuses.js";
import { tagsAPI, extractAPI, articlesAPI } from '../services/api.js';

export default function AddLinkModal({ isOpen, onClose, articles = [], onAddLink }) {
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTags, setNewLinkTags] = useState([]);
  const [newLinkStatus, setNewLinkStatus] = useState(STATUS.INBOX);
  const [newLinkFavorite, setNewLinkFavorite] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Enhanced tag management state
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(-1);
  
  const tagInputRef = useRef(null);
  const tagDropdownRef = useRef(null);

  // Load available tags from API
  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await tagsAPI.getAll();
        if (response.success && response.data) {
          setAvailableTags(response.data);
        }
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  // Filter tags based on search input
  useEffect(() => {
    if (newTagInput.trim() === '') {
      setFilteredTags([]);
      setShowTagDropdown(false);
      return;
    }

    const searchLower = newTagInput.toLowerCase().trim();
    const currentTagIds = new Set(newLinkTags.map(tag => typeof tag === 'object' ? tag.id : tag));

    const filtered = availableTags.filter(tag => {
      // Exclude already selected tags
      if (currentTagIds.has(tag.id)) return false;
      // Include tags that match the search
      return tag.name.toLowerCase().includes(searchLower);
    });

    // Add "Create new tag" option if no exact match exists
    const exactMatch = availableTags.find(tag => tag.name.toLowerCase() === searchLower);
    if (!exactMatch && searchLower.length > 0) {
      filtered.unshift({
        id: `create-${Date.now()}`,
        name: newTagInput.trim(),
        isCreateNew: true
      });
    }

    setFilteredTags(filtered);
    setShowTagDropdown(filtered.length > 0);
    setSelectedTagIndex(-1);
  }, [newTagInput, availableTags, newLinkTags]);

  // Get all existing tags from articles for suggestions (fallback)
  const allExistingTags = Array.from(new Set(articles.flatMap(a => a.tags || []))).sort();

  const handleAddTag = async (tag) => {
    try {
      let tagToAdd;

      if (typeof tag === 'string') {
        // Handle legacy string tags or direct tag names
        const trimmedTag = tag.trim();
        if (!trimmedTag) return;

        // Check if tag already exists
        const existingTag = availableTags.find(t => t.name.toLowerCase() === trimmedTag.toLowerCase());
        if (existingTag) {
          tagToAdd = existingTag;
        } else {
          // Create new tag
          const response = await tagsAPI.create({ name: trimmedTag });
          if (response.success && response.data) {
            tagToAdd = response.data;
            setAvailableTags(prev => [...prev, response.data]);
          } else {
            throw new Error('Failed to create tag');
          }
        }
      } else if (tag.isCreateNew) {
        // Create new tag from dropdown
        const response = await tagsAPI.create({ name: tag.name });
        if (response.success && response.data) {
          tagToAdd = response.data;
          setAvailableTags(prev => [...prev, response.data]);
        } else {
          throw new Error('Failed to create tag');
        }
      } else {
        // Use existing tag object
        tagToAdd = tag;
      }

      // Check if tag is already selected
      const isAlreadySelected = newLinkTags.some(selectedTag => 
        (typeof selectedTag === 'object' ? selectedTag.id : selectedTag) === tagToAdd.id
      );

      if (!isAlreadySelected) {
        setNewLinkTags([...newLinkTags, tagToAdd]);
      }

      // Clear input and hide dropdown
      setNewTagInput('');
      setShowTagDropdown(false);
      setSelectedTagIndex(-1);
    } catch (error) {
      console.error('Failed to add tag:', error);
      alert(`Failed to add tag: ${error.message}`);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewLinkTags(newLinkTags.filter(tag => {
      const tagId = typeof tag === 'object' ? tag.id : tag;
      const removeId = typeof tagToRemove === 'object' ? tagToRemove.id : tagToRemove;
      return tagId !== removeId;
    }));
  };

  const handleTagInputKeyDown = (e) => {
    if (showTagDropdown && filteredTags.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedTagIndex(prev => 
            prev < filteredTags.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedTagIndex(prev => 
            prev > 0 ? prev - 1 : filteredTags.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedTagIndex >= 0 && selectedTagIndex < filteredTags.length) {
            handleAddTag(filteredTags[selectedTagIndex]);
          } else if (filteredTags.length > 0) {
            handleAddTag(filteredTags[0]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowTagDropdown(false);
          setSelectedTagIndex(-1);
          break;
      }
    } else if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      handleAddTag(newTagInput);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setShowTagDropdown(false);
        setSelectedTagIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddLinkSubmit = () => {
    if (newLinkUrl.trim()) {
      (async () => {
        try {
          const extraction = await extractAPI.extract(newLinkUrl.trim());
          if (extraction && extraction.success && extraction.data) {
            const ext = extraction.data;

            // Convert tag objects to tag IDs for the API
            const tagIds = newLinkTags.map(tag => typeof tag === 'object' ? tag.id : tag);

            const newArticle = {
              title: ext.title || 'New Article',
              url: newLinkUrl,
              description: ext.excerpt || 'Article description will appear here once the link is processed...',
              content: ext.content || '',
              textContent: ext.textContent || '',
              readingTime: ext.readingTime ? `${ext.readingTime} min` : '1 min',
              isFavorite: newLinkFavorite,
              status: newLinkStatus,
              tags: tagIds,
              dateAdded: new Date(),
              source: ext.source || null,
              isRead: false,
              hasAnnotations: false
            };

            // Try to persist via API, fallback to bubbling up local object
            try {
              const created = await articlesAPI.create(newArticle);
              if (created && created.success && created.data) {
                if (onAddLink) onAddLink(created.data);
              } else {
                if (onAddLink) onAddLink(newArticle);
              }
            } catch (err) {
              console.error('Failed to create article via API:', err);
              if (onAddLink) onAddLink(newArticle);
            }

            setShowSuccessMessage(true);
            setTimeout(() => {
              setShowSuccessMessage(false);
              resetForm();
            }, 2000);
            return;
          }
        } catch (error) {
          console.warn('Extraction failed, falling back to manual entry:', error);
        }

        // Fallback behavior — use minimal article object
        const fallbackTagIds = newLinkTags.map(tag => typeof tag === 'object' ? tag.id : tag);
        const fallbackArticle = {
          id: Date.now().toString(),
          title: 'New Article',
          url: newLinkUrl,
          description: 'Article description will appear here once the link is processed...',
          readingTime: '2 min',
          isFavorite: newLinkFavorite,
          status: newLinkStatus,
          tags: fallbackTagIds,
          dateAdded: new Date(),
          isRead: false,
          hasAnnotations: false
        };

        if (onAddLink) {
          onAddLink(fallbackArticle);
        }

        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          resetForm();
        }, 2000);
      })();
    }
  };

  const resetForm = () => {
    setNewLinkUrl('');
    setNewLinkTags([]);
    setNewLinkStatus(STATUS.INBOX);
    setNewLinkFavorite(false);
    setNewTagInput('');
    setShowTagDropdown(false);
    setSelectedTagIndex(-1);
    setFilteredTags([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
    }}>
      <DialogContent className="w-full sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
          <DialogDescription>
            Save a link to your reading list and optionally add tags or status.
          </DialogDescription>
        </DialogHeader>
        
        {/* URL Input */}
        <div className="mb-4">
          <label className="block text-[14px] text-foreground mb-2" htmlFor="url-input">URL</label>
          <Input id="url-input" onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="https://example.com/article"></Input>
        </div>

        {/* Tags Section */}
        <div className="mb-6">
          <label className="block text-[14px] text-foreground mb-2" htmlFor="tags-input">Tags</label>
          
          {/* Selected Tags Display */}
          {newLinkTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {newLinkTags.map((tag, index) => {
                const tagName = typeof tag === 'object' ? tag.name : tag;
                const tagKey = typeof tag === 'object' ? `tag-${tag.id}` : `tag-${index}`;
                return (
                  <span key={tagKey} className="inline-flex items-center gap-1 text-[12px] text-foreground bg-accent px-2 py-1 rounded">
                    <Tag size={12} />
                    {tagName}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive hover:cursor-pointer"
                      type="button"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Tag Input with Dropdown */}
          <div className="relative" ref={tagDropdownRef}>
            <Input 
              ref={tagInputRef}
              id="tags-input" 
              type="text" 
              value={newTagInput} 
              onChange={(e) => setNewTagInput(e.target.value)} 
              onKeyDown={handleTagInputKeyDown} 
              placeholder="Search tags or create new..." 
              className="mb-0"
            />

            {/* Autocomplete Dropdown */}
            {showTagDropdown && filteredTags.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg max-h-40 overflow-y-auto z-50">
                {filteredTags.map((tag, index) => (
                  <button
                    key={tag.isCreateNew ? `create-${tag.name}` : `tag-${tag.id}`}
                    onClick={() => handleAddTag(tag)}
                    className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 ${
                      index === selectedTagIndex ? 'bg-accent' : ''
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
          </div>

          {/* Quick Add from Available Tags */}
          {availableTags.length > 0 && newTagInput === '' && (
            <div className="mt-3">
              <p className="text-[12px] text-muted-foreground mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {availableTags
                  .filter(tag => !newLinkTags.some(selected => 
                    (typeof selected === 'object' ? selected.id : selected) === tag.id
                  ))
                  .slice(0, 15)
                  .map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTag(tag)}
                      type="button"
                      className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded hover:bg-accent hover:text-foreground transition-colors"
                    >
                      + {tag.name}
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
              type="button"
              onClick={() => setNewLinkStatus(STATUS.INBOX)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.INBOX
                  ? 'border-foreground bg-accent'
                  : 'border-border bg-background hover:border-muted-foreground'
              }`}
            >
              <Inbox size={20} className={`mx-auto mb-1 ${newLinkStatus === STATUS.INBOX ? 'text-foreground' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === STATUS.INBOX ? 'text-foreground font-medium' : 'text-foreground'}`}>Inbox</p>
            </button>
            
            {/* Daily Reading */}
            <button
              type="button"
              onClick={() => setNewLinkStatus(STATUS.DAILY)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.DAILY
                  ? 'border-foreground bg-accent'
                  : 'border-border bg-background hover:border-muted-foreground'
              }`}
            >
              <Calendar size={20} className={`mx-auto mb-1 ${newLinkStatus === STATUS.DAILY ? 'text-foreground' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === STATUS.DAILY ? 'text-foreground font-medium' : 'text-foreground'}`}>Daily Reading</p>
            </button>
            
            {/* Continue Reading */}
            <button
              type="button"
              onClick={() => setNewLinkStatus(STATUS.CONTINUE)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.CONTINUE
                  ? 'border-foreground bg-accent'
                  : 'border-border bg-background hover:border-muted-foreground'
              }`}
            >
              <BookOpen size={20} className={`mx-auto mb-1 ${newLinkStatus === STATUS.CONTINUE ? 'text-foreground' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === STATUS.CONTINUE ? 'text-foreground font-medium' : 'text-foreground'}`}>Continue Reading</p>
            </button>
          </div>
          
          {/* Bottom Row: Rediscovery Queue, Archive */}
          <div className="grid grid-cols-2 gap-2">
            {/* Rediscovery Queue */}
            <button
              type="button"
              onClick={() => setNewLinkStatus(STATUS.REDISCOVERY)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.REDISCOVERY
                  ? 'border-foreground bg-accent'
                  : 'border-border bg-background hover:border-muted-foreground'
              }`}
            >
              <RotateCcw size={20} className={`mx-auto mb-1 ${newLinkStatus === STATUS.REDISCOVERY ? 'text-foreground' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === STATUS.REDISCOVERY ? 'text-foreground font-medium' : 'text-foreground'}`}>Rediscovery Queue</p>
            </button>
            
            {/* Archive */}
            <button
              type="button"
              onClick={() => setNewLinkStatus(STATUS.ARCHIVED)}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === STATUS.ARCHIVED
                  ? 'border-foreground bg-accent'
                  : 'border-border bg-background hover:border-muted-foreground'
              }`}
            >
              <Archive size={20} className={`mx-auto mb-1 ${newLinkStatus === STATUS.ARCHIVED ? 'text-foreground' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === STATUS.ARCHIVED ? 'text-foreground font-medium' : 'text-foreground'}`}>Archive</p>
            </button>
          </div>
        </div>

        {/* <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="inbox">Inbox</SelectItem>
                <SelectItem value="daily">Daily Reading</SelectItem>
                <SelectItem value="continue">Continue Reading</SelectItem>
                <SelectItem value="rediscovery">Rediscovery Queue</SelectItem>
                <SelectItem value="archived">Archive</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div> */}

        {/* Favorite Toggle */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setNewLinkFavorite(!newLinkFavorite)}
            className={`w-full p-3 rounded border-2 transition-all flex items-center justify-center gap-2 ${
              newLinkFavorite
                ? 'border-foreground bg-accent'
                : 'border-border bg-background hover:border-muted-foreground'
            }`}
          >
            <Star size={18} className={newLinkFavorite ? 'text-foreground fill-foreground' : 'text-muted-foreground'} />
            <span className={`text-[14px] ${newLinkFavorite ? 'text-foreground font-medium' : 'text-foreground'}`}>
              {newLinkFavorite ? 'Favorited' : 'Add to Favorites'}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="mt-2">
          {/* Cancel Button */}
          {/* <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:opacity-80 transition-opacity"
            disabled={showSuccessMessage}
          >
            Cancel
          </button> */}
          
          {/* Add Link Button */}
          {/* <button
            type="button"
            onClick={handleAddLinkSubmit}
            disabled={!newLinkUrl.trim() || showSuccessMessage}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Link
          </button> */}

            <DialogClose asChild>
              <Button variant="outline" disabled={showSuccessMessage}>Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleAddLinkSubmit} disabled={!newLinkUrl.trim() || showSuccessMessage} className="cursor-pointer">Save link</Button>
        </DialogFooter>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mt-4 p-4 bg-accent border border-foreground rounded flex items-center gap-2 text-foreground">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Link saved successfully!</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
