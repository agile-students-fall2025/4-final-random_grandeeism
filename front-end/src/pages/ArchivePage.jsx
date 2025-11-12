/**
 * ArchivePage.jsx
 * 
 * Description: Archive page displaying all completed and archived articles
 * Purpose: Shows articles marked as archived with full search and filtering capabilities
 */

import { useState, useEffect, useMemo } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { STATUS } from "../constants/statuses.js";
import { articlesAPI } from "../services/api.js";
import { Card, CardContent, CardTitle, CardDescription } from "../components/ui/card.jsx";

// Utility to normalize backend response to an array
const normalizeArticles = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.articles)) return data.articles;
  return [];
};

const ArchivePage = ({ onNavigate }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [articles, setArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseLockedFilters = useMemo(() => ({ status: STATUS.ARCHIVED }), []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    articlesAPI.getAll({ status: STATUS.ARCHIVED })
      .then((data) => {
        const normalized = normalizeArticles(data);
        setArticles(normalized);
        setDisplayedArticles(applyFiltersAndSort(normalized, baseLockedFilters));
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load archived articles");
        setArticles([]);
        setDisplayedArticles([]);
        setLoading(false);
      });
  }, []);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const handleSaveSearch = () => {
    setShowSaveStackModal(true);
  };

  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    alert(`Stack "${stackData.name}" saved successfully!`);
  };

  const handleStatusChange = (articleId, newStatus) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, status: newStatus }
        : article
    ));
  };

  const handleToggleFavorite = (articleId) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isFavorite: !article.isFavorite }
        : article
    ));
  };

  const handleDeleteArticle = (articleId) => {
    setArticles(prev => prev.filter(article => article.id !== articleId));
  };

  // Only show error if present; otherwise, always render the layout
  return (
    <MainLayout
      currentPage="articles"
      currentView="Archive"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      availableFeeds={["TechCrunch", "Medium", "Dev.to"]}
      lockedFilters={{ status: STATUS.ARCHIVED }}
      preAppliedFilters={{ status: STATUS.ARCHIVED }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showFavoritesFilter={true}
      showAnnotationsFilter={true}
      showFeedFilter={true}
      showSortOptions={true}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Archive</h1>
            <p className="text-muted-foreground">Archived articles (filtered view).</p>
          </div>
          <div className="min-h-[200px]">
            {error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2 text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">Could not load archived articles.</p>
              </div>
            ) : loading ? null : displayedArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onArticleClick={() => {
                      const destination = article.mediaType === 'video' ? 'video-player' : article.mediaType === 'audio' ? 'audio-player' : 'text-reader';
                      onNavigate && onNavigate(destination, { article });
                    }}
                    onToggleFavorite={handleToggleFavorite}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">No archived articles found</p>
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

export default ArchivePage;
