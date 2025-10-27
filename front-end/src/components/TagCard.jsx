/**
 * TagCard.jsx
 * 
 * Description: Reusable card component for displaying tags in the Tags view
 * Purpose: Primary interface for browsing and managing tags with click-to-filter functionality
 */

import { Tag, Edit2, Trash2, FileText, Video, Headphones } from "lucide-react";

export default function TagCard({
  tag,
  articleCount,
  maxCount,
  mediaBreakdown,
  onTagClick,
  onRename,
  onDelete,
}) {
  const handleRename = (e) => {
    e.stopPropagation();
    const newTag = prompt(`Rename tag "${tag}" to:`, tag);
    
    if (newTag && newTag.trim() !== '' && newTag !== tag) {
      onRename?.(tag, newTag.trim());
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete tag "${tag}"? This will remove it from ${articleCount} ${articleCount === 1 ? 'item' : 'items'}.`)) {
      onDelete?.(tag);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between gap-3">
        {/* Main clickable area */}
        <div 
          className="flex-1 cursor-pointer" 
          onClick={() => onTagClick(tag)}
        >
          {/* Tag Icon & Name */}
          <div className="flex items-center gap-2 mb-3">
            <Tag size={20} className="text-muted-foreground" />
            <h3 className="font-medium text-[18px] text-foreground group-hover:text-primary transition-colors">
              {tag}
            </h3>
          </div>
          
          {/* Article Count */}
          <div className="mb-3">
            <div className="text-[24px] font-semibold text-foreground">
              {articleCount} {articleCount === 1 ? 'item' : 'items'}
            </div>
          </div>
          
          {/* Media Breakdown */}
          {mediaBreakdown && (
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-3 flex-wrap">
              {mediaBreakdown.articles > 0 && (
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  {mediaBreakdown.articles} {mediaBreakdown.articles === 1 ? 'article' : 'articles'}
                </span>
              )}
              {mediaBreakdown.videos > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Video size={14} />
                    {mediaBreakdown.videos} {mediaBreakdown.videos === 1 ? 'video' : 'videos'}
                  </span>
                </>
              )}
              {mediaBreakdown.podcasts > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Headphones size={14} />
                    {mediaBreakdown.podcasts} {mediaBreakdown.podcasts === 1 ? 'podcast' : 'podcasts'}
                  </span>
                </>
              )}
            </div>
          )}
          
          {/* Usage Bar */}
          <div className="w-full bg-accent rounded-full h-2">
            <div 
              className="bg-foreground/70 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(articleCount / maxCount) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Action Buttons (hover-revealed) */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Rename */}
          {onRename && (
            <button
              onClick={handleRename}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Rename tag"
            >
              <Edit2 size={16} className="text-muted-foreground" />
            </button>
          )}
          
          {/* Delete */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
              title="Delete tag"
            >
              <Trash2 size={16} className="text-destructive" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
