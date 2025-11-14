/**
 * ConfirmDeleteModal.jsx
 * 
 * Description: Modal component for confirming article deletion
 * Purpose: Provides a clean, centered confirmation dialog for destructive delete actions
 */

import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  articleTitle 
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div 
        className="bg-background border border-border rounded-lg w-full max-w-md mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Delete Article</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-foreground mb-2">
            Are you sure you want to delete this article?
          </p>
          {articleTitle && (
            <p className="text-sm text-muted-foreground mb-3 font-medium line-clamp-2">
              "{articleTitle}"
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The article will be permanently removed from your library.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            Delete Article
          </button>
        </div>
      </div>
    </div>
  );
}