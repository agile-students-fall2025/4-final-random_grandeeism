/**
 * InboxPage.jsx
 * 
 * Description: Inbox page displaying all newly saved and unprocessed articles
 * Purpose: Shows articles in the inbox queue waiting to be organized or read
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import TagManagerModal from "../components/TagManagerModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { articlesAPI, feedsAPI, tagsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { STATUS } from "../constants/statuses.js";
import { useTagResolution } from "../hooks/useTagResolution.js";

const InboxPage = ({ onNavigate, setPageRefresh }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedArticleForTags, setSelectedArticleForTags] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [articles, setArticles] = useState([]);
  const [rawArticles, setRawArticles] = useState([]); // Store raw articles
  const [feeds, setFeeds] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use tag resolution hook
  const { resolveArticleTags, refreshTags } = useTagResolution();

  const baseLockedFilters = useMemo(() => ({ status: STATUS.INBOX }), []);

  // Define fetchData function with useCallback to prevent infinite re-renders
  const fetchData = useCallback(async () => {
    try {
      console.log('InboxPage: fetchData called, loading data...');
      setLoading(true);
      setError(null);
      
      // Fetch articles, feeds, and tags in parallel
      const [articlesResponse, feedsResponse, tagsResponse] = await Promise.all([
        articlesAPI.getAll(baseLockedFilters),
        feedsAPI.getAll(),
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
      
      setRawArticles(articlesData); // Store raw articles
      
      // Handle feeds response
      if (feedsResponse.success && feedsResponse.data) {
        setFeeds(feedsResponse.data);
      }
      
      // Handle tags response
      if (tagsResponse.success && tagsResponse.data) {
        setAvailableTags(tagsResponse.data);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load data");
      setLoading(false);
    }
  }, [baseLockedFilters]);

  useEffect(() => {
    fetchData();
  }, [baseLockedFilters]);

  // Register refresh function with parent component
  useEffect(() => {
    if (setPageRefresh) {
      console.log('InboxPage: Registering refresh function');
      setPageRefresh(fetchData);
    }
    
    // Cleanup: remove refresh function when component unmounts
    return () => {
      if (setPageRefresh) {
        console.log('InboxPage: Cleaning up refresh function');
        setPageRefresh(null);
      }
    };
  }, [setPageRefresh, fetchData]);

  // Resolve tags when raw articles or tag resolution function changes
  useEffect(() => {
    if (rawArticles.length > 0) {
      const resolvedArticles = resolveArticleTags(rawArticles);
      setArticles(resolvedArticles);
      setDisplayedArticles(applyFiltersAndSort(resolvedArticles, baseLockedFilters));
    }
  }, [rawArticles, resolveArticleTags, baseLockedFilters]);

  const handleSearchWithFilters = (query, filters) => {
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
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
    console.log('handleToggleFavorite called with:', articleId);
    
    // Optimistically update the UI immediately
    setRawArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isFavorite: !article.isFavorite }
        : article
    ));

    try {
      // Find the current article to get its favorite status
      const currentArticle = articles.find(article => article.id === articleId);
      if (!currentArticle) {
        console.error('Article not found:', articleId);
        return;
      }

      console.log('Calling API to toggle favorite...');
      
      // Call the API to toggle favorite status
      const response = await articlesAPI.toggleFavorite(articleId, !currentArticle.isFavorite);
      
      console.log('API response:', response);
      
      if (!response.success) {
        console.error('API responded with failure');
        // Revert the optimistic update
        setRawArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isFavorite: currentArticle.isFavorite }
            : article
        ));
      }
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert the optimistic update on error
      const currentArticle = articles.find(article => article.id === articleId);
      if (currentArticle) {
        setRawArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isFavorite: currentArticle.isFavorite }
            : article
        ));
      }
    }
  };

  const handleDeleteArticle = (articleId) => {
    // Find the article to show its title in the confirmation modal
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
      
      // Revert the optimistic update on error
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
      
      alert(`Failed to delete article: ${error.message}`);
    }
  };

  const handleSaveSearch = () => {
    setShowSaveStackModal(true);
  };

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

      // 4. Refetch articles from API to get latest data
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
      
      // Update selected article for modal with fresh data
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

  return (
    <MainLayout
      currentPage="articles"
      currentView="Inbox"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      availableFeeds={feeds}
      lockedFilters={{ status: STATUS.INBOX }}
      preAppliedFilters={{ status: STATUS.INBOX }}
      onFilterChipRemoved={() => onNavigate("search")}
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Inbox</h1>
            <p className="text-muted-foreground">Articles in your inbox (filtered by Search).</p>
          </div>
          <div className="min-h-[200px]">
            {error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2 text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">Could not load inbox articles.</p>
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

export default InboxPage;
