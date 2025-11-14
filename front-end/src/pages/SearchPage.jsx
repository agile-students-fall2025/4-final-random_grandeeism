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
import { articlesAPI, feedsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";

const SearchPage = ({ onNavigate, initialTag }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(initialTag ? { tags: [initialTag] } : {});
  const [articles, setArticles] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = initialTag ? { tag: initialTag } : {};
        
        // Fetch articles and feeds in parallel
        const [articlesResponse, feedsResponse] = await Promise.all([
          articlesAPI.getAll(filters),
          feedsAPI.getAll()
        ]);
        
        // Handle articles response
        let data = articlesResponse;
        if (Array.isArray(articlesResponse)) {
          data = articlesResponse;
        } else if (articlesResponse.data) {
          data = articlesResponse.data;
        } else if (articlesResponse.articles) {
          data = articlesResponse.articles;
        }
        
        setArticles(data);
        setDisplayedArticles(applyFiltersAndSort(data, filters));
        
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
  }, [initialTag]);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const handleSaveSearch = () => setShowSaveStackModal(true);

  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    alert(`Stack "${stackData.name}" saved successfully!`);
  };

  // The following handlers would need to call backend APIs for full integration
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

  return (
    <MainLayout
      currentPage="search"
      currentView="Search"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      availableFeeds={feeds}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showAnnotationsFilter={true}
      showFeedFilter={true}
      showSortOptions={true}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Advanced Search</h1>
            <p className="text-muted-foreground">Search and filter all your saved content.</p>
          </div>
          <div className="min-h-[200px]">
            {loading ? (
              <div className="flex justify-center items-center min-h-[120px]">
                <span className="animate-spin mr-2">🌀</span> Loading articles...
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2 text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">Could not load search results.</p>
              </div>
            ) : displayedArticles.length > 0 ? (
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
