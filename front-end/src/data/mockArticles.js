// Mock article data for development and testing
export const mockArticles = [
  {
    id: '1',
    title: 'Welcome - Test Article Title',
    url: 'https://examplelink.com/welcome-test-article',
    author: 'John Doe',
    readingTime: '1 min',
    status: 'inbox',
    isFavorite: false,
    tags: ['welcome', 'test'],
    dateAdded: new Date('2024-01-15'),
    hasAnnotations: false,
    readProgress: 0
  },
  {
    id: '2',
    title: 'The Future of Web Development',
    url: 'https://examplelink.com/future-web-dev',
    author: 'Jane Smith',
    readingTime: '6 min',
    status: 'inbox',
    isFavorite: false,
    tags: ['web-development', 'technology'],
    dateAdded: new Date('2024-01-14'),
    hasAnnotations: false,
    readProgress: 0
  },
  {
    id: '3',
    title: 'Building Better User Interfaces',
    url: 'https://examplelink.com/better-ui',
    author: 'Mike Johnson',
    readingTime: '4 min',
    status: 'dailyReading',
    isFavorite: true,
    tags: ['ui', 'design', 'ux'],
    dateAdded: new Date('2024-01-13'),
    hasAnnotations: true,
    readProgress: 0
  },
  {
    id: '4',
    title: 'The Future of JavaScript - Tech Podcast',
    url: 'https://example.com/future-javascript-podcast',
    author: 'Tech Podcast Network',
    readingTime: '52 min',
    status: 'inProgress',
    isFavorite: false,
    tags: ['javascript', 'podcast', 'web-development', 'technology'],
    dateAdded: new Date('2024-01-12'),
    hasAnnotations: true,
    readProgress: 35
  },
  {
    id: '5',
    title: 'CSS Grid vs Flexbox: When to Use What',
    url: 'https://examplelink.com/css-grid-flexbox',
    author: 'David Brown',
    readingTime: '5 min',
    status: 'inbox',
    isFavorite: false,
    tags: ['css', 'layout', 'frontend'],
    dateAdded: new Date('2024-01-11'),
    hasAnnotations: false,
    readProgress: 0
  },
  {
    id: '6',
    title: 'Mastering TypeScript: Advanced Patterns',
    url: 'https://examplelink.com/typescript-advanced-patterns',
    author: 'TypeScript Expert',
    readingTime: '18 min',
    status: 'inProgress',
    isFavorite: false,
    tags: ['typescript', 'programming'],
    dateAdded: new Date('2024-01-10'),
    hasAnnotations: true,
    readProgress: 65
  },
  {
    id: '7',
    title: 'Modern CSS Techniques',
    url: 'https://examplelink.com/modern-css',
    author: 'Alex Rodriguez',
    readingTime: '3 min',
    status: 'rediscovery',
    isFavorite: false,
    tags: ['css', 'modern', 'techniques'],
    dateAdded: new Date('2024-01-09'),
    hasAnnotations: false,
    readProgress: 100
  },
  {
    id: '8',
    title: 'TypeScript Best Practices',
    url: 'https://examplelink.com/typescript-best-practices',
    author: 'Emma Davis',
    readingTime: '9 min',
    status: 'dailyReading',
    isFavorite: false,
    tags: ['typescript', 'best-practices', 'development'],
    dateAdded: new Date('2024-01-08'),
    hasAnnotations: false,
    readProgress: 0
  },
  {
    id: '9',
    title: 'API Design Principles',
    url: 'https://examplelink.com/api-design',
    author: 'Tom Wilson',
    readingTime: '6 min',
    status: 'inbox',
    isFavorite: false,
    tags: ['api', 'design', 'backend'],
    dateAdded: new Date('2024-01-07'),
    hasAnnotations: false,
    readProgress: 0
  },
  {
    id: '10',
    title: 'Database Optimization Strategies',
    url: 'https://examplelink.com/database-optimization',
    author: 'Rachel Green',
    readingTime: '10 min',
    status: 'dailyReading',
    isFavorite: true,
    tags: ['database', 'optimization', 'performance'],
    dateAdded: new Date('2024-01-06'),
    hasAnnotations: true,
    readProgress: 0
  },
  {
    id: '11',
    title: 'Advanced React Patterns',
    url: 'https://examplelink.com/advanced-react-patterns',
    author: 'Kevin Park',
    readingTime: '12 min',
    status: 'dailyReading',
    isFavorite: false,
    tags: ['react', 'patterns', 'advanced', 'javascript'],
    dateAdded: new Date('2024-01-05'),
    hasAnnotations: true,
    readProgress: 0
  },
  {
    id: '12',
    title: 'Microservices Architecture Guide',
    url: 'https://examplelink.com/microservices-guide',
    author: 'Maria Garcia',
    readingTime: '15 min',
    status: 'dailyReading',
    isFavorite: true,
    tags: ['microservices', 'architecture', 'backend', 'scalability'],
    dateAdded: new Date('2024-01-04'),
    hasAnnotations: true,
    readProgress: 0
  },
  {
    id: '13',
    title: 'Docker Best Practices',
    url: 'https://examplelink.com/docker-best-practices',
    author: 'James Wilson',
    readingTime: '8 min',
    status: 'rediscovery',
    isFavorite: false,
    tags: ['docker', 'devops', 'containers', 'deployment'],
    dateAdded: new Date('2024-01-03'),
    hasAnnotations: true,
    readProgress: 100
  },
  {
    id: '14',
    title: 'GraphQL vs REST API',
    url: 'https://examplelink.com/graphql-vs-rest',
    author: 'Sophie Lee',
    readingTime: '9 min',
    status: 'rediscovery',
    isFavorite: true,
    tags: ['graphql', 'rest', 'api', 'comparison'],
    dateAdded: new Date('2024-01-02'),
    hasAnnotations: true,
    readProgress: 100
  },
  {
    id: '15',
    title: 'Machine Learning Fundamentals',
    url: 'https://examplelink.com/ml-fundamentals',
    author: 'Dr. Robert Kim',
    readingTime: '20 min',
    status: 'rediscovery',
    isFavorite: false,
    tags: ['machine-learning', 'ai', 'fundamentals', 'data-science'],
    dateAdded: new Date('2024-01-01'),
    hasAnnotations: true,
    readProgress: 100
  },
  {
    id: '16',
    title: 'Node.js Performance Optimization',
    url: 'https://examplelink.com/nodejs-performance',
    author: 'Alex Thompson',
    readingTime: '14 min',
    status: 'inProgress',
    isFavorite: true,
    tags: ['nodejs', 'performance', 'backend', 'optimization'],
    dateAdded: new Date('2024-01-15'),
    hasAnnotations: true,
    readProgress: 50
  }
];

// Helper function to filter articles by status
export const getArticlesByStatus = (articles, status) => {
  return articles.filter(article => article.status === status);
};

// Helper function to get article counts by status
export const getArticleCounts = (articles) => {
  const counts = {
    inbox: 0,
    dailyReading: 0,
    inProgress: 0,  // This maps to "Continue Reading"
    rediscovery: 0,
    archived: 0
  };
  
  articles.forEach(article => {
    if (counts.hasOwnProperty(article.status)) {
      counts[article.status]++;
    }
  });
  
  return counts;
};
