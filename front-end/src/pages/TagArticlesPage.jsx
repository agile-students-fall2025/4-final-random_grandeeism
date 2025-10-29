import { useState, useMemo } from "react";
import { Globe, ExternalLink, Star, Archive, RefreshCw, FileDown, Trash2 } from "lucide-react";
import TagManager from "../components/TagManager";
import MainLayout from "../components/MainLayout";
import SaveStackModal from "../components/customUI/SaveStackModal";
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

  const handleUpdateTags = (articleId, newTags) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, tags: newTags }
        : article
    ));
  };

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
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div key={article.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      {article.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Globe size={14} />
                      <span>{article.url}</span>
                      <ExternalLink size={14} />
                      <span>| {article.readingTime}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {article.tags.includes('podcast') && (
                      <div className="text-sm text-muted-foreground">
                        {article.readProgress || 0}% Complete
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {article.tags.includes('podcast') ? (
                      <Star size={16} className="text-muted-foreground" />
                    ) : (
                      <Archive size={16} className="text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Star size={14} />
                    Favorite
                  </button>
                  <TagManager
                    articleId={article.id}
                    currentTags={article.tags}
                    allTags={allAvailableTags}
                    onUpdateTags={handleUpdateTags}
                  />
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <RefreshCw size={14} />
                    Change Status
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <FileDown size={14} />
                    Export Notes
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
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
