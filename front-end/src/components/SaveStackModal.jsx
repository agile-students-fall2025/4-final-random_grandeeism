/**
 * SaveStackModal.jsx
 * 
 * Description: Modal dialog for naming and saving a custom search as a Stack
 * Purpose: Allows users to give a custom name to their current filter combination
 *          and save it for quick access from the sidebar
 */

import { useState, useEffect } from "react";
import { SquareLibrary, X } from "lucide-react";
import { Button } from "./ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.jsx";
import { Input } from "./ui/input.jsx";
import { Label } from "./ui/label.jsx";

export default function SaveStackModal({ 
  isOpen, 
  onClose, 
  onSave,
  currentFilters,
  currentQuery = ''
}) {
  const [stackName, setStackName] = useState("");
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStackName("");
      setError("");
    }
  }, [isOpen]);

  const handleSave = () => {
    // Validate name
    if (!stackName.trim()) {
      setError("Please enter a name for this Stack");
      return;
    }

    if (stackName.trim().length < 2) {
      setError("Stack name must be at least 2 characters");
      return;
    }

    if (stackName.trim().length > 50) {
      setError("Stack name must be 50 characters or less");
      return;
    }

    // Call save handler
    onSave({
      name: stackName.trim(),
      filters: currentFilters,
      query: currentQuery
    });

    // Close modal
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && stackName.trim()) {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SquareLibrary size={20} className="text-primary" />
            Save as Stack
          </DialogTitle>
          <DialogDescription>
            Give your custom search a name so you can quickly access it later from the sidebar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="stack-name">Stack Name</Label>
            <Input
              id="stack-name"
              placeholder="e.g., Weekend Reading, Tech News, Quick Videos..."
              value={stackName}
              onChange={(e) => {
                setStackName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              className={error ? "border-destructive" : ""}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Show filter summary */}
          {currentFilters && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-medium mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-1.5">
                {currentFilters.query && (
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    Search: "{currentFilters.query}"
                  </span>
                )}
                {currentFilters.tags?.length > 0 && (
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    {currentFilters.tags.length} tag{currentFilters.tags.length > 1 ? 's' : ''}
                  </span>
                )}
                {currentFilters.timeFilter && currentFilters.timeFilter !== "all" && (
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    Time: {currentFilters.timeFilter}
                  </span>
                )}
                {currentFilters.mediaType && currentFilters.mediaType !== "all" && (
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    Type: {currentFilters.mediaType}
                  </span>
                )}
                {currentFilters.status && currentFilters.status !== "all" && (
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    Status: {currentFilters.status}
                  </span>
                )}
                {currentFilters.favoritesFilter && currentFilters.favoritesFilter !== "all" && (
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    Favorites: {currentFilters.favoritesFilter}
                  </span>
                )}
                {currentFilters.feedFilter && (
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    Feed filter active
                  </span>
                )}
                {currentFilters.sortBy && currentFilters.sortBy !== "dateAdded" && (
                  <span className="text-xs bg-background px-2 py-1 rounded">
                    Sort: {currentFilters.sortBy}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!stackName.trim()}
          >
            <SquareLibrary size={16} className="mr-2" />
            Save Stack
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
