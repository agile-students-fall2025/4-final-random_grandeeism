/**
 * App.jsx
 * 
 * Description: Main application component with routing and navigation
 * Purpose: Root component that manages page navigation and renders the appropriate page
 */

import { useState, useRef } from 'react';

// Import all pages
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import InboxPage from './pages/InboxPage.jsx';
import DailyReadingPage from './pages/DailyReadingPage.jsx';
import ContinueReadingPage from './pages/ContinueReadingPage.jsx';
import RediscoveryPage from './pages/RediscoveryPage.jsx';
import TextPage from './pages/TextPage.jsx';
import VideosPage from './pages/VideosPage.jsx';
import AudioPage from './pages/AudioPage.jsx';
import ArchivePage from './pages/ArchivePage.jsx';
import StatisticsPage from './pages/StatisticsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import FeedsPage from './pages/FeedsPage.jsx';
import TagsPage from './pages/TagsPage.jsx';
import TagArticlesPage from './pages/TagArticlesPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';

// Import viewer pages
import TextReader from './pages/viewers/TextReader.jsx';
import AudioPlayer from './pages/viewers/AudioPlayer.jsx';
import VideoPlayer from './pages/viewers/VideoPlayer.jsx';

// Import components
import FloatingAddButton from './components/FloatingAddButton.jsx';
import AddLinkModal from './components/AddLinkModal.jsx';

// Import data
// import { mockArticles } from './data/mockArticles'; // Adjust path if needed

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [navPosition, setNavPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Drag handlers for movable navigation
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - navPosition.x,
      y: e.clientY - navPosition.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setNavPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Global navigation handler
  const handleNavigate = (page, view) => {
    // Handle tag filtering
    if (view && view.tag) {
      setCurrentTag(view.tag);
    } else {
      setCurrentTag(null);
    }
    
    // Map page/view combinations to route names
    if (page === 'landing') {
      setCurrentPage('landing');
    } else if (page === 'auth') {
      setCurrentPage('auth');
    } else if (page === 'home') {
      setCurrentPage('home');
    } else if (page === 'search' || (page === 'articles' && view === 'Search')) {
      console.log('Setting current page to search');
      console.log('currentTag at search navigation:', currentTag);
      setCurrentPage('search');
    } else if (page === 'articles' && view === 'Inbox') {
      setCurrentPage('inbox');
    } else if (page === 'articles' && view === 'Daily Reading') {
      setCurrentPage('daily-reading');
    } else if (page === 'articles' && view === 'Continue Reading') {
      setCurrentPage('continue-reading');
    } else if (page === 'articles' && view === 'Rediscovery') {
      setCurrentPage('rediscovery');
    } else if (page === 'articles' && view === 'Archive') {
      setCurrentPage('archive');
    } else if (page === 'articles' && view === 'Favorites') {
      setCurrentPage('favorites');
    } else if (page === 'text') {
      setCurrentPage('text');
    } else if (page === 'text-reader') {
      // Support navigating directly to the text reader. The caller may provide
      // an `article` in the `view` object; store it so the reader can render it.
      if (view && view.article) setSelectedArticle(view.article);
      setCurrentPage('text-reader');
    } else if (page === 'videos') {
      setCurrentPage('videos');
    } else if (page === 'podcasts') {
      setCurrentPage('audio');
    } else if (page === 'feeds') {
      setCurrentPage('feeds');
    } else if (page === 'tags' || (page === 'articles' && view === 'Tags')) {
      setCurrentPage('tags');
    } else if (page === 'statistics') {
      setCurrentPage('statistics');
    } else if (page === 'settings') {
      setCurrentPage('settings');
    }
  };


  // Simple page router
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'search':
        if (currentTag) {
          return <TagArticlesPage onNavigate={handleNavigate} tag={currentTag} />;
        } else {
          return <SearchPage onNavigate={handleNavigate} initialTag={currentTag} />;
        }
      case 'inbox':
        return <InboxPage onNavigate={handleNavigate} />;
      case 'daily-reading':
        return <DailyReadingPage onNavigate={handleNavigate} />;
      case 'continue-reading':
        return <ContinueReadingPage onNavigate={handleNavigate} />;
      case 'rediscovery':
        return <RediscoveryPage onNavigate={handleNavigate} />;
      case 'text':
        return <TextPage onNavigate={handleNavigate} />;
      case 'videos':
        return <VideosPage onNavigate={handleNavigate} />;
      case 'audio':
        return <AudioPage onNavigate={handleNavigate} />;
      case 'archive':
        return <ArchivePage onNavigate={handleNavigate} />;
      case 'statistics':
        return <StatisticsPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      case 'feeds':
        return <FeedsPage onNavigate={handleNavigate} />;
      case 'tags':
        return <TagsPage onNavigate={handleNavigate} />;
      case 'favorites':
        return <FavoritesPage onNavigate={handleNavigate} />;
      case 'text-reader':
        return <TextReader onNavigate={handleNavigate} article={selectedArticle} />;
      case 'audio-player':
        return <AudioPlayer onNavigate={handleNavigate} />;
      case 'video-player':
        return <VideoPlayer onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div 
      className="app"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Simple navigation menu for testing */}
      <div 
        className="fixed z-100 bg-card border border-border rounded-lg shadow-lg"
        style={{
          left: `${navPosition.x}px`,
          top: `${navPosition.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div 
          className="flex items-center justify-between p-3 border-b border-border select-none"
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-sm font-bold">Test Navigation</h3>
          <button
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80"
            aria-label={isNavExpanded ? "Collapse menu" : "Expand menu"}
          >
            {isNavExpanded ? '−' : '+'}
          </button>
        </div>
        {isNavExpanded && (
          <div className="flex flex-col gap-1 p-3">
            <button
              onClick={() => setCurrentPage('landing')}
              className={`text-xs px-2 py-1 rounded ${
                currentPage === 'landing' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
              }`}
            >
              Landing
            </button>
            <button
              onClick={() => setCurrentPage('auth')}
              className={`text-xs px-2 py-1 rounded ${
                currentPage === 'auth' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
              }`}
            >
              Auth
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className={`text-xs px-2 py-1 rounded ${
                currentPage === 'home' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
              }`}
            >
              Home
            </button>
          <button
            onClick={() => setCurrentPage('search')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'search' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setCurrentPage('inbox')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'inbox' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => setCurrentPage('daily-reading')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'daily-reading' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Daily Reading
          </button>
          <button
            onClick={() => setCurrentPage('continue-reading')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'continue-reading' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Continue Reading
          </button>
          <button
            onClick={() => setCurrentPage('rediscovery')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'rediscovery' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Rediscovery
          </button>
          <button
            onClick={() => setCurrentPage('text')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'text' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setCurrentPage('videos')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'videos' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setCurrentPage('audio')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'audio' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => setCurrentPage('archive')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'archive' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Archive
          </button>
          <button
            onClick={() => setCurrentPage('statistics')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'statistics' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setCurrentPage('feeds')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'feeds' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Feeds
          </button>
          <button
            onClick={() => setCurrentPage('tags')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'tags' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Tags
          </button>
          <button
            onClick={() => setCurrentPage('favorites')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'favorites' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'settings' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setCurrentPage('text-reader')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'text-reader' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Text Reader
          </button>
          <button
            onClick={() => setCurrentPage('audio-player')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'audio-player' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Audio Player
          </button>
          <button
            onClick={() => setCurrentPage('video-player')}
            className={`text-xs px-2 py-1 rounded ${
              currentPage === 'video-player' ? 'bg-primary text-primary-foreground' : 'bg-accent hover:bg-accent/80'
            }`}
          >
            Video Player
          </button>
          </div>
        )}
      </div>

      {/* Render current page */}
      {renderPage()}

      {/* Floating Add Button - Show on all pages except landing, auth, and viewer pages */}
      {currentPage !== 'landing' && 
       currentPage !== 'auth' && 
       currentPage !== 'text-reader' && 
       currentPage !== 'audio-player' && 
       currentPage !== 'video-player' && (
        <FloatingAddButton onClick={() => setIsAddLinkModalOpen(true)} />
      )}

      {/* Add Link Modal */}
      <AddLinkModal 
        isOpen={isAddLinkModalOpen} 
        onClose={() => setIsAddLinkModalOpen(false)}
        articles={[]}
        onAddLink={(newArticle) => {
          console.log('New article added:', newArticle);
          // TODO: Send to backend API
          setIsAddLinkModalOpen(false);
        }}
      />
    </div>
  );
}

export default App;
