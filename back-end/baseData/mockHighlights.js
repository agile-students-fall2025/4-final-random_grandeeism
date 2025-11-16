/** Base highlights now mirror data format (numeric ids, ISO strings). */
const mockHighlights = [
  {
    "id": 1,
    "articleId": 3,
    "userId": 1,
    "text": "User interfaces should be intuitive and accessible",
    "annotations": {
      "title": "Intuitive & accessible UIs",
      "note": "Important principle for UX design"
    },
    "color": "#fef08a",
    "position": {
      "start": 150,
      "end": 200
    },
    "createdAt": "2024-01-13T14:30:00.000Z",
    "updatedAt": "2024-01-13T14:30:00.000Z"
  },
  {
    "id": 2,
    "articleId": 3,
    "userId": 1,
    "text": "Design systems help maintain consistency",
    "annotations": {
      "title": "Design systems for consistency",
      "note": "Consider implementing for our project"
    },
    "color": "#bfdbfe",
    "position": {
      "start": 450,
      "end": 490
    },
    "createdAt": "2024-01-13T15:00:00.000Z",
    "updatedAt": "2024-01-13T15:00:00.000Z"
  },
  {
    "id": 3,
    "articleId": 4,
    "userId": 1,
    "text": "JavaScript async/await simplifies promise handling",
    "annotations": {
      "title": "Async/await simplifies promises",
      "note": "Use this pattern more often"
    },
    "color": "#86efac",
    "position": {
      "start": 320,
      "end": 375
    },
    "createdAt": "2024-01-12T10:15:00.000Z",
    "updatedAt": "2024-01-12T10:15:00.000Z"
  },
  {
    "id": 4,
    "articleId": 6,
    "userId": 1,
    "text": "TypeScript generics provide type safety with flexibility",
    "annotations": {
      "title": "TypeScript generics for type safety",
      "note": null
    },
    "color": "#fef08a",
    "position": {
      "start": 680,
      "end": 735
    },
    "createdAt": "2024-01-10T16:45:00.000Z",
    "updatedAt": "2024-01-10T16:45:00.000Z"
  },
  {
    "id": 5,
    "articleId": 10,
    "userId": 1,
    "text": "Database indexing can dramatically improve query performance",
    "annotations": {
      "title": "Database indexing boosts query performance",
      "note": "Apply to our user lookup queries"
    },
    "color": "#fca5a5",
    "position": {
      "start": 890,
      "end": 950
    },
    "createdAt": "2024-01-06T11:20:00.000Z",
    "updatedAt": "2024-01-06T11:25:00.000Z"
  }
];

module.exports = { mockHighlights };
