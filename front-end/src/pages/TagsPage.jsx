import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Tag as TagIcon, ArrowUpDown, X } from "lucide-react";
import TagCard from "../components/TagCard";
import MainLayout from "../components/MainLayout";
import { STATUS } from "../constants/statuses.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { toast } from "sonner";
import { tagsAPI } from "../services/api.js";

export default function TagsPage({ onNavigate }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("usage");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef(null);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tags from backend
  useEffect(() => {
    fetchTags();
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  const fetchTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tagsAPI.getAll();
      if (data.success) {
        setTags(data.data);
      } else {
        setError(data.error || "Failed to fetch tags");
      }
    } catch (e) {
      console.error('Failed to fetch tags:', e);
      setError("Failed to fetch tags. Please check your connection.");
    } finally {
      setLoading(false); // Ensure loading is set to false
    }
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
    // Navigate to tag-specific route /tags/:tagName
    navigate(`/tags/${encodeURIComponent(tag)}`);
  };

  const handleRename = async (oldTag, newTag) => {
    const tagObj = tags.find(t => t.name === oldTag);
    if (!tagObj) return;
    try {
      const data = await tagsAPI.update(tagObj.id, { name: newTag });
      if (data.success) {
        toast.success('Tag renamed', {
          description: `"${oldTag}" has been renamed to "${newTag}"`
        });
        fetchTags();
      } else {
        toast.error('Failed to rename tag', {
          description: data.error || 'An error occurred while renaming the tag'
        });
      }
    } catch (e) {
      console.error('Failed to rename tag:', e);
      toast.error('Failed to rename tag', {
        description: 'Please check your connection and try again'
      });
    }
  };

  const handleDelete = async (tag) => {
    const tagObj = tags.find(t => t.name === tag);
    if (!tagObj) return;
    try {
      const data = await tagsAPI.delete(tagObj.id);
      if (data.success) {
        toast.success('Tag deleted', {
          description: `"${tag}" has been deleted`
        });
        fetchTags();
      } else {
        toast.error('Failed to delete tag', {
          description: data.error || 'An error occurred while deleting the tag'
        });
      }
    } catch (e) {
      console.error('Failed to delete tag:', e);
      toast.error('Failed to delete tag', {
        description: 'Please check your connection and try again'
      });
    }
  };

  const handleCreateTag = async () => {
    const trimmedTag = newTagName.trim();
    if (!trimmedTag || tagStats.some(t => t.tag === trimmedTag)) return;
    try {
      const data = await tagsAPI.create({ name: trimmedTag });
      if (data.success) {
        toast.success('Tag created', {
          description: `"${trimmedTag}" has been created`
        });
        setNewTagName("");
        setIsCreateTagModalOpen(false);
        fetchTags(); // Ensure the tag list is refreshed
      } else {
        toast.error('Failed to create tag', {
          description: data.error || 'An error occurred while creating the tag'
        });
      }
    } catch (e) {
      console.error('Failed to create tag:', e);
      toast.error('Failed to create tag', {
        description: 'Please check your connection and try again'
      });
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
            <div className="relative shrink-0" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-3 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors text-[14px]"
                aria-label="Sort tags"
                aria-expanded={showSortDropdown}
              >
                <ArrowUpDown size={14} />
                {sortLabels[sortBy]}
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg p-2 z-50 min-w-40">
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

          {/* Loading and Error States */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-1.5 w-full" />
                  </div>
                </Card>
              ))}
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
