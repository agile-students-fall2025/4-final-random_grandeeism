/**
 * RediscoveryPage.jsx
 * 
 * Description: Smart queue that resurfaces older saved content for rediscovery
 * Purpose: Helps users rediscover valuable content they saved but haven't read yet
 */

import { useState, useEffect, useMemo } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { mockArticles } from "../data/mockArticles.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { STATUS } from "../constants/statuses.js";

const RediscoveryPage = ({ onNavigate }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [articles, setArticles] = useState(mockArticles);
  const [displayedArticles, setDisplayedArticles] = useState([]);

  const baseLockedFilters = useMemo(() => ({ status: STATUS.REDISCOVERY }), []);

  useEffect(() => {
    setDisplayedArticles(applyFiltersAndSort(articles, baseLockedFilters));
  }, [articles, baseLockedFilters]);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const handleSaveSearch = () => setShowSaveStackModal(true);

  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    alert(`Stack "${stackData.name}" saved successfully!`);
  };

  const handleStatusChange = (articleId, newStatus) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === articleId ? { ...article, status: newStatus } : article
      )
    );
  };

  const handleToggleFavorite = (articleId) => {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article.id === articleId ? { ...article, isFavorite: !article.isFavorite } : article
      )
    );
  };

  const handleDeleteArticle = (articleId) => {
    setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
  };

  return (
    <MainLayout
      currentPage="articles"
      currentView="Rediscovery"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      lockedFilters={{ status: STATUS.REDISCOVERY }}
      preAppliedFilters={{ status: STATUS.REDISCOVERY }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showFavoritesFilter={true}
      showAnnotationsFilter={true}
      showSortOptions={true}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Rediscovery Queue</h1>
            <p className="text-muted-foreground">Older saved content surfaced for rediscovery (filtered view).</p>
          </div>

          <div className="min-h-[200px]">
            {displayedArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onArticleClick={() => onNavigate && onNavigate('text-reader', { article })}
                    onToggleFavorite={(id) => handleToggleFavorite(id)}
                    onStatusChange={(id, status) => handleStatusChange(id, status)}
                    onDelete={(id) => handleDeleteArticle(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">No articles found</p>
                <p className="text-sm text-muted-foreground">Try modifying filters or search.</p>
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

export default RediscoveryPage;
