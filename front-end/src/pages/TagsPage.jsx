import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Tag as TagIcon, ArrowUpDown, X } from "lucide-react";
import TagCard from "../components/TagCard";
import MainLayout from "../components/MainLayout";
import { STATUS } from "../constants/statuses.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { articlesAPI, tagsAPI } from "../services/api.js";

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
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tags from backend
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      if (data.success) {
        setTags(data.data);
      } else {
        setError(data.error || "Failed to fetch tags");
      }
    } catch (e) {
      setError("Failed to fetch tags");
    }
    setLoading(false);
  };

  // Calculate tag statistics
  const tagStats = useMemo(() => {
    return tags.map(tag => ({
      tag: tag.name,
      id: tag.id,
      articleCount: tag.articleCount || 0,
      mediaBreakdown: {}, // You can enhance this if you want
    }));
  }, [tags]);

    fetchTags();
  }, [sortBy]);

  // Filter tags based on search query (API already handles sorting)
  const filteredTags = useMemo(() => {
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  const maxCount = Math.max(...tags.map(t => t.articleCount), 1);

  const handleTagClick = (tagName) => {
    // Navigate to search results filtered by this tag
    onNavigate('search', { tag: tagName });
  };

  const handleRename = async (oldTag, newTag) => {
    const tagObj = tags.find(t => t.name === oldTag);
    if (!tagObj) return;
    try {
      const res = await fetch(`/api/tags/${tagObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag })
      });
      const data = await res.json();
      if (data.success) {
        fetchTags();
      } else {
        alert(data.error || 'Failed to rename tag');
      }
    } catch (e) {
      alert('Failed to rename tag');
    }
  };

  const handleDelete = async (tag) => {
    const tagObj = tags.find(t => t.name === tag);
    if (!tagObj) return;
    // if (!window.confirm(`Delete tag "${tag}"?`)) return;
    try {
      const res = await fetch(`/api/tags/${tagObj.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTags();
      } else {
        alert(data.error || 'Failed to delete tag');
      }
    } catch (e) {
      alert('Failed to delete tag');
    }
  };

  const handleCreateTag = async () => {
    const trimmedTag = newTagName.trim();
    if (!trimmedTag || tagStats.some(t => t.tag === trimmedTag)) return;
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedTag })
      });
      const data = await res.json();
      if (data.success) {
        setNewTagName("");
        setIsCreateTagModalOpen(false);
        fetchTags();
      } else {
        alert(data.error || 'Failed to create tag');
      }
    } catch (e) {
      alert('Failed to create tag');
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
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <TagIcon className="size-8 mx-auto mb-4 animate-pulse" />
                <div className="text-lg font-medium">Loading tags...</div>
                <div className="text-sm text-muted-foreground mt-2">Please wait while we fetch your tags</div>
              </div>
            </div>
          </div>
        </div>
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
                                        {newTagName.trim() && tags.some(t => t.name === newTagName.trim()) && (
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
                      disabled={!newTagName.trim() || tags.some(t => t.name === newTagName.trim())}
                    >
                      Create Tag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="text-muted-foreground text-lg">Loading tags...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <span className="text-destructive text-lg">{error}</span>
            </div>
          ) : filteredAndSortedTags.length === 0 ? (
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
                  Showing <span className="font-medium text-foreground">{filteredTags.length}</span> of <span className="font-medium text-foreground">{tags.length}</span> tags
                </p>
              </div>

              {/* Tags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag.name}
                    articleCount={tag.articleCount}
                    maxCount={maxCount}
                    mediaBreakdown={{ articles: tag.articleCount, videos: 0, podcasts: 0 }} // Default breakdown since API doesn't provide this
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
