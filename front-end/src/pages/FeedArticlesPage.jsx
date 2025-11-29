import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Rss, FileText } from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import MainLayout from "../components/MainLayout";
import SaveStackModal from "../components/SaveStackModal.jsx";
import TagManagerModal from "../components/TagManagerModal.jsx";
import { articlesAPI, tagsAPI, feedsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import useTagResolution from "../hooks/useTagResolution.js";
import { useStacks } from "../contexts/useStacks.js";

export default function FeedArticlesPage({ onNavigate, feed }) {
  const [rawArticles, setRawArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [selectedArticleForTags, setSelectedArticleForTags] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableFeeds, setAvailableFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { resolveArticleTags, refreshTags } = useTagResolution();
  // Base locked filters - always include the feed
  const baseLockedFilters = useMemo(() => ({ feed: feed || "" }), [feed]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch articles, tags, and feeds in parallel
        const [articlesResponse, tagsResponse, feedsResponse] = await Promise.all([
          articlesAPI.getAll(baseLockedFilters),
          tagsAPI.getAll(),
          feedsAPI.getAll().catch(() => ({ data: [] })) // Fallback to empty array if feeds API fails
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
        
        // Handle feeds response
        if (feedsResponse && feedsResponse.data) {
          setAvailableFeeds(feedsResponse.data);
        } else if (Array.isArray(feedsResponse)) {
          setAvailableFeeds(feedsResponse);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [feed]);

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
    // Merge locked filters with search filters
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const { addStack } = useStacks();

  const handleSaveSearch = () => {
    setShowSaveStackModal(true);
  };

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
      }
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
      }
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
      
      // Refresh tags to update the tag resolution mapping
      await refreshTags();
    } catch (error) {
      console.error('Failed to add tag to local state:', error);
    }
  };

  // ArticleCard handlers
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

      // Call the API to toggle favorite status
      const response = await articlesAPI.toggleFavorite(articleId, !currentArticle.isFavorite);
      
      if (response.success) {
        // Update local state immediately to reflect the change
        setRawArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isFavorite: !article.isFavorite }
            : article
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
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

  const handleDelete = (articleId) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setRawArticles(prev => prev.filter(article => article.id !== articleId));
    }
  };

  // Get all available tags from articles
  const allAvailableTags = Array.from(new Set(articles.flatMap(article => article.tags || [])));

  return (
    <MainLayout
      currentPage="articles"
      currentView="Search"
      onNavigate={onNavigate}
      articles={displayedArticles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={allAvailableTags}
      availableFeeds={availableFeeds}
      lockedFilters={baseLockedFilters}
      preAppliedFilters={baseLockedFilters}
      onFilterChipRemoved={() => onNavigate('search')}
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
          {/* Header Section */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => onNavigate('feeds')}
              className="mb-6 -ml-3"
            >
              <ChevronLeft className="size-4" />
              Back to Feeds
            </Button>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rss className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {feed || 'Unknown Feed'}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {displayedArticles.length} {displayedArticles.length === 1 ? 'item' : 'items'}
                    </span>
                    <span>•</span>
                    <span>Feed articles</span>
                  </div>
                </div>
              </div>
              {/* Feed Badge */}
              {feed && (
                <div>
                  <Badge variant="secondary" className="text-sm">
                    <Rss className="size-3 mr-1.5" />
                    {feed}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          {/* Articles Grid */}
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="size-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">Loading articles...</CardTitle>
                <CardDescription className="text-center max-w-md">
                  Fetching articles from the feed.
                </CardDescription>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <FileText className="size-8 text-destructive" />
                </div>
                <CardTitle className="text-xl mb-2 text-destructive">{error}</CardTitle>
                <CardDescription className="text-center max-w-md">
                  Could not load feed articles.
                </CardDescription>
              </CardContent>
            </Card>
          ) : displayedArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="size-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">No articles found</CardTitle>
                <CardDescription className="text-center max-w-md">
                  {feed 
                    ? `No articles are currently available from "${feed}". Try refreshing the feed or check back later.`
                    : "Try adjusting your search terms or filters to find what you're looking for."}
                </CardDescription>
                {feed && (
                  <Button
                    variant="outline"
                    onClick={() => onNavigate('feeds')}
                    className="mt-6"
                  >
                    <ChevronLeft className="size-4" />
                    Browse All Feeds
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{displayedArticles.length}</span> {displayedArticles.length === 1 ? 'article' : 'articles'} from "{feed}"
                </p>
              </div>
              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onArticleClick={handleArticleClick}
                    onToggleFavorite={handleToggleFavorite}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onManageTags={handleManageTags}
                  />
                ))}
              </div>
            </>
          )}
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
    </MainLayout>
  );
}
