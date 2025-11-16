/**
 * DailyReadingPage.jsx
 * 
 * Description: Curated daily reading queue with articles scheduled for today
 * Purpose: Displays articles marked for daily reading, helping users maintain reading habits
 */

import { useState, useEffect, useMemo } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import TagManagerModal from "../components/TagManagerModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { articlesAPI, tagsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { STATUS } from "../constants/statuses.js";
import useTagResolution from "../hooks/useTagResolution.js";

const DailyReadingPage = ({ onNavigate }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedArticleForTags, setSelectedArticleForTags] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [rawArticles, setRawArticles] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [articles, setArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { resolveArticleTags } = useTagResolution();
  const baseLockedFilters = useMemo(() => ({ status: STATUS.DAILY }), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch articles and tags in parallel
        const [articlesResponse, tagsResponse] = await Promise.all([
          articlesAPI.getAll(baseLockedFilters),
          tagsAPI.getAll()
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
        
        setRawArticles(articlesData);
        
        // Handle tags response
        if (tagsResponse.success && tagsResponse.data) {
          setAvailableTags(tagsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [baseLockedFilters]);

  // Tag resolution effect
  useEffect(() => {
    if (rawArticles.length > 0) {
      const resolveAndSetArticles = async () => {
        const resolved = await resolveArticleTags(rawArticles);
        setArticles(resolved);
      };
      resolveAndSetArticles();
    } else {
      setArticles([]);
    }
  }, [rawArticles, resolveArticleTags]);

  // Update displayed articles when resolved articles change
  useEffect(() => {
    if (articles.length > 0) {
      setDisplayedArticles(applyFiltersAndSort(articles, currentFilters || baseLockedFilters));
    }
  }, [articles, currentFilters, baseLockedFilters]);

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

  const handleManageTags = (article) => {
    // Find the raw article (with tag IDs) instead of using the resolved article (with tag names)
    const rawArticle = rawArticles.find(raw => raw.id === article.id);
    setSelectedArticleForTags(rawArticle || article);
    setShowTagManagerModal(true);
  };

  const handleAddTag = async (articleId, tagId) => {
    try {
      // Optimistic update: Update BOTH rawArticles AND articles immediately for instant UI feedback
      setRawArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, tags: [...(article.tags || []), tagId] }
          : article
      ));
      
      // ALSO update the resolved articles state immediately
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, tags: [...(article.tags || []), tagId] }
          : article
      ));
      
      // Update selected article for modal
      setSelectedArticleForTags(prev => 
        prev?.id === articleId 
          ? { ...prev, tags: [...(prev.tags || []), tagId] }
          : prev
      );

      // Then make the API call
      const response = await articlesAPI.addTag(articleId, tagId);
      if (!response.success) {
        // Rollback on failure
        setRawArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, tags: (article.tags || []).filter(t => t !== tagId) }
            : article
        ));
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, tags: (article.tags || []).filter(t => t !== tagId) }
            : article
        ));
        throw new Error(response.error || 'Failed to add tag');
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
      alert(`Failed to add tag: ${error.message}`);
    }
  };

  const handleRemoveTag = async (articleId, tagId) => {
    try {
      // Optimistic update: Update BOTH rawArticles AND articles immediately for instant UI feedback
      setRawArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, tags: (article.tags || []).filter(t => String(t) !== String(tagId)) }
          : article
      ));
      
      // ALSO update the resolved articles state immediately
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, tags: (article.tags || []).filter(t => String(t) !== String(tagId)) }
          : article
      ));
      
      // Update selected article for modal
      setSelectedArticleForTags(prev => 
        prev?.id === articleId 
          ? { ...prev, tags: (prev.tags || []).filter(t => String(t) !== String(tagId)) }
          : prev
      );

      // Then make the API call
      const response = await articlesAPI.removeTag(articleId, tagId);
      if (!response.success) {
        // Rollback on failure
        setRawArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, tags: [...(article.tags || []), tagId] }
            : article
        ));
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, tags: [...(article.tags || []), tagId] }
            : article
        ));
        throw new Error(response.error || 'Failed to remove tag');
      }
    } catch (error) {
      console.error('Failed to remove tag:', error);
      alert(`Failed to remove tag: ${error.message}`);
    }
  };

  const handleCreateTag = async (newTag) => {
    // This is called by TagManagerModal AFTER the tag has already been created
    // Just update the local state, don't create the tag again
    try {
      // Check if tag already exists in local state to avoid duplicates
      const exists = availableTags.some(t => 
        t.id === newTag.id || t.name.toLowerCase() === newTag.name.toLowerCase()
      );
      
      if (!exists) {
        setAvailableTags(prevTags => [...prevTags, newTag]);
      }
    } catch (error) {
      console.error('Failed to add tag to local state:', error);
    }
  };

  const handleStatusChange = async (articleId, newStatus) => {
    try {
      const response = await articlesAPI.updateStatus(articleId, newStatus);
      if (response.success) {
        // Optimistically update the local state
        setRawArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, status: newStatus }
            : article
        ));
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update article status:', error);
      alert(`Failed to update status: ${error.message}`);
    }
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
        // Refetch all articles to get the updated state
        const articlesResponse = await articlesAPI.getAll({ status: STATUS.DAILY });
        if (articlesResponse.success) {
          setRawArticles(articlesResponse.data);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDeleteArticle = (articleId) => {
    // Find the article to show in confirmation modal
    const article = rawArticles.find(a => a.id === articleId);
    setArticleToDelete(article);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      // Optimistically update the UI immediately
      setRawArticles(prev => prev.filter(article => article.id !== articleToDelete.id));
      
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
        setRawArticles(articlesData);
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
      currentPage="articles"
      currentView="Daily Reading"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      lockedFilters={{ status: STATUS.DAILY }}
      preAppliedFilters={{ status: STATUS.DAILY }}
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Daily Reading Queue</h1>
            <p className="text-muted-foreground">Your curated daily reading list.</p>
          </div>
          <div className="min-h-[200px]">
            {error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2 text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">Could not load daily reading articles.</p>
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
                    onManageTags={handleManageTags}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">No articles found</p>
                <p className="text-sm text-muted-foreground">Adjust filters or search to surface items.</p>
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
      
      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={showTagManagerModal}
        onClose={() => setShowTagManagerModal(false)}
        article={selectedArticleForTags}
        availableTags={availableTags}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onCreateTag={handleCreateTag}
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

export default DailyReadingPage;
