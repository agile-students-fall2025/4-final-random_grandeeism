import React, { useEffect, useState, useCallback } from "react";
import { getStacks, createStack, deleteStack } from "../api/stacks";
import { StacksContext } from "./StacksContextValue";

export function StacksProvider({ children }) {
  const [stacks, setStacks] = useState([]);
  const [currentStack, setCurrentStack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load stacks from backend
  const loadStacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStacks();
      setStacks(res.data || res);
    } catch (e) {
      console.error('Failed to load stacks:', e);
      setError(e.message);
      setStacks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStacks();
  }, [loadStacks]);

  // Add a new stack
  const addStack = async (stack) => {
    await createStack(stack);
    await loadStacks();
  };

  // Delete a stack
  const removeStack = async (id) => {
    await deleteStack(id);
    await loadStacks();
  };

  // Load a specific stack (set as current)
  const loadStack = useCallback((stackId) => {
    const stack = stacks.find(s => s.id === stackId);
    if (stack) {
      setCurrentStack(stack);
    }
  }, [stacks]);

  // Clear current stack
  const clearCurrentStack = useCallback(() => {
    setCurrentStack(null);
  }, []);

  return (
    <StacksContext.Provider value={{ stacks, currentStack, loading, error, addStack, removeStack, loadStack, clearCurrentStack, reload: loadStacks }}>
      {children}
    </StacksContext.Provider>
  );
}
