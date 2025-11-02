/**
 * SearchPage.jsx
 * 
 * Description: Advanced search page with comprehensive filtering and sorting options
 * Purpose: Allows users to search and filter articles by tags, time, media type, status, and more
 */

import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { mockArticles } from "../data/mockArticles.js";
import applyFiltersAndSort from "../utils/searchUtils.js";

const SearchPage = ({ onNavigate, initialTag }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(initialTag ? { tags: [initialTag] } : {});
  const allArticles = mockArticles;
  const [displayedArticles, setDisplayedArticles] = useState([]);

  useEffect(() => {
    const initial = initialTag ? { tags: [initialTag] } : {};
    setCurrentFilters(initial);
    setDisplayedArticles(applyFiltersAndSort(allArticles, initial));
  }, [initialTag, allArticles]);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...(filters || {}), query };
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
      currentPage="search"
      currentView="Search"
      onNavigate={onNavigate}
      articles={mockArticles}
      pageTitle="Search"
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
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Advanced Search</h1>
            <p className="text-muted-foreground">Use the filters above to search and sort across all articles.</p>
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
                <p className="text-lg font-medium mb-2">No results</p>
                <p className="text-sm text-muted-foreground">Try broadening your search or clearing filters.</p>
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

export default SearchPage;
