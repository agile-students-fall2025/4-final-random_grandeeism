/**
 * ArticleCard.jsx
 * 
 * Description: Reusable card component for displaying articles, videos, and podcasts
 * Purpose: Primary interface for interacting with saved content items in all queue views
 * 
 * DESIGN STANDARD: Use PanelBottomClose icon for MANUAL "change status" actions (dropdowns, buttons).
 * NOTE: Automatic queue advancement (status icon hover) shows the NEXT STATUS icon for clarity.
 */

import { useState, useEffect, useRef } from 'react';
import { STATUS } from '../constants/statuses.js';
import { 
  generateExportContent, 
  downloadFile, 
  generateFilename, 
  getMimeType,
  generatePDFFile 
} from '../utils/exportUtils.js';
import { 
  Star, 
  Tag, 
  Calendar, 
  Check, 
  Archive, 
  Inbox, 
  BookOpen, 
  RotateCcw, 
  FileDown, 
  ChevronDown, 
  Trash2, 
  ExternalLink,
  PanelBottomClose  // For manual status change actions (not automatic queue advancement)
} from 'lucide-react';
import ExportNotesModal from './ExportNotesModal.jsx';
import StatusChangeModal from './StatusChangeModal.jsx';
import { tagsAPI } from '../services/api.js';
import { ensureTagsLoaded, getTagName, getTagMapSnapshot } from '../utils/tagsCache.js';
import { calculateReadingTime } from '../utils/readingTime.js';

export default function ArticleCard({
  article,
  onArticleClick,
  onToggleFavorite,
  onManageTags,
  onStatusChange,
  onDelete,
  selectionMode = false,
  isSelected = false,
  onToggleSelect
}) {
  const [isStatusHovered, setIsStatusHovered] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [tagMap, setTagMap] = useState(getTagMapSnapshot());
  const loadingRef = useRef(false);
  const lastArticleTagsRef = useRef(null);

  useEffect(() => {
    const maybeLoad = async () => {
      // Serialize tags for comparison to avoid reference changes causing re-runs
      const currentTagsKey = Array.isArray(article?.tags) ? article.tags.slice().sort().join(',') : '';
      if (lastArticleTagsRef.current === currentTagsKey) return; // no change
      lastArticleTagsRef.current = currentTagsKey;
      
      const needsNumericResolution = Array.isArray(article?.tags) && article.tags.some(t => /^\d+$/.test(String(t)) && !tagMap[String(t)]);
      if (!needsNumericResolution) return;
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        await ensureTagsLoaded(() => tagsAPI.getAll({ sort: 'alphabetical' }));
        setTagMap(getTagMapSnapshot());
      } catch (e) {
        console.error('ArticleCard ensureTagsLoaded failed', e);
      } finally {
        loadingRef.current = false;
      }
    };
    maybeLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.tags]); // tagMap intentionally omitted to prevent infinite loop

  const resolveTagDisplay = (t) => getTagName(t);

  // Get status icon information
  const getStatusIconInfo = (status) => {
    switch (status) {
      case STATUS.INBOX:
        return { 
          icon: Inbox, 
          color: 'text-foreground', 
          bgColor: 'bg-foreground/10',
          label: 'Inbox',
        };
      case STATUS.DAILY:
        return { 
          icon: Calendar, 
          color: 'text-foreground', 
          bgColor: 'bg-foreground/10',
          label: 'Daily Reading',
        };
      case STATUS.CONTINUE:
        return { 
          icon: BookOpen, 
          color: 'text-foreground', 
          bgColor: 'bg-foreground/10',
          label: 'Continue Reading',
        };
      case STATUS.REDISCOVERY:
        return { 
          icon: RotateCcw, 
          color: 'text-foreground', 
          bgColor: 'bg-foreground/10',
          label: 'Rediscovery Queue',
        };
      case STATUS.ARCHIVED:
        return { 
          icon: Archive, 
          color: 'text-muted-foreground', 
          bgColor: 'bg-muted/50',
          label: 'Archive',
        };
      default:
        return { 
          icon: Inbox, 
          color: 'text-foreground', 
          bgColor: 'bg-foreground/10',
          label: 'Inbox'
        };
    }
  };

  // Get next status in workflow
  const getNextStatus = () => {
    switch (article.status) {
      case STATUS.INBOX: return STATUS.DAILY;
      case STATUS.DAILY: return STATUS.CONTINUE;
      case STATUS.CONTINUE: return STATUS.REDISCOVERY;
      case STATUS.REDISCOVERY: return STATUS.ARCHIVED;
      case STATUS.ARCHIVED: return null;
      default: return null;
    }
  };

  // Shorten URL for display
  const getShortenedUrl = () => {
    try {
      const urlObj = new URL(article.url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return article.url;
    }
  };

  const statusIconInfo = getStatusIconInfo(article.status);
  const StatusIcon = statusIconInfo.icon;
  const nextStatus = getNextStatus();
  const nextStatusIconInfo = nextStatus ? getStatusIconInfo(nextStatus) : null;
  const NextStatusIcon = nextStatusIconInfo?.icon;

  // Handle card click
  const handleCardClick = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(article.id);
    } else {
      onArticleClick(article);
    }
    // no-op: card click should not change status by default
  };

  // Handle status icon click
  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (nextStatus && onStatusChange) {
      onStatusChange(article.id, nextStatus);
    }
  };

  // Handle export
  const handleExport = async (format, destination) => {
    console.log('🔄 Starting export process:', { format, destination, article: article.title });
    
    // Close modal FIRST to prevent any interaction issues
    setShowExportModal(false);
    
    try {
      const filename = generateFilename(article.title || 'Untitled Article', format);
      
      // Handle PDF export differently - generate PDF directly
      if (format === 'pdf') {
        await generatePDFFile(article, filename);
      } else {
        // Generate content for text-based formats
        const content = await generateExportContent(article, format);
        const mimeType = getMimeType(format);
        downloadFile(content, filename, mimeType);
      }
      
      console.log(`✅ Successfully exported "${article.title}" as ${format.toUpperCase()}`);
      
    } catch (error) {
      console.error('❌ Export failed:', error);
      toast.error('Export failed', {
        description: 'There was an error exporting your notes. Please try again.',
      });
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      {/* Main Content */}
      <div className="p-4 relative">
        {/* Selection Checkbox */}
        {selectionMode && (
          <div className="absolute top-4 left-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(article.id);
              }}
              className="w-4 h-4 rounded border-border"
            />
          </div>
        )}

        {/* Status Icon (Top Right) */}
  {article.status !== STATUS.ARCHIVED && nextStatus ? (
          <button
            onClick={handleStatusClick}
            onMouseEnter={() => setIsStatusHovered(true)}
            onMouseLeave={() => setIsStatusHovered(false)}
            className={`absolute top-4 right-4 p-2 rounded-full ${statusIconInfo.bgColor} ${statusIconInfo.color} hover:opacity-80 transition-opacity`}
            title={`Send to ${nextStatusIconInfo?.label}?`}
          >
            {isStatusHovered && NextStatusIcon ? (
              <NextStatusIcon size={16} />
            ) : (
              <StatusIcon size={16} />
            )}
          </button>
  ) : article.status === STATUS.ARCHIVED ? (
          <div className={`absolute top-4 right-4 p-2 rounded-full ${statusIconInfo.bgColor} ${statusIconInfo.color} opacity-60`}>
            <StatusIcon size={16} />
          </div>
        ) : null}

        {/* Title */}
        <h4 className={`line-clamp-2 pr-12 ${selectionMode ? 'ml-8' : ''}`}>
          {article.title}
        </h4>

        {/* Metadata Row */}
        <div className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground flex-wrap">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            {getShortenedUrl()}
            <ExternalLink size={12} />
          </a>
          {article.author && (
            <>
              <span>|</span>
              <span>{article.author}</span>
            </>
          )}
          <span>|</span>
          <span>{article.content ? calculateReadingTime(article.content) : (article.readingTime || '2 min read')}</span>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {article.tags
              .map(tag => ({ raw: tag, name: resolveTagDisplay(tag) }))
              .filter(t => t.name) // suppress empty while mapping not ready
              .map(t => (
                <span 
                  key={t.raw}
                  className="inline-flex items-center gap-1 text-[11px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                >
                  {t.name}
                </span>
              ))}
          </div>
        )}

        {/* Progress Bar (Continue Reading Only) */}
  {article.status === STATUS.CONTINUE && article.readProgress !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-foreground/80">
                {article.readProgress}% Complete
              </span>
            </div>
            <div className="w-full bg-accent rounded-full h-2">
              <div 
                className="bg-foreground/70 h-2 rounded-full transition-all duration-300"
                style={{ width: `${article.readProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="px-4 pt-4 pb-2 border-t border-border">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(article.id);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-accent hover:bg-accent/80 rounded transition-colors"
          >
            <Star size={14} className={article.isFavorite ? 'fill-foreground text-foreground' : ''} />
            {article.isFavorite ? 'Unfavorite' : 'Favorite'}
          </button>

          {/* Tags Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onManageTags && onManageTags(article);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-accent hover:bg-accent/80 rounded transition-colors"
          >
            <Tag size={14} />
            Manage Tags
          </button>

          {/* Export Notes Button (only shown if article has annotations) */}
          {article.hasAnnotations && (
            <button
              onClick={(e) => {
                console.log('🚀 Export button clicked for article:', article.title);
                e.stopPropagation();
                setShowExportModal(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-accent hover:bg-accent/80 rounded transition-colors"
            >
              <FileDown size={14} />
              Export Notes
            </button>
          )}

          {/* Change Status Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowStatusModal(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-accent hover:bg-accent/80 rounded transition-colors"
          >
            <PanelBottomClose size={14} />
            Change Status
          </button>

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(article.id);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-destructive/10 hover:bg-destructive/20 text-destructive rounded transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Export Notes Modal */}
      <ExportNotesModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        articleTitle={article.title}
        onExport={handleExport}
      />

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        article={article}
        onStatusChange={onStatusChange}
      />
    </div>
  );
}
