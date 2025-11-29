/**
 * RediscoveryPage.jsx
 * 
 * Description: Smart queue that resurfaces older saved content for rediscovery
 * Purpose: Helps users rediscover valuable content they saved but haven't read yet
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import TagManagerModal from "../components/TagManagerModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { articlesAPI, tagsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { STATUS } from "../constants/statuses.js";
import useTagResolution from "../hooks/useTagResolution.js";
import { useStacks } from "../contexts/useStacks.js";

const RediscoveryPage = ({ onNavigate, setPageRefresh }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [rawArticles, setRawArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // TagManager states
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [selectedArticleForTags, setSelectedArticleForTags] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);

  const { resolveArticleTags, refreshTags } = useTagResolution();
  const baseLockedFilters = useMemo(() => ({ status: STATUS.REDISCOVERY }), []);

  // Define fetchData function with useCallback to prevent infinite re-renders
  const fetchData = useCallback(async () => {
    try {
      console.log('RediscoveryPage: fetchData called, loading data...');
      setLoading(true);
      setError(null);
      
      const [articlesRes, tagsRes] = await Promise.all([
        articlesAPI.getAll(baseLockedFilters),
        tagsAPI.getAll()
      ]);
      
      let data = articlesRes;
      if (Array.isArray(articlesRes)) data = articlesRes;
      else if (articlesRes.data) data = articlesRes.data;
      else if (articlesRes.articles) data = articlesRes.articles;
      setRawArticles(data);
      
      // Handle tags response properly
      let tagsData = tagsRes;
      if (Array.isArray(tagsRes)) tagsData = tagsRes;
      else if (tagsRes.data) tagsData = tagsRes.data;
      else if (tagsRes.tags) tagsData = tagsRes.tags;
      setAvailableTags(tagsData);
      
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load articles");
      setLoading(false);
    }
  }, [baseLockedFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Register refresh function with parent component
  useEffect(() => {
    if (setPageRefresh) {
      console.log('RediscoveryPage: Registering refresh function');
      setPageRefresh(fetchData);
    }
    
    // Cleanup: remove refresh function when component unmounts
    return () => {
      if (setPageRefresh) {
        console.log('RediscoveryPage: Cleaning up refresh function');
        setPageRefresh(null);
      }
    };
  }, [setPageRefresh, fetchData]);

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
    setDisplayedArticles(applyFiltersAndSort(articles, currentFilters || baseLockedFilters));
  }, [articles, currentFilters, baseLockedFilters]);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const { addStack } = useStacks();

  const handleSaveSearch = () => setShowSaveStackModal(true);

  const handleSaveStack = async (stackData) => {
    try {
      await addStack(stackData);
      alert(`Stack "${stackData.name}" saved successfully!`);
    } catch (error) {
      console.error('Error saving stack:', error);
      alert('Failed to save stack');
    }
  };

  // TagManager handlers
  const handleManageTags = (article) => {
    // Find the raw article with tag IDs (before resolution)
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
      
      // Update the selected article for the modal to show the new tag immediately
      if (selectedArticleForTags && selectedArticleForTags.id === articleId) {
        setSelectedArticleForTags(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tagId]
        }));
      }
      
      // Make API call
      await articlesAPI.addTag(articleId, tagId);
    } catch (error) {
      console.error('Error adding tag:', error);
      // Rollback on error
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
    }
  };

  const handleRemoveTag = async (articleId, tagId) => {
    try {
      // Optimistic update: Update BOTH rawArticles AND articles immediately for instant UI feedback
      setRawArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, tags: (article.tags || []).filter(id => String(id) !== String(tagId)) }
          : article
      ));
      
      // ALSO update the resolved articles state immediately
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, tags: (article.tags || []).filter(id => String(id) !== String(tagId)) }
          : article
      ));
      
      // Update the selected article for the modal to remove the tag immediately
      if (selectedArticleForTags && selectedArticleForTags.id === articleId) {
        setSelectedArticleForTags(prev => ({
          ...prev,
          tags: (prev.tags || []).filter(id => String(id) !== String(tagId))
        }));
      }
      
      // Make API call
      await articlesAPI.removeTag(articleId, tagId);
    } catch (error) {
      console.error('Error removing tag:', error);
      // Rollback on error
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
    }
  };

  const handleCreateTag = async (tagName) => {
    try {
      if (!selectedArticleForTags) {
        throw new Error('No article selected');
      }

      // 1. Check if tag already exists
      let existingTag = availableTags.find(t => 
        t.name.toLowerCase() === tagName.toLowerCase()
      );

      let tagId;
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        // 2. Create new tag via API
        const createResponse = await tagsAPI.create({ name: tagName });
        if (!createResponse.success || !createResponse.data) {
          throw new Error('Failed to create tag');
        }
        existingTag = createResponse.data;
        tagId = existingTag.id;
        setAvailableTags(prev => [...prev, existingTag]);
      }

      // 3. Add tag to article via API
      const addResponse = await articlesAPI.addTag(selectedArticleForTags.id, tagId);
      if (!addResponse.success) {
        throw new Error(addResponse.error || 'Failed to add tag to article');
      }

      // 4. Refresh tags to update the tag resolution mapping
      await refreshTags();
      
      // 5. Refetch articles from API to get latest data
      const articlesResponse = await articlesAPI.getAll(baseLockedFilters);
      let articlesData = articlesResponse;
      if (Array.isArray(articlesResponse)) {
        articlesData = articlesResponse;
      } else if (articlesResponse.data) {
        articlesData = articlesResponse.data;
      }
      
      setRawArticles(articlesData);
      
      // Update selected article for modal
      const updatedArticle = articlesData.find(a => a.id === selectedArticleForTags.id);
      if (updatedArticle) {
        setSelectedArticleForTags(updatedArticle);
      }

    } catch (error) {
      console.error('Failed to create/add tag:', error);
      const errorMsg = String(error?.message || 'Unknown error');
      if (!errorMsg.toLowerCase().includes('already')) {
        alert(`Failed to create tag: ${errorMsg}`);
      }
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
        const articlesResponse = await articlesAPI.getAll({ status: STATUS.REDISCOVERY });
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
      currentView="Rediscovery"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={availableTags}
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
            {error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2 text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">Could not load rediscovery articles.</p>
              </div>
            ) : loading ? (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">Loading rediscovery articles...</p>
                <p className="text-sm text-muted-foreground">Please wait while we fetch your content.</p>
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
                    onManageTags={handleManageTags}
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
      
      {/* Tag Manager Modal */}
      <TagManagerModal
        isOpen={showTagManagerModal}
        onClose={() => setShowTagManagerModal(false)}
        availableTags={availableTags}
        article={selectedArticleForTags}
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

export default RediscoveryPage;
