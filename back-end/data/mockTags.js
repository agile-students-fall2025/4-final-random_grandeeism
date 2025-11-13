/**
 * Mock tags data for development and testing
 * This will be replaced with MongoDB Tag model in Sprint 3
 */

const mockTags = [
  {
    "id": "tag-1",
    "name": "javascript",
    "color": "#f7df1e",
    "description": "JavaScript programming language",
    "articleCount": 5,
    "createdAt": new Date("2024-01-01T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-15T00:00:00.000Z")
  },
  {
    "id": "tag-2",
    "name": "react",
    "color": "#61dafb",
    "description": "React library for building UIs",
    "articleCount": 3,
    "createdAt": new Date("2024-01-02T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-14T00:00:00.000Z")
  },
  {
    "id": "tag-3",
    "name": "css",
    "color": "#264de4",
    "description": "Cascading Style Sheets",
    "articleCount": 4,
    "createdAt": new Date("2024-01-03T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-13T00:00:00.000Z"),
    "updatedAt": new Date("2025-11-13T17:53:32.631Z")
  },
  {
    "id": "tag-4",
    "name": "typescript",
    "color": "#3178c6",
    "description": "TypeScript programming language",
    "articleCount": 3,
    "createdAt": new Date("2024-01-04T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-12T00:00:00.000Z")
  },
  {
    "id": "tag-5",
    "name": "web-development",
    "color": "#ff6b6b",
    "description": "General web development topics",
    "articleCount": 2,
    "createdAt": new Date("2024-01-05T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-14T00:00:00.000Z")
  },
  {
    "id": "tag-6",
    "name": "nodejs",
    "color": "#68a063",
    "description": "Node.js runtime environment",
    "articleCount": 2,
    "createdAt": new Date("2024-01-06T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-15T00:00:00.000Z")
  },
  {
    "id": "tag-7",
    "name": "backend",
    "color": "#8b5cf6",
    "description": "Backend development",
    "articleCount": 3,
    "createdAt": new Date("2024-01-07T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-11T00:00:00.000Z")
  },
  {
    "id": "tag-8",
    "name": "frontend",
    "color": "#ec4899",
    "description": "Frontend development",
    "articleCount": 4,
    "createdAt": new Date("2024-01-08T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-13T00:00:00.000Z")
  },
  {
    "id": "tag-9",
    "name": "api",
    "color": "#10b981",
    "description": "API design and development",
    "articleCount": 2,
    "createdAt": new Date("2024-01-09T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-10T00:00:00.000Z")
  },
  {
    "id": "tag-10",
    "name": "database",
    "color": "#f59e0b",
    "description": "Database design and optimization",
    "articleCount": 2,
    "createdAt": new Date("2024-01-10T00:00:00.000Z"),
    "lastUsed": new Date("2024-01-11T00:00:00.000Z")
  }
];

module.exports = { mockTags };
