/**
 * SearchPage.jsx
 * 
 * Description: Advanced search page with comprehensive filtering and sorting options
 * Purpose: Allows users to search and filter articles by tags, time, media type, status, and more
 */

import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import TagManagerModal from "../components/TagManagerModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { articlesAPI, feedsAPI, tagsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { useTagResolution } from "../hooks/useTagResolution.js";

const SearchPage = ({ onNavigate, initialTag }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedArticleForTags, setSelectedArticleForTags] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(initialTag ? { tags: [initialTag] } : {});
  const [articles, setArticles] = useState([]);
  const [rawArticles, setRawArticles] = useState([]); // Store raw articles
  const [feeds, setFeeds] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use tag resolution hook
  const { resolveArticleTags, refreshTags } = useTagResolution();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = initialTag ? { tag: initialTag } : {};
        
        // Fetch articles, feeds, and tags in parallel
        const [articlesResponse, feedsResponse, tagsResponse] = await Promise.all([
          articlesAPI.getAll(filters),
          feedsAPI.getAll(),
          tagsAPI.getAll()
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
        
        setRawArticles(data); // Store raw articles
        
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
    };

    fetchData();
  }, [initialTag]);

  // Resolve tags when raw articles or tag resolution function changes
  useEffect(() => {
    if (rawArticles.length > 0) {
      const resolvedArticles = resolveArticleTags(rawArticles);
      setArticles(resolvedArticles);
      const filters = initialTag ? { tag: initialTag } : {};
      setDisplayedArticles(applyFiltersAndSort(resolvedArticles, filters));
    }
  }, [rawArticles, resolveArticleTags, initialTag]);

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

  const handleManageTags = (article) => {
    // Find the raw article (with tag IDs) instead of using the resolved article (with tag names)
    const rawArticle = rawArticles.find(raw => raw.id === article.id);
    setSelectedArticleForTags(resolveArticleTags([rawArticle || article])[0]);
    setShowTagManagerModal(true);
  };

  const handleAddTag = async (articleId, tagId) => {
    try {
      const response = await articlesAPI.addTag(articleId, tagId);
      if (response.success) {
        // First, optimistically update the selected article for immediate UI feedback
        if (selectedArticleForTags && selectedArticleForTags.id === articleId) {
          const updatedTags = [...(selectedArticleForTags.tags || []), tagId];
          const optimisticUpdate = { ...selectedArticleForTags, tags: updatedTags };
          setSelectedArticleForTags(optimisticUpdate);
        }
        
        // Refetch articles to show updated tags
        const articlesResponse = await articlesAPI.getAll(currentFilters || {});
        let articlesData = articlesResponse;
        if (articlesResponse.data) articlesData = articlesResponse.data;
        
        setRawArticles(articlesData);
        // Update the selected article for the modal with fresh server data
        const updatedArticle = articlesData.find(a => a.id === articleId);
        if (updatedArticle) {
          setSelectedArticleForTags(updatedArticle);
        }
      } else {
        throw new Error(response.error || 'Failed to add tag');
      }
    } catch (error) {
      console.error('Failed to add tag:', error);
      alert(`Failed to add tag: ${error.message}`);
    }
  };

  const handleRemoveTag = async (articleId, tagId) => {
    try {
      const response = await articlesAPI.removeTag(articleId, tagId);
      if (response.success) {
        // First, optimistically update the selected article for immediate UI feedback
        if (selectedArticleForTags && selectedArticleForTags.id === articleId) {
          const updatedTags = selectedArticleForTags.tags.filter(tag => tag !== tagId);
          const optimisticUpdate = { ...selectedArticleForTags, tags: updatedTags };
          setSelectedArticleForTags(optimisticUpdate);
        }
        
        // Refetch articles to show updated tags
        const articlesResponse = await articlesAPI.getAll(currentFilters || {});
        let articlesData = articlesResponse;
        if (articlesResponse.data) articlesData = articlesResponse.data;
        
        setRawArticles(articlesData);
        // Update the selected article for the modal with fresh server data
        const updatedArticle = articlesData.find(a => a.id === articleId);
        if (updatedArticle) {
          setSelectedArticleForTags(updatedArticle);
        }
      } else {
        throw new Error(response.error || 'Failed to remove tag');
      }
    } catch (error) {
      console.error('Failed to remove tag:', error);
      alert(`Failed to remove tag: ${error.message}`);
    }
  };

  const handleCreateTag = async (newTag) => {
    try {
      const response = await tagsAPI.create({ name: newTag.name, color: newTag.color });
      if (response.success) {
        setAvailableTags(prevTags => [...prevTags, response.data]);
        // Refresh the global tag resolution mapping
        await refreshTags();
        // Return the created tag for use by child components
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
      alert(`Failed to create tag: ${error.message}`);
      throw error; // Re-throw so child components can handle it
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
        const articlesResponse = await articlesAPI.getAll(currentFilters || {});
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
        const articlesResponse = await articlesAPI.getAll();
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
                    onManageTags={handleManageTags}
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

export default SearchPage;
