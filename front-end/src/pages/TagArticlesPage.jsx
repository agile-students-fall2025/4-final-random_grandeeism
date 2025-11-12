import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Tag as TagIcon, FileText } from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import MainLayout from "../components/MainLayout";
import SaveStackModal from "../components/SaveStackModal.jsx";
import { feedsAPI, articlesAPI, tagsAPI } from "../services/api.js";
import applyFiltersAndSort from "../utils/searchUtils.js";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";

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
  const [feeds, setFeeds] = useState([]);
  const [tags, setTags] = useState([]);
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to find tag ID by tag name
  const getTagIdByName = (tagName, tagsArray) => {
    if (!tagName || !Array.isArray(tagsArray)) return tagName;
    const foundTag = tagsArray.find(t => t.name === tagName);
    return foundTag ? foundTag.id : tagName;
  };

  // Create base filters for search functionality (will use resolved tag ID)
  const baseLockedFilters = useMemo(() => {
    if (!tag) return {};
    const tagId = getTagIdByName(tag, tags);
    return { tag: tagId };
  }, [tag, tags]);

  // Fetch tags first, then articles and feeds
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, fetch tags to resolve tag name to ID
        const tagsResponse = await tagsAPI.getAll();
        let tagId = tag;
        
        if (tagsResponse.success && tagsResponse.data) {
          setTags(tagsResponse.data);
          // Convert tag name to tag ID if needed
          if (tag) {
            const foundTag = tagsResponse.data.find(t => t.name === tag);
            tagId = foundTag ? foundTag.id : tag;
          }
        }
        
        // Now fetch articles and feeds with the resolved tag ID
        const filters = tagId ? { tag: tagId } : {};
        const [articlesResponse, feedsResponse] = await Promise.all([
          articlesAPI.getAll(filters),
          feedsAPI.getAll()
        ]);
        
        const normalized = normalizeArticles(articlesResponse);
        setArticles(normalized);
        setDisplayedArticles(normalized); // Use backend-filtered result directly
        
        // Handle feeds response
        if (feedsResponse.success && feedsResponse.data) {
          setFeeds(feedsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load articles");
        setArticles([]);
        setDisplayedArticles([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [tag]);

  const allAvailableTags = useMemo(() => getAllAvailableTags(articles), [articles]);

  const handleSearchWithFilters = (query, filters) => {
    // Merge locked filters with search filters
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const handleSaveSearch = () => {
    console.log('Save current search as a Stack');
    setShowSaveStackModal(true);
  };

  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    alert(`Stack "${stackData.name}" saved successfully!`);
  };

  // ArticleCard handlers
  const handleArticleClick = (article) => {
    // Navigate to the appropriate viewer based on media type
    const destination = article.mediaType === 'video' ? 'video-player' : article.mediaType === 'audio' ? 'audio-player' : 'text-reader';
    onNavigate && onNavigate(destination, { article });
  };

  const handleToggleFavorite = (articleId) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isFavorite: !article.isFavorite }
        : article
    ));
  };

  const handleStatusChange = (articleId, newStatus) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, status: newStatus }
        : article
    ));
  };

  const handleDelete = (articleId) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(prev => prev.filter(article => article.id !== articleId));
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
                    {tag || 'Untagged'}
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
    </MainLayout>
  );
}
