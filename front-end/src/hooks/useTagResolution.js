/**
 * useTagResolution Hook
 * 
 * Provides tag resolution functionality across all components
 * Fetches tags once and provides utilities to resolve tag IDs to names
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { tagsAPI } from "../services/api.js";

export const useTagResolution = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tags function
  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tagsAPI.getAll();
      
      if (response.success && response.data) {
        setTags(response.data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch tags');
      setTags([]);
      setLoading(false);
    }
  }, []);

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Create tag mapping from ID to name
  const tagMapping = useMemo(() => {
    const mapping = {};
    tags.forEach(tag => {
      mapping[tag.id] = tag.name;
    });
    return mapping;
  }, [tags]);

  // Function to resolve a single tag ID to name
  const resolveTagId = useCallback((tagId) => {
    return tagMapping[tagId] || tagId;
  }, [tagMapping]);

  // Function to resolve tag name to ID
  const resolveTagName = useCallback((tagName) => {
    const tag = tags.find(t => t.name === tagName);
    return tag ? tag.id : tagName;
  }, [tags]);

  // Function to resolve article tags from IDs to names
  const resolveArticleTags = useCallback((articles) => {
    if (!Array.isArray(articles)) return articles;
    
    return articles.map(article => ({
      ...article,
      tags: Array.isArray(article.tags) 
        ? article.tags.map(tagId => tagMapping[tagId] || tagId)
        : []
    }));
  }, [tagMapping]);

  return {
    tags,
    loading,
    error,
    tagMapping,
    resolveTagId,
    resolveTagName,
    resolveArticleTags,
    refreshTags: fetchTags
  };
};

export default useTagResolution;