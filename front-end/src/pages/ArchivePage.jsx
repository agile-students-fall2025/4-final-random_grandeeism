/**
 * ArchivePage.jsx
 * 
 * Description: Archive page displaying all completed and archived articles
 * Purpose: Shows articles marked as archived with full search and filtering capabilities
 */

import { useState } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";

const ArchivePage = ({ onNavigate }) => {
  const mockArticles = [];
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);

  const handleSearch = (query) => {
    console.log('Search archive:', query);
  };

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search archive with filters:', query, filters);
    setCurrentFilters(filters);
  };

  const handleSaveSearch = () => {
    console.log('Save current search as a Stack');
    setShowSaveStackModal(true);
  };

  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    alert(`Stack "${stackData.name}" saved successfully!`);
  };

  return (
    <MainLayout
      currentPage="articles"
      currentView="Archive"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Archive"
      showSearch={true}
      searchPlaceholder="Search archive..."
      onSearch={handleSearch}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      useAdvancedSearch={true}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showFavoritesFilter={true}
      showFeedFilter={true}
      showSortOptions={true}
      availableTags={["Development", "Design", "AI", "Technology"]}
      availableFeeds={["TechCrunch", "Medium", "Dev.to"]}
      lockedFilters={{ status: "archive" }}
      preAppliedFilters={{ status: "archive" }}
      onFilterChipRemoved={() => onNavigate("search")}
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Archive</h2>
            <p className="text-muted-foreground mb-6">
              This page will display:
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li>• All completed and archived articles</li>
              <li>• Full search and advanced filtering capabilities</li>
              <li>• Sort by date archived, date added, or title</li>
              <li>• Filter by tags, media type, and feeds</li>
              <li>• Restore articles back to Inbox or other queues</li>
              <li>• Bulk actions for managing archived content</li>
              <li>• Archive statistics and insights</li>
            </ul>
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

export default ArchivePage;
