/**
 * NavigationSidebar.jsx
 * 
 * Description: Main navigation sidebar component for the Fieldnotes read-it-later application
 * Purpose: Provides hierarchical navigation across different views (Inbox, Archive, Feeds, etc.)
 *          and manages saved search stacks with collapsible sections
 * Features:
 *  - Dynamic active state highlighting based on current page/view
 *  - Count badges for items with pending content
 *  - Collapsible "Stacks" section for saved searches
 *  - Organized sections: Home, Search, Status, Shelves, Tags/Statistics, Settings
 *  - Responsive hover states and theme-aware styling
 */

import { useState } from "react";
import { 
  Home, 
  Inbox, 
  Calendar, 
  BookOpen, 
  RotateCcw, 
  Archive, 
  Star, 
  Tag, 
  BarChart3, 
  Settings, 
  Rss, 
  Video, 
  FileText, 
  Headphones, 
  Search, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  X 
} from "lucide-react";

export default function NavigationSidebar({
  onNavigate,
  currentPage,
  currentView,
  inboxCount,
  dailyReadingCount,
  inProgressCount,
  rediscoveryCount,
  savedSearches = [],
  onLoadSavedSearch,
  onDeleteSavedSearch
}) {
  const [isStacksExpanded, setIsStacksExpanded] = useState(true);

  // Active state logic
  const getIsActive = (item) => {
    // Direct page matches (no view needed)
    if (currentPage === 'home' && item.page === 'home') return true;
    if (currentPage === 'statistics' && item.page === 'statistics') return true;
    if (currentPage === 'feeds' && item.page === 'feeds') return true;
    if (currentPage === 'videos' && item.page === 'videos') return true;
    if (currentPage === 'podcasts' && item.page === 'podcasts') return true;
    if (currentPage === 'text' && item.page === 'text') return true;
    
    // Page + view matches (for articles page with different views)
    if (currentPage === 'articles' && item.view === currentView) return true;
    
    return false;
  };

  // Navigation item renderer
  const renderNavItem = (item) => {
    const isActive = getIsActive(item);
    
    return (
      <button
        key={item.name}
        onClick={item.action}
        className={`flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-lg transition-colors h-[44px] ${
          isActive
            ? 'bg-accent text-foreground'
            : 'hover:bg-white/50 dark:hover:bg-white/10 text-foreground'
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon size={20} className="shrink-0" />
          <span className={`font-['Inter:${isActive ? 'Bold' : 'Regular'}',sans-serif] text-[15px]`}>
            {item.name}
          </span>
        </div>
        
        {/* Count Badge - only show if count exists and > 0 */}
        {item.count !== undefined && item.count > 0 && (
          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-[11px] min-w-[20px] text-center shrink-0">
            {item.count}
          </span>
        )}
      </button>
    );
  };

  // Define navigation items
  const homeItem = {
    name: "Home",
    icon: Home,
    page: "home",
    view: null,
    action: () => onNavigate('home')
  };

  const searchItem = {
    name: "Search",
    icon: Search,
    page: "articles",
    view: "Search",
    action: () => onNavigate('articles', 'Search')
  };

  const statusItems = [
    { 
      name: "Inbox", 
      icon: Inbox, 
      page: "articles", 
      view: "Inbox", 
      action: () => onNavigate('articles', 'Inbox'), 
      count: inboxCount 
    },
    { 
      name: "Daily Reading", 
      icon: Calendar, 
      page: "articles", 
      view: "Daily Reading", 
      action: () => onNavigate('articles', 'Daily Reading'), 
      count: dailyReadingCount 
    },
    { 
      name: "Continue Reading", 
      icon: BookOpen, 
      page: "articles", 
      view: "Continue Reading", 
      action: () => onNavigate('articles', 'Continue Reading'), 
      count: inProgressCount 
    },
    { 
      name: "Rediscovery", 
      icon: RotateCcw, 
      page: "articles", 
      view: "Rediscovery", 
      action: () => onNavigate('articles', 'Rediscovery'), 
      count: rediscoveryCount 
    },
    { 
      name: "Archive", 
      icon: Archive, 
      page: "articles", 
      view: "Archive", 
      action: () => onNavigate('articles', 'Archive') 
    }
  ];

  const shelvesItems = [
    { 
      name: "Favorites", 
      icon: Star, 
      page: "articles", 
      view: "Favorites", 
      action: () => onNavigate('articles', 'Favorites') 
    },
    { 
      name: "Feeds", 
      icon: Rss, 
      page: "feeds", 
      view: null, 
      action: () => onNavigate('feeds') 
    },
    { 
      name: "Videos", 
      icon: Video, 
      page: "videos", 
      view: null, 
      action: () => onNavigate('videos') 
    },
    { 
      name: "Audios", 
      icon: Headphones, 
      page: "podcasts", 
      view: null, 
      action: () => onNavigate('podcasts') 
    },
    { 
      name: "Text", 
      icon: FileText, 
      page: "text", 
      view: null, 
      action: () => onNavigate('text') 
    }
  ];

  const otherItems = [
    { 
      name: "Tags", 
      icon: Tag, 
      page: "articles", 
      view: "Tags", 
      action: () => onNavigate('articles', 'Tags') 
    },
    { 
      name: "Statistics", 
      icon: BarChart3, 
      page: "statistics", 
      view: null, 
      action: () => onNavigate('statistics') 
    }
  ];

  return (
    <nav className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-12 space-y-1">
        {/* 1. Home (no section header) */}
        <div className="space-y-1">
          {renderNavItem(homeItem)}
        </div>

        {/* 2. Search (no section header) */}
        <div className="space-y-1">
          {renderNavItem(searchItem)}
        </div>

      {/* 3. Status Section */}
      <div className="space-y-2 pt-4 mt-4 border-t border-border">
        <p className="px-3 text-[12px] text-muted-foreground uppercase tracking-wider">
          Status
        </p>
        <div className="space-y-1">
          {statusItems.map((item) => renderNavItem(item))}
        </div>
      </div>

      {/* 4. Shelves Section */}
      <div className="space-y-2 pt-4 mt-4 border-t border-border">
        <p className="px-3 text-[12px] text-muted-foreground uppercase tracking-wider">
          Shelves
        </p>
        <div className="space-y-1">
          {/* 4a. Stacks (if any saved searches exist) */}
          {savedSearches.length > 0 && (
            <div className="space-y-1">
              {/* Stacks Header Button */}
              <button
                onClick={() => setIsStacksExpanded(!isStacksExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <Layers size={20} className="shrink-0" />
                  <span className="font-['Inter:Regular',sans-serif] text-[15px] text-foreground">
                    Stacks
                  </span>
                </div>
                {isStacksExpanded ? (
                  <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                )}
              </button>
              
              {/* Stacks List (when expanded) */}
              {isStacksExpanded && (
                <div className="space-y-1 pl-6">
                  {savedSearches.map((savedSearch) => (
                    <div
                      key={savedSearch.id}
                      className="group flex items-center justify-between gap-2 w-full px-3 py-2.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors h-[44px]"
                    >
                      {/* Click to Load Stack */}
                      <button
                        onClick={() => onLoadSavedSearch?.(savedSearch.id)}
                        className="flex-1 text-left min-w-0"
                      >
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-foreground line-clamp-1">
                          {savedSearch.name}
                        </span>
                      </button>
                      
                      {/* Delete Stack Button (shows on hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSavedSearch?.(savedSearch.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded shrink-0"
                      >
                        <X size={14} className="text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* 4b. Regular Shelves Items */}
          {shelvesItems.map((item) => renderNavItem(item))}
        </div>
      </div>

      {/* 5. Other Items Section */}
      <div className="space-y-1 pt-4 mt-4 border-t border-border">
        {otherItems.map((item) => renderNavItem(item))}
      </div>

      {/* 6. Settings Button */}
      <div className="pt-4 mt-4 border-t border-border">
        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-3 hover:bg-white/50 dark:hover:bg-white/10 transition-colors w-full px-3 py-2.5 rounded-lg h-[44px] ${
            currentPage === 'settings' ? 'bg-accent' : ''
          }`}
        >
          <Settings size={20} className="shrink-0 text-foreground" />
          <p className="font-['Inter:Medium',sans-serif] text-[15px] text-foreground">Settings</p>
        </button>
      </div>
      </div>
    </nav>
  );
}
