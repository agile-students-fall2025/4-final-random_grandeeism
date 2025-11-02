// Utility to apply filters and sorting to a list of articles
import { STATUS } from "../constants/statuses.js";

export function applyFiltersAndSort(articles = [], filters = {}) {
  const {
    query = "",
    tags = [],
    timeFilter = "all",
    mediaType = "all",
    sortBy = "dateAdded",
    status,
    favoritesFilter = "all",
    annotationsFilter = "all",
    feed,
    feedFilter
  } = filters || {};

  let result = articles.slice();
  
  // Feed filter (supports both 'feed' and 'feedFilter' for compatibility)
  const feedValue = feed || feedFilter;
  if (feedValue && feedValue !== "") {
    result = result.filter(a => a.source === feedValue || a.feedId === feedValue);
  }

  // Locked status/media filters are expected to be passed in via filters
  if (status && status !== "all") {
    // Map UI filter tokens to underlying article.status values.
    // - 'completed' should include rediscovery, archived, or fully-read items
    if (status === 'completed') {
      result = result.filter(a => a.status === STATUS.REDISCOVERY || a.status === STATUS.ARCHIVED || a.readProgress === 100);
    } else if (status === STATUS.ARCHIVED) {
      // Archived filter: match articles with archived status
      result = result.filter(a => a.status === STATUS.ARCHIVED);
    } else {
      // Normal case: expect status to match the article.status token (e.g., 'inbox', 'daily', 'continue', 'rediscovery')
      result = result.filter(a => a.status === status);
    }
  }

  if (mediaType && mediaType !== "all") {
    result = result.filter(a => {
      const mt = a.mediaType || (a.videoId || a.podcastUrl ? (a.podcastUrl ? 'podcast' : 'video') : 'article');
      if (mediaType === 'article') return mt === 'article';
      return mt === mediaType;
    });
  }

  // Favorites
  if (favoritesFilter === "favorites") {
    result = result.filter(a => a.isFavorite);
  } else if (favoritesFilter === "nonFavorites") {
    result = result.filter(a => !a.isFavorite);
  }

  // Annotations
  if (annotationsFilter === "annotated") {
    result = result.filter(a => a.hasAnnotations);
  } else if (annotationsFilter === "unannotated") {
    result = result.filter(a => !a.hasAnnotations);
  }

  // Tags (any match)
  if (Array.isArray(tags) && tags.length > 0) {
    result = result.filter(a => Array.isArray(a.tags) && a.tags.some(t => tags.includes(t)));
  }

  // Time filter based on readingTime like "6 min"
  if (timeFilter && timeFilter !== 'all') {
    result = result.filter(a => {
      const rt = a.readingTime ? parseInt(String(a.readingTime).replace(/[^0-9]/g, ''), 10) : 0;
      if (timeFilter === 'short') return rt > 0 && rt < 5;
      if (timeFilter === 'medium') return rt >=5 && rt <= 15;
      if (timeFilter === 'long') return rt > 15;
      return true;
    });
  }

  // Text query
  if (query && query.toString().trim() !== '') {
    const q = query.toString().toLowerCase().trim();
    result = result.filter(a => {
      const inTitle = a.title && a.title.toLowerCase().includes(q);
      const inAuthor = a.author && a.author.toLowerCase().includes(q);
      const inUrl = a.url && a.url.toLowerCase().includes(q);
      const inContent = a.content && a.content.toLowerCase().includes(q);
      const inTags = Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q));
      return inTitle || inAuthor || inUrl || inContent || inTags;
    });
  }

  // Sort
  const byDate = (a, b) => (new Date(b.dateAdded) - new Date(a.dateAdded));
  const byDateAsc = (a, b) => (new Date(a.dateAdded) - new Date(b.dateAdded));
  const byLength = (a, b) => {
    const ra = a.readingTime ? parseInt(String(a.readingTime).replace(/[^0-9]/g, ''), 10) || 0 : 0;
    const rb = b.readingTime ? parseInt(String(b.readingTime).replace(/[^0-9]/g, ''), 10) || 0 : 0;
    return ra - rb;
  };

  switch (sortBy) {
    case 'dateAdded':
      result.sort(byDate);
      break;
    case 'dateAddedOldest':
      result.sort(byDateAsc);
      break;
    case 'lengthAsc':
      result.sort(byLength);
      break;
    case 'lengthDesc':
      result.sort((a,b) => byLength(b,a));
      break;
    default:
      result.sort(byDate);
  }

  return result;
}

export default applyFiltersAndSort;
