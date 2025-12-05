/**
 * Mock Tags - Test data source
 * Aligned with Tag Mongoose schema
 * IDs use simple format: tag-1, tag-2, etc.
 */

const mockTags = [
  {
    "id": "tag-1",
    "name": "testing",
    "description": "Testing and QA",
    "category": "General",
    "color": "#6366f1",
    "articleCount": 0,
    "createdDate": "2024-01-01T00:00:00.000Z",
    "isSystem": false,
    "userId": "user-1",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "tag-2",
    "name": "patterns",
    "description": "Design and code patterns",
    "category": "General",
    "color": "#ec4899",
    "articleCount": 0,
    "createdDate": "2024-01-02T00:00:00.000Z",
    "isSystem": false,
    "userId": "user-1",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  {
    "id": "tag-3",
    "name": "quality",
    "description": "Code quality",
    "category": "General",
    "color": "#f59e0b",
    "articleCount": 0,
    "createdDate": "2024-01-03T00:00:00.000Z",
    "isSystem": false,
    "userId": "user-2",
    "createdAt": "2024-01-03T00:00:00.000Z",
    "updatedAt": "2024-01-03T00:00:00.000Z"
  },
  {
    "id": "tag-4",
    "name": "important",
    "description": "Important articles",
    "category": "General",
    "color": "#ef4444",
    "articleCount": 0,
    "createdDate": "2024-01-04T00:00:00.000Z",
    "isSystem": false,
    "userId": "user-1",
    "createdAt": "2024-01-04T00:00:00.000Z",
    "updatedAt": "2024-01-04T00:00:00.000Z"
  }
];

module.exports = { mockTags };
