/**
 * AddLinkModal.jsx
 * 
 * Description: Modal dialog for adding new links/articles to the read-it-later collection
 * Purpose: Provides a comprehensive form to add URLs with metadata (tags, status, favorite)
 */

import { useState } from 'react';
import { 
  Star, 
  Tag, 
  X, 
  Inbox, 
  Calendar, 
  Archive, 
  BookOpen, 
  RotateCcw,
  CheckCircle
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

export default function AddLinkModal({ isOpen, onClose, articles = [], onAddLink }) {
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTags, setNewLinkTags] = useState([]);
  const [newLinkStatus, setNewLinkStatus] = useState('inbox');
  const [newLinkFavorite, setNewLinkFavorite] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Get all existing tags from articles for suggestions
  const allExistingTags = Array.from(new Set(articles.flatMap(a => a.tags || []))).sort();

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
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      handleAddTag(newTagInput);
      setNewTagInput('');
    }
  };

  const handleAddLinkSubmit = () => {
    if (newLinkUrl.trim()) {
      const newArticle = {
        id: Date.now().toString(),
        title: 'New Article',
        url: newLinkUrl,
        description: 'Article description will appear here once the link is processed...',
        readingTime: '2 min',
        isFavorite: newLinkFavorite,
        status: newLinkStatus,
        tags: newLinkTags,
        dateAdded: new Date(),
        isRead: false,
        hasAnnotations: false
      };

      if (onAddLink) {
        onAddLink(newArticle);
      }

      // Show success message
      setShowSuccessMessage(true);

      // Hide success message and close modal after 2 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        resetForm();
      }, 2000);
    }
  };

  const resetForm = () => {
    setNewLinkUrl('');
    setNewLinkTags([]);
    setNewLinkStatus('inbox');
    setNewLinkFavorite(false);
    setNewTagInput('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
    }}>
      <DialogContent className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
          <DialogDescription>
            Save a link to your reading list and optionally add tags or status.
          </DialogDescription>
        </DialogHeader>
        
        {/* URL Input */}
        <div className="mb-4">
          <label className="block text-[14px] text-foreground mb-2" for="url-input">URL</label>
          <Input id="url-input" onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="https://example.com/article"></Input>
        </div>

        {/* Tags Section */}
        <div className="mb-6">
          <label className="block text-[14px] text-foreground mb-2" for="tags-input">Tags</label>
          <Input className="mb-3" id="tags-input" type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} onKeyDown={handleTagInputKeyDown} placeholder="Add tags (press Enter)" />

          {/* Selected Tags Display */}
          {newLinkTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {newLinkTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-[12px] text-primary bg-primary/10 px-2 py-1 rounded">
                  <Tag size={12} />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive hover:cursor-pointer"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Tag Input */}
          {/* <input
            id="tags-input"
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Add tags (press Enter)"
            className="w-full p-2 border border-border bg-background text-foreground rounded text-[14px] outline-none focus:border-primary"
          /> */}
          
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
                      type="button"
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
              type="button"
              onClick={() => setNewLinkStatus('inbox')}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === 'inbox'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-border bg-background hover:border-blue-500/50'
              }`}
            >
              <Inbox size={20} className={`mx-auto mb-1 ${newLinkStatus === 'inbox' ? 'text-blue-500' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === 'inbox' ? 'text-blue-500' : 'text-foreground'}`}>Inbox</p>
            </button>
            
            {/* Daily Reading */}
            <button
              type="button"
              onClick={() => setNewLinkStatus('dailyReading')}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === 'dailyReading'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-border bg-background hover:border-indigo-500/50'
              }`}
            >
              <Calendar size={20} className={`mx-auto mb-1 ${newLinkStatus === 'dailyReading' ? 'text-indigo-500' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === 'dailyReading' ? 'text-indigo-500' : 'text-foreground'}`}>Daily Reading</p>
            </button>
            
            {/* Continue Reading */}
            <button
              type="button"
              onClick={() => setNewLinkStatus('inProgress')}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === 'inProgress'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-border bg-background hover:border-amber-500/50'
              }`}
            >
              <BookOpen size={20} className={`mx-auto mb-1 ${newLinkStatus === 'inProgress' ? 'text-amber-500' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === 'inProgress' ? 'text-amber-500' : 'text-foreground'}`}>Continue Reading</p>
            </button>
          </div>
          
          {/* Bottom Row: Rediscovery Queue, Archive */}
          <div className="grid grid-cols-2 gap-2">
            {/* Rediscovery Queue */}
            <button
              type="button"
              onClick={() => setNewLinkStatus('rediscovery')}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === 'rediscovery'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-border bg-background hover:border-green-500/50'
              }`}
            >
              <RotateCcw size={20} className={`mx-auto mb-1 ${newLinkStatus === 'rediscovery' ? 'text-green-500' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === 'rediscovery' ? 'text-green-500' : 'text-foreground'}`}>Rediscovery Queue</p>
            </button>
            
            {/* Archive */}
            <button
              type="button"
              onClick={() => setNewLinkStatus('archived')}
              className={`p-3 rounded border-2 transition-all ${
                newLinkStatus === 'archived'
                  ? 'border-rose-500 bg-rose-500/10'
                  : 'border-border bg-background hover:border-rose-500/50'
              }`}
            >
              <Archive size={20} className={`mx-auto mb-1 ${newLinkStatus === 'archived' ? 'text-rose-500' : 'text-muted-foreground'}`} />
              <p className={`text-[12px] ${newLinkStatus === 'archived' ? 'text-rose-500' : 'text-foreground'}`}>Archive</p>
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
                <SelectItem value="dailyReading">Daily Reading</SelectItem>
                <SelectItem value="inProgress">Continue Reading</SelectItem>
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
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-border bg-background hover:border-yellow-500/50'
            }`}
          >
            <Star size={18} className={newLinkFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'} />
            <span className={`text-[14px] ${newLinkFavorite ? 'text-yellow-500' : 'text-foreground'}`}>
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
            <Button type="submit" onClick={handleAddLinkSubmit} disabled={!newLinkUrl.trim() || showSuccessMessage} className="cursor-pointer">Save changes</Button>
        </DialogFooter>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500 rounded flex items-center gap-2 text-green-500">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Link saved successfully!</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
