/**
 * HomePage.jsx
 * 
 * Description: Main landing page with tabbed view of workflow queues
 * Purpose: Central hub displaying articles in different workflow statuses via tabs
 * Features:
 *  - Four-tab view: Inbox, Daily Reading, Continue Reading, Rediscovery
 *  - Tab-based filtering that auto-applies status filters
 *  - Search within active tab view
 *  - Save searches as Stacks
 */

import { useState, useEffect, useMemo } from "react";
import { Inbox, Calendar, BookOpen, RotateCcw } from "lucide-react";
import MainLayout from "../components/MainLayout.jsx";
import SaveStackModal from "../components/SaveStackModal.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import { mockArticles, getArticlesByStatus, getArticleCounts } from "../data/mockArticles.js";
import { STATUS } from "../constants/statuses.js";

// Tab configuration with icons and status mapping
const tabs = [
  { name: "Inbox", icon: Inbox, status: STATUS.INBOX },
  { name: "Daily Reading", icon: Calendar, status: STATUS.DAILY },
  { name: "Continue Reading", icon: BookOpen, status: STATUS.CONTINUE },
  { name: "Rediscovery", icon: RotateCcw, status: STATUS.REDISCOVERY }
];

const HomePage = ({ onNavigate }) => {
  const [articles, setArticles] = useState(mockArticles);
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [activeTab, setActiveTab] = useState("Inbox");
  const [searchQuery, setSearchQuery] = useState("");

  // Get current tab's status value
  const currentStatus = tabs.find(t => t.name === activeTab)?.status || "inbox";

  // Get articles for current tab with search filtering
  const currentTabArticles = useMemo(() => {
    let filteredArticles = getArticlesByStatus(articles, currentStatus);
    
    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.author?.toLowerCase().includes(query) ||
        article.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        article.url.toLowerCase().includes(query)
      );
    }
    
    return filteredArticles;
  }, [articles, currentStatus, searchQuery]);

  // Get article counts for display
  const articleCounts = useMemo(() => {
    return getArticleCounts(articles);
  }, [articles]);

  // Article management functions
  const handleArticleClick = (article) => {
    // Navigate to the text reader and pass the whole article object via the
    // view payload so the App can render it in the reader.
    onNavigate && onNavigate('text-reader', { article });
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

  const handleDeleteArticle = (articleId) => {
    setArticles(prev => prev.filter(article => article.id !== articleId));
  };

  // Get pre-applied filters based on active tab (memoized to prevent re-creation)
  const preAppliedFilters = useMemo(() => ({
    status: currentStatus,
    tags: [],
    timeFilter: "all",
    mediaType: "all",
    sortBy: "dateAdded",
    favoritesFilter: "all"
  }), [currentStatus]);


  // Update filters when tab changes
  useEffect(() => {
    setCurrentFilters(preAppliedFilters);
  }, [preAppliedFilters]);


  const handleSimpleSearch = (query) => {
    console.log('Simple search:', query);
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };


  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    // TODO: Implement actual save to backend/state
    alert(`Stack "${stackData.name}" saved successfully!`);
    setShowSaveStackModal(false);
  };

  // Note: preAppliedFilters is used to seed filter UI when tabs change.
  // The following helper functions were intentionally removed because
  // they were previously unused; re-add them later when wiring advanced
  // search and filter flows across pages.

  return (
    <MainLayout
      currentPage="home"
      currentView={activeTab}
      onNavigate={onNavigate}
      articles={currentTabArticles}
      pageTitle="Home"
      showSearch={true}
      searchPlaceholder="Search articles..."
      onSearch={handleSimpleSearch}
      initialSearchQuery={searchQuery}
    >
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Here's your reading overview</p>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.name
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden text-[11px] leading-tight text-center">
                    {tab.name === "Daily Reading" ? "Daily" : 
                     tab.name === "Continue Reading" ? "Continue" : 
                     tab.name}
                  </span>
                  {articleCounts[tab.status] > 0 && (
                    <span className="bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {articleCounts[tab.status]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Indicator */}
          {searchQuery.trim() && (
            <div className="mb-4 p-3 bg-accent/50 border border-border rounded-lg">
              <p className="text-sm text-foreground">
                <span className="font-medium">{currentTabArticles.length}</span> result{currentTabArticles.length !== 1 ? 's' : ''} found for "<span className="font-medium">{searchQuery}</span>" in {activeTab}
              </p>
              <button 
                onClick={clearSearch}
                className="text-xs text-muted-foreground hover:text-foreground underline mt-1"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {currentTabArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentTabArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onArticleClick={handleArticleClick}
                    onToggleFavorite={handleToggleFavorite}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteArticle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-lg font-medium mb-2">
                  {searchQuery.trim() ? 'No results found' : activeTab}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery.trim() ? (
                    `No articles found matching "${searchQuery}" in ${activeTab}`
                  ) : (
                    <>
                      {activeTab === "Inbox" && "No new articles waiting to be triaged"}
                      {activeTab === "Daily Reading" && "No articles scheduled for today's reading session"}
                      {activeTab === "Continue Reading" && "No articles in progress"}
                      {activeTab === "Rediscovery" && "No articles scheduled for rediscovery"}
                    </>
                  )}
                </p>
                {searchQuery.trim() && (
                  <button 
                    onClick={clearSearch}
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
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
};

export default HomePage;
