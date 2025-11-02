/**
 * @file /src/data/mockArticles.js
 * @description Mock article data for development and testing
 */

import { STATUS } from "../constants/statuses.js";

export const mockArticles = [
  {
    id: '1',
    title: 'Welcome - Test Article Title',
    url: 'https://examplelink.com/welcome-test-article',
    author: 'John Doe',
    readingTime: '1 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['welcome', 'test'],
    dateAdded: new Date('2024-01-15'),
    hasAnnotations: false,
    readProgress: 0,
    content: `This is the first paragraph. You can select this text to test highlighting.
This is the second paragraph. The component logic splits text based on newlines, so this will appear as a separate paragraph.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
Here is some more text.
And more.
And more.
And more.
And more.
You can scroll down to test the completion modal.
This is the very last line of the article.`
  },
  {
    id: '2',
    title: 'The Future of Web Development',
    url: 'https://examplelink.com/future-web-dev',
    author: 'Jane Smith',
    readingTime: '6 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['web-development', 'technology'],
    dateAdded: new Date('2024-01-14'),
    hasAnnotations: false,
    readProgress: 0,
    content: 'The future of web development looks bright, with new technologies emerging...'
  },
  {
    id: '3',
    title: 'Building Better User Interfaces',
    url: 'https://examplelink.com/better-ui',
    author: 'Mike Johnson',
    readingTime: '4 min',
    status: STATUS.DAILY,
    isFavorite: true,
    tags: ['ui', 'design', 'ux'],
    dateAdded: new Date('2024-01-13'),
    hasAnnotations: true,
    readProgress: 0,
    content: 'Building better user interfaces requires a deep understanding of user needs.'
  },
  {
    id: '4',
    title: 'The Future of JavaScript - Tech Podcast',
    url: 'https://example.com/future-javascript-podcast',
    author: 'Tech Podcast Network',
    readingTime: '52 min',
    status: STATUS.CONTINUE,
    isFavorite: false,
    tags: ['javascript', 'podcast', 'web-development', 'technology'],
    dateAdded: new Date('2024-01-12'),
    hasAnnotations: true,
    readProgress: 35,
    mediaType: 'podcast',
    podcastUrl: 'https://example.com/podcast.mp3'
  },
  {
    id: '5',
    title: 'CSS Grid vs Flexbox: When to Use What',
    url: 'https://examplelink.com/css-grid-flexbox',
    author: 'David Brown',
    readingTime: '5 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['css', 'layout', 'frontend'],
    dateAdded: new Date('2024-01-11'),
    hasAnnotations: false,
    readProgress: 0,
    content: 'CSS Grid and Flexbox are powerful tools, but they solve different problems.'
  },
  {
    id: '6',
    title: 'Mastering TypeScript: Advanced Patterns',
    url: 'https://examplelink.com/typescript-advanced-patterns',
    author: 'TypeScript Expert',
    readingTime: '18 min',
    status: STATUS.CONTINUE,
    isFavorite: false,
    tags: ['typescript', 'programming'],
    dateAdded: new Date('2024-01-10'),
    hasAnnotations: true,
    readProgress: 65,
    content: 'Advanced patterns in TypeScript can significantly improve code quality.'
  },
  {
    id: '7',
    title: 'Modern CSS Techniques',
    url: 'https://examplelink.com/modern-css',
    author: 'Alex Rodriguez',
    readingTime: '3 min',
    status: STATUS.REDISCOVERY,
    isFavorite: false,
    tags: ['css', 'modern', 'techniques'],
    dateAdded: new Date('2024-01-09'),
    hasAnnotations: false,
    readProgress: 100,
    content: 'Modern CSS offers amazing possibilities for styling websites.'
  },
  {
    id: '8',
    title: 'TypeScript Best Practices',
    url: 'https://examplelink.com/typescript-best-practices',
    author: 'Emma Davis',
    readingTime: '9 min',
    status: STATUS.DAILY,
    isFavorite: false,
    tags: ['typescript', 'best-practices', 'development'],
    dateAdded: new Date('2024-01-08'),
    hasAnnotations: false,
    readProgress: 0,
    content: 'Following best practices in TypeScript leads to maintainable code.'
  },
  {
    id: '9',
    title: 'API Design Principles',
    url: 'https://examplelink.com/api-design',
    author: 'Tom Wilson',
    readingTime: '6 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['api', 'design', 'backend'],
    dateAdded: new Date('2024-01-07'),
    hasAnnotations: false,
    readProgress: 0,
    content: 'Good API design is crucial for a successful software product.'
  },
  {
    id: '10',
    title: 'Database Optimization Strategies',
    url: 'https://examplelink.com/database-optimization',
    author: 'Rachel Green',
    readingTime: '10 min',
    status: STATUS.DAILY,
    isFavorite: true,
    tags: ['database', 'optimization', 'performance'],
    dateAdded: new Date('2024-01-06'),
    hasAnnotations: true,
    readProgress: 0,
    content: 'Database optimization can drastically improve application speed.'
  },
  {
    id: '11',
    title: 'Advanced React Patterns',
    url: 'https://examplelink.com/advanced-react-patterns',
    author: 'Kevin Park',
    readingTime: '12 min',
    status: STATUS.DAILY,
    isFavorite: false,
    tags: ['react', 'patterns', 'advanced', 'javascript'],
    dateAdded: new Date('2024-01-05'),
    hasAnnotations: true,
    readProgress: 0,
    content: 'Learn about render props, hooks, and other advanced React patterns.'
  },
  {
    id: '12',
    title: 'Microservices Architecture Guide',
    url: 'https://examplelink.com/microservices-guide',
    author: 'Maria Garcia',
    readingTime: '15 min',
    status: STATUS.DAILY,
    isFavorite: true,
    tags: ['microservices', 'architecture', 'backend', 'scalability'],
    dateAdded: new Date('2024-01-04'),
    hasAnnotations: true,
    readProgress: 0,
    content: 'Microservices can improve scalability and maintainability, but come with trade-offs.'
  },
  {
    id: '13',
    title: 'Docker Best Practices',
    url: 'https://examplelink.com/docker-best-practices',
    author: 'James Wilson',
    readingTime: '8 min',
    status: STATUS.REDISCOVERY,
    isFavorite: false,
    tags: ['docker', 'devops', 'containers', 'deployment'],
    dateAdded: new Date('2024-01-03'),
    hasAnnotations: true,
    readProgress: 100,
    content: 'Use multi-stage builds and keep your Docker images small.'
  },
  {
    id: '14',
    title: 'GraphQL vs REST API',
    url: 'https://examplelink.com/graphql-vs-rest',
    author: 'Sophie Lee',
    readingTime: '9 min',
    status: STATUS.REDISCOVERY,
    isFavorite: true,
    tags: ['graphql', 'rest', 'api', 'comparison'],
    dateAdded: new Date('2024-01-02'),
    hasAnnotations: true,
    readProgress: 100,
    content: 'GraphQL offers flexibility, while REST provides simplicity and caching.'
  },
  {
    id: '15',
    title: 'Machine Learning Fundamentals',
    url: 'https://examplelink.com/ml-fundamentals',
    author: 'Dr. Robert Kim',
    readingTime: '20 min',
    status: STATUS.REDISCOVERY,
    isFavorite: false,
    tags: ['machine-learning', 'ai', 'fundamentals', 'data-science'],
    dateAdded: new Date('2024-01-01'),
    hasAnnotations: true,
    readProgress: 100,
    content: 'Supervised, unsupervised, and reinforcement learning are the main types.'
  },
  {
    id: '16',
    title: 'Node.js Performance Optimization',
    url: 'https://examplelink.com/nodejs-performance',
    author: 'Alex Thompson',
    readingTime: '14 min',
    status: STATUS.CONTINUE,
    isFavorite: true,
    tags: ['nodejs', 'performance', 'backend', 'optimization'],
    dateAdded: new Date('2024-01-15'),
    hasAnnotations: true,
    readProgress: 50,
    content: 'Profile your Node.js applications to find performance bottlenecks.'
  },
  {
    id: '17',
    title: 'Intro to React Native - Video',
    url: 'https://youtube.com/watch?v=example',
    author: 'React University',
    readingTime: '35 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['react-native', 'mobile', 'video'],
    dateAdded: new Date('2024-01-16'),
    hasAnnotations: false,
    readProgress: 0,
    mediaType: 'video',
    videoId: 'example'
  },
  {
    id: '18',
    title: 'Understanding Web Security Best Practices',
    url: 'https://examplelink.com/web-security-best-practices',
    author: 'Security Expert',
    readingTime: '12 min',
    status: STATUS.ARCHIVED,
    isFavorite: true,
    tags: ['security', 'web', 'best-practices'],
    dateAdded: new Date('2023-12-20'),
    hasAnnotations: true,
    readProgress: 100,
    content: 'Always validate user input, use HTTPS, implement CSP, and keep dependencies updated.'
  },
  {
    id: '19',
    title: 'Complete Guide to CSS Grid',
    url: 'https://examplelink.com/complete-css-grid-guide',
    author: 'Layout Guru',
    readingTime: '15 min',
    status: STATUS.ARCHIVED,
    isFavorite: false,
    tags: ['css', 'grid', 'layout', 'frontend'],
    dateAdded: new Date('2023-12-15'),
    hasAnnotations: true,
    readProgress: 100,
    content: 'CSS Grid revolutionized web layouts with two-dimensional control.'
  },
  {
    id: '20',
    title: 'Advanced JavaScript Patterns',
    url: 'https://examplelink.com/advanced-js-patterns',
    author: 'JS Master',
    readingTime: '22 min',
    status: STATUS.ARCHIVED,
    isFavorite: true,
    tags: ['javascript', 'patterns', 'advanced', 'programming'],
    dateAdded: new Date('2023-12-10'),
    hasAnnotations: true,
    readProgress: 100,
    content: 'Module pattern, revealing module pattern, singleton, observer, and more design patterns in JavaScript.'
  }
];

export const getArticlesByStatus = (articles, status) => {
  return articles.filter(article => article.status === status);
};

export const getArticleCounts = (articles) => {
  const counts = {
    [STATUS.INBOX]: 0,
    [STATUS.DAILY]: 0,
    [STATUS.CONTINUE]: 0,
    [STATUS.REDISCOVERY]: 0,
    [STATUS.ARCHIVED]: 0
  };

  articles.forEach(article => {
    if (Object.prototype.hasOwnProperty.call(counts, article.status)) {
      counts[article.status]++;
    }
  });

  return counts;
};