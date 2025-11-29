const express = require('express');
const router = express.Router();

// In-memory store for demo; replace with DB in production
let stacks = [];

// GET /api/stacks - Get all stacks
router.get('/', (req, res) => {
  res.json({ success: true, data: stacks });
});

// POST /api/stacks - Create a new stack
router.post('/', (req, res) => {
  const { name, query, filters } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Stack name is required' });
  }
  const newStack = {
    id: 'stack-' + Date.now(),
    name,
    query: query || '',
    filters: filters || {},
  };
  stacks.push(newStack);
  res.status(201).json({ success: true, data: newStack });
});

// DELETE /api/stacks/:id - Delete a stack
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const prevLen = stacks.length;
  stacks = stacks.filter(stack => stack.id !== id);
  if (stacks.length === prevLen) {
    return res.status(404).json({ success: false, message: 'Stack not found' });
  }
  res.json({ success: true });
});

module.exports = router;
