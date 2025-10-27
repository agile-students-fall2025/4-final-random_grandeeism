/**
 * BulkFeedsModal.jsx
 * 
 * Description: Modal for managing multiple RSS/podcast feeds simultaneously
 * Purpose: Provides batch operations for refreshing, organizing, and managing multiple feeds
 */

import { useState } from "react";
import { X, Rss, RefreshCw, Folder, Clock, Pause, Play, Trash2, AlertTriangle, FileText, Video, Headphones } from "lucide-react";
import { Button } from "./primitives/button.jsx";
import { Badge } from "./primitives/badge.jsx";

export default function BulkFeedsModal({
  isOpen,
  onClose,
  selectedFeeds = [],
  allFolders = [],
  onApplyActions,
}) {
  const [selectedFolder, setSelectedFolder] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOption, setDeleteOption] = useState("delete-all");
  const [refreshing, setRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleApplyActions = () => {
    const actions = {};
    
    if (selectedFolder) actions.folder = selectedFolder;
    if (selectedFrequency) actions.updateFrequency = selectedFrequency;
    
    if (Object.keys(actions).length > 0) {
      onApplyActions(actions);
      resetState();
      onClose();
    }
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    await onApplyActions({ refresh: true });
    setRefreshing(false);
  };

  const handlePause = () => {
    onApplyActions({ pause: true });
    resetState();
    onClose();
  };

  const handleResume = () => {
    onApplyActions({ resume: true });
    resetState();
    onClose();
  };

  const handleMarkAllRead = () => {
    onApplyActions({ markAllRead: true });
    resetState();
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onApplyActions({
      delete: { deleteType: deleteOption }
    });
    setShowDeleteConfirm(false);
    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedFolder("");
    setSelectedFrequency("");
    setDeleteOption("delete-all");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false);
      } else {
        onClose();
      }
    }
  };

  const totalArticles = selectedFeeds.reduce((sum, feed) => sum + (feed.articleCount || 0), 0);

  // Delete Confirmation Dialog
  if (showDeleteConfirm) {
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-destructive" />
              <h2 className="text-[18px] font-semibold">Delete {selectedFeeds.length} Feeds?</h2>
            </div>
            <button onClick={() => setShowDeleteConfirm(false)} className="p-1 hover:bg-accent rounded">
              <X size={20} />
            </button>
          </div>
          
          <div className="px-6 py-6 space-y-4">
            <p className="text-[14px] text-muted-foreground">
              You are about to delete {selectedFeeds.length} feeds with a total of {totalArticles} articles.
            </p>
            
            <div>
              <p className="text-[14px] font-medium mb-3">What would you like to do with the articles?</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-accent rounded">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="keep"
                    checked={deleteOption === "keep"}
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-[13px]">Keep all articles (orphaned)</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-accent rounded">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="delete-read"
                    checked={deleteOption === "delete-read"}
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-[13px]">Delete only read articles</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-accent rounded">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="delete-all"
                    checked={deleteOption === "delete-all"}
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-[13px]">Delete all articles ({totalArticles} items)</span>
                </label>
              </div>
            </div>
            
            <div className="p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
              <AlertTriangle size={16} className="text-destructive mt-0.5" />
              <p className="text-[12px] text-destructive">This action cannot be undone.</p>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Feeds
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Modal
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rss size={20} className="text-primary" />
            <h2 className="text-[18px] font-semibold">Manage Feeds</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Selected Count */}
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-[13px] text-muted-foreground">
              Managing <span className="text-foreground font-medium">{selectedFeeds.length}</span> selected {selectedFeeds.length === 1 ? 'feed' : 'feeds'}
            </p>
          </div>

          {/* Selected Feeds Preview */}
          <div>
            <label className="text-[13px] text-muted-foreground mb-2 block">Selected Feeds:</label>
            <div className="bg-accent/50 border border-border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {selectedFeeds.map((feed) => (
                <div key={feed.id} className="flex items-center gap-2 p-2 hover:bg-background/50 rounded">
                  <Rss size={16} className="text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] truncate">{feed.name}</span>
                      {feed.feedType && (
                        <Badge variant="outline" className="text-[10px]">
                          {feed.feedType === 'article' && <FileText size={10} className="mr-1" />}
                          {feed.feedType === 'video' && <Video size={10} className="mr-1" />}
                          {feed.feedType === 'podcast' && <Headphones size={10} className="mr-1" />}
                          {feed.feedType}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      {feed.articleCount || 0} items
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh & Sync */}
          <div>
            <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-2">Refresh & Sync</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={refreshing}>
                <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh All Now'}
              </Button>
            </div>
          </div>

          {/* Organization */}
          <div>
            <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-2">Organization</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[13px] mb-1 block">Add to folder:</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-background border border-border rounded focus:border-primary focus:outline-none"
                >
                  <option value="">Select folder...</option>
                  {allFolders.map((folder) => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                  <option value="_new_">+ Create New Folder</option>
                </select>
              </div>
              
              <div>
                <label className="text-[13px] mb-1 block">Update frequency:</label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-background border border-border rounded focus:border-primary focus:outline-none"
                >
                  <option value="">Select frequency...</option>
                  <option value="hourly">Every hour</option>
                  <option value="6hours">Every 6 hours</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feed Status */}
          <div>
            <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-2">Feed Status</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePause}>
                <Pause size={14} className="mr-2" />
                Pause Updates
              </Button>
              <Button variant="outline" size="sm" onClick={handleResume}>
                <Play size={14} className="mr-2" />
                Resume Updates
              </Button>
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                Mark All as Read
              </Button>
            </div>
          </div>

          {/* Cleanup */}
          <div>
            <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-2">Cleanup</h3>
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
              <Trash2 size={14} className="mr-2" />
              Delete Feeds
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyActions} disabled={!selectedFolder && !selectedFrequency}>
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
