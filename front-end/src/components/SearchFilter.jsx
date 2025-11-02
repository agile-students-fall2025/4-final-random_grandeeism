/**
 * SearchFilter.jsx
 * 
 * Description: Advanced search and filtering component for the Fieldnotes read-it-later application
 * Purpose: Provides comprehensive filtering interface with text search, tags, reading time, media type,
 *          status, favorites, RSS feeds, and sort options. Supports locked filters and saved searches.
 * Features:
 *  - Live text search with clear button
 *  - Multi-select tag filtering with count badge
 *  - Reading time filter (short, medium, long)
 *  - Media type filter (article, video, podcast)
 *  - Status filter (inbox, daily reading, continue reading, etc.)
 *  - Favorites filter (all, starred only, non-starred)
 *  - RSS feed source filter
 *  - Multiple sort options (date added, time ascending/descending)
 *  - Pin as Stack button for saving current search
 *  - Select All button for bulk selection mode
 *  - Active filter chips with individual remove buttons
 *  - Locked filters (non-removable pre-applied filters)
 *  - Collapsible filter button row
 *  - Exclusive dropdown behavior (only one open at a time)
 */

import { useState, useEffect, useRef } from "react";
import { 
  Search,
  X,
  Filter,
  Tag,
  Clock,
  ArrowUpDown,
  Inbox,
  Star,
  Pin,
  Rss,
  MessageSquare
} from "lucide-react";

import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";

export default function SearchFilter({
  // Required
  onSearch,
  
  // Configuration
  placeholder = "Search by name or content...",
  availableTags = [],
  availableFeeds = [],
  showTimeFilter = true,
  showMediaFilter = false,
  showTagFilter = true,
  showSortOptions = true,
  showStatusFilter = false,
  showFavoritesFilter = false,
  showAnnotationsFilter = false,
  showFeedFilter = false,
  
  // Initial State
  preAppliedFilters,
  initialQuery = "",
  
  // Locked Filters (non-removable)
  lockedFilters = {},
  onFilterChipRemoved,
  
  // Actions
  onSaveSearch,
  
  // Selection Mode (Bulk Actions)
  selectionMode = false,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0
}) {
  // Filter Labels
  const timeFilterLabels = {
    all: "All Lengths",
    short: "Short (< 5 min)",
    medium: "Medium (5-15 min)",
    long: "Long (> 15 min)"
  };

  const mediaTypeLabels = {
    all: "All Types",
    article: "Text",
    video: "Video",
    podcast: "Audio"
  };

  const sortLabels = {
    dateAdded: "Date Added (Newest)",
    dateAddedOldest: "Date Added (Oldest)",
    lengthAsc: "Length (Shortest)",
    lengthDesc: "Length (Longest)",
  };

  const statusFilterLabels = {
    all: "All Status",
    inbox: "Inbox",
    daily: "Daily",
    continue: "Continue",
    rediscovery: "Rediscovery",
    archived: "Archive"
  };

  const favoritesFilterLabels = {
    all: "All Articles",
    favorites: "Starred Only",
    nonFavorites: "Non-Starred"
  };

  const annotationsFilterLabels = {
    all: "All Articles",
    annotated: "Annotated",
    unannotated: "Unannotated"
  };

  // Filter State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState(preAppliedFilters?.tags || []);
  const [timeFilter, setTimeFilter] = useState(preAppliedFilters?.timeFilter || "all");
  const [mediaType, setMediaType] = useState(lockedFilters.mediaType || preAppliedFilters?.mediaType || "all");
  const [sortBy, setSortBy] = useState(preAppliedFilters?.sortBy || "dateAdded");
  const [statusFilter, setStatusFilter] = useState(lockedFilters.status || preAppliedFilters?.status || "all");
  const [favoritesFilter, setFavoritesFilter] = useState(lockedFilters.favoritesFilter || preAppliedFilters?.favoritesFilter || "all");
  const [annotationsFilter, setAnnotationsFilter] = useState(preAppliedFilters?.annotationsFilter || "all");
  const [feedFilter, setFeedFilter] = useState(lockedFilters.feed || preAppliedFilters?.feedFilter || "");

  // Dropdown State
  const [showFilters, setShowFilters] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showMediaDropdown, setShowMediaDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFavoritesDropdown, setShowFavoritesDropdown] = useState(false);
  const [showAnnotationsDropdown, setShowAnnotationsDropdown] = useState(false);
  const [showFeedDropdown, setShowFeedDropdown] = useState(false);

  // Ref for change detection
  const prevFiltersRef = useRef(undefined);

  // Computed: Has Active Filters
  const hasActiveFilters = 
    selectedTags.length > 0 || 
    timeFilter !== "all" || 
    (mediaType !== "all" && mediaType !== lockedFilters.mediaType) || 
    searchQuery !== "" || 
    sortBy !== "dateAdded" || 
    (statusFilter !== "all" && statusFilter !== lockedFilters.status) || 
    (favoritesFilter !== "all" && favoritesFilter !== lockedFilters.favoritesFilter) ||
    annotationsFilter !== "all" ||
    feedFilter !== "";

  // Event Handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const removeTag = (tag) => {
    // Check if this is a locked/preapplied tag
    if (lockedFilters?.tags?.includes(tag)) {
      // Call the handler to navigate away
      if (onFilterChipRemoved) {
        onFilterChipRemoved();
      }
      return;
    }
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setTimeFilter("all");
    setMediaType(lockedFilters.mediaType || "all");
    setSortBy("dateAdded");
    setStatusFilter(lockedFilters.status || "all");
    setFavoritesFilter(lockedFilters.favoritesFilter || "all");
    setAnnotationsFilter("all");
    setFeedFilter(lockedFilters.feed || "");
    setSearchQuery("");
  };

  // Effect: Sync with Pre-Applied Filters
  useEffect(() => {
    if (!preAppliedFilters) return;

    // Check if preAppliedFilters actually changed
    const prev = prevFiltersRef.current;
    const hasChanged = !prev ||
      prev.query !== preAppliedFilters.query ||
      prev.timeFilter !== preAppliedFilters.timeFilter ||
      prev.mediaType !== preAppliedFilters.mediaType ||
      prev.sortBy !== preAppliedFilters.sortBy ||
      prev.status !== preAppliedFilters.status ||
      prev.favoritesFilter !== preAppliedFilters.favoritesFilter ||
      prev.feedFilter !== preAppliedFilters.feedFilter ||
      JSON.stringify(prev.tags) !== JSON.stringify(preAppliedFilters.tags);

    if (hasChanged) {
      prevFiltersRef.current = preAppliedFilters;
      
      // Update all filter state
      const newQuery = preAppliedFilters.query || "";
      const newTags = preAppliedFilters.tags || [];
      const newTimeFilter = preAppliedFilters.timeFilter || "all";
      const newMediaType = lockedFilters.mediaType || preAppliedFilters.mediaType || "all";
      const newSortBy = preAppliedFilters.sortBy || "dateAdded";
      const newStatusFilter = lockedFilters.status || preAppliedFilters.status || "all";
      const newFavoritesFilter = lockedFilters.favoritesFilter || preAppliedFilters.favoritesFilter || "all";
      const newFeedFilter = preAppliedFilters.feedFilter || "";

      setSearchQuery(newQuery);
      setSelectedTags(newTags);
      setTimeFilter(newTimeFilter);
      setMediaType(newMediaType);
      setSortBy(newSortBy);
      setStatusFilter(newStatusFilter);
      setFavoritesFilter(newFavoritesFilter);
      setFeedFilter(newFeedFilter);
    }
  }, [preAppliedFilters, lockedFilters]);

  // Effect: Trigger Search on Filter Change
  useEffect(() => {
    onSearch(searchQuery, {
      query: searchQuery,
      tags: selectedTags,
      timeFilter,
      mediaType,
      sortBy,
      status: statusFilter,
      favoritesFilter,
      annotationsFilter,
      feedFilter
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedTags, timeFilter, mediaType, sortBy, statusFilter, favoritesFilter, annotationsFilter, feedFilter]);

  return (
    <div className="border-b border-border px-4 py-3 md:px-6">
      {/* Row 1: Search Bar & Action Buttons */}
      <div className="flex items-center gap-2 mb-3">
        {/* Search Input */}
        <div className="flex-1 min-w-0 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-card text-foreground text-[14px] outline-none placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="p-1 hover:opacity-70 transition-opacity shrink-0">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
        
        {/* Pin Button (visible when filters are active) */}
        {hasActiveFilters && onSaveSearch && (
          <button
            onClick={onSaveSearch}
            className="p-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors shrink-0"
            title="Pin as Stack"
            aria-label="Pin this search as a Stack"
          >
            <Pin size={18} />
          </button>
        )}

        {/* Select All Button (visible in selection mode) */}
        {selectionMode && onSelectAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="text-[13px] whitespace-nowrap shrink-0"
            disabled={totalCount === 0}
          >
            <span className="hidden sm:inline">
              {selectedCount === totalCount && totalCount > 0 ? "Deselect All" : "Select All"}
            </span>
            <span className="sm:hidden">
              {selectedCount === totalCount && totalCount > 0 ? "Deselect" : "Select"}
            </span>
          </Button>
        )}

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-colors shrink-0 ${
            hasActiveFilters ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/80"
          }`}
          aria-label="Toggle filters"
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Row 2: Active Filter Chips */}
      {(hasActiveFilters || lockedFilters.status || lockedFilters.mediaType || lockedFilters.favoritesFilter) && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {/* Locked Status Filter */}
          {lockedFilters.status && lockedFilters.status !== "all" && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {statusFilterLabels[lockedFilters.status]}
              {onFilterChipRemoved && (
                <button onClick={onFilterChipRemoved} className="hover:opacity-70">
                  <X size={12} />
                </button>
              )}
            </Badge>
          )}
          
          {/* Locked Media Type Filter */}
          {lockedFilters.mediaType && lockedFilters.mediaType !== "all" && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {mediaTypeLabels[lockedFilters.mediaType]}
              {onFilterChipRemoved && (
                <button onClick={onFilterChipRemoved} className="hover:opacity-70">
                  <X size={12} />
                </button>
              )}
            </Badge>
          )}
          
          {/* Locked Favorites Filter */}
          {lockedFilters.favoritesFilter && lockedFilters.favoritesFilter !== "all" && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {favoritesFilterLabels[lockedFilters.favoritesFilter]}
              {onFilterChipRemoved && (
                <button onClick={onFilterChipRemoved} className="hover:opacity-70">
                  <X size={12} />
                </button>
              )}
            </Badge>
          )}
          
          {/* Removable filters: tags */}
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          ))}
          
          {/* Time Filter */}
          {timeFilter !== "all" && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {timeFilterLabels[timeFilter]}
              <button onClick={() => setTimeFilter("all")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {/* Media Type Filter (removable) */}
          {mediaType !== "all" && mediaType !== lockedFilters.mediaType && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {mediaTypeLabels[mediaType]}
              <button onClick={() => setMediaType(lockedFilters.mediaType || "all")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {/* Sort Filter */}
          {sortBy !== "dateAdded" && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {sortLabels[sortBy]}
              <button onClick={() => setSortBy("dateAdded")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {/* Status Filter (removable) */}
          {statusFilter !== "all" && statusFilter !== lockedFilters.status && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {statusFilterLabels[statusFilter]}
              <button onClick={() => setStatusFilter(lockedFilters.status || "all")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {/* Favorites Filter (removable) */}
          {favoritesFilter !== "all" && favoritesFilter !== lockedFilters.favoritesFilter && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {favoritesFilterLabels[favoritesFilter]}
              <button onClick={() => setFavoritesFilter(lockedFilters.favoritesFilter || "all")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {/* Annotations Filter */}
          {annotationsFilter !== "all" && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {annotationsFilter === "annotated" ? "Annotated" : "Unannotated"}
              <button onClick={() => setAnnotationsFilter("all")} className="hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {/* Feed Filter */}
          {feedFilter && (
            <Badge variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
              {availableFeeds.find(f => f.id === feedFilter || f.name === feedFilter)?.name || feedFilter}
              <button onClick={() => {
                // Check if this is a locked feed filter
                if (lockedFilters?.feed === feedFilter) {
                  // Call the handler to navigate away
                  if (onFilterChipRemoved) {
                    onFilterChipRemoved();
                  }
                  return;
                }
                setFeedFilter("");
              }} className="hover:opacity-70">
                <X size={12} />
              </button>
            </Badge>
          )}
          
          {/* Clear All Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Row 3: Filter Buttons */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {/* Tag Filter */}
          {showTagFilter && availableTags.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowTagDropdown(!showTagDropdown);
                  setShowTimeDropdown(false);
                  setShowMediaDropdown(false);
                  setShowSortDropdown(false);
                  setShowStatusDropdown(false);
                  setShowFavoritesDropdown(false);
                  setShowFeedDropdown(false);
                  setShowAnnotationsDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                <Tag size={14} />
                Tags
                {selectedTags.length > 0 && (
                  <Badge variant="default" className="ml-1 h-5 min-w-5 flex items-center justify-center px-1">
                    {selectedTags.length}
                  </Badge>
                )}
              </button>
              
              {showTagDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                        selectedTags.includes(tag) ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{tag}</span>
                        {selectedTags.includes(tag) && (
                          <div className="w-4 h-4 bg-primary rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Feed Filter */}
          {showFeedFilter && availableFeeds.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowFeedDropdown(!showFeedDropdown);
                  setShowTagDropdown(false);
                  setShowTimeDropdown(false);
                  setShowMediaDropdown(false);
                  setShowSortDropdown(false);
                  setShowStatusDropdown(false);
                  setShowFavoritesDropdown(false);
                  setShowAnnotationsDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                <Rss size={14} />
                {feedFilter ? (
                  availableFeeds.find(f => f.id === feedFilter || f.name === feedFilter)?.name || feedFilter
                ) : (
                  "All Feeds"
                )}
              </button>
              
              {showFeedDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[200px] max-h-[300px] overflow-y-auto">
                  {/* "All Feeds" option */}
                  <button
                    onClick={() => {
                      setFeedFilter("");
                      setShowFeedDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                      feedFilter === "" ? "bg-accent" : ""
                    }`}
                  >
                    All Feeds
                  </button>
                  
                  {/* Individual feeds */}
                  {availableFeeds.map(feed => {
                    const feedValue = feed.id || feed.name;
                    return (
                      <button
                        key={feedValue}
                        onClick={() => {
                          setFeedFilter(feedValue);
                          setShowFeedDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                          feedFilter === feedValue ? "bg-accent" : ""
                        }`}
                      >
                        {feed.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Time Filter */}
          {showTimeFilter && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowTimeDropdown(!showTimeDropdown);
                  setShowTagDropdown(false);
                  setShowMediaDropdown(false);
                  setShowSortDropdown(false);
                  setShowStatusDropdown(false);
                  setShowFavoritesDropdown(false);
                  setShowFeedDropdown(false);
                  setShowAnnotationsDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                <Clock size={14} />
                {timeFilterLabels[timeFilter]}
              </button>
              
              {showTimeDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[180px]">
                  {Object.keys(timeFilterLabels).map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setTimeFilter(option);
                        setShowTimeDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                        timeFilter === option ? "bg-accent" : ""
                      }`}
                    >
                      {timeFilterLabels[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Media Type Filter */}
          {showMediaFilter && !lockedFilters.mediaType && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowMediaDropdown(!showMediaDropdown);
                  setShowTagDropdown(false);
                  setShowTimeDropdown(false);
                  setShowSortDropdown(false);
                  setShowStatusDropdown(false);
                  setShowFavoritesDropdown(false);
                  setShowFeedDropdown(false);
                  setShowAnnotationsDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                {mediaTypeLabels[mediaType]}
              </button>
              
              {showMediaDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
                  {Object.keys(mediaTypeLabels).map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setMediaType(option);
                        setShowMediaDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                        mediaType === option ? "bg-accent" : ""
                      }`}
                    >
                      {mediaTypeLabels[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Status Filter */}
          {showStatusFilter && !lockedFilters.status && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowTagDropdown(false);
                  setShowTimeDropdown(false);
                  setShowMediaDropdown(false);
                  setShowSortDropdown(false);
                  setShowFavoritesDropdown(false);
                  setShowFeedDropdown(false);
                  setShowAnnotationsDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                <Inbox size={14} />
                {statusFilterLabels[statusFilter]}
              </button>
              
              {showStatusDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[180px]">
                  {Object.keys(statusFilterLabels).map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                        statusFilter === option ? "bg-accent" : ""
                      }`}
                    >
                      {statusFilterLabels[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Filter */}
          {showFavoritesFilter && !lockedFilters.favoritesFilter && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowFavoritesDropdown(!showFavoritesDropdown);
                  setShowTagDropdown(false);
                  setShowTimeDropdown(false);
                  setShowMediaDropdown(false);
                  setShowSortDropdown(false);
                  setShowStatusDropdown(false);
                  setShowFeedDropdown(false);
                  setShowAnnotationsDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                <Star size={14} />
                {favoritesFilterLabels[favoritesFilter]}
              </button>
              
              {showFavoritesDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
                  {Object.keys(favoritesFilterLabels).map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setFavoritesFilter(option);
                        setShowFavoritesDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                        favoritesFilter === option ? "bg-accent" : ""
                      }`}
                    >
                      {favoritesFilterLabels[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Annotations Filter */}
          {showAnnotationsFilter && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowAnnotationsDropdown(!showAnnotationsDropdown);
                  setShowTagDropdown(false);
                  setShowTimeDropdown(false);
                  setShowMediaDropdown(false);
                  setShowSortDropdown(false);
                  setShowStatusDropdown(false);
                  setShowFavoritesDropdown(false);
                  setShowFeedDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                <MessageSquare size={14} />
                {annotationsFilterLabels[annotationsFilter]}
              </button>
              
              {showAnnotationsDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
                  {Object.keys(annotationsFilterLabels).map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setAnnotationsFilter(option);
                        setShowAnnotationsDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                        annotationsFilter === option ? "bg-accent" : ""
                      }`}
                    >
                      {annotationsFilterLabels[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sort Options */}
          {showSortOptions && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowTagDropdown(false);
                  setShowTimeDropdown(false);
                  setShowMediaDropdown(false);
                  setShowStatusDropdown(false);
                  setShowFavoritesDropdown(false);
                  setShowFeedDropdown(false);
                  setShowAnnotationsDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                <ArrowUpDown size={14} />
                {sortLabels[sortBy]}
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
                  {Object.keys(sortLabels).map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                        sortBy === option ? "bg-accent" : ""
                      }`}
                    >
                      {sortLabels[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
