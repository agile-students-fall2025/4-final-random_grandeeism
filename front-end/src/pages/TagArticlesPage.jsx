import { useState, useMemo } from "react";
import { Archive } from "lucide-react";
import ArticleCard from "../components/ArticleCard";
import MainLayout from "../components/MainLayout";
import SaveStackModal from "../components/SaveStackModal.jsx";
import { mockArticles } from "../data/mockArticles";

// Get all available tags from mockArticles
const allAvailableTags = Array.from(new Set(mockArticles.flatMap(article => article.tags)));

export default function TagArticlesPage({ onNavigate, tag }) {
  const [articles, setArticles] = useState(mockArticles);
  const [showSaveStackModal, setShowSaveStackModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState(null);

  // Filter articles by the selected tag
  const filteredArticles = useMemo(() => {
    if (!tag) return articles;
    return articles.filter(article => article.tags.includes(tag));
  }, [articles, tag]);


  const handleSearchWithFilters = (query, filters) => {
    console.log('Search tag articles:', query, filters);
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

  // ArticleCard handlers
  const handleArticleClick = (article) => {
    // Navigate to the text reader and provide the article object
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
      articles={filteredArticles}
      pageTitle={`Tag: ${tag || 'Untagged'}`}
      useAdvancedSearch={true}
      onSearchWithFilters={handleSearchWithFilters}
      onSaveSearch={handleSaveSearch}
      availableTags={allAvailableTags}
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
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => onNavigate('tags')}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Tags
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {tag || 'Untagged'}
                </h1>
                <p className="text-muted-foreground">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'item' : 'items'} tagged with "{tag}"
                </p>
              </div>
            </div>
          </div>
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
              <Archive size={24} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">No articles found</p>
            <p className="text-muted-foreground text-sm">
              {tag ? `No articles are tagged with "${tag}"` : "Try adjusting your search terms"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
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
