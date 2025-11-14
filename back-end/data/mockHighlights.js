/**
 * Mock highlights/annotations data for development and testing
 * This will be replaced with MongoDB Highlight model in Sprint 3
 */

const mockHighlights = [
  {
    id: 'highlight-1',
    articleId: '3',
    userId: 'user-1',
    text: 'User interfaces should be intuitive and accessible',
    annotations: {
      title: 'Intuitive & accessible UIs',
      note: 'Important principle for UX design'
    },
    color: '#fef08a',
    position: {
      start: 150,
      end: 200
    },
    createdAt: new Date('2024-01-13T14:30:00Z'),
    updatedAt: new Date('2024-01-13T14:30:00Z')
  },
  {
    id: 'highlight-2',
    articleId: '3',
    userId: 'user-1',
    text: 'Design systems help maintain consistency',
    annotations: {
      title: 'Design systems for consistency',
      note: 'Consider implementing for our project'
    },
    color: '#bfdbfe',
    position: {
      start: 450,
      end: 490
    },
    createdAt: new Date('2024-01-13T15:00:00Z'),
    updatedAt: new Date('2024-01-13T15:00:00Z')
  },
  {
    id: 'highlight-3',
    articleId: '4',
    userId: 'user-1',
    text: 'JavaScript async/await simplifies promise handling',
    annotations: {
      title: 'Async/await simplifies promises',
      note: 'Use this pattern more often'
    },
    color: '#86efac',
    position: {
      start: 320,
      end: 375
    },
    createdAt: new Date('2024-01-12T10:15:00Z'),
    updatedAt: new Date('2024-01-12T10:15:00Z')
  },
  {
    id: 'highlight-4',
    articleId: '6',
    userId: 'user-1',
    text: 'TypeScript generics provide type safety with flexibility',
    annotations: {
      title: 'TypeScript generics for type safety',
      note: null
    },
    color: '#fef08a',
    position: {
      start: 680,
      end: 735
    },
    createdAt: new Date('2024-01-10T16:45:00Z'),
    updatedAt: new Date('2024-01-10T16:45:00Z')
  },
  {
    id: 'highlight-5',
    articleId: '10',
    userId: 'user-1',
    text: 'Database indexing can dramatically improve query performance',
    annotations: {
      title: 'Database indexing boosts query performance',
      note: 'Apply to our user lookup queries'
    },
    color: '#fca5a5',
    position: {
      start: 890,
      end: 950
    },
    createdAt: new Date('2024-01-06T11:20:00Z'),
    updatedAt: new Date('2024-01-06T11:25:00Z')
  }
];

module.exports = { mockHighlights };
