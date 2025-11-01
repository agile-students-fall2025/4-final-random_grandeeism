import { useState, useMemo } from "react";
import { Search, Plus, Tag as TagIcon } from "lucide-react";
import TagCard from "../components/TagCard";
import MainLayout from "../components/MainLayout";
import SaveStackModal from "../components/SaveStackModal.jsx";
import { mockArticles } from "../data/mockArticles";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select.jsx";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";

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
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
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
            
            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                <Input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usage">Sort by Usage</SelectItem>
                  <SelectItem value="alphabetical">Sort Alphabetically</SelectItem>
                </SelectContent>
              </Select>
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
