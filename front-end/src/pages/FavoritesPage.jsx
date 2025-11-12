/**
 * FavoritesPage.jsx
 * 
 * Description: Favorites page displaying all starred/favorited articles
 * Purpose: Shows articles marked as favorites with full search and filtering capabilities
 */

import { useState, useEffect, useMemo } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { articlesAPI, feedsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";

const FavoritesPage = ({ onNavigate }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [articles, setArticles] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backend expects isFavorite=true for favorites
  const baseLockedFilters = useMemo(() => ({ isFavorite: true }), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch articles and feeds in parallel
        const [articlesResponse, feedsResponse] = await Promise.all([
          articlesAPI.getAll(baseLockedFilters),
          feedsAPI.getAll()
        ]);
        
        // Handle articles response
        let articlesData = articlesResponse;
        if (Array.isArray(articlesResponse)) {
          articlesData = articlesResponse;
        } else if (articlesResponse.data) {
          articlesData = articlesResponse.data;
        } else if (articlesResponse.articles) {
          articlesData = articlesResponse.articles;
        }
        
        setArticles(articlesData);
        setDisplayedArticles(applyFiltersAndSort(articlesData, baseLockedFilters));
        
        // Handle feeds response
        if (feedsResponse.success && feedsResponse.data) {
          setFeeds(feedsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [baseLockedFilters]);

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

  // The following handlers would need to call backend APIs for full integration
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
      currentView="Favorites"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      availableFeeds={feeds}
      lockedFilters={{ isFavorite: true }}
      preAppliedFilters={{ isFavorite: true }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showAnnotationsFilter={true}
      showFeedFilter={true}
      showSortOptions={true}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Favorites</h1>
            <p className="text-muted-foreground">Your favorited articles (filtered view).</p>
          </div>
          <div className="min-h-[200px]">
            {error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2 text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">Could not load favorite articles.</p>
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
                <p className="text-lg font-medium mb-2">No favorite articles found</p>
                <p className="text-sm text-muted-foreground">Star articles to add them to your favorites.</p>
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

export default FavoritesPage;
