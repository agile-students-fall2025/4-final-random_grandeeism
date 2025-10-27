/**
 * TextPage.jsx
 * 
 * Description: Dedicated page for text-based articles and written content
 * Purpose: Filtered view showing only text/article content, excluding videos and audio
 */

import { useState } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/customUI/SaveStackModal.jsx";

const TextPage = ({ onNavigate }) => {
  const mockArticles = [];
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search in text articles:', query, filters);
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
      currentPage="text"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Text Articles"
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      lockedFilters={{ mediaType: "article" }}
      preAppliedFilters={{ mediaType: "article" }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showSortOptions={true}
      addLinkButtonText="Add Article"
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Text Articles</h2>
            <p className="text-muted-foreground mb-6">
              This page will display:
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li>• All text-based articles and blog posts</li>
              <li>• Filter by reading time (short, medium, long)</li>
              <li>• Filter by tags and status</li>
              <li>• Grid or list view options</li>
              <li>• Estimated reading time for each article</li>
              <li>• Reader mode preview</li>
              <li>• Bulk actions for organizing articles</li>
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

export default TextPage;
