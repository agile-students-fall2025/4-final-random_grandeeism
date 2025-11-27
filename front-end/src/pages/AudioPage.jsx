/**
 * AudioPage.jsx
 * 
 * Description: Dedicated page for audio content including podcasts and audio articles
 * Purpose: Filtered view showing only audio/podcast content with playback controls
 */

import { useState, useEffect, useMemo } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { articlesAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { useStacks } from "../contexts/useStacks.js";

const AudioPage = ({ onNavigate }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [articles, setArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const baseLockedFilters = useMemo(() => ({ mediaType: 'audio' }), []);

  useEffect(() => {
    setDisplayedArticles(applyFiltersAndSort(articles, baseLockedFilters));
  }, [articles, baseLockedFilters]);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const handleSaveSearch = () => setShowSaveStackModal(true);

  const { addStack } = useStacks();

  const handleSaveStack = async (stackData) => {
    try {
      await addStack(stackData);
      alert(`Stack "${stackData.name}" saved successfully!`);
    } catch (error) {
      console.error('Error saving stack:', error);
      alert('Failed to save stack');
    }
  };

  const handleStatusChange = (articleId, newStatus) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === articleId ? { ...article, status: newStatus } : article
      )
    );
  };

  const handleToggleFavorite = async (articleId) => {
    try {
      // Find the current article to get its favorite status
      const currentArticle = articles.find(article => article.id === articleId);
      if (!currentArticle) {
        console.error('Article not found:', articleId);
        return;
      }

      // Call the API to toggle favorite status
      const response = await articlesAPI.toggleFavorite(articleId, !currentArticle.isFavorite);
      
      if (response.success) {
        // Update local state to reflect the change
        setArticles(prevArticles =>
          prevArticles.map(article =>
            article.id === articleId ? { ...article, isFavorite: !article.isFavorite } : article
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeleteArticle = (articleId) => {
    // Find the article to show in confirmation modal
    const article = articles.find(a => a.id === articleId);
    setArticleToDelete(article);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      // Optimistically update the UI immediately
      setArticles(prev => prev.filter(article => article.id !== articleToDelete.id));
      
      // Call the backend API
      const response = await articlesAPI.delete(articleToDelete.id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete article');
      }
      
      console.log('Article deleted successfully');
    } catch (error) {
      console.error('Failed to delete article:', error);
      
      // Revert the optimistic update on error by refetching data
      try {
        const articlesResponse = await articlesAPI.getAll(baseLockedFilters);
        let articlesData = articlesResponse;
        if (Array.isArray(articlesResponse)) {
          articlesData = articlesResponse;
        } else if (articlesResponse.data) {
          articlesData = articlesResponse.data;
        } else if (articlesResponse.articles) {
          articlesData = articlesResponse.articles;
        }
        setArticles(articlesData);
      } catch (fetchError) {
        console.error('Failed to refetch articles:', fetchError);
      }
      
      alert(`Failed to delete article: ${error.message}`);
    } finally {
      // Close modal and reset state
      setShowConfirmDeleteModal(false);
      setArticleToDelete(null);
    }
  };

  return (
    <MainLayout
      currentPage="podcasts"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Podcast", "Tech", "Interview", "Education"]}
      lockedFilters={{ mediaType: "audio" }}
      preAppliedFilters={{ mediaType: "audio" }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showAnnotationsFilter={true}
      showSortOptions={true}
      addLinkButtonText="Add Podcast"
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Audio & Podcasts</h1>
            <p className="text-muted-foreground">All your saved audio content and podcasts.</p>
          </div>

          <div className="min-h-[200px]">
            {displayedArticles.length > 0 ? (
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

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showConfirmDeleteModal}
        onClose={() => {
          setShowConfirmDeleteModal(false);
          setArticleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        articleTitle={articleToDelete?.title}
      />
    </MainLayout>
  );
};

export default AudioPage;
