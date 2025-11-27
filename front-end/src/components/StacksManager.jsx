import React, { useEffect, useState } from 'react';
import { getStacks, createStack, deleteStack } from '../api/stacks';

export default function StacksManager() {
  const [stacks, setStacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStack, setNewStack] = useState({ name: '', query: '', filters: {} });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadStacks();
  }, []);

  async function loadStacks() {
    setLoading(true);
    setError(null);
    try {
      const res = await getStacks();
      setStacks(res.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createStack(newStack);
      setNewStack({ name: '', query: '', filters: {} });
      loadStacks();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await deleteStack(id);
      loadStacks();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Stacks Manager</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Stack Name"
          value={newStack.name}
          onChange={e => setNewStack({ ...newStack, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Query (optional)"
          value={newStack.query}
          onChange={e => setNewStack({ ...newStack, query: e.target.value })}
        />
        <button type="submit" disabled={creating || !newStack.name}>
          {creating ? 'Creating...' : 'Add Stack'}
        </button>
      </form>
      {loading ? (
        <div>Loading stacks...</div>
      ) : (
        <ul>
          {stacks && stacks.length > 0 ? (
            stacks.map(stack => (
              <li key={stack.id || stack._id}>
                <strong>{stack.name}</strong> {stack.query && <span>({stack.query})</span>}
                <button onClick={() => handleDelete(stack.id || stack._id)} style={{ marginLeft: 8 }}>
                  Delete
                </button>
              </li>
            ))
          ) : (
            <li>No stacks found.</li>
          )}
        </ul>
      )}
    </div>
  );
}
