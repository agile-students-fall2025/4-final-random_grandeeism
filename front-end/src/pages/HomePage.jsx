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
import { mockArticles, getArticleCounts } from "../data/mockArticles.js";
import { STATUS } from "../constants/statuses.js";
import applyFiltersAndSort from "../utils/searchUtils.js";

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
  const [displayedArticles, setDisplayedArticles] = useState([]);

  // Get current tab's status value
  const currentStatus = tabs.find(t => t.name === activeTab)?.status || STATUS.INBOX;

  // Base locked filters based on active tab
  const baseLockedFilters = useMemo(() => ({ status: currentStatus }), [currentStatus]);

  // Initialize displayed articles with locked filters
  useEffect(() => {
    setDisplayedArticles(applyFiltersAndSort(articles, baseLockedFilters));
  }, [articles, baseLockedFilters]);

  // Get article counts for display
  const articleCounts = useMemo(() => {
    return getArticleCounts(articles);
  }, [articles]);

  // Article management functions
  const handleArticleClick = (article) => {
    // Navigate to the appropriate viewer based on media type
    const destination = article.mediaType === 'video' ? 'video-player' : 'text-reader';
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

  const handleDeleteArticle = (articleId) => {
    setArticles(prev => prev.filter(article => article.id !== articleId));
  };

  const handleSearchWithFilters = (query, filters) => {
    // Merge locked filters (status) with search filters
    const merged = { ...baseLockedFilters, ...(filters || {}), query };
    setCurrentFilters(merged);
    setDisplayedArticles(applyFiltersAndSort(articles, merged));
  };

  const handleSaveSearch = () => {
    setShowSaveStackModal(true);
  };

  const handleSaveStack = (stackData) => {
    console.log('Saving stack:', stackData);
    alert(`Stack "${stackData.name}" saved successfully!`);
    setShowSaveStackModal(false);
  };

  // Handler for when the locked filter chip is removed - navigate to search page
  const handleFilterChipRemoved = () => {
    onNavigate('search');
  };

  return (
    <MainLayout
      currentPage="home"
      currentView={activeTab}
      onNavigate={onNavigate}
      articles={displayedArticles}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={["Development", "Design", "AI", "Technology"]}
      lockedFilters={baseLockedFilters}
      preAppliedFilters={baseLockedFilters}
      onFilterChipRemoved={handleFilterChipRemoved}
      showTimeFilter={true}
      showMediaFilter={true}
      showTagFilter={true}
      showFavoritesFilter={true}
      showAnnotationsFilter={true}
      showSortOptions={true}
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

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {displayedArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedArticles.map((article) => (
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
                <p className="text-lg font-medium mb-2">{activeTab}</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "Inbox" && "No new articles waiting to be triaged"}
                  {activeTab === "Daily Reading" && "No articles scheduled for today's reading session"}
                  {activeTab === "Continue Reading" && "No articles in progress"}
                  {activeTab === "Rediscovery" && "No articles scheduled for rediscovery"}
                </p>
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
