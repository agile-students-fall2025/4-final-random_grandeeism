/**
 * StatusChangeModal.jsx
 * 
 * Description: Modal component for changing article status
 * Purpose: Provides a clean interface for selecting article status with visual feedback
 */

import { useState, useEffect } from 'react';
import { STATUS } from '../constants/statuses.js';
import { 
  X, 
  Inbox, 
  Calendar, 
  BookOpen, 
  RotateCcw, 
  Archive,
  Check
} from 'lucide-react';

export default function StatusChangeModal({ 
  isOpen, 
  onClose, 
  article, 
  onStatusChange 
}) {
  const [selectedStatus, setSelectedStatus] = useState(article?.status || STATUS.INBOX);

  // Update selectedStatus when article changes (important for state consistency)
  useEffect(() => {
    if (article?.status) {
      setSelectedStatus(article.status);
    }
  }, [article?.status]);

  if (!isOpen || !article) return null;

  const statusOptions = [
    {
      value: STATUS.INBOX,
      label: 'Inbox',
      icon: Inbox,
      description: 'Move to inbox for later review'
    },
    {
      value: STATUS.DAILY,
      label: 'Daily Reading',
      icon: Calendar,
      description: 'Add to daily reading queue'
    },
    {
      value: STATUS.CONTINUE,
      label: 'Continue Reading',
      icon: BookOpen,
      description: 'Mark as partially read'
    },
    {
      value: STATUS.REDISCOVERY,
      label: 'Rediscovery',
      icon: RotateCcw,
      description: 'Save for future rediscovery'
    },
    {
      value: STATUS.ARCHIVED,
      label: 'Archive',
      icon: Archive,
      description: 'Archive as completed or no longer needed'
    }
  ];

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
  };

  const handleSave = () => {
    // Debug logging can be removed in production
    
    if (onStatusChange && selectedStatus !== article.status) {
      onStatusChange(article.id, selectedStatus);
      
      // Show user feedback about where the article went
      const statusLabels = {
        [STATUS.INBOX]: 'Inbox',
        [STATUS.DAILY]: 'Daily Reading',
        [STATUS.CONTINUE]: 'Continue Reading',
        [STATUS.REDISCOVERY]: 'Rediscovery',
        [STATUS.ARCHIVED]: 'Archive'
      };
      
      const newStatusLabel = statusLabels[selectedStatus];
      if (newStatusLabel && selectedStatus !== article.status) {
        // Show a subtle notification instead of an alert
        console.log(`Article "${article.title}" moved to ${newStatusLabel}`);
      }
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedStatus(article.status); // Reset to original status
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
        className="bg-background border border-border rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Change Status</h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Article Info */}
        <div className="p-4 border-b border-border">
          <h3 className="font-medium text-sm mb-1 line-clamp-2">{article.title}</h3>
          <p className="text-xs text-muted-foreground">
            Current status: {statusOptions.find(opt => opt.value === article.status)?.label || 'Unknown'}
          </p>
        </div>

        {/* Status Options */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;
              const isCurrent = article.status === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusSelect(option.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-md border transition-colors text-left ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <Icon size={18} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {option.label}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <Check size={16} className="text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
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
            onClick={handleSave}
            disabled={selectedStatus === article.status}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedStatus === article.status ? 'No Change' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}