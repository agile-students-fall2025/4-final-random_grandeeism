// Shared tag cache & resolution utilities
// Ensures consistent tag name resolution across components (ArticleCard, TextReader, etc.)
// Fetch function signature expected: async () => ({ data: [ { id, name, ... } ] })

let TAG_CACHE = null; // array of tag objects
let TAG_MAP = {}; // id -> name
let LOADING_PROMISE = null; // in-flight fetch promise

export function isTagCacheReady() {
  return TAG_CACHE !== null && Object.keys(TAG_MAP).length > 0;
}

export async function ensureTagsLoaded(fetchFn) {
  if (TAG_CACHE && Object.keys(TAG_MAP).length > 0) {
    return { tags: TAG_CACHE, map: TAG_MAP };
  }
  if (!LOADING_PROMISE) {
    LOADING_PROMISE = (async () => {
      try {
        const res = await fetchFn();
        const tags = res?.data || [];
        TAG_CACHE = tags.slice();
        TAG_MAP = Object.fromEntries(tags.map(t => [String(t.id), t.name]));
      } catch (e) {
        console.error('ensureTagsLoaded failed', e);
        TAG_CACHE = TAG_CACHE || [];
      } finally {
        LOADING_PROMISE = null;
      }
    })();
  }
  await LOADING_PROMISE;
  return { tags: TAG_CACHE, map: TAG_MAP };
}

export function getTagName(idOrName) {
  if (idOrName == null) return '';
  const s = String(idOrName);
  
  // Check if this looks like a MongoDB ObjectId (24-character hexadecimal string)
  // or a numeric ID
  const isObjectId = /^[a-f0-9]{24}$/i.test(s);
  const isNumericId = /^\d+$/.test(s);
  
  // If it's not an ID format, assume it's already a tag name
  if (!isObjectId && !isNumericId) return s;
  
  // If it's an ID but mapping not ready yet, return empty to avoid flashing raw ID
  if (!TAG_MAP[s]) return '';
  
  return TAG_MAP[s];
}

export function mergeTags(newTags) {
  if (!Array.isArray(newTags)) return;
  let changed = false;
  if (!TAG_CACHE) TAG_CACHE = [];
  newTags.forEach(t => {
    if (!t || t.id == null) return;
    const key = String(t.id);
    if (!TAG_MAP[key]) {
      TAG_MAP[key] = t.name;
      changed = true;
    }
    if (!TAG_CACHE.some(x => x.id === t.id)) {
      TAG_CACHE.push(t);
      changed = true;
    }
  });
  return changed;
}

export function addSingleTag(tagObj) {
  if (!tagObj || tagObj.id == null) return false;
  return mergeTags([tagObj]);
}

export function getTagMapSnapshot() {
  return { ...TAG_MAP }; // shallow copy for React state usage
}

export function invalidateTagCache() {
  TAG_CACHE = null;
  TAG_MAP = {};
  LOADING_PROMISE = null;
}
