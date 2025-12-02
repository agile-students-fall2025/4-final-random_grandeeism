import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Rss, ArrowUpDown, X } from "lucide-react";
import FeedCard from "../components/FeedCard";
import MainLayout from "../components/MainLayout";
import { feedsAPI, articlesAPI, handleAPIError } from "../services/api";
import { STATUS } from "../constants/statuses.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Loader } from "../components/ui/loader.jsx";

export default function FeedsPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("usage");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isCreateFeedModalOpen, setIsCreateFeedModalOpen] = useState(false);
  const [newFeedName, setNewFeedName] = useState("");
  const [articles, setArticles] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch feeds and articles from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch feeds and articles in parallel
        const [feedsResponse, articlesResponse] = await Promise.all([
          feedsAPI.getAll(),
          articlesAPI.getAll()
        ]);
        
        if (feedsResponse.success) {
          setFeeds(feedsResponse.data);
        } else {
          throw new Error('Failed to fetch feeds');
        }
        
        if (articlesResponse.success) {
          setArticles(articlesResponse.data);
        } else {
          throw new Error('Failed to fetch articles');
        }
        
      } catch (err) {
        const errorResult = handleAPIError(err, 'fetching feeds and articles');
        setError(errorResult.error);
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate feed statistics from articles
  const feedStats = useMemo(() => {
    return feeds.map(feed => {
      const feedArticles = articles.filter(a => a.source === feed.name || a.feedId === feed.id);
      
      const breakdown = {
        articles: 0,
        videos: 0,
        podcasts: 0
      };
      
      feedArticles.forEach(article => {
        if (article.tags.includes('podcast') || article.mediaType === 'audio') {
          breakdown.podcasts++;
        } else if (article.tags.includes('video') || article.mediaType === 'video') {
          breakdown.videos++;
        } else {
          breakdown.articles++;
        }
      });
      
      return {
        feed: feed.name,
        feedId: feed.id,
        isPaused: feed.isPaused || false,
        articleCount: feedArticles.length,
        mediaBreakdown: breakdown,
      };
    }).sort((a, b) => b.articleCount - a.articleCount);
  }, [articles, feeds]);

  // Filter and sort feeds
  const filteredAndSortedFeeds = useMemo(() => {
    let filtered = feedStats.filter(feedData => 
      feedData.feed.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'usage':
        return filtered.sort((a, b) => b.articleCount - a.articleCount);
      case 'alphabetical':
        return filtered.sort((a, b) => a.feed.localeCompare(b.feed));
      default:
        return filtered;
    }
  }, [feedStats, searchQuery, sortBy]);

  const maxCount = Math.max(...feedStats.map(f => f.articleCount), 1);

  const handleFeedClick = (feed) => {
    // Navigate to feed articles page
    onNavigate('feed-articles', { feed: feed });
  };

  const handleRename = async (oldFeedName, newFeedName) => {
    try {
      // Find the feed to rename
      const feedToRename = feeds.find(f => f.name === oldFeedName);
      if (!feedToRename) {
        console.error('Feed not found:', oldFeedName);
        return;
      }

      // Update the feed via API
      const response = await feedsAPI.update(feedToRename.id, { name: newFeedName });
      
      if (response.success) {
        // Update local state
        setFeeds(feeds.map(f => 
          f.name === oldFeedName ? { ...f, name: newFeedName } : f
        ));
        
        // Note: In a real implementation, articles might be updated via their own endpoint
        // For now, we'll update them locally to maintain UI consistency
        setArticles(articles.map(article => ({
          ...article,
          source: article.source === oldFeedName ? newFeedName : article.source
        })));
        
        console.log(`Successfully renamed feed "${oldFeedName}" to "${newFeedName}"`);
      } else {
        throw new Error('Failed to rename feed');
      }
    } catch (err) {
      const errorResult = handleAPIError(err, 'renaming feed');
      console.error('Failed to rename feed:', errorResult.error);
      // Optionally show user-friendly error message
    }
  };

  const handleDelete = async (feedName) => {
    try {
      // Find the feed to delete
      const feedToDelete = feeds.find(f => f.name === feedName);
      if (!feedToDelete) {
        console.error('Feed not found:', feedName);
        return;
      }

      // Delete the feed via API
      const response = await feedsAPI.delete(feedToDelete.id);
      
      if (response.success) {
        // Update local state
        setFeeds(feeds.filter(f => f.name !== feedName));
        // Remove articles from this feed
        setArticles(articles.filter(article => article.source !== feedName));
        
        console.log(`Successfully deleted feed: ${feedName}`);
      } else {
        throw new Error('Failed to delete feed');
      }
    } catch (err) {
      const errorResult = handleAPIError(err, 'deleting feed');
      console.error('Failed to delete feed:', errorResult.error);
      // Optionally show user-friendly error message
    }
  };

  const handleTogglePause = async (feedId, isPaused) => {
    try {
      let response;
      if (isPaused) {
        // Resume the feed
        response = await feedsAPI.resume(feedId, 60); // Default 60 minute interval
      } else {
        // Pause the feed
        response = await feedsAPI.pause(feedId);
      }
      
      if (response.success) {
        // Update local state
        setFeeds(feeds.map(f => 
          f.id === feedId ? { ...f, isPaused: !isPaused } : f
        ));
        
        console.log(`Successfully ${isPaused ? 'resumed' : 'paused'} feed`);
      } else {
        throw new Error(`Failed to ${isPaused ? 'resume' : 'pause'} feed`);
      }
    } catch (err) {
      const errorResult = handleAPIError(err, `${isPaused ? 'resuming' : 'pausing'} feed`);
      console.error(`Failed to ${isPaused ? 'resume' : 'pause'} feed:`, errorResult.error);
      // Optionally show user-friendly error message
    }
  };

  const handleCreateFeed = async () => {
    const trimmedFeed = newFeedName.trim();
    if (trimmedFeed && !feeds.some(f => f.name === trimmedFeed)) {
      try {
        // Create a new feed
        const newFeedData = {
          name: trimmedFeed,
          url: `https://example.com/${trimmedFeed.toLowerCase().replace(/\s+/g, '-')}/feed/`,
          feedType: 'rss',
          favicon: 'https://example.com/favicon.ico',
          category: 'Uncategorized',
          description: `Feed for ${trimmedFeed}`,
          website: 'https://example.com',
          refreshFrequency: 'daily'
        };
        
        const response = await feedsAPI.create(newFeedData);
        
        if (response.success) {
          // Add the new feed to local state
          setFeeds([...feeds, response.data]);
          setNewFeedName("");
          setIsCreateFeedModalOpen(false);
          console.log(`Successfully created feed: ${trimmedFeed}`);
        } else {
          throw new Error('Failed to create feed');
        }
      } catch (err) {
        const errorResult = handleAPIError(err, 'creating feed');
        console.error('Failed to create feed:', errorResult.error);
        // Optionally show user-friendly error message
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateFeed();
    }
  };

  const sortLabels = {
    usage: "Sort by Usage",
    alphabetical: "Sort Alphabetically"
  };

  return (
    <MainLayout
      currentPage="articles"
      currentView="Feeds"
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
                placeholder="Search feeds..."
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
                <h1 className="text-3xl font-bold mb-2">Feeds</h1>
                <p className="text-muted-foreground text-sm">
                  Manage your RSS feed subscriptions
                </p>
              </div>
              <Dialog open={isCreateFeedModalOpen} onOpenChange={setIsCreateFeedModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} />
                    Add Feed
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Feed</DialogTitle>
                    <DialogDescription>
                      Subscribe to a new RSS feed.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="feed-name">Feed Name</Label>
                      <Input
                        id="feed-name"
                        type="text"
                        value={newFeedName}
                        onChange={(e) => setNewFeedName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter feed name..."
                        autoFocus
                      />
                    </div>
                    {newFeedName.trim() && feeds.some(f => f.name === newFeedName.trim()) && (
                      <p className="text-sm text-destructive">
                        A feed with this name already exists.
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleCreateFeed}
                      disabled={!newFeedName.trim() || feeds.some(f => f.name === newFeedName.trim())}
                    >
                      Add Feed
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <Loader size={48} className="text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">Loading feeds...</CardTitle>
                <CardDescription className="text-center max-w-md">
                  Please wait while we fetch your RSS feeds.
                </CardDescription>
              </CardContent>
            </Card>
          ) : error ? (
            /* Error State */
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <X className="size-8 text-destructive" />
                </div>
                <CardTitle className="text-xl mb-2">Error loading feeds</CardTitle>
                <CardDescription className="text-center max-w-md mb-4">
                  {error}
                </CardDescription>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredAndSortedFeeds.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Rss className="size-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">No feeds found</CardTitle>
                <CardDescription className="text-center max-w-md">
                  {searchQuery 
                    ? 'Try adjusting your search terms to find what you\'re looking for.' 
                    : 'Subscribe to your first feed to start organizing your content.'}
                </CardDescription>
                {!searchQuery && (
                  <Button 
                    onClick={() => setIsCreateFeedModalOpen(true)}
                    className="mt-6"
                  >
                    <Plus size={16} />
                    Add Your First Feed
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredAndSortedFeeds.length}</span> of <span className="font-medium text-foreground">{feedStats.length}</span> feeds
                </p>
              </div>

              {/* Feeds Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAndSortedFeeds.map(({ feed, feedId, isPaused, articleCount, mediaBreakdown }) => (
                  <FeedCard
                    key={feed}
                    feed={feed}
                    feedId={feedId}
                    isPaused={isPaused}
                    articleCount={articleCount}
                    maxCount={maxCount}
                    mediaBreakdown={mediaBreakdown}
                    onFeedClick={handleFeedClick}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onTogglePause={handleTogglePause}
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
