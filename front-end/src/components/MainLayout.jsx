/**
 * MainLayout.jsx
 * 
 * Description: Master layout component providing unified structure for all main application pages
 * Purpose: Wraps all pages with consistent Sidebar + TopBar + content area structure,
 *          handles responsive navigation, and auto-calculates sidebar counts
 * Features:
 *  - Desktop fixed sidebar (≥1024px) + Mobile overlay sidebar (<1024px)
 *  - Sticky TopBar with search, filters, and actions
 *  - Scrollable main content area for page children
 *  - Auto-calculated queue counts (inbox, daily reading, in progress, rediscovery)
 *  - Mobile menu state management with backdrop overlay
 *  - Responsive design with proper z-index layering
 *  - Flexible configuration via 42+ props
 *  - Pass-through props to TopBar and Sidebar components
 *  - Single source of truth for layout structure
 */

import { useState } from "react";
import { STATUS } from "../constants/statuses.js";
import TopBar from "./TopBar.jsx";
import NavigationSidebar from "./NavigationSidebar.jsx";

export default function MainLayout({
  // === CORE NAVIGATION (Required) ===
  children,
  currentPage,
  currentView,
  onNavigate,
  
  // === DATA (Required for counts) ===
  articles = [],
  
  // === ACTIONS (Optional) ===
  onAddLink,
  onSearch,
  onSearchWithFilters,
  
  // === SIDEBAR - STACKS (Optional) ===
  savedSearches = [],
  onLoadSavedSearch,
  onDeleteSavedSearch,
  
  // === TOPBAR - BASIC CONFIG (Optional) ===
  pageTitle,
  showSearch = true,
  searchPlaceholder = "Search articles...",
  initialSearchQuery = "",
  customSearchContent,
  addLinkButtonText = "Add Link",
  
  // === TOPBAR - ADVANCED SEARCH (Optional) ===
  useAdvancedSearch = false,
  availableTags = [],
  availableFeeds = [],
  showTimeFilter = false,
  showMediaFilter = false,
  showTagFilter = false,
  showStatusFilter = false,
  showFavoritesFilter = false,
  showFeedFilter = false,
  showSortOptions = false,
  preAppliedFilters,
  lockedFilters,
  onFilterChipRemoved,
  onSaveSearch,
  
  // === TOPBAR - SELECTION MODE (Optional) ===
  showSelectionMode = false,
  selectionMode = false,
  onToggleSelectionMode,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0,
}) {
  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Auto-calculate counts for sidebar
  const inboxCount = articles.filter(a => a.status === STATUS.INBOX && !a.isHidden).length;
  const dailyReadingCount = articles.filter(a => a.status === STATUS.DAILY && !a.isHidden).length;
  const inProgressCount = articles.filter(a => a.status === STATUS.CONTINUE && !a.isHidden).length;
  const rediscoveryCount = articles.filter(a => a.status === STATUS.REDISCOVERY && !a.isHidden).length;

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:flex lg:flex-col w-[280px] border-r border-border h-full" aria-label="Main navigation">
        <NavigationSidebar
          onNavigate={onNavigate}
          currentPage={currentPage}
          currentView={currentView}
          inboxCount={inboxCount}
          dailyReadingCount={dailyReadingCount}
          inProgressCount={inProgressCount}
          rediscoveryCount={rediscoveryCount}
          savedSearches={savedSearches}
          onLoadSavedSearch={onLoadSavedSearch}
          onDeleteSavedSearch={onDeleteSavedSearch}
        />
      </aside>

      {/* Mobile Sidebar - Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMobileMenu(false)}
            aria-label="Close menu"
          />
          
          {/* Sidebar */}
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border flex flex-col h-full" aria-label="Main navigation">
            <NavigationSidebar
              onNavigate={(page, view) => {
                onNavigate(page, view);
                setShowMobileMenu(false);
              }}
              currentPage={currentPage}
              currentView={currentView}
              inboxCount={inboxCount}
              dailyReadingCount={dailyReadingCount}
              inProgressCount={inProgressCount}
              rediscoveryCount={rediscoveryCount}
              savedSearches={savedSearches}
              onLoadSavedSearch={(searchId) => {
                onLoadSavedSearch?.(searchId);
                setShowMobileMenu(false);
              }}
              onDeleteSavedSearch={onDeleteSavedSearch}
            />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <TopBar
          onMenuClick={() => setShowMobileMenu(true)}
          onNavigate={onNavigate}
          onAddLink={onAddLink}
          onSearch={onSearch}
          onSearchWithFilters={onSearchWithFilters}
          pageTitle={pageTitle}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          initialSearchQuery={initialSearchQuery}
          customSearchContent={customSearchContent}
          addLinkButtonText={addLinkButtonText}
          showSelectionMode={showSelectionMode}
          selectionMode={selectionMode}
          onToggleSelectionMode={onToggleSelectionMode}
          useAdvancedSearch={useAdvancedSearch}
          availableTags={availableTags}
          availableFeeds={availableFeeds}
          showTimeFilter={showTimeFilter}
          showMediaFilter={showMediaFilter}
          showTagFilter={showTagFilter}
          showStatusFilter={showStatusFilter}
          showFavoritesFilter={showFavoritesFilter}
          showFeedFilter={showFeedFilter}
          showSortOptions={showSortOptions}
          preAppliedFilters={preAppliedFilters}
          lockedFilters={lockedFilters}
          onFilterChipRemoved={onFilterChipRemoved}
          onSaveSearch={onSaveSearch}
          onSelectAll={onSelectAll}
          selectedCount={selectedCount}
          totalCount={totalCount}
          currentPage={currentPage}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-12" aria-label="Main content">
          {children}
        </main>
      </div>
    </div>
  );
}
