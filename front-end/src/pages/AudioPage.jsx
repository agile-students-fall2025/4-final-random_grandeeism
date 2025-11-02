/**
 * AudioPage.jsx
 * 
 * Description: Dedicated page for audio content including podcasts and audio articles
 * Purpose: Filtered view showing only audio/podcast content with playback controls
 */

import { useState, useEffect, useMemo } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { mockArticles } from "../data/mockArticles.js";
import applyFiltersAndSort from "../utils/searchUtils.js";

const AudioPage = ({ onNavigate }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const allArticles = mockArticles;
  const [displayedArticles, setDisplayedArticles] = useState([]);

  const baseLockedFilters = useMemo(() => ({ mediaType: 'podcast' }), []);

  useEffect(() => {
    setDisplayedArticles(applyFiltersAndSort(allArticles, baseLockedFilters));
  }, [allArticles, baseLockedFilters]);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(allArticles, merged));
  };

  const handleSaveSearch = () => setShowSaveStackModal(true);

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
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Audio & Podcasts</h1>
            <p className="text-muted-foreground">All audio/podcast content (filtered view).</p>
          </div>

          <div className="min-h-[200px]">
            {displayedArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onArticleClick={() => onNavigate && onNavigate('text-reader', { article })}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">No audio found</p>
                <p className="text-sm text-muted-foreground">Try adjusting filters or search.</p>
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

export default AudioPage;
