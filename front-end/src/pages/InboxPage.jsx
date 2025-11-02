/**
 * InboxPage.jsx
 * 
 * Description: Inbox page displaying all newly saved and unprocessed articles
 * Purpose: Shows articles in the inbox queue waiting to be organized or read
 */

import { useState, useEffect, useMemo } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { mockArticles } from "../data/mockArticles.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { STATUS } from "../constants/statuses.js";

const InboxPage = ({ onNavigate }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const allArticles = mockArticles;
  const [displayedArticles, setDisplayedArticles] = useState([]);

  const baseLockedFilters = useMemo(() => ({ status: STATUS.INBOX }), []);

  useEffect(() => {
    // Initialize view with locked filters applied
    setDisplayedArticles(applyFiltersAndSort(allArticles, baseLockedFilters));
  }, [allArticles, baseLockedFilters]);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(allArticles, merged));
  };

  const handleSaveSearch = () => {
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
  lockedFilters={{ status: STATUS.INBOX }}
  preAppliedFilters={{ status: STATUS.INBOX }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showFavoritesFilter={true}
      showFeedFilter={true}
      showSortOptions={true}
    >
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Inbox</h1>
              <p className="text-muted-foreground">Articles in your inbox (filtered by Search).</p>
            </div>

            <div className="min-h-[200px]">
              {displayedArticles.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {displayedArticles.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onArticleClick={() => onNavigate && onNavigate('text-reader', { article })}
                      onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
                      onStatusChange={(id, status) => console.log('Change status:', id, status)}
                      onDelete={(id) => console.log('Delete article:', id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <p className="text-lg font-medium mb-2">No articles found</p>
                  <p className="text-sm text-muted-foreground">Try clearing filters or adjusting your search.</p>
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

export default InboxPage;
