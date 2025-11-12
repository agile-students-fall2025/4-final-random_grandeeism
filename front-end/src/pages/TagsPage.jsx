import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Tag as TagIcon, ArrowUpDown, X } from "lucide-react";
import TagCard from "../components/TagCard";
import MainLayout from "../components/MainLayout";
import { STATUS } from "../constants/statuses.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { articlesAPI } from "../services/api.js";

// Utility to normalize backend response to an array
const normalizeArticles = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.articles)) return data.articles;
  return [];
};

export default function TagsPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("usage");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    articlesAPI.getAll()
      .then((data) => {
        setArticles(normalizeArticles(data));
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load articles");
        setArticles([]);
        setLoading(false);
      });
  }, []);

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
        status: STATUS.INBOX,
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

  const sortLabels = {
    usage: "Sort by Usage",
    alphabetical: "Sort Alphabetically"
  };

  if (loading) {
    return (
      <MainLayout currentPage="articles" currentView="Tags">
        <div className="p-6"><div className="max-w-7xl mx-auto"></div></div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 px-8">
            <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <TagIcon className="size-8 text-destructive" />
            </div>
            <CardTitle className="text-xl mb-2 text-destructive">Error loading tags</CardTitle>
            <CardDescription className="text-center max-w-md text-destructive">
              {error}<br />
              <span className="text-muted-foreground">Please try refreshing the page.</span>
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <MainLayout
      currentPage="articles"
      currentView="Tags"
      onNavigate={onNavigate}
      articles={articles}
      showSearch={true}
      customSearchContent={
        <>
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="flex-1 min-w-0 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="flex-1 min-w-0 bg-card text-foreground text-[14px] outline-none placeholder:text-muted-foreground"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="p-1 hover:opacity-70 transition-opacity shrink-0"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Sort Button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
              >
                <ArrowUpDown size={14} />
                {sortLabels[sortBy]}
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-40">
                  {Object.keys(sortLabels).map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded hover:bg-accent transition-colors text-[14px] ${
                        sortBy === option ? "bg-accent" : ""
                      }`}
                    >
                      {sortLabels[option]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      }
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section with Create Button */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Tags</h1>
                <p className="text-muted-foreground text-sm">
                  Organize and manage your content with tags
                </p>
              </div>
              <Dialog open={isCreateTagModalOpen} onOpenChange={setIsCreateTagModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} />
                    Create Tag
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Tag</DialogTitle>
                    <DialogDescription>
                      Add a new tag to organize your content.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tag-name">Tag Name</Label>
                      <Input
                        id="tag-name"
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter tag name..."
                        autoFocus
                      />
                    </div>
                    {newTagName.trim() && tagStats.some(t => t.tag === newTagName.trim()) && (
                      <p className="text-sm text-destructive">
                        A tag with this name already exists.
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim() || tagStats.some(t => t.tag === newTagName.trim())}
                    >
                      Create Tag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tags Grid */}
          {filteredAndSortedTags.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <TagIcon className="size-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">No tags found</CardTitle>
                <CardDescription className="text-center max-w-md">
                  {searchQuery 
                    ? 'Try adjusting your search terms to find what you\'re looking for.' 
                    : 'Create your first tag to start organizing your content.'}
                </CardDescription>
                {!searchQuery && (
                  <Button 
                    onClick={() => setIsCreateTagModalOpen(true)}
                    className="mt-6"
                  >
                    <Plus size={16} />
                    Create Your First Tag
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredAndSortedTags.length}</span> of <span className="font-medium text-foreground">{tagStats.length}</span> tags
                </p>
              </div>

              {/* Tags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
