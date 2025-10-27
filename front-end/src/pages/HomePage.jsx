/**
 * HomePage.jsx
 * 
 * Description: Main landing page with tabbed view of workflow queues
 * Purpose: Central hub displaying articles in different workflow statuses via tabs
 * Features:
 *  - Four-tab view: Inbox, Daily Reading, Continue Reading, Rediscovery
 *  - Tab-based filtering that auto-applies status filters
 *  - Search within active tab view
 *  - Save searches as Stacks
 */

import { useState, useEffect, useMemo } from "react";
import { Inbox, Calendar, BookOpen, RotateCcw } from "lucide-react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/customUI/SaveStackModal.jsx";

// Tab configuration with icons and status mapping
const tabs = [
  { name: "Inbox", icon: Inbox, status: "inbox" },
  { name: "Daily Reading", icon: Calendar, status: "daily" },
  { name: "Continue Reading", icon: BookOpen, status: "continue" },
  { name: "Rediscovery", icon: RotateCcw, status: "completed" }
];

const HomePage = ({ onNavigate }) => {
  const mockArticles = [];
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [activeTab, setActiveTab] = useState("Inbox");

  // Get current tab's status value
  const currentStatus = tabs.find(t => t.name === activeTab)?.status || "inbox";

  // Get pre-applied filters based on active tab (memoized to prevent re-creation)
  const preAppliedFilters = useMemo(() => ({
    status: currentStatus,
    tags: [],
    timeFilter: "all",
    mediaType: "all",
    sortBy: "dateAdded",
    favoritesFilter: "all"
  }), [currentStatus]);

  const lockedFilters = useMemo(() => ({
    status: currentStatus
  }), [currentStatus]);

  // Update filters when tab changes
  useEffect(() => {
    setCurrentFilters(preAppliedFilters);
  }, [preAppliedFilters]);

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search from home - Tab:', activeTab, 'Query:', query, 'Filters:', filters);
    setCurrentFilters(filters);
    // TODO: Filter mockArticles based on filters and query
    // The filtered results will be displayed in the active tab content
  };

  const handleSaveSearch = () => {
    console.log('Save current search as a Stack');
    setShowSaveStackModal(true);
  };

  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    // TODO: Implement actual save to backend/state
    alert(`Stack "${stackData.name}" saved successfully!`);
    setShowSaveStackModal(false);
  };

  const handleFilterChipRemoved = () => {
    // Navigate to search page when pre-applied filter is removed
    onNavigate('search');
  };

  return (
    <MainLayout
      currentPage="home"
      currentView={activeTab}
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Home"
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showSortOptions={true}
      preAppliedFilters={preAppliedFilters}
      lockedFilters={lockedFilters}
      onFilterChipRemoved={handleFilterChipRemoved}
    >
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Here's your reading overview</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.name
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden text-[11px] leading-tight text-center">
                    {tab.name === "Daily Reading" ? "Daily" : 
                     tab.name === "Continue Reading" ? "Continue" : 
                     tab.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "Inbox" && (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">Inbox</p>
                <p className="text-sm text-muted-foreground">
                  New articles waiting to be triaged will appear here
                </p>
              </div>
            )}

            {activeTab === "Daily Reading" && (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">Daily Reading</p>
                <p className="text-sm text-muted-foreground">
                  Articles scheduled for today's reading session will appear here
                </p>
              </div>
            )}

            {activeTab === "Continue Reading" && (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">Continue Reading</p>
                <p className="text-sm text-muted-foreground">
                  Articles you've started but haven't finished will appear here
                </p>
              </div>
            )}

            {activeTab === "Rediscovery" && (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">Rediscovery</p>
                <p className="text-sm text-muted-foreground">
                  Completed articles scheduled to be re-read will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Stack Modal */}
      <SaveStackModal
        isOpen={showSaveStackModal}
        onClose={() => setShowSaveStackModal(false)}
        onSave={handleSaveStack}
        currentFilters={currentFilters}
      />
    </MainLayout>
  );
};

export default HomePage;
