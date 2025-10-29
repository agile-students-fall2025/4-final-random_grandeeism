/**
 * VideosPage.jsx
 * 
 * Description: Dedicated page for video content from YouTube, Vimeo, and other platforms
 * Purpose: Filtered view showing only video content with thumbnails and playback options
 */

import { useState } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";

const VideosPage = ({ onNavigate }) => {
  const mockArticles = [];
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search in videos:', query, filters);
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
      currentPage="videos"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Videos"
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Tutorial", "Conference", "Tech Talk", "Interview"]}
      lockedFilters={{ mediaType: "video" }}
      preAppliedFilters={{ mediaType: "video" }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showSortOptions={true}
      addLinkButtonText="Add Video"
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Video Library</h2>
            <p className="text-muted-foreground mb-6">
              This page will display:
            </p>
            <ul className="space-y-2 text-left max-w-md mx-auto">
              <li>• All saved video content (YouTube, Vimeo, etc.)</li>
              <li>• Video thumbnails and preview images</li>
              <li>• Video duration and platform information</li>
              <li>• Filter by watch time (short, medium, long)</li>
              <li>• Play inline or in full-screen viewer</li>
              <li>• Watch progress tracking</li>
              <li>• Grid view optimized for video thumbnails</li>
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

export default VideosPage;
