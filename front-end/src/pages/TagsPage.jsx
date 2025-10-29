import { useState, useMemo } from "react";
import { Search, Plus, X } from "lucide-react";
import TagCard from "../components/TagCard";
import MainLayout from "../components/MainLayout";
import SaveStackModal from "../components/SaveStackModal.jsx";
import { mockArticles } from "../data/mockArticles";


export default function TagsPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("usage");
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [articles, setArticles] = useState(mockArticles);
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);

  // Calculate tag statistics
  const tagStats = useMemo(() => {
    const stats = new Map();
    
    articles.forEach(article => {
      article.tags.forEach(tag => {
        const existing = stats.get(tag) || { count: 0, articles: 0, videos: 0, podcasts: 0 };
        existing.count++;
        
        // Infer media type from tags
        if (article.tags.includes('podcast')) {
          existing.podcasts++;
        } else if (article.tags.includes('video')) {
          existing.videos++;
        } else {
          existing.articles++;
        }
        
        stats.set(tag, existing);
      });
    });
    
    return Array.from(stats.entries())
      .map(([tag, data]) => ({
        tag,
        articleCount: data.count,
        mediaBreakdown: {
          articles: data.articles,
          videos: data.videos,
          podcasts: data.podcasts,
        },
      }))
      .sort((a, b) => b.articleCount - a.articleCount);
  }, [articles]);

  // Filter and sort tags
  const filteredAndSortedTags = useMemo(() => {
    let filtered = tagStats.filter(tagData => 
      tagData.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'usage':
        return filtered.sort((a, b) => b.articleCount - a.articleCount);
      case 'alphabetical':
        return filtered.sort((a, b) => a.tag.localeCompare(b.tag));
      default:
        return filtered;
    }
  }, [tagStats, searchQuery, sortBy]);

  const maxCount = Math.max(...tagStats.map(t => t.articleCount), 1);

  const handleTagClick = (tag) => {
    // Navigate to search results filtered by this tag
    onNavigate('search', { tag: tag });
  };

  const handleRename = (oldTag, newTag) => {
    console.log(`Renaming tag "${oldTag}" to "${newTag}"`);
    // Update all articles with the renamed tag
    setArticles(articles.map(article => ({
      ...article,
      tags: article.tags.map(tag => tag === oldTag ? newTag : tag)
    })));
  };

  const handleDelete = (tag) => {
    console.log(`Deleting tag: ${tag}`);
    // Remove tag from all articles
    setArticles(articles.map(article => ({
      ...article,
      tags: article.tags.filter(t => t !== tag)
    })));
  };

  const handleCreateTag = () => {
    const trimmedTag = newTagName.trim();
    if (trimmedTag && !tagStats.some(t => t.tag === trimmedTag)) {
      // Create a new article with this tag to demonstrate the functionality
      const newArticle = {
        id: `new-${Date.now()}`,
        title: `Sample Article with ${trimmedTag}`,
        url: "https://example.com",
        author: "User",
        readingTime: "5 min",
        status: "inbox",
        isFavorite: false,
        tags: [trimmedTag],
        dateAdded: new Date(),
        hasAnnotations: false,
        readProgress: 0
      };
      
      setArticles([...articles, newArticle]);
      setNewTagName("");
      setIsCreateTagModalOpen(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag();
    }
  };

  const handleSearchWithFilters = (query, filters) => {
    console.log('Search tags:', query, filters);
    setCurrentFilters(filters);
  };

  const handleSaveSearch = () => {
    console.log('Save current search as a Stack');
    setShowSaveStackModal(true);
  };

  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    alert(`Stack "${stackData.name}" saved successfully!`);
  };

  return (
    <MainLayout
      currentPage="articles"
      currentView="Tags"
      onNavigate={onNavigate}
      articles={articles}
      pageTitle="Tags"
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={Array.from(new Set(articles.flatMap(article => article.tags)))}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showStatusFilter={true}
      showFavoritesFilter={true}
      showSortOptions={true}
    >
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">Tags</h1>
                <p className="text-muted-foreground">
                  Organize and manage your content with tags
                </p>
              </div>
              <button
                onClick={() => setIsCreateTagModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                Create Tag
              </button>
            </div>
            
            {/* Search and Sort */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:border-primary focus:outline-none"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background focus:border-primary focus:outline-none"
              >
                <option value="usage">Sort by Usage</option>
                <option value="alphabetical">Sort Alphabetically</option>
              </select>
            </div>
          </div>

          {filteredAndSortedTags.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                <Search size={24} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No tags found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Create your first tag to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsCreateTagModalOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Tag
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedTags.map(({ tag, articleCount, mediaBreakdown }) => (
                <TagCard
                  key={tag}
                  tag={tag}
                  articleCount={articleCount}
                  maxCount={maxCount}
                  mediaBreakdown={mediaBreakdown}
                  onTagClick={handleTagClick}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Tag Modal */}
      {isCreateTagModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Create New Tag</h2>
              <button
                onClick={() => {
                  setIsCreateTagModalOpen(false);
                  setNewTagName("");
                }}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter tag name..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || tagStats.some(t => t.tag === newTagName.trim())}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Tag
                </button>
                <button
                  onClick={() => {
                    setIsCreateTagModalOpen(false);
                    setNewTagName("");
                  }}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              {newTagName.trim() && tagStats.some(t => t.tag === newTagName.trim()) && (
                <p className="text-sm text-destructive">
                  A tag with this name already exists.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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