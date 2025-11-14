/**
 * TopBar.jsx
 * 
 * Description: Sticky header navigation component for the Fieldnotes read-it-later application
 * Purpose: Provides main navigation, search functionality, and quick actions across all pages
 * Features:
 *  - Mobile hamburger menu toggle
 *  - App logo and branding
 *  - Simple inline search (desktop) or expandable search (mobile)
 *  - Advanced search with SearchFilter component integration
 *  - Selection mode toggle for bulk actions
 *  - Add Link button (icon on mobile, text on desktop)
 *  - Page title display below main row (desktop only)
 *  - Custom content support for specialized pages
 *  - Sticky positioning with proper z-index layering
 *  - Completely grayscale design with flat UI
 *  - Responsive behavior at all breakpoints
 */

// No React hooks required in this component after removing simple inline search
import { 
  Menu, 
  Plus, 
  NotebookPen, 
  CheckSquare,
  User,
  Settings,
  LogOut
} from "lucide-react";

import { Button } from "./ui/button.jsx";
import SearchFilter from "./SearchFilter.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.jsx";

export default function TopBar({
  // Navigation
  onMenuClick,
  onNavigate,
  
  // Page Configuration
  pageTitle,
  
  // Search - Basic Mode
  searchPlaceholder = "Search articles...",
  customSearchContent,
  
  // Search - Advanced Mode
  useAdvancedSearch = false,
  onSearchWithFilters,
  availableTags = [],
  availableFeeds = [],
  showTimeFilter = false,
  showMediaFilter = false,
  showTagFilter = false,
  showStatusFilter = false,
  showFavoritesFilter = false,
  showAnnotationsFilter = false,
  showFeedFilter = false,
  showSortOptions = false,
  preAppliedFilters,
  lockedFilters = {},
  onFilterChipRemoved,
  onSaveSearch,
  
  // Actions
  onAddLink,
  addLinkButtonText = "Add Link",
  
  // Selection Mode (Bulk Actions)
  showSelectionMode = false,
  selectionMode = false,
  onToggleSelectionMode,
  onSelectAll,
  selectedCount = 0,
  totalCount = 0
}) {
  // Internal State

  // Event Handlers

  return (
    <div className="bg-background border-b border-border sticky top-0 z-40 w-full">
      {/* ROW 1: Main TopBar */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* LEFT SIDE: Menu Button & Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 hover:opacity-70 transition-opacity"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <NotebookPen className="w-[24px] h-[24px] md:w-[30px] md:h-[30px] text-foreground" />
            <p className="font-['New_Spirit:SemiBold',sans-serif] leading-[normal] text-[22px] md:text-[26px] text-foreground">
              fieldnotes.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Selection, Search, Add Link */}
        <div className="flex items-center gap-2">
          {/* Selection Mode Button */}
          {showSelectionMode && onToggleSelectionMode && (
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="sm"
              onClick={onToggleSelectionMode}
              className="text-[13px]"
            >
              <CheckSquare size={16} className="mr-1" />
              <span className="hidden sm:inline">
                {selectionMode ? "Cancel" : "Select"}
              </span>
            </Button>
          )}

          {/* Simple inline search removed — use advanced SearchFilter when `useAdvancedSearch` is true. */}

          {/* Add Link Button */}
          {onAddLink && (
            <button 
              onClick={onAddLink}
              className="bg-[#1a1a1a] h-[36px] md:h-[34px] px-3 md:px-5 rounded-[2px] cursor-pointer hover:bg-[#2a2a2a] transition-colors border border-[#404040] flex items-center gap-1"
              aria-label={addLinkButtonText}
            >
              <Plus size={16} className="text-white md:hidden" />
              <p className="hidden md:block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-white">
                {addLinkButtonText}
              </p>
            </button>
          )}

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full w-8 h-8 p-0 shrink-0"
                aria-label="User menu"
              >
                <User size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate && onNavigate('settings')}>
                <Settings size={16} className="mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onNavigate && onNavigate('landing')}
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ROW 2: Page Title / Custom Content (Desktop Only) */}
      {(pageTitle || customSearchContent) && (
        <div className="border-t border-border px-4 py-3 md:px-6">
          {customSearchContent ? (
            <div className="hidden md:block">
              {customSearchContent}
            </div>
          ) : (
            <p className="hidden md:block font-['New_Spirit:Medium',sans-serif] leading-[normal] text-[18px] text-foreground">
              {pageTitle}
            </p>
          )}
        </div>
      )}

      {/* ROW 3: Advanced Search Filter */}
      {useAdvancedSearch && onSearchWithFilters && (
        <SearchFilter
          onSearch={onSearchWithFilters}
          placeholder={searchPlaceholder}
          availableTags={availableTags}
          availableFeeds={availableFeeds}
          showTimeFilter={showTimeFilter}
          showMediaFilter={showMediaFilter}
          showTagFilter={showTagFilter}
          showStatusFilter={showStatusFilter}
          showFavoritesFilter={showFavoritesFilter}
          showAnnotationsFilter={showAnnotationsFilter}
          showFeedFilter={showFeedFilter}
          showSortOptions={showSortOptions}
          preAppliedFilters={preAppliedFilters}
          lockedFilters={lockedFilters}
          onSaveSearch={onSaveSearch}
          onFilterChipRemoved={onFilterChipRemoved}
          selectionMode={selectionMode}
          onSelectAll={onSelectAll}
          selectedCount={selectedCount}
          totalCount={totalCount}
        />
      )}

      {/* Mobile/simple inline search removed; use advanced SearchFilter when `useAdvancedSearch` is true. */}
    </div>
  );
}
