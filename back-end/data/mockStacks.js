// mockStacks.js
// Example mock data for saved search stacks

module.exports = [
  {
    id: "stack-1",
    name: "Unread JavaScript",
    query: "javascript",
    filters: { status: "inbox", tag: "javascript" }
  },
  {
    id: "stack-2",
    name: "Favorites",
    query: "",
    filters: { isFavorite: true }
  },
  {
    id: "stack-3",
    name: "Articles with Tag: AI",
    query: "",
    filters: { tag: "ai" }
  },
  {
    id: "stack-4",
    name: "Read in October",
    query: "",
    filters: { status: "archived", dateRange: { from: "2025-10-01", to: "2025-10-31" } }
  }
];
