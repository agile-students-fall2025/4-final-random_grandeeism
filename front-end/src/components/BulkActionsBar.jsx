/**
 * BulkActionsBar.jsx
 * 
 * Description: Fixed bottom toolbar for bulk operations on selected items
 * Purpose: Provides batch operations for favoriting, tagging, status changes, and deletion
 */

import { X, Star, Tag, Archive, Trash2, Inbox, Calendar, BookOpen, RotateCcw, PanelBottomClose } from "lucide-react";
import { STATUS } from "../constants/statuses.js";
import { Button } from "./primitives/button.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./primitives/dropdown-menu.jsx";

export default function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkFavorite,
  onBulkUnfavorite,
  onBulkTag,
  onBulkStatusChange,
  onBulkAdvanceStatus,
  onBulkDelete,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Clear + Count */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClearSelection}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Clear selection"
            >
              <X size={20} />
            </button>
            <span className="text-[14px]">
              {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
            </span>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Favorite */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkFavorite}
              className="text-[13px]"
            >
              <Star size={14} className="mr-1" />
              Favorite
            </Button>

            {/* Unfavorite */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkUnfavorite}
              className="text-[13px]"
            >
              <Star size={14} className="mr-1" />
              Unfavorite
            </Button>

            {/* Add Tags */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkTag}
              className="text-[13px]"
            >
              <Tag size={14} className="mr-1" />
              Add Tags
            </Button>

            {/* Change Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[13px]"
                >
                  <PanelBottomClose size={14} className="mr-1" />
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={onBulkAdvanceStatus}>
                  <PanelBottomClose size={16} className="mr-2" />
                  Move to Next Queue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusChange(STATUS.INBOX)}>
                  <Inbox size={16} className="mr-2" />
                  Move to Inbox
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusChange(STATUS.DAILY)}>
                  <Calendar size={16} className="mr-2" />
                  Move to Daily Reading
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusChange(STATUS.CONTINUE)}>
                  <BookOpen size={16} className="mr-2" />
                  Move to Continue Reading
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusChange(STATUS.REDISCOVERY)}>
                  <RotateCcw size={16} className="mr-2" />
                  Move to Rediscovery
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStatusChange(STATUS.ARCHIVED)}>
                  <Archive size={16} className="mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="text-[13px] text-destructive hover:text-destructive"
            >
              <Trash2 size={14} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
