// Simple highlights storage for development (persists to localStorage)
const STORAGE_KEY = 'mock_highlights_v1';

const loadAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load highlights', e);
    return [];
  }
};

const saveAll = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save highlights', e);
  }
};

export const getHighlightsForArticle = (articleId) => {
  const all = loadAll();
  return all
    .filter(h => String(h.articleId) === String(articleId))
    // ensure a title field exists for each highlight (migration/default)
    .map(h => ({ ...(h || {}), title: typeof h.title === 'string' ? h.title : '' }))
    .sort((a, b) => {
      // sort by paragraphIndex then start offset to make rendering deterministic
      const pa = (typeof a.paragraphIndex === 'number') ? a.paragraphIndex : 0;
      const pb = (typeof b.paragraphIndex === 'number') ? b.paragraphIndex : 0;
      if (pa !== pb) return pa - pb;
      const sa = (typeof a.start === 'number') ? a.start : 0;
      const sb = (typeof b.start === 'number') ? b.start : 0;
      return sa - sb;
    });
};

export const addHighlight = (highlight) => {
  const all = loadAll();
  // ensure title exists
  const next = { ...(highlight || {}), title: typeof highlight.title === 'string' ? highlight.title : '' };
  all.push(next);
  saveAll(all);
  return next;
};

export const updateHighlight = (id, patch) => {
  const all = loadAll();
  const idx = all.findIndex(h => h.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch };
  saveAll(all);
  return all[idx];
};

export const deleteHighlight = (id) => {
  const all = loadAll();
  const next = all.filter(h => h.id !== id);
  saveAll(next);
  return true;
};

export const clearAllHighlights = () => {
  saveAll([]);
};

// Simple helper to generate ids
export const makeId = (prefix = '') => `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

export default {
  getHighlightsForArticle,
  addHighlight,
  updateHighlight,
  deleteHighlight,
  clearAllHighlights,
  makeId,
};
