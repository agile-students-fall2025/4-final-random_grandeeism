import React, { useEffect, useState, useCallback, useRef, useMemo, useContext } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext.jsx';
import { mockArticles } from '../../data/mockArticles';
import CompletionModal from '../../components/CompletionModal.jsx';
import ReaderSettingsModal from '../../components/ReaderSettingsModal.jsx';
import TagManager from '../../components/TagManager.jsx';
import * as highlightsStore from '../../data/mockHighlights';
import { Star, Settings, StickyNote, RotateCcw, Archive } from 'lucide-react';
import '../../styles/textReader.css';

// small palette used by the selection toolbar
const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: 'yellow', light: '#fef08a' },
  { name: 'Green', value: 'green', light: '#bbf7d0' },
  { name: 'Blue', value: 'blue', light: '#bfdbfe' },
  { name: 'Red', value: 'red', light: '#fecaca' },
  { name: 'Purple', value: 'purple', light: '#d8b4fe' },
];

const STORAGE_OVERRIDES = 'article_overrides_v1';

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
  const [showHighlightsPanel, setShowHighlightsPanel] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');
  const [focusedHighlightId, setFocusedHighlightId] = useState(null);
  
  const [editingTitle, setEditingTitle] = useState('');
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [completionShownFor, setCompletionShownFor] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completion_shown') || '{}'); } catch { return {}; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overrides, setOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_OVERRIDES) || '{}'); } catch { return {}; }
  });

  // Reader settings (font, theme, images) persisted separately
  const SETTINGS_KEY = 'reader_settings_v1';
  const [fontSize, setFontSize] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.fontSize || 'medium'; } catch { return 'medium'; }
  });
  const [fontFamily, setFontFamily] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.fontFamily || 'serif'; } catch { return 'serif'; }
  });
  const [showImages, setShowImages] = useState(() => {
    try { const v = JSON.parse(localStorage.getItem(SETTINGS_KEY))?.showImages; return typeof v === 'boolean' ? v : true; } catch { return true; }
  });
  const { setTheme: setAppTheme, effectiveTheme } = useContext(ThemeContext);
  const [readerTheme, setReaderTheme] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY))?.readerTheme || effectiveTheme || 'light'; } catch { return effectiveTheme || 'light'; }
  });

  const persistReaderSettings = (next) => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (e) { console.error('persist reader settings failed', e); }
  };

  const onFontSizeChange = (size) => { setFontSize(size); persistReaderSettings({ fontSize: size, fontFamily, showImages, readerTheme }); };
  const onFontFamilyChange = (fam) => { setFontFamily(fam); persistReaderSettings({ fontSize, fontFamily: fam, showImages, readerTheme }); };
  const onShowImagesChange = (val) => { setShowImages(val); persistReaderSettings({ fontSize, fontFamily, showImages: val, readerTheme }); };
  const onReaderThemeChange = (theme) => {
    setReaderTheme(theme);
    persistReaderSettings({ fontSize, fontFamily, showImages, readerTheme: theme });
    // update app-wide theme so Reader setting toggles the whole app like SettingsPage
  try { if (setAppTheme) setAppTheme(theme); } catch { /* ignore */ }
  };

  const contentRef = useRef(null);
  
  // computed reader classes/styles based on settings
  const fontSizePx = fontSize === 'small' ? 18 : fontSize === 'large' ? 22 : 20;
  const fontFamilyMap = {
    'serif': "Literata, Georgia, 'Times New Roman', serif",
    'sans-serif': "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    'mono': "SFMono-Regular, Menlo, Monaco, 'Courier New', monospace",
  };
  const fontFamilyCss = fontFamilyMap[fontFamily] || fontFamilyMap.serif;
  const isDark = readerTheme === 'dark';

  useEffect(() => {
    if (article) {
      setCurrent(article);
    } else if (articleId) {
      const found = mockArticles.find(a => String(a.id) === String(articleId));
      setCurrent(found || null);
    } else {
      setCurrent(null);
    }
  }, [article, articleId]);

  

  // paragraphs split (memoized so offsets stay stable across renders)
  const paragraphs = useMemo(() => (
    (current && current.content)
      ? String(current.content).split(/\n+/).map(p => p.trim()).filter(Boolean)
      : []
  ), [current]);

  // load highlights and try to migrate any legacy text-only highlights to paragraph offsets
  const refreshHighlights = useCallback(() => {
    if (!current) return;
    let hs = highlightsStore.getHighlightsForArticle(current.id) || [];
    let migrated = false;
    const paras = paragraphs;
    hs = hs.map(h => {
      if (typeof h.paragraphIndex === 'number') return h;
      for (let i = 0; i < paras.length; i++) {
        const p = paras[i] || '';
        const idx = p.indexOf(h.text || '');
        if (idx !== -1) {
          const start = idx;
          const end = idx + (h.text || '').length;
          try { highlightsStore.updateHighlight(h.id, { paragraphIndex: i, start, end }); } catch { /* ignore */ }
          migrated = true;
          return { ...h, paragraphIndex: i, start, end };
        }
      }
      return h;
    });
    if (migrated) hs = highlightsStore.getHighlightsForArticle(current.id) || [];
    setHighlights(hs);
  }, [current, paragraphs]);

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

  // selection handling
  useEffect(() => {
    const onMouseUp = () => {
      try {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) { setSelection(null); return; }
        const range = sel.getRangeAt(0);
        const container = contentRef.current;
        if (!container) { setSelection(null); return; }
        // ensure selection is inside reader container
        if (!container.contains(range.commonAncestorContainer)) { setSelection(null); return; }

        // find the paragraph element that contains the start of the range
        let startNode = range.startContainer;
        let pEl = startNode.nodeType === Node.ELEMENT_NODE && startNode.nodeName.toLowerCase() === 'p' ? startNode : startNode.parentNode;
        while (pEl && pEl !== container && pEl.nodeName.toLowerCase() !== 'p') pEl = pEl.parentNode;
        if (!pEl || pEl === container) {
          // try the commonAncestorContainer
          let anc = range.commonAncestorContainer;
          while (anc && anc !== container && anc.nodeName && anc.nodeName.toLowerCase() !== 'p') anc = anc.parentNode;
          if (!anc || anc === container) { setSelection(null); return; }
          pEl = anc;
        }

        // ensure selection doesn't span multiple paragraphs (keep simple)
        let endAncestor = range.endContainer;
        let endP = endAncestor.nodeType === Node.ELEMENT_NODE && endAncestor.nodeName.toLowerCase() === 'p' ? endAncestor : endAncestor.parentNode;
        while (endP && endP !== container && endP.nodeName.toLowerCase() !== 'p') endP = endP.parentNode;
        if (endP !== pEl) { setSelection(null); return; }

        // compute start offset within paragraph by creating a range from paragraph start to range.start
        const rBefore = document.createRange();
        rBefore.setStart(pEl, 0);
        rBefore.setEnd(range.startContainer, range.startOffset);
        const start = rBefore.toString().length;
        const length = range.toString().length;
        const end = start + length;

        const paragraphNodes = Array.from(container.querySelectorAll('p'));
        const paragraphIndex = paragraphNodes.indexOf(pEl);
        if (paragraphIndex === -1) { setSelection(null); return; }

        const rect = range.getBoundingClientRect();
        const text = range.toString();
        setSelection({ text, rect, paragraphIndex, start, end });
      } catch {
        // ignore selection errors
        setSelection(null);
      }
    };

    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, []);

  // completion detection on scroll
  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el || !current) return;
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (remaining <= 100 && !completionShownFor[current.id]) {
          setIsCompletionOpen(true);
          const next = { ...completionShownFor, [current.id]: true };
          setCompletionShownFor(next);
          try { localStorage.setItem('completion_shown', JSON.stringify(next)); } catch (e) { console.error('saving completion_shown failed', e); }
      }
    };
    const el = contentRef.current;
    if (el) el.addEventListener('scroll', onScroll);
    return () => { if (el) el && el.removeEventListener('scroll', onScroll); };
  }, [current, completionShownFor]);

  // autofocus was removed by request — do not auto-focus the textarea

  

  const applyHighlight = (color) => {
    if (!selection || !current) return;
    // require paragraph-based selection (start/end present)
    if (typeof selection.paragraphIndex !== 'number' || typeof selection.start !== 'number' || typeof selection.end !== 'number') {
      setSelection(null);
      return;
    }

    const h = {
      id: highlightsStore.makeId('h-'),
      articleId: current.id,
      paragraphIndex: selection.paragraphIndex,
      start: selection.start,
      end: selection.end,
      text: selection.text,
      color,
      note: '',
      title: '',
      createdAt: new Date().toISOString(),
    };

    highlightsStore.addHighlight(h);
    // open inline editor so user can add an annotation immediately
    setEditingNoteId(h.id);
    setEditingNoteValue('');
    setEditingTitle('');
    setShowHighlightsPanel(true);
    setFocusedHighlightId(h.id); // Focus the newly created highlight
    setSelection(null);
    refreshHighlights();
    try { window.getSelection().removeAllRanges(); } catch { /* ignore */ }
  };

  const removeHighlight = (id) => { highlightsStore.deleteHighlight(id); refreshHighlights(); };

  const saveEditingNote = async () => {
    if (!editingNoteId) return;
    try {
      highlightsStore.updateHighlight(editingNoteId, { note: editingNoteValue, title: editingTitle });
    } catch (e) { console.error('save note failed', e); }
    setEditingNoteId(null);
    setEditingNoteValue('');
    setEditingTitle('');
    setFocusedHighlightId(editingNoteId); // Keep focus on the edited highlight
    refreshHighlights();
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteValue('');
  };

  const scrollToHighlight = (id) => {
    const el = document.querySelector(`[data-highlight-id="${id}"]`);
    if (!el) return;
    
    const container = contentRef.current;
    if (!container) return;
    
    // Get positions relative to the scrollable container
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    
    // Calculate the scroll position needed to center the highlight in the container
    const scrollTop = container.scrollTop;
    const elOffsetTop = elRect.top - containerRect.top + scrollTop;
    const containerCenter = container.clientHeight / 2;
    const targetScrollTop = elOffsetTop - containerCenter;
    
    // Scroll smoothly within the container
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
    
    // Optionally close the highlights panel to give better view
    setShowHighlightsPanel(false);
  };

  const appliedFavorite = current && overrides[current.id] && typeof overrides[current.id].isFavorite !== 'undefined'
    ? overrides[current.id].isFavorite
    : current?.isFavorite;

  // status overrides are stored in `overrides` and used by other flows; not displayed in reader header

  const persistOverrides = (next) => { setOverrides(next); try { localStorage.setItem(STORAGE_OVERRIDES, JSON.stringify(next)); } catch (e) { console.error('persistOverrides failed', e); } };

  const toggleFavorite = () => {
    if (!current) return;
    const next = { ...overrides };
    next[current.id] = { ...(next[current.id] || {}), isFavorite: !appliedFavorite };
    persistOverrides(next);
  };

  const changeStatus = (newStatus) => { if (!current) return; const next = { ...overrides }; next[current.id] = { ...(next[current.id] || {}), status: newStatus }; persistOverrides(next); };

  const handleUpdateTags = (articleId, newTags) => { if (!current || String(current.id) !== String(articleId)) return; setCurrent({ ...current, tags: newTags }); };

  const handleCompletion = (reflection) => {
    if (!current) return;
    changeStatus('archived');
    try {
      const notesKey = 'article_reflections_v1';
      const raw = localStorage.getItem(notesKey);
      const map = raw ? JSON.parse(raw) : {};
      map[current.id] = { reflection, at: new Date().toISOString() };
      localStorage.setItem(notesKey, JSON.stringify(map));
    } catch (e) { console.error('saving reflection failed', e); }
    setIsCompletionOpen(false);
  };

  // Render paragraph with offset-based highlights (paragraphIndex, start, end)
  const renderParagraph = (text, idx) => {
    const pHighlights = (highlights || []).filter(h => Number(h.paragraphIndex) === idx);
  // use an empty gap between paragraphs (blank line) instead of a visible border
  const pClass = 'mb-6';
  if (!pHighlights || pHighlights.length === 0) return <p key={idx} className={pClass}>{text}</p>;

    // sort and sanitize ranges
    const ranges = pHighlights
      .map(h => ({ ...h, start: Math.max(0, Math.min(Number(h.start) || 0, text.length)), end: Math.max(0, Math.min(Number(h.end) || 0, text.length)) }))
      .sort((a, b) => (a.start - b.start));

    const parts = [];
    let cursor = 0;
    for (const r of ranges) {
      // skip invalid or empty ranges
      if (r.end <= r.start) continue;
      if (r.start > cursor) {
        parts.push({ type: 'text', text: text.slice(cursor, r.start) });
      }
      // clamp end to text length
      const end = Math.min(r.end, text.length);
      const start = Math.max(r.start, cursor);
      if (end > start) {
        parts.push({ type: 'highlight', highlight: r, text: text.slice(start, end) });
        cursor = end;
      }
    }
    if (cursor < text.length) parts.push({ type: 'text', text: text.slice(cursor) });

    return (
  <p key={idx} className={pClass}>
        {parts.map((part, i) => part.type === 'text' ? (
          <span key={i}>{part.text}</span>
        ) : (
          (() => {
            const colorDef = HIGHLIGHT_COLORS.find(c => c.value === part.highlight.color);
            const bg = colorDef ? colorDef.light : '#fffbdd';
            const style = {
              backgroundColor: bg,
              padding: '0.08rem 0.24rem',
              borderRadius: 4,
              boxShadow: isDark ? 'inset 0 -6px 0 rgba(0,0,0,0.18)' : undefined,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            };
            return (
              <mark
                key={i}
                data-highlight-id={part.highlight.id}
                style={style}
                onClick={() => {
                  try {
                    // focus this single highlight in the panel (do NOT open the editor)
                    setFocusedHighlightId(part.highlight.id);
                    setShowHighlightsPanel(true);
                  } catch { /* ignore */ }
                }}
              >
                {part.text}
              </mark>
            );
          })()
        ))}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-6 pb-6 pl-6 pr-16 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <button onClick={goBack} className="text-sm text-muted-foreground hover:text-foreground mr-3 reader-button">← Back</button>
          </div>
        </div>

        <div className="mb-6">
          {current ? (
            <>
              <h1 className="text-3xl font-bold mb-2">{current.title}</h1>
              <p className="text-muted-foreground mb-4">
                {current.author && <span className="mr-2">{current.author}</span>}
                {current.readingTime && <span className="mr-2">• {current.readingTime}</span>}
                {current.dateAdded && <span className="mr-2">• {new Date(current.dateAdded).toLocaleDateString()}</span>}
                {current.url && (
                  <a href={current.url} target="_blank" rel="noreferrer" className="underline reader-link">Source</a>
                )}
              </p>

              <div className="flex items-center gap-2">
                {current.tags && <div className="flex flex-wrap gap-2">{current.tags.map(t => <span key={t} className="text-[12px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded reader-tag">{t}</span>)}</div>}
                <div className="ml-4">
                  <TagManager articleId={current.id} currentTags={current.tags || []} allTags={Array.from(new Set(mockArticles.flatMap(a => a.tags || [])))} onUpdateTags={handleUpdateTags} />
                </div>
              </div>
            </>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-2">No article selected</h1>
              <p className="text-muted-foreground mb-4">Open an article card to view it here.</p>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex gap-6 relative">
          <div className="flex-1 overflow-y-auto max-h-[70vh]" ref={contentRef}>
            {current ? (
              <article
                className="prose max-w-none text-reader-article"
                style={{
                  fontSize: `${fontSizePx}px`,
                  fontFamily: fontFamilyCss,
                  backgroundColor: 'transparent',
                  color: isDark ? '#e6eef8' : undefined,
                  padding: '0',
                }}
              >
                {!showImages && (
                  <style>{`.text-reader-article img { display: none !important; }`}</style>
                )}
                {paragraphs.length > 0 ? paragraphs.map((p, i) => renderParagraph(p, i)) : <p className="text-muted-foreground">No readable content available for this article.</p>}
              </article>
            ) : (
              <div className="text-center py-12"><p className="text-muted-foreground">No article data. Select an article from a list to read it.</p></div>
            )}
          </div>
        </div>
        {/* Highlights sidebar for desktop and mobile */}
        {/* Overlay for mobile when highlights panel is open */}
        {showHighlightsPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowHighlightsPanel(false)} />
        )}
        <div className="fixed top-0 right-0 h-full z-50 flex flex-col">
          {/* Minimized bar (desktop only) */}
          {!showHighlightsPanel && (
            <div className="w-10 h-full bg-card border-l border-border flex flex-col items-center pt-3 justify-between">
              <div className="flex flex-col items-center">
                <button onClick={() => setShowHighlightsPanel(true)} className="p-2 rounded bg-accent reader-button mb-2 hover:bg-accent/80" title="Show Highlights">
                  <StickyNote size={18} className="text-foreground" />
                </button>
              </div>

              <div className="flex flex-col items-center mb-3 space-y-2">
                <button onClick={() => toggleFavorite()} className="p-2 rounded reader-button" title="Favorite">
                  <Star size={16} className={appliedFavorite ? 'text-yellow-400' : 'text-muted-foreground'} />
                </button>
                <button onClick={() => changeStatus('rediscovery')} className="p-2 rounded reader-button" title="Rediscovery">
                  <RotateCcw size={16} className="text-muted-foreground" />
                </button>
                <button onClick={() => changeStatus('archived')} className="p-2 rounded reader-button" title="Archive">
                  <Archive size={16} className="text-muted-foreground" />
                </button>
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
                    <h3 className="font-semibold text-lg">Highlights</h3>
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
                          className={`px-3 py-1 rounded text-sm ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-primary text-white'} reader-button hover:opacity-90 transform hover:-translate-y-0.5 transition-all`}
                        >
                          Save
                        </button>
                        <button onClick={cancelEditingNote} className="px-3 py-1 bg-card border border-border rounded text-sm reader-button hover:bg-accent transform hover:-translate-y-0.5 transition-all">Cancel</button>
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
                              <strong className="text-sm">{h.title && h.title.length > 0 ? (h.title.length > 80 ? h.title.slice(0,80) + '…' : h.title) : 'No title yet'}</strong>
                            <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); scrollToHighlight(h.id); }} className="text-xs px-1.5 py-0.5 rounded reader-button hover:bg-accent hover:text-foreground transition-colors">Jump</button>
                              <button onClick={(e) => { e.stopPropagation(); setFocusedHighlightId(h.id); setEditingNoteId(h.id); setEditingTitle(h.title || ''); setEditingNoteValue(h.note || ''); setShowHighlightsPanel(true); }} className="text-xs px-1.5 py-0.5 rounded reader-button hover:bg-accent hover:text-foreground transition-colors">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); removeHighlight(h.id); }} className="text-xs px-1.5 py-0.5 rounded reader-button hover:bg-destructive/10 text-destructive hover:text-destructive/90 transition-colors">Delete</button>
                            </div>
                          </div>
                          <div className="text-[13px] text-muted-foreground">{h.note && h.note.length > 0 ? h.note : 'No annotation yet'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Bottom action group: Favorites, Rediscovery, Archive, Settings */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleFavorite()} className="p-2 rounded reader-button" title="Favorite">
                    <Star size={18} className={appliedFavorite ? 'text-yellow-400' : 'text-muted-foreground'} />
                  </button>
                  <button onClick={() => changeStatus('rediscovery')} className="p-2 rounded reader-button" title="Rediscovery">
                    <RotateCcw size={18} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => changeStatus('archived')} className="p-2 rounded reader-button" title="Archive">
                    <Archive size={18} className="text-muted-foreground" />
                  </button>
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
          <div style={{ position: 'fixed', left: selection.rect.left + window.scrollX, top: selection.rect.top + window.scrollY - 40, zIndex: 60 }}>
            <div className="flex gap-1 bg-card border border-border rounded shadow p-1">
              {HIGHLIGHT_COLORS.map(c => (
                <button 
                  key={c.value} 
                  onClick={() => applyHighlight(c.value)} 
                  title={c.name} 
                  style={{ background: c.light }} 
                  className="w-6 h-6 rounded reader-button hover:scale-110 transition-transform duration-200" 
                />
              ))}
              <button onClick={() => setSelection(null)} className="px-2 text-sm reader-button text-muted-foreground hover:text-foreground">Cancel</button>
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
        />
      </div>
    </div>
  );
};

export default TextReader;

