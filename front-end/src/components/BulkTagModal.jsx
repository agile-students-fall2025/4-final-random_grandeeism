/**
 * BulkTagModal.jsx
 * 
 * Description: Modal for adding tags to multiple selected items simultaneously
 * Purpose: Provides efficient batch tag management with new tag creation and existing tag selection
 */

import { useState } from "react";
import { X, Tag, Plus } from "lucide-react";
import { Button } from "./primitives/button.jsx";
import { Badge } from "./primitives/badge.jsx";

export default function BulkTagModal({
  isOpen,
  onClose,
  selectedCount,
  allTags = [],
  onApplyTags,
}) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");

  if (!isOpen) return null;

  const handleAddNewTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setNewTagInput("");
    }
  };

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleApply = () => {
    onApplyTags(selectedTags);
    setSelectedTags([]);
    setNewTagInput("");
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewTag();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Modal Content */}
      <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-primary" />
            <h2 className="text-[18px] font-semibold">Add Tags to Items</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Selected Count Display */}
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-[13px] text-muted-foreground">
              Adding tags to <span className="text-foreground font-medium">{selectedCount}</span> selected {selectedCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Tags to Add Section */}
          {selectedTags.length > 0 && (
            <div>
              <label className="text-[13px] text-muted-foreground mb-2 block">
                Tags to add:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[12px] cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X size={12} className="ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add New Tag Input */}
          <div>
            <label className="text-[13px] mb-2 block">
              Add new tag
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type and press Enter..."
                className="flex-1 px-3 py-2 text-[14px] bg-background border border-border rounded focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Button
                size="sm"
                onClick={handleAddNewTag}
                disabled={!newTagInput.trim()}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Existing Tags Selection */}
          {allTags.length > 0 && (
            <div>
              <label className="text-[13px] text-muted-foreground mb-2 block">
                Or select from existing tags:
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="text-[12px] cursor-pointer"
                    onClick={() => handleToggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={selectedTags.length === 0}
          >
            <Tag size={16} className="mr-2" />
            Add {selectedTags.length} Tag{selectedTags.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  );
}
