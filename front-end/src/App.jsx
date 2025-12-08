/**
 * App.jsx
 * 
 * Description: Main application component with routing and navigation
 * Purpose: Root component that manages page navigation and renders the appropriate page
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { StacksProvider } from './contexts/StacksContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

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
import FeedArticlesPage from './pages/FeedArticlesPage.jsx';
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
import { Toaster } from './components/ui/sonner.jsx';

// Import API services
import { articlesAPI, handleAPIError } from './services/api.js';

// Import hooks
import { useTagResolution } from './hooks/useTagResolution.js';

// Import utils
import { invalidateTagCache } from './utils/tagsCache.js';

// Import data
// import { mockArticles } from './data/mockArticles'; // Adjust path if needed

// Route mapping constant - single source of truth for page to route mapping
const ROUTE_MAP = {
  'landing': '/',
  'auth': '/auth',
  'home': '/home',
  'inbox': '/inbox',
  'daily-reading': '/daily-reading',
  'continue-reading': '/continue-reading',
  'rediscovery': '/rediscovery',
  'text': '/text',
  'videos': '/videos',
  'audio': '/audio',
  'archive': '/archive',
  'search': '/search',
  'tags': '/tags',
  'favorites': '/favorites',
  'feeds': '/feeds',
  'feed-articles': '/feed-articles',
  'settings': '/settings',
  'statistics': '/statistics',
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StacksProvider>
          <AppContent />
        </StacksProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize currentPage from URL path
  const [currentPage, setCurrentPage] = useState(() => {
    const path = location.pathname;
    if (path === '/' || path === '/landing') return 'landing';
    if (path === '/auth') return 'auth';
    if (path.startsWith('/article/')) return 'text-reader';
    if (path.startsWith('/video/')) return 'video-player';
    if (path.startsWith('/audio/')) return 'audio-player';
    // Map other paths to pages
    const pathMap = {
      '/home': 'home',
      '/search': 'search',
      '/inbox': 'inbox',
      '/daily-reading': 'daily-reading',
      '/continue-reading': 'continue-reading',
      '/rediscovery': 'rediscovery',
      '/text': 'text',
      '/videos': 'videos',
      '/audio': 'audio',
      '/archive': 'archive',
      '/statistics': 'statistics',
      '/settings': 'settings',
      '/feeds': 'feeds',
      '/feed-articles': 'feed-articles',
      '/tags': 'tags',
      '/favorites': 'favorites',
    };
    return pathMap[path] || 'landing';
  });
  /* TEMPORARILY COMMENTED OUT FOR STAKEHOLDER DEMO - Test Navigation state */
  /* TODO: Uncomment when development resumes */
  // const [isNavExpanded, setIsNavExpanded] = useState(false);
  // const [navPosition, setNavPosition] = useState({ x: 16, y: 16 });
  // const [isDragging, setIsDragging] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);
  const [currentFeed, setCurrentFeed] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [returnToPage, setReturnToPage] = useState('home');
  
  // Tag resolution hook for refreshing tags when new ones are created
  const { refreshTags } = useTagResolution();
  
  // Reference to the current page's refresh function
  const currentPageRefreshRef = useRef(null);
  
  // Function to set the current page's refresh callback
  const setPageRefresh = (refreshFunction) => {
    currentPageRefreshRef.current = refreshFunction;
  };
  
  // const dragOffset = useRef({ x: 0, y: 0 });

  // Disable browser back/forward buttons
  useEffect(() => {
    // Push a state on mount
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = () => {
      // Immediately push state back to block navigation
      window.history.pushState(null, '', window.location.href);
    };
    
    window.addEventListener('popstate', handlePopState, true);
    
    return () => {
      window.removeEventListener('popstate', handlePopState, true);
    };
  }, []);

  // Re-push state whenever location changes to maintain block
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
  }, [location.pathname]);

  // Track previous pathname to detect actual URL changes
  const prevPathnameRef = useRef(location.pathname);

  // Sync URL to currentPage state when location changes
  useEffect(() => {
    const path = location.pathname;
    
    // Only process if the pathname actually changed (not just our own navigate calls)
    if (prevPathnameRef.current === path) {
      return;
    }
    
    prevPathnameRef.current = path;
    let newPage = 'landing'; // Default fallback
    
    if (path === '/' || path === '/landing') newPage = 'landing';
    else if (path === '/auth') newPage = 'auth';
    else if (path === '/home') newPage = 'home';
    else if (path === '/search') newPage = 'search';
    else if (path === '/inbox') newPage = 'inbox';
    else if (path === '/daily-reading') newPage = 'daily-reading';
    else if (path === '/continue-reading') newPage = 'continue-reading';
    else if (path === '/rediscovery') newPage = 'rediscovery';
    else if (path === '/text') newPage = 'text';
    else if (path === '/videos') newPage = 'videos';
    else if (path === '/audio') newPage = 'audio';
    else if (path === '/archive') newPage = 'archive';
    else if (path === '/statistics') newPage = 'statistics';
    else if (path === '/settings') newPage = 'settings';
    else if (path === '/feeds') newPage = 'feeds';
    else if (path === '/feed-articles') newPage = 'feed-articles';
    else if (path === '/tags') newPage = 'tags';
    else if (path === '/favorites') newPage = 'favorites';
    else if (path.startsWith('/article/')) newPage = 'text-reader';
    else if (path.startsWith('/video/')) newPage = 'video-player';
    else if (path.startsWith('/audio/')) newPage = 'audio-player';
    
    console.log('[URL Sync] Detected pathname change to', path, ', updating currentPage to', newPage);
    setCurrentPage(newPage);
  }, [location.pathname]);

  // Sync currentPage with URL (only when currentPage changes, not when URL changes)
  useEffect(() => {
    // Don't update URL for viewer pages as they have dynamic paths
    if (currentPage !== 'text-reader' && currentPage !== 'video-player' && currentPage !== 'audio-player') {
      const newPath = ROUTE_MAP[currentPage];
      // Only navigate if the path is different from current location
      if (newPath && newPath !== location.pathname) {
        console.log('[State->URL Sync] Navigating from', location.pathname, 'to', newPath, 'because currentPage is', currentPage);
        // Update the ref to prevent the URL sync effect from treating this as a back button event
        prevPathnameRef.current = newPath;
        navigate(newPath, { replace: true });
      }
    }
  }, [currentPage, navigate]);

  // Handle authentication redirects
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Not authenticated - redirect to auth page unless already on landing/auth
        if (currentPage !== 'landing' && currentPage !== 'auth') {
          setCurrentPage('auth');
        }
      } else {
        // Authenticated - redirect away from landing/auth pages to home
        if (currentPage === 'landing' || currentPage === 'auth') {
          setCurrentPage('home');
        }
      }
    }
  }, [authLoading, isAuthenticated, currentPage]);

  /* TEMPORARILY COMMENTED OUT FOR STAKEHOLDER DEMO - Test Navigation drag handlers */
  /* TODO: Uncomment when development resumes */
  // Drag handlers for movable navigation
  /* const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON') return; // Don't drag when clicking buttons
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - navPosition.x,
      y: e.clientY - navPosition.y
    };
  }; */

  /* TEMPORARILY COMMENTED OUT FOR STAKEHOLDER DEMO - Test Navigation mouse handlers */
  /* TODO: Uncomment when development resumes */
  /* 
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
  */

  // Global navigation handler
  const handleNavigate = (page, view) => {
    // Handle tag filtering
    if (view && view.tag) {
      setCurrentTag(view.tag);
    } else {
      setCurrentTag(null);
    }
    
    // Handle feed filtering
    if (view && view.feed) {
      setCurrentFeed(view.feed);
    } else {
      setCurrentFeed(null);
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
      // Navigate to article reader with URL
      if (view && view.article) {
        navigate(`/article/${view.article.id}`);
        setSelectedArticle(view.article);
        // Store the current page to return to (or use provided returnTo)
        // Make sure we never use a viewer page as returnTo
        const safeReturnTo = view.returnTo || (currentPage !== 'text-reader' && currentPage !== 'video-player' && currentPage !== 'audio-player' ? currentPage : 'home');
        console.log('[Navigation] Setting returnToPage for text-reader:', safeReturnTo, 'from currentPage:', currentPage, 'view.returnTo:', view.returnTo);
        setReturnToPage(safeReturnTo);
      }
      setCurrentPage('text-reader');
    } else if (page === 'video-player') {
      // Navigate to video player with URL
      if (view && view.article) {
        navigate(`/video/${view.article.id}`);
        setSelectedArticle(view.article);
        // Store the current page to return to (or use provided returnTo)
        // Make sure we never use a viewer page as returnTo
        const safeReturnTo = view.returnTo || (currentPage !== 'text-reader' && currentPage !== 'video-player' && currentPage !== 'audio-player' ? currentPage : 'home');
        console.log('[Navigation] Setting returnToPage for video-player:', safeReturnTo, 'from currentPage:', currentPage, 'view.returnTo:', view.returnTo);
        setReturnToPage(safeReturnTo);
      }
      setCurrentPage('video-player');
    } else if (page === 'audio-player') {
      // Navigate to audio player with URL
      if (view && view.article) {
        navigate(`/audio/${view.article.id}`);
        setSelectedArticle(view.article);
        // Store the current page to return to (or use provided returnTo)
        // Make sure we never use a viewer page as returnTo
        const safeReturnTo = view.returnTo || (currentPage !== 'text-reader' && currentPage !== 'video-player' && currentPage !== 'audio-player' ? currentPage : 'home');
        console.log('[Navigation] Setting returnToPage for audio-player:', safeReturnTo, 'from currentPage:', currentPage, 'view.returnTo:', view.returnTo);
        setReturnToPage(safeReturnTo);
      }
      setCurrentPage('audio-player');
    } else if (page === 'videos') {
      setCurrentPage('videos');
    } else if (page === 'audio' || page === 'podcasts') {
      setCurrentPage('audio');
    } else if (page === 'feeds') {
      setCurrentPage('feeds');
    } else if (page === 'feed-articles') {
      setCurrentPage('feed-articles');
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
        return <HomePage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'search':
        if (currentTag) {
          return <TagArticlesPage onNavigate={handleNavigate} tag={currentTag} setPageRefresh={setPageRefresh} />;
        } else {
          return <SearchPage onNavigate={handleNavigate} initialTag={currentTag} setPageRefresh={setPageRefresh} />;
        }
      case 'inbox':
        return <InboxPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'daily-reading':
        return <DailyReadingPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'continue-reading':
        return <ContinueReadingPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'rediscovery':
        return <RediscoveryPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'text':
        return <TextPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'videos':
        return <VideosPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'audio':
        return <AudioPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'archive':
        return <ArchivePage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'statistics':
        return <StatisticsPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'feeds':
        return <FeedsPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'feed-articles':
        return <FeedArticlesPage onNavigate={handleNavigate} feed={currentFeed} setPageRefresh={setPageRefresh} />;
      case 'tags':
        return <TagsPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      case 'favorites':
        return <FavoritesPage onNavigate={handleNavigate} setPageRefresh={setPageRefresh} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <StacksProvider>
      <div className="relative min-h-screen bg-background">
        {/* Render current page */}
        <Routes>
          <Route path="/article/:articleId" element={
            <TextReaderWrapperRoute 
              onNavigate={handleNavigate} 
              returnToPage={returnToPage}
              navigate={navigate}
            />
          } />
          <Route path="/video/:articleId" element={
            <VideoPlayerWrapperRoute 
              onNavigate={handleNavigate} 
              returnToPage={returnToPage}
              navigate={navigate}
            />
          } />
          <Route path="/audio/:articleId" element={
            <AudioPlayerWrapperRoute 
              onNavigate={handleNavigate} 
              returnToPage={returnToPage}
              navigate={navigate}
            />
          } />
          <Route path="*" element={
            renderPage()
          } />
        </Routes>
        
        {/* TEMPORARILY COMMENTED OUT FOR STAKEHOLDER DEMO - Test Navigation */}
        {/* TODO: Uncomment when development resumes */}
        {/* Simple navigation menu for testing */}
        {/* <div 
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
              onClick={() => handleNavigate('text-reader', { returnTo: currentPage })}
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
        </div> */}

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
          onAddLink={async (newArticle, onSuccess, onError) => {
            try {
              console.log('Adding new article:', newArticle);
              const response = await articlesAPI.create(newArticle);
              if (response.success) {
                console.log('Article created successfully:', response.data);
                setIsAddLinkModalOpen(false);
                if (typeof onSuccess === 'function') onSuccess();
                // Invalidate the ArticleCard tag cache to force it to refetch
                console.log('Invalidating ArticleCard tag cache...');
                invalidateTagCache();
                // Refresh the global tag resolution mapping to pick up any new tags
                console.log('Refreshing tag resolution mapping...');
                await refreshTags();
                // Refresh the current page's data (this will fetch both articles and tags)
                if (currentPageRefreshRef.current) {
                  console.log('Refreshing current page data...');
                  await currentPageRefreshRef.current();
                } else {
                  console.log('No refresh function available');
                }
              } else {
                if (typeof onError === 'function') onError();
                throw new Error('Failed to create article');
              }
            } catch (err) {
              if (typeof onError === 'function') onError();
              const errorResult = handleAPIError(err, 'creating article');
              console.error('Failed to create article:', errorResult.error);
              // Optionally show error toast to user
            }
          }}
        />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </StacksProvider>
  );
}

// Wrapper route components - defined outside AppContent to prevent recreation on every render
// These components handle return navigation using the ROUTE_MAP
function TextReaderWrapperRoute({ navigate: routeNavigate, returnToPage }) {
  const { articleId } = useParams();
  
  const handleBack = useCallback(() => {
    const targetPage = returnToPage || 'home';
    console.log('[TextReaderWrapper] Going back to:', targetPage);
    
    const route = ROUTE_MAP[targetPage] || '/home';
    routeNavigate(route);
  }, [routeNavigate, returnToPage]);
  
  console.log('[TextReaderWrapper] Rendered with returnToPage:', returnToPage);
  return <TextReader onNavigate={handleBack} articleId={articleId} />;
}

function VideoPlayerWrapperRoute({ navigate: routeNavigate, returnToPage }) {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  
  useEffect(() => {
    if (articleId) {
      console.log('VideoPlayerWrapper - fetching article ID:', articleId);
      articlesAPI.getById(articleId)
        .then(response => {
          console.log('VideoPlayerWrapper - API response:', response);
          if (response.success) {
            console.log('VideoPlayerWrapper - article data:', response.data);
            console.log('VideoPlayerWrapper - mediaType:', response.data.mediaType);
            console.log('VideoPlayerWrapper - videoId:', response.data.videoId);
            setArticle(response.data);
          } else {
            console.error('Failed to fetch article:', response.error);
            // Navigate back to home on error
            routeNavigate('/home');
          }
        })
        .catch(error => {
          console.error('Error fetching article:', error);
          // Navigate back to home on error
          routeNavigate('/home');
        });
    }
  }, [articleId, routeNavigate]);
  
  const handleClose = useCallback(() => {
    const targetPage = returnToPage || 'home';
    console.log('[VideoPlayerWrapper] Going back to:', targetPage);
    
    const route = ROUTE_MAP[targetPage] || '/home';
    routeNavigate(route);
  }, [routeNavigate, returnToPage]);
  
  console.log('[VideoPlayerWrapper] Rendered with returnToPage:', returnToPage);
  return (
    <VideoPlayer 
      article={article}
      onUpdateArticle={setArticle}
      onClose={handleClose}
    />
  );
}

function AudioPlayerWrapperRoute({ navigate: routeNavigate, returnToPage }) {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  
  useEffect(() => {
    if (articleId) {
      articlesAPI.getById(articleId)
        .then(response => {
          if (response.success) {
            setArticle(response.data);
          } else {
            console.error('Failed to fetch article:', response.error);
            // Navigate back to home on error
            routeNavigate('/home');
          }
        })
        .catch(error => {
          console.error('Error fetching article:', error);
          // Navigate back to home on error
          routeNavigate('/home');
        });
    }
  }, [articleId, routeNavigate]);
  
  const handleClose = useCallback(() => {
    const targetPage = returnToPage || 'home';
    console.log('[AudioPlayerWrapper] Going back to:', targetPage);
    
    const route = ROUTE_MAP[targetPage] || '/home';
    routeNavigate(route);
  }, [routeNavigate, returnToPage]);
  
  console.log('[AudioPlayerWrapper] Rendered with returnToPage:', returnToPage);
  return (
    <AudioPlayer 
      article={article}
      onUpdateArticle={setArticle}
      onClose={handleClose}
    />
  );
}

export default App;
