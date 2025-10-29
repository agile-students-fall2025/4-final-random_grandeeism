import { Tag, Edit2, Trash2, FileText, Video, Headphones } from "lucide-react";

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
    <div className="bg-card border border-border rounded-[8px] p-4 hover:border-primary/50 transition-all group">
      <div className="flex items-start justify-between gap-3">
        {/* Main clickable area */}
        <div 
          className="flex-1 cursor-pointer" 
          onClick={() => onTagClick(tag)}
        >
          {/* Tag Icon & Name */}
          <div className="flex items-center gap-2 mb-3">
            <Tag size={20} className="text-muted-foreground" />
            <h3 className="font-['Inter:Medium', sans-serif] text-[18px] text-foreground group-hover:text-primary transition-colors">
              {tag}
            </h3>
          </div>
          
          {/* Article Count */}
          <div className="mb-3">
            <div className="text-[24px] font-['Inter:SemiBold', sans-serif] text-foreground">
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