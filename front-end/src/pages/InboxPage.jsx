/**
 * InboxPage.jsx
 * 
 * Description: Inbox page displaying all newly saved and unprocessed articles
 * Purpose: Shows articles in the inbox queue waiting to be organized or read
 */

import { useState } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";

const InboxPage = ({ onNavigate }) => {
  const mockArticles = [];
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search inbox:', query, filters);
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
      currentView="Inbox"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Inbox"
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      availableFeeds={["TechCrunch", "Medium", "Dev.to"]}
      lockedFilters={{ status: "inbox" }}
      preAppliedFilters={{ status: "inbox" }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showFavoritesFilter={true}
      showFeedFilter={true}
      showSortOptions={true}
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Inbox</h2>
            <p className="text-muted-foreground mb-6">
              This page will display:
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li>• All newly saved articles in your inbox</li>
              <li>• Full search and advanced filtering capabilities</li>
              <li>• Sort by date added, title, or reading time</li>
              <li>• Filter by tags, media type, and feeds</li>
              <li>• Quick actions: add to Daily Reading, Archive, or Delete</li>
              <li>• Bulk selection and organization tools</li>
              <li>• Mark as read or move to other queues</li>
              <li>• Add tags and notes to articles</li>
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

export default InboxPage;
