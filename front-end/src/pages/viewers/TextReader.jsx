import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
// STATUS constants no longer needed for persistence; using raw strings
import { ThemeContext } from '../../contexts/ThemeContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import CompletionModal from '../../components/CompletionModal.jsx';
import ReaderSettingsModal from '../../components/ReaderSettingsModal.jsx';
import TagManagerModal from '../../components/TagManagerModal.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Star, Settings, StickyNote, RotateCcw, Archive, Inbox, PlayCircle, Calendar, Tag as TagIcon, ArrowLeft } from 'lucide-react';
import { ensureTagsLoaded, getTagName, getTagMapSnapshot, addSingleTag } from '../../utils/tagsCache.js';
import { articlesAPI, tagsAPI, highlightsAPI, usersAPI } from '../../services/api.js';
import { calculateReadingTime } from '../../utils/readingTime.js';
import '../../styles/textReader.css';
import { toast } from 'sonner';

// default color for new highlights (can be changed with color picker)
const DEFAULT_HIGHLIGHT_COLOR = '#fef08a';
// Exact article status strings discovered from mock data
const ARTICLE_STATUSES = ['inbox','continue','daily','rediscovery','archived'];
// Icon mapping for statuses
const STATUS_ICON_MAP = {
  inbox: Inbox,
  continue: PlayCircle,
  daily: Calendar,
  rediscovery: RotateCcw,
  archived: Archive,
};

// Removed STORAGE_OVERRIDES: no in-browser persistence

/**
 * TextReader
 * Props:
 *  - onNavigate(page, view) : function to navigate back to pages
 *  - article: optional article object passed from parent navigation
 *  - articleId: optional id string to look up article from mockArticles
 */
const TextReader = ({ onNavigate, article, articleId }) => {
  const [current, setCurrent] = useState(article || null);
  const [highlights, setHighlights] = useState([]);
  const [selection, setSelection] = useState(null);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_HIGHLIGHT_COLOR);
  const [showHighlightsPanel, setShowHighlightsPanel] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');
  const [focusedHighlightId, setFocusedHighlightId] = useState(null);
  
  const [editingTitle, setEditingTitle] = useState('');
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  // Track completion shown for current article only (ephemeral, not persisted)
  const [completionShown, setCompletionShown] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  // Get authenticated user
  const { user } = useAuth();

  // Reader settings persisted locally (frontend only)
  const { setTheme: setAppTheme, effectiveTheme } = useContext(ThemeContext);
  const SETTINGS_KEY = 'reader_settings_v1';
  const [fontSize, setFontSize] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.fontSize || 'medium'; } catch { return 'medium'; }
  });
  const [fontFamily, setFontFamily] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.fontFamily || 'sans-serif'; } catch { return 'sans-serif'; }
  });
  const [showImages, setShowImages] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem(SETTINGS_KEY))?.showImages; return typeof v === 'boolean' ? v : true; } catch { return true; }
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [readerTheme, setReaderTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.readerTheme || effectiveTheme || 'light'; } catch { return effectiveTheme || 'light'; }
  });
  const [contentWidth, setContentWidth] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.contentWidth || 'normal'; } catch { return 'normal'; }
  });

  const persistReaderSettings = (next) => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (e) { console.error('persist reader settings failed', e); }
  };
  const onFontSizeChange = (size) => { setFontSize(size); persistReaderSettings({ fontSize: size, fontFamily, showImages, readerTheme, contentWidth }); };
  const onFontFamilyChange = (fam) => { setFontFamily(fam); persistReaderSettings({ fontSize, fontFamily: fam, showImages, readerTheme, contentWidth }); };
  const onShowImagesChange = (val) => { setShowImages(val); persistReaderSettings({ fontSize, fontFamily, showImages: val, readerTheme, contentWidth }); };
  const onReaderThemeChange = (theme) => {
    setReaderTheme(theme);
    persistReaderSettings({ fontSize, fontFamily, showImages, readerTheme: theme, contentWidth });
    try { if (setAppTheme) setAppTheme(theme); } catch { /* ignore */ }
  };
  const onContentWidthChange = (width) => {
    setContentWidth(width);
    persistReaderSettings({ fontSize, fontFamily, showImages, readerTheme, contentWidth: width });
  };

  // Listen for online/offline events for hybrid offline reading
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const contentRef = useRef(null);
  const selectionToolbarRef = useRef(null);
  const [allTags, setAllTags] = useState([]);
  // maintain a local snapshot of tagMap for possible future reactive displays; unused directly for resolution
  const [tagMap, setTagMap] = useState(getTagMapSnapshot()); // eslint-disable-line no-unused-vars
  
  // computed reader classes/styles based on settings
  const fontSizePx = fontSize === 'small' ? 18 : fontSize === 'large' ? 22 : 20;
  const fontFamilyMap = {
    'serif': "MR-Literata, Georgia, 'Times New Roman', serif",
    'sans-serif': "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    'mono': "SFMono-Regular, Menlo, Monaco, 'Courier New', monospace",
  };
  const fontFamilyCss = fontFamilyMap[fontFamily] || fontFamilyMap.serif;
  const isDark = readerTheme === 'dark';
  
  // Content width mapping
  const contentWidthMap = {
    'narrow': '600px',
    'normal': '750px',
    'wide': '900px',
    'full': '100%'
  };
  const contentMaxWidth = contentWidthMap[contentWidth] || contentWidthMap.normal;

  // Load user preferences from backend on mount
  useEffect(() => {
    const USER_PREFS_KEY = 'user_preferences_v1';
    let cancelled = false;
    const loadPreferences = async () => {
      // Only load preferences if user is authenticated
      if (!user?.id) {
        return;
      }
      try {
        const res = await usersAPI.getProfile(user.id);
        if (!cancelled && res?.data?.preferences) {
          const prefs = res.data.preferences;
          // Store in localStorage for quick access
          localStorage.setItem(USER_PREFS_KEY, JSON.stringify(prefs));
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    };
    loadPreferences();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (article) {
          if (!cancelled) setCurrent(article);
          return;
        }
        if (articleId) {
          const res = await articlesAPI.getById(articleId);
          if (!cancelled) setCurrent(res?.data || null);
          return;
        }
        if (!cancelled) setCurrent(null);
      } catch (e) {
        console.error('Failed to load article', e);
        if (!cancelled) setCurrent(null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [article, articleId]);

  // Load available tags using shared cache once article is known
  useEffect(() => {
    let cancelled = false;
    const loadTags = async () => {
      if (!current?.id) return;
      try {
        const { tags, map } = await ensureTagsLoaded(() => tagsAPI.getAll({ sort: 'alphabetical' }));
        if (!cancelled) {
          setAllTags(tags);
          setTagMap(map);
        }
      } catch (e) {
        console.error('Failed to load tags (TextReader)', e);
        if (!cancelled) {
          setAllTags([]);
        }
      }
    };
    loadTags();
    return () => { cancelled = true; };
  }, [current?.id]);

  // tagMap snapshot not strictly needed as dependency; getTagName reads cache
  const resolveTagName = useCallback((tagIdOrName) => getTagName(tagIdOrName), []);

  // Determine which content to display based on online status and user settings
  // Hybrid approach: Show images only when online AND user setting is on
  const displayContent = useMemo(() => {
    if (!current) return '';
    
    // If offline, always use contentNoImages (text-only for true offline reading)
    if (!isOnline) {
      return current.contentNoImages || current.textContent || current.content || '';
    }
    
    // If online, respect user's showImages preference
    if (showImages) {
      return current.content || current.textContent || '';
    } else {
      return current.contentNoImages || current.textContent || current.content || '';
    }
  }, [current, isOnline, showImages]);

  // Check if content is HTML or plain text
  const isHTMLContent = useMemo(() => {
    if (!displayContent) return false;
    return /<[a-z][\s\S]*>/i.test(displayContent);
  }, [displayContent]);

  // For plain text content: Preserve exact content/newlines to keep stable offsets across backend and UI
  const paragraphs = useMemo(() => {
    if (isHTMLContent) return [];
    return displayContent ? String(displayContent).split('\n') : [];
  }, [displayContent, isHTMLContent]);

  // Precomputed offsets of each paragraph start in the full text (joined with single \n)
  const paragraphStartOffsets = useMemo(() => {
    const starts = [];
    let acc = 0;
    for (let i = 0; i < paragraphs.length; i++) {
      starts.push(acc);
      acc += (paragraphs[i] || '').length + 1; // +1 for the split newline
    }
    return starts;
  }, [paragraphs]);

  const fullText = useMemo(() => paragraphs.join('\n'), [paragraphs]);

  // Load highlights from backend for this article
  const refreshHighlights = useCallback(async () => {
    if (!current) return;
    console.log('=== Loading Highlights ===');
    console.log('Article ID:', current.id);
    console.log('Article userId:', current.userId);
    console.log('Current user ID:', user?.id);
    console.log('Article belongs to user?', current.userId === user?.id || String(current.userId) === String(user?.id));
    try {
      const res = await highlightsAPI.getByArticle(current.id);
      const fetchedHighlights = res?.data || [];
      console.log('\u2713 Loaded highlights:', fetchedHighlights);
      console.log('\u2713 Highlight count:', fetchedHighlights.length);
      setHighlights(fetchedHighlights);
      
      // Update article's hasAnnotations property based on highlights presence
      const hasAnnotations = fetchedHighlights.length > 0;
      if (current.hasAnnotations !== hasAnnotations) {
        try {
          await articlesAPI.update(current.id, { hasAnnotations });
          setCurrent(prev => prev ? { ...prev, hasAnnotations } : prev);
        } catch (e) {
          console.error('Failed to update hasAnnotations', e);
        }
      }
    } catch (e) {
      console.error('\u2717 Failed to load highlights:', e);
      console.error('Error details:', e.response?.data);
      setHighlights([]);
    }
  }, [current, user]);

  // refresh highlights when current article is set
  useEffect(() => {
    if (current) refreshHighlights();
    else setHighlights([]);
  }, [current, refreshHighlights]);

  const goBack = useCallback(() => { if (onNavigate) onNavigate('home'); }, [onNavigate]);

  // Esc closes reader
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') goBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBack]);

  // selection handling (supports both HTML and plain text content)
  useEffect(() => {
    const onMouseUp = (e) => {
      try {
        // If the mouse up occurred inside the selection toolbar, do not alter selection
        const toolbarEl = selectionToolbarRef.current;
        if (toolbarEl && e && toolbarEl.contains(e.target)) {
          return;
        }
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) { setSelection(null); return; }
        const range = sel.getRangeAt(0);
        const container = contentRef.current;
        if (!container) { setSelection(null); return; }
        if (!container.contains(range.commonAncestorContainer)) { setSelection(null); return; }

        // Capture text immediately before it can be cleared
        const text = sel.toString().trim();
        if (!text) { setSelection(null); return; }
        
        // Store range for later use
        const storedRange = range.cloneRange();

        // For HTML content, calculate position based on text up to selection
        if (isHTMLContent) {
          const beforeSelection = range.cloneRange();
          beforeSelection.selectNodeContents(container);
          beforeSelection.setEnd(range.startContainer, range.startOffset);
          const absStart = (beforeSelection.toString() || '').length;
          const absEnd = absStart + text.length;
          
          const rect = range.getBoundingClientRect();
          setSelection({ text, absStart, absEnd, rect, range: storedRange });
          return;
        }

        // For plain text content with paragraphs
        // start paragraph
        let sNode = range.startContainer;
        let sP = sNode.nodeType === Node.ELEMENT_NODE && sNode.nodeName.toLowerCase() === 'p' ? sNode : sNode.parentNode;
        while (sP && sP !== container && sP.nodeName.toLowerCase() !== 'p') sP = sP.parentNode;
        if (!sP || sP === container) { setSelection(null); return; }

        // end paragraph
        let eNode = range.endContainer;
        let eP = eNode.nodeType === Node.ELEMENT_NODE && eNode.nodeName.toLowerCase() === 'p' ? eNode : eNode.parentNode;
        while (eP && eP !== container && eP.nodeName.toLowerCase() !== 'p') eP = eP.parentNode;
        if (!eP || eP === container) { setSelection(null); return; }

        const pNodes = Array.from(container.querySelectorAll('p'));
        const sIdx = pNodes.indexOf(sP);
        const eIdx = pNodes.indexOf(eP);
        if (sIdx === -1 || eIdx === -1) { setSelection(null); return; }

        const rBeforeStart = document.createRange();
        rBeforeStart.setStart(sP, 0);
        rBeforeStart.setEnd(range.startContainer, range.startOffset);
        const startInPara = rBeforeStart.toString().length;

        const rBeforeEnd = document.createRange();
        rBeforeEnd.setStart(eP, 0);
        rBeforeEnd.setEnd(range.endContainer, range.endOffset);
        const endInPara = rBeforeEnd.toString().length;

        const absStart = (paragraphStartOffsets[sIdx] || 0) + startInPara;
        const absEnd = (paragraphStartOffsets[eIdx] || 0) + endInPara;
        if (absEnd <= absStart) { setSelection(null); return; }

        const rect = range.getBoundingClientRect();
        setSelection({ text, absStart, absEnd, rect, range: storedRange });
      } catch (e) {
        console.error('Selection error', e);
        setSelection(null);
      }
    };
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, [paragraphStartOffsets, fullText, isHTMLContent]);

  // completion detection on scroll with reading progress tracking and auto-archive
  useEffect(() => {
    const USER_PREFS_KEY = 'user_preferences_v1';
    let progressUpdateTimeout = null;
    
    const onScroll = async () => {
      const el = contentRef.current;
      if (!el || !current) return;
      
      // Calculate reading progress percentage
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const scrollableHeight = scrollHeight - clientHeight;
      const progress = scrollableHeight > 0 ? Math.round((scrollTop / scrollableHeight) * 100) : 100;
      
      // Debounced progress update to backend
      if (progressUpdateTimeout) clearTimeout(progressUpdateTimeout);
      progressUpdateTimeout = setTimeout(async () => {
        try {
          await articlesAPI.update(current.id, { readingProgress: progress });
        } catch (error) {
          console.error('Failed to update reading progress:', error);
        }
      }, 2000); // Update every 2 seconds of inactivity
      
      // Check if user reached the end
      const remaining = scrollHeight - scrollTop - clientHeight;
      if (remaining <= 100 && !completionShown) {
        setIsCompletionOpen(true);
        setCompletionShown(true);
        
        // Auto-progression logic (happens regardless of toggle, but destination differs)
        try {
          const userPrefs = JSON.parse(localStorage.getItem(USER_PREFS_KEY)) || {};
          const isAutoArchiveEnabled = userPrefs.autoArchive;
          
          if (current.status !== 'archived') {
            let nextStatus;
            
            // Reading workflow progression
            if (current.status === 'inbox') {
              nextStatus = 'continue';
            } else if (current.status === 'continue') {
              // Stay in continue if reading is incomplete (progress < 100%)
              // Move to daily when complete
              nextStatus = progress >= 100 ? 'daily' : 'continue';
            } else if (current.status === 'daily') {
              // Auto-archive toggle only affects this transition:
              // If enabled: daily -> archived (skip rediscovery)
              // If disabled: daily -> rediscovery (normal flow)
              nextStatus = isAutoArchiveEnabled ? 'archived' : 'rediscovery';
            } else if (current.status === 'rediscovery') {
              nextStatus = 'archived';
            } else {
              nextStatus = 'archived';
            }
            
            // Only update if status actually changes
            if (nextStatus !== current.status) {
              await articlesAPI.update(current.id, { status: nextStatus, readingProgress: 100 });
              setCurrent(prev => ({ ...prev, status: nextStatus, readingProgress: 100 }));
              
              // Show appropriate toast message
              const statusMessages = {
                'continue': 'Moved to Continue reading',
                'daily': 'Moved to Daily reads',
                'rediscovery': 'Moved to Rediscovery',
                'archived': 'Article archived'
              };
              toast.success(statusMessages[nextStatus] || 'Status updated');
            }
          }
        } catch (error) {
          console.error('Auto-progression failed:', error);
        }
      }
    };
    
    const el = contentRef.current;
    if (el) el.addEventListener('scroll', onScroll);
    return () => { 
      if (el) el.removeEventListener('scroll', onScroll);
      if (progressUpdateTimeout) clearTimeout(progressUpdateTimeout);
    };
  }, [current, completionShown]);

  // autofocus was removed by request — do not auto-focus the textarea

  

  const applyHighlight = async (colorHex) => {
    if (!selection || !current) {
      console.log('applyHighlight aborted: selection or current missing', { selection: !!selection, current: !!current });
      return;
    }
    // Validate selected text (avoid pure whitespace or zero-length)
    const trimmed = (selection.text || '').trim();
    if (trimmed.length === 0 || selection.absEnd <= selection.absStart) {
      toast.error('Please select some text to highlight');
      return;
    }
    // Only allow creating highlights if user is authenticated
    if (!user?.id) {
      console.error('Cannot create highlight: User not authenticated');
      toast.error('Please log in to create highlights');
      return;
    }
    
    // Normalize positions: clamp to content length
    const fullLen = isHTMLContent ? (displayContent ? String(displayContent).replace(/<[^>]*>/g, '').length : 0) : fullText.length;
    const startPos = Math.max(0, Math.min(selection.absStart, fullLen));
    const endPos = Math.max(startPos + 1, Math.min(selection.absEnd, fullLen));

    // Prevent duplicate highlight on same exact range for same user/article
    const duplicate = (highlights || []).some(h => {
      const hStart = Number(h.position?.start ?? h.start ?? -1);
      const hEnd = Number(h.position?.end ?? h.end ?? -1);
      return h.articleId === current.id && h.userId === user.id && hStart === startPos && hEnd === endPos && (h.text || '').trim() === trimmed;
    });
    if (duplicate) {
      toast.info('That passage is already highlighted');
      // Focus the existing one instead of creating another
      const existing = (highlights || []).find(h => {
        const hStart = Number(h.position?.start ?? h.start ?? -1);
        const hEnd = Number(h.position?.end ?? h.end ?? -1);
        return h.articleId === current.id && h.userId === user.id && hStart === startPos && hEnd === endPos && (h.text || '').trim() === trimmed;
      });
      if (existing?.id) {
        setFocusedHighlightId(existing.id);
        setShowHighlightsPanel(true);
        setEditingNoteId(existing.id);
        setEditingTitle(existing.annotations?.title || '');
        setEditingNoteValue(existing.annotations?.note || '');
      }
      return;
    }

    const payload = {
      articleId: current.id,
      userId: user.id,
      text: trimmed,
      color: colorHex || DEFAULT_HIGHLIGHT_COLOR,
      position: { start: startPos, end: endPos },
      annotations: { title: '', note: '' }
    };
    
    console.log('=== Creating Highlight ===');
    console.log('User ID:', user.id);
    console.log('Article ID:', current.id);
    console.log('Selected text:', selection.text);
    console.log('Position:', { start: selection.absStart, end: selection.absEnd });
    console.log('Color:', colorHex || DEFAULT_HIGHLIGHT_COLOR);
    console.log('Full payload:', payload);
    
    try {
      const res = await highlightsAPI.create(payload);
      console.log('✓ API Response:', res);
      console.log('✓ Created highlight ID:', res?.data?.id);
      
      await refreshHighlights();
      if (res?.data?.id) {
        // Open sidebar focused on new highlight in edit mode
        setEditingNoteId(res.data.id);
        setEditingNoteValue('');
        setEditingTitle('');
        setShowHighlightsPanel(true);
        setFocusedHighlightId(res.data.id);
        // Now that the highlight is saved and sidebar opened, clear native selection
        // so the page returns to normal view
        setSelection(null);
        try { window.getSelection().removeAllRanges(); } catch { /* ignore */ }
      } else {
        setShowHighlightsPanel(true);
        // Clear selection even if no ID returned to avoid lingering UI
        setSelection(null);
        try { window.getSelection().removeAllRanges(); } catch { /* ignore */ }
      }
      toast.success('Highlight created!');
    } catch (e) {
      console.error('✗ Failed to create highlight');
      console.error('Error object:', e);
      console.error('Error message:', e.message);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      toast.error(`Failed to create highlight: ${e.message}`);
    }
  };

  const removeHighlight = async (id) => {
    try { await highlightsAPI.delete(id); } catch (e) { console.error('Delete highlight failed', e); }
    await refreshHighlights();
  };

  const saveEditingNote = async () => {
    if (!editingNoteId) return;
    try {
      await highlightsAPI.update(editingNoteId, { annotations: { title: editingTitle, note: editingNoteValue } });
    } catch (e) { console.error('save note failed', e); }
    const savedId = editingNoteId;
    setEditingNoteId(null);
    setEditingNoteValue('');
    setEditingTitle('');
    setFocusedHighlightId(null);
    await refreshHighlights();
    // Close sidebar and jump to the highlight
    setShowHighlightsPanel(false);
    setTimeout(() => scrollToHighlight(savedId), 150);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteValue('');
  };

  // Centralize opening of highlight details in sidebar
  const openHighlightDetails = useCallback((id) => {
    if (!id) return;
    setFocusedHighlightId(id);
    setShowHighlightsPanel(true);
    const h = (highlights || []).find(x => x.id === id);
    if (h) {
      setEditingNoteId(id);
      setEditingTitle(h.annotations?.title || '');
      setEditingNoteValue(h.annotations?.note || '');
    }
    // Clear any active text selection to avoid conflicts
    try { window.getSelection().removeAllRanges(); } catch { /* ignore */ }
    setSelection(null);
  }, [highlights]);

  // Handle clicks on highlighted text
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('[data-highlight-id]');
      if (target) {
        e.stopPropagation();
        const highlightId = target.getAttribute('data-highlight-id');
        if (highlightId) {
          openHighlightDetails(highlightId);
        }
      }
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener('click', handleClick);
      return () => container.removeEventListener('click', handleClick);
    }
  }, [openHighlightDetails]);

  const scrollToHighlight = (id, { keepPanelOpen = false } = {}) => {
    const el = document.querySelector(`[data-highlight-id="${id}"]`);
    if (!el) return;

    const container = contentRef.current;
    // If container can scroll, prefer centering inside it
    if (container && (container.scrollHeight > container.clientHeight)) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const currentTop = container.scrollTop;
      const offsetTop = elRect.top - containerRect.top + currentTop;
      const center = container.clientHeight / 2;
      const targetTop = Math.max(0, offsetTop - center);
      container.scrollTo({ top: targetTop, behavior: 'smooth' });
    } else {
      // Fallback to window scroll if container isn't scrollable
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } catch {
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY - (window.innerHeight / 2);
        window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
      }
    }

    if (!keepPanelOpen) setShowHighlightsPanel(false);
  };

  // Fallback retry is added later after processedHTMLContent declaration to avoid TDZ

  const appliedFavorite = current?.isFavorite;

  // status overrides are stored in `overrides` and used by other flows; not displayed in reader header

  const toggleFavorite = async () => {
    if (!current) return;
    try {
      // backend update
      await articlesAPI.toggleFavorite(current.id, !appliedFavorite);
      // reflect immediately in local state
      setCurrent(prev => prev ? { ...prev, isFavorite: !appliedFavorite } : prev);
    } catch (e) {
      console.error('Favorite toggle failed', e);
    }
  };

  const changeStatus = async (newStatus) => {
    if (!current) return;
    if (!ARTICLE_STATUSES.includes(newStatus)) return; // guard invalid
    try {
      await articlesAPI.updateStatus(current.id, newStatus);
      setCurrent(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (e) {
      console.error('Status update failed', e);
    }
  };

  // Handle adding a tag (signature (articleId, tagIdOrName) expected by TagManagerModal)
  const handleAddTag = async (articleId, tagIdOrName) => {
    if (!current || String(current.id) !== String(articleId)) return;
    try {
      let tagId = null;
      let tagObj = null;
      // Support object, ID string (including MongoDB ObjectIds), or name string
      if (tagIdOrName && typeof tagIdOrName === 'object') {
        tagId = tagIdOrName.id;
        tagObj = tagIdOrName;
      } else if (typeof tagIdOrName === 'string') {
        // First try to find by ID (works for both numeric and MongoDB ObjectId strings)
        const existingById = allTags.find(t => String(t.id) === String(tagIdOrName));
        if (existingById) {
          tagId = existingById.id;
          tagObj = existingById;
        } else {
          // If not found by ID, try to find by name
          const existingByName = allTags.find(t => t.name.toLowerCase() === tagIdOrName.toLowerCase());
          if (existingByName) {
            tagId = existingByName.id;
            tagObj = existingByName;
          } else {
            // Fallback: attempt to create if not found (defensive in case modal didn't create)
            try {
              const createResp = await tagsAPI.create({ name: tagIdOrName });
              if (createResp?.data) {
                tagId = createResp.data.id;
                tagObj = createResp.data;
                setAllTags(prev => prev.some(t => t.id === tagId) ? prev : [...prev, tagObj]);
              }
            } catch (e) {
              // If already exists, refetch list and resolve
              const msg = String(e?.message || '').toLowerCase();
              if (msg.includes('already exists')) {
                const list = await tagsAPI.getAll({ search: tagIdOrName });
                const resolved = list?.data?.find(t => t.name.toLowerCase() === tagIdOrName.toLowerCase());
                if (resolved) {
                  tagId = resolved.id;
                  tagObj = resolved;
                  setAllTags(prev => prev.some(t => t.id === tagId) ? prev : [...prev, tagObj]);
                }
              } else {
                throw e;
              }
            }
          }
        }
      }

      if (tagId == null) {
        console.warn('Tag add aborted: unable to resolve tag reference', tagIdOrName);
        return;
      }

      // Defensive duplicate check
      if ((current.tags || []).map(t => String(t)).includes(String(tagId))) {
        // Already present; just refresh article to ensure latest names/state
        const res = await articlesAPI.getById(current.id);
        if (res?.data) setCurrent(res.data);
        return;
      }

      await articlesAPI.addTag(current.id, tagId);
      // Merge tag into shared cache & local state (only if new)
      if (tagObj) {
        addSingleTag(tagObj);
        setAllTags(prev => prev.some(t => t.id === tagObj.id) ? prev : [...prev, tagObj]);
        // Note: no setTagMap needed; getTagName reads cache directly
      }
      const res = await articlesAPI.getById(current.id);
      if (res?.data) setCurrent(res.data);
    } catch (error) {
      if (error?.status === 409) {
        // treat as success; refresh article
        const res = await articlesAPI.getById(current.id);
        if (res?.data) setCurrent(res.data);
      } else {
        console.error('Failed to add tag:', error);
      }
    }
  };

  // Handle removing a tag (signature (articleId, tagIdOrName))
  const handleRemoveTag = async (articleId, tagIdOrName) => {
    if (!current || String(current.id) !== String(articleId)) return;
    try {
      let tagId = null;
      if (tagIdOrName && typeof tagIdOrName === 'object') {
        tagId = tagIdOrName.id;
      } else if (typeof tagIdOrName === 'string') {
        // First try to find by ID (works for both numeric and MongoDB ObjectId strings)
        const existingById = allTags.find(t => String(t.id) === String(tagIdOrName));
        if (existingById) {
          tagId = existingById.id;
        } else {
          // If not found by ID, try to find by name
          const existingByName = allTags.find(t => t.name.toLowerCase() === tagIdOrName.toLowerCase());
          if (existingByName) {
            tagId = existingByName.id;
          } else {
            // If still not found in allTags, the tagIdOrName might already be a valid ID
            // (happens when allTags hasn't loaded yet but we have a valid tag ID)
            tagId = tagIdOrName;
          }
        }
      } else if (typeof tagIdOrName === 'number') {
        tagId = tagIdOrName;
      }
      
      if (tagId == null) {
        console.warn('Tag remove aborted: unresolved tag', tagIdOrName);
        return;
      }
      
      await articlesAPI.removeTag(current.id, tagId);
      const res = await articlesAPI.getById(current.id);
      if (res?.data) setCurrent(res.data);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  // Handle created tag notification from modal - create tag and add it to article
  const handleCreateTag = async (tagName) => {
    if (!current || !tagName) return;
    try {
      // Create the tag first
      const createResp = await tagsAPI.create({ name: tagName });
      if (!createResp?.data) {
        throw new Error('Failed to create tag');
      }
      
      const newTag = createResp.data;
      
      // Add to local tag list and cache
      addSingleTag(newTag);
      setAllTags(prev => {
        const exists = prev.some(t => t.id === newTag.id);
        return exists ? prev : [...prev, newTag];
      });
      
      // Add tag to the current article
      await articlesAPI.addTag(current.id, newTag.id);
      
      // Reload article to get updated tags
      const res = await articlesAPI.getById(current.id);
      if (res?.data) setCurrent(res.data);
    } catch (error) {
      // If tag already exists, try to find it and add it
      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('already exists')) {
        try {
          const list = await tagsAPI.getAll({ search: tagName });
          const existing = list?.data?.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (existing) {
            // Add to cache and local state
            addSingleTag(existing);
            setAllTags(prev => {
              const exists = prev.some(t => t.id === existing.id);
              return exists ? prev : [...prev, existing];
            });
            // Add to article
            await articlesAPI.addTag(current.id, existing.id);
            // Reload article
            const res = await articlesAPI.getById(current.id);
            if (res?.data) setCurrent(res.data);
          }
        } catch (e2) {
          console.error('Failed to handle existing tag:', e2);
          throw e2;
        }
      } else {
        console.error('Failed to create tag:', error);
        throw error;
      }
    }
  };

  const handleCompletion = () => {
    if (!current) return;
    changeStatus('rediscovery');
    setIsCompletionOpen(false);
  };

  // Render paragraph by intersecting backend highlight ranges with this paragraph's span in the full text
  const renderParagraph = (text, idx) => {
    const pStart = paragraphStartOffsets[idx] || 0;
    const pEnd = pStart + (text || '').length;
    const pClass = 'mb-6';
    if (!highlights || highlights.length === 0) return <p key={idx} className={pClass}>{text}</p>;

    const ranges = (highlights || [])
      .map(h => ({
        ...h,
        start: Math.max(pStart, Number(h.position?.start ?? h.start ?? 0)),
        end: Math.min(pEnd, Number(h.position?.end ?? h.end ?? 0))
      }))
      .filter(r => r.end > r.start)
      .sort((a, b) => a.start - b.start);

    if (ranges.length === 0) return <p key={idx} className={pClass}>{text}</p>;

    const parts = [];
    let cursor = pStart;
    for (const r of ranges) {
      if (r.start > cursor) parts.push({ type: 'text', text: fullText.slice(cursor, r.start) });
      parts.push({ type: 'highlight', highlight: r, text: fullText.slice(r.start, r.end) });
      cursor = r.end;
    }
    if (cursor < pEnd) parts.push({ type: 'text', text: fullText.slice(cursor, pEnd) });

    return (
      <p key={idx} className={pClass}>
        {parts.map((part, i) => part.type === 'text' ? (
          <span key={i}>{part.text}</span>
        ) : (
          <mark
            key={i}
            data-highlight-id={part.highlight.id}
            style={{
              backgroundColor: part.highlight.color || '#fffbdd',
              padding: '0.08rem 0.24rem',
              borderRadius: 4,
              boxShadow: isDark ? 'inset 0 -6px 0 rgba(0,0,0,0.18)' : undefined,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={(e) => { e.stopPropagation(); openHighlightDetails(part.highlight.id); }}
          >
            {part.text}
          </mark>
        ))}
      </p>
    );
  };

  // Apply highlights to HTML content by wrapping highlighted text with marks
  const applyHighlightsToHTML = useCallback((htmlContent) => {
    if (!highlights || highlights.length === 0) return htmlContent;
    
    // Create a temporary div to parse and manipulate the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Get all text content to calculate positions
    const fullTextContent = tempDiv.innerText || tempDiv.textContent || '';
    
    // Sort highlights by start position
    const sortedHighlights = [...highlights].sort((a, b) => {
      const aStart = Number(a.position?.start ?? a.start ?? 0);
      const bStart = Number(b.position?.start ?? b.start ?? 0);
      return aStart - bStart;
    });
    
    // Process each highlight
    sortedHighlights.forEach(highlight => {
      const start = Number(highlight.position?.start ?? highlight.start ?? 0);
      const end = Number(highlight.position?.end ?? highlight.end ?? 0);
      
      if (start >= end || start < 0 || end > fullTextContent.length) return;
      
      const highlightText = fullTextContent.substring(start, end);
      if (!highlightText.trim()) return;
      
      // Create a TreeWalker to find text nodes
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let currentPos = 0;
      
      for (let textNode = walker.nextNode(); textNode; textNode = walker.nextNode()) {
        const nodeText = textNode.nodeValue || '';
        const nodeStart = currentPos;
        const nodeEnd = currentPos + nodeText.length;
        
        // Check if this text node contains part of the highlight
        if (nodeEnd > start && nodeStart < end) {
          const highlightStartInNode = Math.max(0, start - nodeStart);
          const highlightEndInNode = Math.min(nodeText.length, end - nodeStart);
          
          // Split the text node and wrap the highlighted part
          const beforeText = nodeText.substring(0, highlightStartInNode);
          const highlightedText = nodeText.substring(highlightStartInNode, highlightEndInNode);
          const afterText = nodeText.substring(highlightEndInNode);
          
          const fragment = document.createDocumentFragment();
          
          if (beforeText) {
            fragment.appendChild(document.createTextNode(beforeText));
          }
          
          if (highlightedText) {
            const mark = document.createElement('mark');
            mark.setAttribute('data-highlight-id', highlight.id);
            mark.style.backgroundColor = highlight.color || '#fffbdd';
            mark.style.padding = '0.08rem 0.24rem';
            mark.style.borderRadius = '4px';
            if (isDark) {
              mark.style.boxShadow = 'inset 0 -6px 0 rgba(0,0,0,0.18)';
            }
            mark.style.cursor = 'pointer';
            mark.style.transition = 'all 0.2s ease';
            mark.textContent = highlightedText;
            mark.setAttribute('data-highlight-click', highlight.id);
            fragment.appendChild(mark);
          }
          
          if (afterText) {
            fragment.appendChild(document.createTextNode(afterText));
          }
          
          textNode.parentNode.replaceChild(fragment, textNode);
        }
        
        currentPos = nodeEnd;
      }
    });
    
    return tempDiv.innerHTML;
  }, [highlights, isDark]);

  // Memoize the processed HTML content with highlights
  const processedHTMLContent = useMemo(() => {
    if (!isHTMLContent) return displayContent;
    return applyHighlightsToHTML(displayContent);
  }, [isHTMLContent, displayContent, applyHighlightsToHTML]);

  // Fallback: after highlights refresh or HTML processing, if focusedHighlightId is set but element not found yet, try again
  useEffect(() => {
    if (!focusedHighlightId) return;
    const container = contentRef.current;
    if (!container) return;
    const el = document.querySelector(`[data-highlight-id="${focusedHighlightId}"]`);
    if (!el) {
      const t = setTimeout(() => scrollToHighlight(focusedHighlightId, { keepPanelOpen: true }), 120);
      return () => clearTimeout(t);
    }
  }, [processedHTMLContent, paragraphs, focusedHighlightId]);

  return (
    <div className="min-h-screen bg-background pt-6 pb-6 pl-6 pr-16 relative">
      <div className="mx-auto" style={{ maxWidth: contentMaxWidth }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button onClick={goBack} variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft size={16} />
              Back
            </Button>
            {!isOnline && (
              <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                📖 Offline Mode - Text Only
              </span>
            )}
          </div>
        </div>

        <div className="mb-6">
          {current ? (
            <>
              <h1 className="text-3xl font-bold mb-2">{current.title}</h1>
              <p className="text-muted-foreground mb-4">
                {current.author && <span className="mr-2">{current.author}</span>}
                {displayContent && <span className="mr-2">• {calculateReadingTime(displayContent)}</span>}
                {(current.publishedDate || current.dateAdded) && (
                  <span className="mr-2">• {new Date(current.publishedDate || current.dateAdded).toLocaleDateString()} •</span>
                )}
                {current.url && (
                  <a href={current.url} target="_blank" rel="noreferrer" className="underline reader-link">Source</a>
                )}
              </p>

              <div className="flex items-center gap-2">
                {Array.isArray(current.tags) && current.tags.length > 0 && (() => {
                  const resolved = current.tags
                    .map(t => ({ raw: t, name: resolveTagName(t) }))
                    .filter(t => t.name && t.name.trim().length > 0);
                  if (resolved.length === 0) return null; // suppress empty placeholder chips
                  return (
                    <div className="flex flex-wrap gap-2">
                      {resolved.map(t => (
                        <span key={t.raw} className="text-[12px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded reader-tag">{t.name}</span>
                      ))}
                    </div>
                  );
                })()}
                <Button 
                  onClick={() => setTagModalOpen(true)}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                >
                  <TagIcon size={14} />
                  Manage Tags
                </Button>
              </div>
            </>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-2">No article selected</h1>
              <p className="text-muted-foreground mb-4">Open an article card to view it here.</p>
            </div>
          )}
        </div>

        <div className="rounded-lg flex gap-6 relative mt-5">
          <div className="" ref={contentRef} style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>
            {current ? (
              <article
                className="prose prose-lg max-w-none text-reader-article"
                style={{
                  fontSize: `${fontSizePx}px`,
                  fontFamily: fontFamilyCss,
                  backgroundColor: 'transparent',
                  color: isDark ? '#e6eef8' : undefined,
                  padding: '0',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                }}
              >
                {isHTMLContent ? (
                  <div dangerouslySetInnerHTML={{ __html: processedHTMLContent }} />
                ) : paragraphs.length > 0 ? (
                  paragraphs.map((p, i) => renderParagraph(p, i))
                ) : (
                  <p className="text-muted-foreground">No readable content available for this article.</p>
                )}
              </article>
            ) : (
              <div className="text-center py-12"><p className="text-muted-foreground">No article data. Select an article from a list to read it.</p></div>
            )}
          </div>
        </div>
        {/* Highlights sidebar for desktop and mobile */}
        {/* Overlay for mobile when highlights panel is open */}
        {showHighlightsPanel && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setShowHighlightsPanel(false)}
            aria-label="Close highlights panel"
          />
        )}
        <div className="fixed top-0 right-0 h-full z-50 flex flex-col">
          {/* Minimized bar (desktop only) */}
          {!showHighlightsPanel && (
            <div className="w-10 h-full bg-card border-l border-border flex flex-col items-center pt-3 justify-between">
              <div className="flex flex-col items-center">
                <button onClick={() => { setFocusedHighlightId(null); setShowHighlightsPanel(true); }} className="p-2 rounded bg-accent reader-button mb-2 hover:bg-accent/80" title="Show Highlights">
                  <StickyNote size={18} className="text-foreground" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-3 space-y-2">
                <button onClick={() => toggleFavorite()} className="p-2 rounded reader-button" title="Favorite">
                  <Star size={16} className={appliedFavorite ? 'text-yellow-400' : 'text-muted-foreground'} />
                </button>
                {current && ARTICLE_STATUSES.map(status => {
                  const Icon = STATUS_ICON_MAP[status];
                  const active = current.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => changeStatus(status)}
                      className={`p-2 rounded reader-button transition-colors ${active ? 'bg-muted' : ''}`}
                      title={status.charAt(0).toUpperCase() + status.slice(1)}
                    >
                      <Icon size={16} className={active ? 'text-foreground' : 'text-muted-foreground'} />
                    </button>
                  );
                })}
                <button onClick={() => setSettingsOpen(true)} className="p-2 rounded reader-button" title="Settings">
                  <Settings size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          )}
          {/* Expanded highlights sidebar */}
          {showHighlightsPanel && (
            <aside className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-card border-l border-border z-50 overflow-y-auto shadow-xl flex flex-col justify-between">
              <div>
                <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StickyNote size={20} className="text-foreground" />
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-lg">
                        {focusedHighlightId ? 'Highlight Details' : 'All Highlights'}
                      </h3>
                      {focusedHighlightId && highlights.length > 0 && (
                        <button 
                          onClick={() => setFocusedHighlightId(null)}
                          className="text-xs text-muted-foreground hover:text-foreground mt-0.5 text-left"
                        >
                          ← Back to all highlights
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setShowHighlightsPanel(false)} className="p-2 hover:bg-accent rounded-lg transition-all reader-button" title="Close">
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  {highlights.length === 0 && <p className="text-sm text-muted-foreground">No highlights yet</p>}
                  {/* Inline annotation editor */}
                  {editingNoteId && (
                    <div className="mb-3 p-2 bg-muted rounded">
                      <label className="text-sm font-medium mb-1 block">Title</label>
                      <input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="w-full p-2 text-sm rounded border border-border mb-2" placeholder="Enter a title for this highlight" />
                      <label className="text-sm font-medium mb-1 block">Edit note</label>
                      <textarea value={editingNoteValue} onChange={(e) => setEditingNoteValue(e.target.value)} className="w-full p-2 text-sm rounded border border-border mb-2" rows={4} />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditingNote}
                          className="px-3 py-1 rounded text-sm bg-primary text-primary-foreground reader-button hover:bg-primary/90 transition-all"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditingNote}
                          className="px-3 py-1 bg-card border border-border rounded text-sm reader-button hover:bg-accent transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {/* If we're editing the focused highlight, only show the editor pane (H_specific editing) */}
                  {!(focusedHighlightId && editingNoteId === focusedHighlightId) && (
                    <div className="space-y-3">
                      {(focusedHighlightId ? highlights.filter(h => h.id === focusedHighlightId) : highlights).map(h => (
                        <div
                          key={h.id}
                          className="p-2 bg-muted rounded hover:bg-muted/80 cursor-pointer transition-all hover:-translate-y-0.5"
                          onClick={() => { setFocusedHighlightId(h.id); setShowHighlightsPanel(true); }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="flex items-center justify-between mb-1">
                              <strong className="text-sm">{h.annotations?.title && h.annotations.title.length > 0 ? (h.annotations.title.length > 80 ? h.annotations.title.slice(0,80) + '…' : h.annotations.title) : 'No title yet'}</strong>
                            <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); scrollToHighlight(h.id); }} className="text-xs px-1.5 py-0.5 rounded reader-button hover:bg-accent hover:text-foreground transition-colors">Jump</button>
                              <button onClick={(e) => { e.stopPropagation(); setFocusedHighlightId(h.id); setEditingNoteId(h.id); setEditingTitle(h.annotations?.title || ''); setEditingNoteValue(h.annotations?.note || ''); setShowHighlightsPanel(true); }} className="text-xs px-1.5 py-0.5 rounded reader-button hover:bg-accent hover:text-foreground transition-colors">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); removeHighlight(h.id); }} className="text-xs px-1.5 py-0.5 rounded reader-button hover:bg-destructive/10 text-destructive hover:text-destructive/90 transition-colors">Delete</button>
                            </div>
                          </div>
                          <div className="text-[13px] text-muted-foreground">{h.annotations?.note && h.annotations.note.length > 0 ? h.annotations.note : 'No annotation yet'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Bottom action group: Favorites, Rediscovery, Archive, Settings */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => toggleFavorite()} className="p-2 rounded reader-button" title="Favorite">
                    <Star size={18} className={appliedFavorite ? 'text-yellow-400' : 'text-muted-foreground'} />
                  </button>
                  {current && ARTICLE_STATUSES.map(status => {
                    const Icon = STATUS_ICON_MAP[status];
                    const active = current.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => changeStatus(status)}
                        className={`p-2 rounded reader-button transition-colors ${active ? 'bg-muted' : ''}`}
                        title={status.charAt(0).toUpperCase() + status.slice(1)}
                      >
                        <Icon size={18} className={active ? 'text-foreground' : 'text-muted-foreground'} />
                      </button>
                    );
                  })}
                </div>
                <div>
                  <button onClick={() => setSettingsOpen(true)} className="p-2 rounded reader-button" title="Settings">
                    <Settings size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Selection toolbar */}
        {selection && (
          <div 
            style={{ position: 'fixed', left: selection.rect.left + window.scrollX, top: selection.rect.top + window.scrollY - 48, zIndex: 60 }}
            ref={selectionToolbarRef}
          >
            <div className="flex items-center gap-2 bg-card border border-border rounded shadow p-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-8 h-8 p-0 border border-border rounded cursor-pointer"
                aria-label="Pick highlight color"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-24 px-2 py-1 text-xs border border-border rounded bg-background"
                placeholder="#fef08a"
              />
              <button 
                onClick={() => applyHighlight(selectedColor)}
                className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded reader-button hover:bg-primary/90"
              >
                Highlight
              </button>
              <button 
                onClick={() => setSelection(null)}
                className="px-3 py-1 text-sm bg-card border border-border rounded reader-button hover:bg-accent transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <CompletionModal isOpen={isCompletionOpen} onClose={() => setIsCompletionOpen(false)} onComplete={handleCompletion} onSkip={() => setIsCompletionOpen(false)} itemTitle={current?.title} />
        <ReaderSettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
          fontFamily={fontFamily}
          onFontFamilyChange={onFontFamilyChange}
          showImages={showImages}
          onShowImagesChange={onShowImagesChange}
          readerTheme={readerTheme}
          onReaderThemeChange={onReaderThemeChange}
          contentWidth={contentWidth}
          onContentWidthChange={onContentWidthChange}
        />
        {current && (
          <TagManagerModal
            isOpen={tagModalOpen}
            onClose={() => setTagModalOpen(false)}
            article={current}
            availableTags={allTags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onCreateTag={handleCreateTag}
          />
        )}
      </div>
    </div>
  );
};

export default TextReader;

