/**
 * App.jsx
 * 
 * Description: Main application component with routing and navigation
 * Purpose: Root component that manages page navigation and renders the appropriate page
 */

import { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useParams } from 'react-router-dom';

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
import TermsPage from './pages/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';

// Import viewer pages
import TextReader from './pages/viewers/TextReader.jsx';
import AudioPlayer from './pages/viewers/AudioPlayer.jsx';
import VideoPlayer from './pages/viewers/VideoPlayer.jsx';

// Import components
import FloatingAddButton from './components/FloatingAddButton.jsx';
import AddLinkModal from './components/AddLinkModal.jsx';

function App() {
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [navPosition, setNavPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Draggable test menu handlers
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - navPosition.x,
      y: e.clientY - navPosition.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e) => {
      setNavPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onUp = () => setIsDragging(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

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

  // Hide FAB on specific routes
  const Fab = () => {
    const { pathname } = useLocation();
    const hidden = pathname === '/' || pathname === '/auth' || pathname.startsWith('/view/') || isDragging;
    if (hidden) return null;
    return <FloatingAddButton onClick={() => setIsAddLinkModalOpen(true)} />;
  };

  // Helper element to render a tag-specific articles page from URL param
  const TagArticlesRoute = ({ onNavigate }) => {
    const { tag } = useParams();
    return <TagArticlesPage onNavigate={onNavigate} tag={decodeURIComponent(tag || '')} />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
        <Route path="/home" element={<HomePage onNavigate={handleNavigate} />} />
        <Route path="/auth" element={<AuthPage onNavigate={handleNavigate} />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/settings" element={<SettingsPage onNavigate={handleNavigate} />} />
        <Route path="/search" element={currentTag ? (
          <TagArticlesPage onNavigate={handleNavigate} tag={currentTag} />
        ) : (
          <SearchPage onNavigate={handleNavigate} initialTag={currentTag} />
        )} />
        <Route path="/inbox" element={<InboxPage onNavigate={handleNavigate} />} />
        <Route path="/daily-reading" element={<DailyReadingPage onNavigate={handleNavigate} />} />
        <Route path="/continue-reading" element={<ContinueReadingPage onNavigate={handleNavigate} />} />
        <Route path="/rediscovery" element={<RediscoveryPage onNavigate={handleNavigate} />} />
        <Route path="/text" element={<TextPage onNavigate={handleNavigate} />} />
        <Route path="/videos" element={<VideosPage onNavigate={handleNavigate} />} />
        <Route path="/audio" element={<AudioPage onNavigate={handleNavigate} />} />
        <Route path="/archive" element={<ArchivePage onNavigate={handleNavigate} />} />
        <Route path="/statistics" element={<StatisticsPage onNavigate={handleNavigate} />} />
        <Route path="/feeds" element={<FeedsPage onNavigate={handleNavigate} />} />
        <Route path="/tags" element={<TagsPage onNavigate={handleNavigate} />} />
        <Route path="/tags/:tag" element={<TagArticlesRoute onNavigate={handleNavigate} />} />
        <Route path="/favorites" element={<FavoritesPage onNavigate={handleNavigate} />} />
        {/* Viewers */}
        <Route path="/view/text" element={<TextReader onNavigate={handleNavigate} />} />
        <Route path="/view/audio" element={<AudioPlayer onNavigate={handleNavigate} />} />
        <Route path="/view/video" element={<VideoPlayer onNavigate={handleNavigate} />} />
        {/* 404 */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      {/* Route element to pass URL param to TagArticlesPage */}
      
      {/* Draggable test page selector */}
      <div
        className="fixed z-100 bg-card border border-border rounded-lg shadow-lg select-none"
        style={{
          left: `${navPosition.x}px`,
          top: `${navPosition.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div
          className="flex items-center justify-between p-3 border-b border-border"
          onMouseDown={handleMouseDown}
        >
          <h3 className="text-sm font-bold mr-3">Pages</h3>
          <button
            onClick={() => setIsNavExpanded(!isNavExpanded)}
            className="text-xs px-2 py-1 rounded bg-accent hover:bg-accent/80"
          >
            {isNavExpanded ? '−' : '+'}
          </button>
        </div>
        {isNavExpanded && (
          <div className="grid grid-cols-2 gap-1 p-3 w-[220px]">
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/">Landing</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/auth">Auth</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/home">Home</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/search">Search</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/inbox">Inbox</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/daily-reading">Daily Reading</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/continue-reading">Continue Reading</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/rediscovery">Rediscovery</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/text">Text</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/videos">Videos</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/audio">Audio</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/archive">Archive</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/statistics">Statistics</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/feeds">Feeds</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/tags">Tags</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/favorites">Favorites</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/settings">Settings</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/terms">Terms</Link>
            <Link className="text-xs px-2 py-1 rounded text-center bg-accent hover:bg-accent/80" to="/privacy">Privacy</Link>
          </div>
        )}
      </div>
      <Fab />
      <AddLinkModal 
        isOpen={isAddLinkModalOpen} 
        onClose={() => setIsAddLinkModalOpen(false)}
        articles={[]}
        onAddLink={(newArticle) => {
          console.log('New article added:', newArticle);
          setIsAddLinkModalOpen(false);
        }}
      />
    </Router>
  );
}

export default App;
