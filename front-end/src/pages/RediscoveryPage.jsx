/**
 * RediscoveryPage.jsx
 * 
 * Description: Smart queue that resurfaces older saved content for rediscovery
 * Purpose: Helps users rediscover valuable content they saved but haven't read yet
 */

import { useState } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";

const RediscoveryPage = ({ onNavigate }) => {
  const mockArticles = [];
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search in rediscovery:', query, filters);
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
      currentView="Rediscovery"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Rediscovery"
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      lockedFilters={{ status: "completed" }}
      preAppliedFilters={{ status: "completed" }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showFavoritesFilter={true}
      showSortOptions={true}
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Rediscovery Queue</h2>
            <p className="text-muted-foreground mb-6">
              This page will display:
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li>• Older articles intelligently resurfaced for reading</li>
              <li>• Smart algorithm based on age, tags, and relevance</li>
              <li>• "Time capsule" feature for forgotten gems</li>
              <li>• Move to Daily Reading or Archive</li>
              <li>• Days since saved indicator</li>
              <li>• Refresh queue to get new suggestions</li>
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

export default RediscoveryPage;
