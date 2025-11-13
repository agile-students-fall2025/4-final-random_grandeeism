import { useState } from "react";
import { Tag, Edit2, Trash2, FileText, Video, Headphones } from "lucide-react";
import { Button } from "./ui/button.jsx";
import { Card } from "./ui/card.jsx";
import { Input } from "./ui/input.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./ui/dialog.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog.jsx";
import { Label } from "./ui/label.jsx";
import { Badge } from "./ui/badge.jsx";

/**
 * TagCard component for displaying individual tags in the Tags view
 * @param {Object} props
 * @param {string} props.tag - The tag name/label
 * @param {number} props.articleCount - Total number of items with this tag
 * @param {number} props.maxCount - Maximum count across all tags (for usage bar calculation)
 * @param {Object} [props.mediaBreakdown] - Optional breakdown by media type
 * @param {number} [props.mediaBreakdown.articles] - Number of articles
 * @param {number} [props.mediaBreakdown.videos] - Number of videos
 * @param {number} [props.mediaBreakdown.podcasts] - Number of podcasts
 * @param {Function} props.onTagClick - Handler when card is clicked (filters content by this tag)
 * @param {Function} [props.onRename] - Optional handler to rename the tag
 * @param {Function} [props.onDelete] - Optional handler to delete the tag from all items
 */
export default function TagCard({
  tag,
  articleCount,
  maxCount,
  mediaBreakdown,
  onTagClick,
  onRename,
  onDelete,
}) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState(tag);

  const handleRename = (e) => {
    e.stopPropagation();
    setNewTagName(tag);
    setIsRenameDialogOpen(true);
  };

  const handleRenameConfirm = () => {
    if (newTagName && newTagName.trim() !== '' && newTagName.trim() !== tag) {
      onRename?.(tag, newTagName.trim());
      setIsRenameDialogOpen(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(tag);
    setIsDeleteDialogOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newTagName.trim() !== tag) {
      e.preventDefault();
      handleRenameConfirm();
    }
  };

  return (
    <>
      <Card 
        className="group hover:border-primary/50 transition-all cursor-pointer"
        onClick={() => onTagClick(tag)}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            {/* Main content area */}
            <div className="flex-1 min-w-0">
              {/* Tag Icon & Name */}
              <div className="flex items-center gap-2 mb-3">
                <Tag className="size-5 text-muted-foreground shrink-0" />
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {tag}
                </h3>
              </div>
              
              {/* Article Count */}
              <div className="mb-3">
                <div className="text-2xl font-semibold text-foreground">
                  {articleCount}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {articleCount === 1 ? 'item' : 'items'}
                </div>
              </div>
              
              {/* Media Breakdown */}
              {mediaBreakdown && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {mediaBreakdown.articles > 0 && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <FileText className="size-3" />
                      {mediaBreakdown.articles}
                    </Badge>
                  )}
                  {mediaBreakdown.videos > 0 && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Video className="size-3" />
                      {mediaBreakdown.videos}
                    </Badge>
                  )}
                  {mediaBreakdown.podcasts > 0 && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Headphones className="size-3" />
                      {mediaBreakdown.podcasts}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Usage Bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max((articleCount / maxCount) * 100, 5)}%` }}
                />
              </div>
            </div>
            
            {/* Action Buttons (hover-revealed) */}
            <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {/* Rename */}
              {onRename && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={handleRename}
                    title="Rename tag"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                    <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rename Tag</DialogTitle>
                      <DialogDescription>
                        Enter a new name for the tag "{tag}".
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rename-tag">New Tag Name</Label>
                        <Input
                          id="rename-tag"
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter new tag name..."
                          autoFocus
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        onClick={e => { e.stopPropagation(); handleRenameConfirm(); }}
                        disabled={!newTagName.trim() || newTagName.trim() === tag}
                      >
                        Rename
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                  </Dialog>
                </>
              )}
              
              {/* Delete */}
              {onDelete && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleDelete}
                    title="Delete tag"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the tag "{tag}"? This will remove it from {articleCount} {articleCount === 1 ? 'item' : 'items'}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={e => { e.stopPropagation(); handleDeleteConfirm(); }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
