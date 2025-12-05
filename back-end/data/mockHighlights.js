/**
 * Mock Highlights - Test data source
 * Aligned with Highlight Mongoose schema
 * IDs use simple format: highlight-1, highlight-2, etc.
 */

const mockHighlights = [
  {
    "id": "highlight-1",
    "articleId": "article-2",
    "userId": "user-1",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    "annotations": {
      "title": "Testing Concept",
      "note": "Important testing concept"
    },
    "color": "#fef08a",
    "position": {
      "start": 0,
      "end": 100,
      "startContainer": "",
      "endContainer": "",
      "xpath": "",
      "cssSelector": ""
    },
    "tags": ["testing"],
    "isPublic": false,
    "metadata": {},
    "createdAt": "2024-01-02T12:00:00.000Z",
    "updatedAt": "2024-01-02T12:00:00.000Z"
  },
  {
    "id": "highlight-2",
    "articleId": "article-3",
    "userId": "user-2",
    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod.",
    "annotations": {
      "title": "Best Practice",
      "note": "Best practice reference"
    },
    "color": "#86efac",
    "position": {
      "start": 0,
      "end": 80,
      "startContainer": "",
      "endContainer": "",
      "xpath": "",
      "cssSelector": ""
    },
    "tags": ["quality"],
    "isPublic": false,
    "metadata": {},
    "createdAt": "2024-01-03T15:30:00.000Z",
    "updatedAt": "2024-01-03T15:30:00.000Z"
  }
];

module.exports = { mockHighlights };
