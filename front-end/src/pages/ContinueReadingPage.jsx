/**
 * ContinueReadingPage.jsx
 * 
 * Description: In-progress articles queue for content users have started but not finished
 * Purpose: Tracks reading progress and helps users resume where they left off
 */

import { useState } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";

const ContinueReadingPage = ({ onNavigate }) => {
  const mockArticles = [];
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search in continue reading:', query, filters);
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
      currentView="Continue Reading"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Continue Reading"
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      lockedFilters={{ status: "continue" }}
      preAppliedFilters={{ status: "continue" }}
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
            <h2 className="text-2xl font-bold mb-4">Continue Reading</h2>
            <p className="text-muted-foreground mb-6">
              This page will display:
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li>• Articles you've started reading</li>
              <li>• Reading progress percentage for each article</li>
              <li>• Last read timestamp</li>
              <li>• Resume reading button to jump to last position</li>
              <li>• Estimated time remaining</li>
              <li>• Mark as complete or archive options</li>
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

export default ContinueReadingPage;
