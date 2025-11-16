/**
 * HomePage.jsx
 * 
 * Description: Main landing page with tabbed view of workflow queues
 * Purpose: Central hub displaying articles in different workflow statuses via tabs
 * Features:
 *  - Four-tab view: Inbox, Daily Reading, Continue Reading, Rediscovery
 *  - Tab-based filtering that auto-applies status filters
 *  - Search within active tab view
 *  - Save searches as Stacks
 */

import { useState, useEffect, useMemo } from "react";
import { Inbox, Calendar, BookOpen, RotateCcw } from "lucide-react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import TagManagerModal from "../components/TagManagerModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { articlesAPI, tagsAPI } from "../services/api.js";
import { STATUS } from "../constants/statuses.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { useTagResolution } from "../hooks/useTagResolution.js";
import { ensureTagsLoaded } from "../utils/tagsCache.js";

// Tab configuration with icons and status mapping
const tabs = [
  { name: "Inbox", icon: Inbox, status: STATUS.INBOX },
  { name: "Daily Reading", icon: Calendar, status: STATUS.DAILY },
  { name: "Continue Reading", icon: BookOpen, status: STATUS.CONTINUE },
  { name: "Rediscovery", icon: RotateCcw, status: STATUS.REDISCOVERY }
];

const HomePage = ({ onNavigate }) => {
  const [articles, setArticles] = useState([]);
  const [rawArticles, setRawArticles] = useState([]); // Store raw articles
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedArticleForTags, setSelectedArticleForTags] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [activeTab, setActiveTab] = useState("Inbox");
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use tag resolution hook
  const { resolveArticleTags, refreshTags } = useTagResolution();

  // Get current tab's status value
  const currentStatus = tabs.find(t => t.name === activeTab)?.status || STATUS.INBOX;

  // Base locked filters based on active tab
  const baseLockedFilters = useMemo(() => ({ status: currentStatus }), [currentStatus]);

  // Fetch articles and tags from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Load tags first so resolution never flashes IDs
        const tagsResponse = await tagsAPI.getAll({ sort: 'alphabetical' });
        if (tagsResponse.success && tagsResponse.data) {
          setAvailableTags(tagsResponse.data);
          // Preload cache for downstream components
          await ensureTagsLoaded(async () => ({ data: tagsResponse.data }));
        }

        // Step 2: Fetch articles after tags ready
        const articlesResponse = await articlesAPI.getAll({});
        let articlesData = articlesResponse;
        if (Array.isArray(articlesResponse)) {
          articlesData = articlesResponse;
        } else if (articlesResponse.data) {
          articlesData = articlesResponse.data;
        } else if (articlesResponse.articles) {
          articlesData = articlesResponse.articles;
        }
        setRawArticles(articlesData);

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Resolve tags when raw articles or tag resolution function changes
  useEffect(() => {
    if (rawArticles.length > 0) {
      const resolvedArticles = resolveArticleTags(rawArticles);
      setArticles(resolvedArticles);
      setDisplayedArticles(applyFiltersAndSort(resolvedArticles, baseLockedFilters));
    }
  }, [rawArticles, resolveArticleTags, baseLockedFilters]);

  // Update displayed articles when tab or articles change
  useEffect(() => {
    setDisplayedArticles(applyFiltersAndSort(articles, baseLockedFilters));
  }, [articles, baseLockedFilters]);

  // Get article counts for display
  // Removed unused articleCounts (was causing lint warning). Re-add if needed for tab badges.

  // Article management functions
  const handleArticleClick = (article) => {
    // Navigate to the appropriate viewer based on media type
    const destination = article.mediaType === 'video' ? 'video-player' : article.mediaType === 'audio' ? 'audio-player' : 'text-reader';
    onNavigate && onNavigate(destination, { article });
  };

  // The following handlers would need to call backend APIs for full integration
  const handleToggleFavorite = async (articleId) => {
    try {
      // Find the current article to get its favorite status
      const currentArticle = articles.find(article => article.id === articleId);
      if (!currentArticle) {
        console.error('Article not found:', articleId);
        return;
      }

      console.log('Toggling favorite for article:', articleId, 'from', currentArticle.isFavorite, 'to', !currentArticle.isFavorite);

      // Call the API to toggle favorite status
      const response = await articlesAPI.toggleFavorite(articleId, !currentArticle.isFavorite);
      
      console.log('API response:', response);
      
      if (response.success) {
        console.log('API success, refetching articles...');
        // Refetch all articles to get the updated state
        const articlesResponse = await articlesAPI.getAll(currentFilters || {});
        if (articlesResponse.success) {
          setRawArticles(articlesResponse.data);
        }
      } else {
        console.error('API response indicated failure:', response);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // TODO: Show error message to user
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
    }
  };

  const handleSearchWithFilters = (query, filters) => {
    // Merge locked filters (status) with search filters
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
    setShowSaveStackModal(false);
  };

  // Handler for when the locked filter chip is removed - navigate to search page
  const handleFilterChipRemoved = () => {
    onNavigate('search');
  };

  const handleManageTags = (article) => {
    // Find the raw article (with tag IDs) instead of using the resolved article (with tag names)  
    const rawArticle = rawArticles.find(raw => raw.id === article.id);
    setSelectedArticleForTags(rawArticle || article);
    setShowTagManagerModal(true);
  };

  const handleAddTag = async (articleId, tagId) => {
    try {
      // Check if tag is already on article before making API call
      const currentArticle = rawArticles.find(a => a.id === articleId);
      const tagAlreadyExists = currentArticle?.tags?.some(t => 
        String(t).toLowerCase() === String(tagId).toLowerCase()
      );
      
      if (tagAlreadyExists) {
        console.log('Tag already on article, skipping API call');
        return; // Silently succeed - tag is already attached
      }
      // Perform API call to attach tag
      const response = await articlesAPI.addTag(articleId, tagId);
      if (!response.success) throw new Error(response.error || 'Failed to add tag');

      // Optimistically update rawArticles locally (avoid full refetch for responsiveness)
      setRawArticles(prev => {
        const updated = prev.map(a => {
          if (a.id !== articleId) return a;
          const existing = Array.isArray(a.tags) ? a.tags : [];
          if (existing.some(t => String(t).toLowerCase() === String(tagId).toLowerCase())) return a;
          return { ...a, tags: [...existing, tagId] };
        });
        return updated;
      });

      // Update resolved articles & displayedArticles immediately
      const nextRaw = rawArticles.map(a => {
        if (a.id !== articleId) return a;
        const existing = Array.isArray(a.tags) ? a.tags : [];
        if (existing.some(t => String(t).toLowerCase() === String(tagId).toLowerCase())) return a;
        return { ...a, tags: [...existing, tagId] };
      });
      const resolved = resolveArticleTags(nextRaw);
      setArticles(resolved);
      setDisplayedArticles(applyFiltersAndSort(resolved, baseLockedFilters));

      // Update selected article for tag modal (use raw article with tag IDs, not resolved)
      if (selectedArticleForTags && selectedArticleForTags.id === articleId) {
        const updatedRaw = nextRaw.find(a => a.id === articleId);
        if (updatedRaw) {
          setSelectedArticleForTags(updatedRaw);
        }
      }
    } catch (error) {
      // If tag is already on article (409), treat as success
      const errorMsg = String(error?.message || '').toLowerCase();
      if (errorMsg.includes('already on article')) {
        console.log('Tag already on article (409), treating as success');
        // Refetch to sync state
        const articlesResponse = await articlesAPI.getAll({});
        if (articlesResponse.data) {
          setRawArticles(articlesResponse.data);
          const updatedArticle = articlesResponse.data.find(a => a.id === articleId);
          if (updatedArticle) {
            setSelectedArticleForTags(updatedArticle);
          }
        }
        return; // Don't show error to user
      }
      
      console.error('Failed to add tag:', error);
      alert(`Failed to add tag: ${error.message}`);
    }
  };

  const handleRemoveTag = async (articleId, tagId) => {
    try {
      const response = await articlesAPI.removeTag(articleId, tagId);
      if (!response.success) throw new Error(response.error || 'Failed to remove tag');

      // Optimistically update rawArticles by removing tagId (handle both id and name forms)
      setRawArticles(prev => prev.map(a => {
        if (a.id !== articleId) return a;
        const existing = Array.isArray(a.tags) ? a.tags : [];
        const filtered = existing.filter(t => {
          const s = String(t).toLowerCase();
          const target = String(tagId).toLowerCase();
          return s !== target; // if tags are names OR ids
        });
        return { ...a, tags: filtered };
      }));

      const nextRaw = rawArticles.map(a => {
        if (a.id !== articleId) return a;
        const existing = Array.isArray(a.tags) ? a.tags : [];
        const filtered = existing.filter(t => String(t).toLowerCase() !== String(tagId).toLowerCase());
        return { ...a, tags: filtered };
      });
      const resolved = resolveArticleTags(nextRaw);
      setArticles(resolved);
      setDisplayedArticles(applyFiltersAndSort(resolved, baseLockedFilters));

      if (selectedArticleForTags && selectedArticleForTags.id === articleId) {
        const updatedRaw = nextRaw.find(a => a.id === articleId);
        if (updatedRaw) {
          const [resolvedArticle] = resolveArticleTags([updatedRaw]);
          setSelectedArticleForTags(resolvedArticle);
        }
      }
    } catch (error) {
      console.error('Failed to remove tag:', error);
      alert(`Failed to remove tag: ${error.message}`);
    }
  };

  // Note: TagManagerModal already creates the tag via API and passes the created tag here.
  // Avoid creating again (which caused 409 conflicts). Just update local state.
  const handleCreateTag = (createdTag) => {
    if (!createdTag || !createdTag.id) return;
    setAvailableTags(prev => {
      // Prevent duplicates if callback fires multiple times
      const exists = prev.some(t => t.id === createdTag.id || t.name.toLowerCase() === createdTag.name.toLowerCase());
      return exists ? prev : [...prev, createdTag];
    });
  };

  return (
    <MainLayout
      currentPage="home"
      currentView={activeTab}
      onNavigate={onNavigate}
      articles={displayedArticles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      lockedFilters={baseLockedFilters}
      preAppliedFilters={baseLockedFilters}
      onFilterChipRemoved={handleFilterChipRemoved}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showFavoritesFilter={true}
      showAnnotationsFilter={true}
      showSortOptions={true}
    >
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Here's your reading overview</p>
          </div>
          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.name
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden text-[11px] leading-tight text-center">
                    {tab.name === "Daily Reading" ? "Daily" : 
                     tab.name === "Continue Reading" ? "Continue" : 
                     tab.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {/* Tab Content */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center min-h-[120px]">
                <span className="animate-spin mr-2">🌀</span> Loading articles...
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2 text-destructive">{error}</p>
                <p className="text-sm text-muted-foreground">Could not load articles.</p>
              </div>
            ) : displayedArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onArticleClick={handleArticleClick}
                    onToggleFavorite={handleToggleFavorite}
                    onManageTags={handleManageTags}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">{activeTab}</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "Inbox" && "No new articles waiting to be triaged"}
                  {activeTab === "Daily Reading" && "No articles scheduled for today's reading session"}
                  {activeTab === "Continue Reading" && "No articles in progress"}
                  {activeTab === "Rediscovery" && "No articles scheduled for rediscovery"}
                </p>
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

export default HomePage;
