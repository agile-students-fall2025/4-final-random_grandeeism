/**
 * AudioPage.jsx
 * 
 * Description: Dedicated page for audio content including podcasts and audio articles
 * Purpose: Filtered view showing only audio/podcast content with playback controls
 */

import { useState } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";

const AudioPage = ({ onNavigate }) => {
  const mockArticles = [];
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search in audio:', query, filters);
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
      currentPage="podcasts"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Audio & Podcasts"
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Podcast", "Tech", "Interview", "Education"]}
      lockedFilters={{ mediaType: "podcast" }}
      preAppliedFilters={{ mediaType: "podcast" }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showSortOptions={true}
      addLinkButtonText="Add Podcast"
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Audio & Podcasts</h2>
            <p className="text-muted-foreground mb-6">
              This page will display:
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li>• All saved podcast episodes and audio content</li>
              <li>• Episode artwork and podcast information</li>
              <li>• Duration and publish date</li>
              <li>• Filter by listen time (short, medium, long)</li>
              <li>• Audio player with playback controls</li>
              <li>• Listen progress tracking and resume functionality</li>
              <li>• Speed controls and skip buttons</li>
              <li>• Download for offline listening</li>
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

export default AudioPage;
