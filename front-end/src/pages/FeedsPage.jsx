import { useState, useMemo } from "react";
import { Search, Plus, Rss, ArrowUpDown, X } from "lucide-react";
import FeedCard from "../components/FeedCard";
import MainLayout from "../components/MainLayout";
import { mockArticles } from "../data/mockArticles";
import { mockFeeds } from "../data/mockFeeds";
import { STATUS } from "../constants/statuses.js";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../components/ui/dialog.jsx";
import { Label } from "../components/ui/label.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";

export default function FeedsPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("usage");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isCreateFeedModalOpen, setIsCreateFeedModalOpen] = useState(false);
  const [newFeedName, setNewFeedName] = useState("");
  const [articles, setArticles] = useState(mockArticles);
  const [feeds, setFeeds] = useState(mockFeeds);

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
        if (article.tags.includes('podcast') || article.mediaType === 'podcast') {
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

  const handleRename = (oldFeedName, newFeedName) => {
    console.log(`Renaming feed "${oldFeedName}" to "${newFeedName}"`);
    // Update the feed
    setFeeds(feeds.map(f => 
      f.name === oldFeedName ? { ...f, name: newFeedName } : f
    ));
    // Update all articles with the renamed feed
    setArticles(articles.map(article => ({
      ...article,
      source: article.source === oldFeedName ? newFeedName : article.source
    })));
  };

  const handleDelete = (feedName) => {
    console.log(`Deleting feed: ${feedName}`);
    // Remove the feed
    setFeeds(feeds.filter(f => f.name !== feedName));
    // Remove articles from this feed
    setArticles(articles.filter(article => article.source !== feedName));
  };

  const handleCreateFeed = () => {
    const trimmedFeed = newFeedName.trim();
    if (trimmedFeed && !feeds.some(f => f.name === trimmedFeed)) {
      // Create a new feed
      const newFeed = {
        id: `feed-${Date.now()}`,
        name: trimmedFeed,
        url: `https://example.com/${trimmedFeed.toLowerCase().replace(/\s+/g, '-')}/feed/`,
        feedType: 'rss',
        favicon: 'https://example.com/favicon.ico',
        category: 'Uncategorized',
        description: `Feed for ${trimmedFeed}`,
        website: 'https://example.com',
        lastFetched: new Date(),
        lastUpdated: new Date(),
        refreshFrequency: 'daily',
        status: 'success',
        errorMessage: null,
        createdAt: new Date()
      };
      
      setFeeds([...feeds, newFeed]);
      setNewFeedName("");
      setIsCreateFeedModalOpen(false);
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

          {/* Feeds Grid */}
          {filteredAndSortedFeeds.length === 0 ? (
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
                {filteredAndSortedFeeds.map(({ feed, articleCount, mediaBreakdown }) => (
                  <FeedCard
                    key={feed}
                    feed={feed}
                    articleCount={articleCount}
                    maxCount={maxCount}
                    mediaBreakdown={mediaBreakdown}
                    onFeedClick={handleFeedClick}
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
