import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Tag as TagIcon, FileText } from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import MainLayout from "../components/MainLayout";
import SaveStackModal from "../components/SaveStackModal.jsx";
import TagManagerModal from "../components/TagManagerModal.jsx";
import { feedsAPI, articlesAPI, tagsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "../components/ui/dialog.jsx";
import { useTagResolution } from "../hooks/useTagResolution.js";
import { useStacks } from "../contexts/useStacks.js";

// Utility to normalize backend response to an array
const normalizeArticles = (data) => {
  // Accepts { data: [...] } or { articles: [...] } or [...]
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.articles)) return data.articles;
  return [];
};

// Get all available tags from articles (will be recalculated after fetch)
const getAllAvailableTags = (articles) =>
  Array.from(new Set((Array.isArray(articles) ? articles : []).flatMap(article => Array.isArray(article.tags) ? article.tags : [])));

export default function TagArticlesPage({ onNavigate, tag }) {
  const [articles, setArticles] = useState([]);
  const [rawArticles, setRawArticles] = useState([]); // Store raw articles
  const [feeds, setFeeds] = useState([]);
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [showTagManagerModal, setShowTagManagerModal] = useState(false);
  const [selectedArticleForTags, setSelectedArticleForTags] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  // Use shared tag resolution hook
  const { tags, resolveTagName, resolveArticleTags, resolveTagId, refreshTags, loading: tagsLoading } = useTagResolution();

  // Create base filters for search functionality (convert tag name to ID if needed)
  const baseLockedFilters = useMemo(() => {
    if (!tag) return {};
    // Just pass the tag as-is - backend will resolve it to ID or name
    return { tag: tag };
  }, [tag]);

  // Get the display name for the current tag
  const tagDisplayName = useMemo(() => {
    if (!tag) return 'Untagged';
    // If tag is already a readable name (not an ID), return it
    if (!tag.startsWith('tag-')) return tag;
    // Otherwise, resolve ID to name using the hook
    return resolveTagId(tag);
  }, [tag, resolveTagId]);

  // Fetch articles and feeds when tag or baseLockedFilters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch articles, feeds, and tags with the resolved tag ID
        const [articlesResponse, feedsResponse, tagsResponse] = await Promise.all([
          articlesAPI.getAll(baseLockedFilters),
          feedsAPI.getAll(),
          tagsAPI.getAll()
        ]);
        
        const normalized = normalizeArticles(articlesResponse);
        setRawArticles(normalized); // Store raw articles
        
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
        setError("Failed to load articles");
        setRawArticles([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [baseLockedFilters]);

  // Resolve tags when raw articles or tag resolution function changes
  useEffect(() => {
    if (rawArticles.length > 0) {
      const articlesWithResolvedTags = resolveArticleTags(rawArticles);
      setArticles(articlesWithResolvedTags);
      setDisplayedArticles(articlesWithResolvedTags);
    } else {
      setArticles([]);
      setDisplayedArticles([]);
    }
  }, [rawArticles, resolveArticleTags]);

  const allAvailableTags = useMemo(() => getAllAvailableTags(articles), [articles]);

  const handleSearchWithFilters = (query, filters) => {
    // Merge locked filters with search filters
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const { addStack } = useStacks();

  const handleSaveSearch = () => {
    console.log('Save current search as a Stack');
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

  // ArticleCard handlers
  const handleArticleClick = (article) => {
    // Navigate to the appropriate viewer based on media type
    const destination = article.mediaType === 'video' ? 'video-player' : article.mediaType === 'audio' ? 'audio-player' : 'text-reader';
    // Return to tag-specific route when possible, preserving the tagName
    const returnTo = tag
      ? { page: 'tag-articles', tagName: tag }
      : { page: 'tags' };
    onNavigate && onNavigate(destination, { article, returnTo });
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
    setArticleToDelete(articleId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    
    try {
      const response = await articlesAPI.delete(articleToDelete);
      if (response.success) {
        // Update both raw and resolved articles
        setRawArticles(prev => prev.filter(article => article.id !== articleToDelete));
        setArticles(prev => prev.filter(article => article.id !== articleToDelete));
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
      } else {
        throw new Error(response.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert(`Failed to delete article: ${error.message}`);
    }
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
              availableFeeds={feeds}
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
              onClick={() => onNavigate('tags')}
              className="mb-6 -ml-3"
            >
              <ChevronLeft className="size-4" />
              Back to Tags
            </Button>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TagIcon className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {tagDisplayName}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {displayedArticles.length} {displayedArticles.length === 1 ? 'item' : 'items'}
                    </span>
                    <span>•</span>
                    <span>Tagged articles</span>
                  </div>
                </div>
              </div>
              {/* Tag Badge */}
              {tag && (
                <div>
                  <Badge variant="secondary" className="text-sm">
                    <TagIcon className="size-3 mr-1.5" />
                    {tag}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          {/* Articles Grid */}
          {error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <FileText className="size-8 text-destructive" />
                </div>
                <CardTitle className="text-xl mb-2 text-destructive">{error}</CardTitle>
                <CardDescription className="text-center max-w-md text-destructive">
                  Could not load tagged articles.
                </CardDescription>
              </CardContent>
            </Card>
          ) : loading ? null : displayedArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="size-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">No articles found</CardTitle>
                <CardDescription className="text-center max-w-md">
                  {tag 
                    ? `No articles are currently tagged with "${tag}". Try adding this tag to articles or check back later.`
                    : "Try adjusting your search terms or filters to find what you're looking for."}
                </CardDescription>
                {tag && (
                  <Button
                    variant="outline"
                    onClick={() => onNavigate('tags')}
                    className="mt-6"
                  >
                    <ChevronLeft className="size-4" />
                    Browse All Tags
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{displayedArticles.length}</span> {displayedArticles.length === 1 ? 'article' : 'articles'} tagged with "{tag}"
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
                    onManageTags={handleManageTags}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
