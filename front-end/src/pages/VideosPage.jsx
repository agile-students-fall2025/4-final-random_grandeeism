/**
 * VideosPage.jsx
 * 
 * Description: Dedicated page for video content from YouTube, Vimeo, and other platforms
 * Purpose: Filtered view showing only video content with thumbnails and playback options
 */

import { useState, useEffect, useMemo } from "react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import TagManagerModal from "../components/TagManagerModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { articlesAPI, tagsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import useTagResolution from "../hooks/useTagResolution.js";
import { useStacks } from "../contexts/useStacks.js";

const VideosPage = ({ onNavigate }) => {
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [articles, setArticles] = useState([]);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  // TagManager states
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [selectedArticleForTags, setSelectedArticleForTags] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);

  const { resolveArticleTags, refreshTags } = useTagResolution();
  const baseLockedFilters = useMemo(() => ({ mediaType: 'video' }), []);

  useEffect(() => {
    // Load tags
    tagsAPI.getAll()
      .then(tags => setAvailableTags(tags))
      .catch(err => console.error('Error loading tags:', err));
      
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

  // TagManager handlers
  const handleManageTags = (article) => {
    setSelectedArticleForTags(article);
    setShowTagManagerModal(true);
  };

  const handleAddTag = async (tagId) => {
    try {
      await articlesAPI.addTag(selectedArticleForTags.id, tagId);
      // Update the article in our displayed articles
      setDisplayedArticles(prev => prev.map(article => 
        article.id === selectedArticleForTags.id 
          ? { ...article, tags: [...(article.tags || []), tagId] }
          : article
      ));
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      await articlesAPI.removeTag(selectedArticleForTags.id, tagId);
      // Update the article in our displayed articles
      setDisplayedArticles(prev => prev.map(article => 
        article.id === selectedArticleForTags.id 
          ? { ...article, tags: (article.tags || []).filter(id => id !== tagId) }
          : article
      ));
    } catch (error) {
      console.error('Error removing tag:', error);
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
      
      setArticles(articlesData);
      setDisplayedArticles(applyFiltersAndSort(articlesData, baseLockedFilters));
      
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
        setArticles(prev => prev.map(article => 
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
      currentPage="videos"
      onNavigate={onNavigate}
      articles={articles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Tutorial", "Conference", "Tech Talk", "Interview"]}
      lockedFilters={{ mediaType: "video" }}
      preAppliedFilters={{ mediaType: "video" }}
      onFilterChipRemoved={() => onNavigate("search")}
      showTimeFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showAnnotationsFilter={true}
      showSortOptions={true}
      addLinkButtonText="Add Video"
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Video Library</h1>
            <p className="text-muted-foreground">All your saved video content.</p>
          </div>

          <div className="min-h-[200px]">
            {displayedArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onArticleClick={() => onNavigate && onNavigate('video-player', { article })}
                    onToggleFavorite={handleToggleFavorite}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteArticle}
                    onManageTags={handleManageTags}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">No videos found</p>
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

export default VideosPage;
