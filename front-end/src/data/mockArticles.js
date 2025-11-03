/**
 * @file /src/data/mockArticles.js
 * @description Mock article data for development and testing
 */

import { STATUS } from "../constants/statuses.js";

// Lorem Ipsum content for text articles
const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.

Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.`;

export const mockArticles = [
  {
    id: '1',
    title: 'Welcome - Test Article Title',
    url: 'https://examplelink.com/welcome-test-article',
    author: 'John Doe',
    source: 'Dev.to',
    feedId: 'feed-4',
    readingTime: '1 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['welcome', 'test'],
    dateAdded: new Date('2024-01-15'),
    hasAnnotations: false,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '2',
    title: 'The Future of Web Development',
    url: 'https://examplelink.com/future-web-dev',
    author: 'Jane Smith',
    source: 'Smashing Magazine',
    feedId: 'feed-3',
    readingTime: '6 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['web-development', 'technology'],
    dateAdded: new Date('2024-01-14'),
    hasAnnotations: false,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '3',
    title: 'Building Better User Interfaces',
    url: 'https://examplelink.com/better-ui',
    author: 'Mike Johnson',
    source: 'A List Apart',
    feedId: 'feed-6',
    readingTime: '4 min',
    status: STATUS.DAILY,
    isFavorite: true,
    tags: ['ui', 'design', 'ux'],
    dateAdded: new Date('2024-01-13'),
    hasAnnotations: true,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '4',
    title: 'The Future of JavaScript - Tech Podcast',
    url: 'https://example.com/future-javascript-podcast',
    author: 'Tech Podcast Network',
    source: 'JavaScript Weekly',
    feedId: 'feed-7',
    readingTime: '52 min',
    status: STATUS.CONTINUE,
    isFavorite: false,
    tags: ['javascript', 'podcast', 'web-development', 'technology'],
    dateAdded: new Date('2024-01-12'),
    hasAnnotations: true,
    readProgress: 35,
    mediaType: 'audio',
    podcastUrl: 'https://example.com/podcast.mp3'
  },
  {
    id: '5',
    title: 'CSS Grid vs Flexbox: When to Use What',
    url: 'https://examplelink.com/css-grid-flexbox',
    author: 'David Brown',
    source: 'CSS-Tricks',
    feedId: 'feed-2',
    readingTime: '5 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['css', 'layout', 'frontend'],
    dateAdded: new Date('2024-01-11'),
    hasAnnotations: false,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '6',
    title: 'Mastering TypeScript: Advanced Patterns',
    url: 'https://examplelink.com/typescript-advanced-patterns',
    author: 'TypeScript Expert',
    source: 'Dev.to',
    feedId: 'feed-4',
    readingTime: '18 min',
    status: STATUS.CONTINUE,
    isFavorite: false,
    tags: ['typescript', 'programming'],
    dateAdded: new Date('2024-01-10'),
    hasAnnotations: true,
    readProgress: 65,
    content: loremIpsum
  },
  {
    id: '7',
    title: 'Modern CSS Techniques',
    url: 'https://examplelink.com/modern-css',
    author: 'Alex Rodriguez',
    source: 'CSS-Tricks',
    feedId: 'feed-2',
    readingTime: '3 min',
    status: STATUS.REDISCOVERY,
    isFavorite: false,
    tags: ['css', 'modern', 'techniques'],
    dateAdded: new Date('2024-01-09'),
    hasAnnotations: false,
    readProgress: 100,
    content: loremIpsum
  },
  {
    id: '8',
    title: 'TypeScript Best Practices',
    url: 'https://examplelink.com/typescript-best-practices',
    author: 'Emma Davis',
    source: 'Smashing Magazine',
    feedId: 'feed-3',
    readingTime: '9 min',
    status: STATUS.DAILY,
    isFavorite: false,
    tags: ['typescript', 'best-practices', 'development'],
    dateAdded: new Date('2024-01-08'),
    hasAnnotations: false,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '9',
    title: 'API Design Principles',
    url: 'https://examplelink.com/api-design',
    author: 'Tom Wilson',
    source: 'TechCrunch',
    feedId: 'feed-1',
    readingTime: '6 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['api', 'design', 'backend'],
    dateAdded: new Date('2024-01-07'),
    hasAnnotations: false,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '10',
    title: 'Database Optimization Strategies',
    url: 'https://examplelink.com/database-optimization',
    author: 'Rachel Green',
    source: 'Hacker News',
    feedId: 'feed-5',
    readingTime: '10 min',
    status: STATUS.DAILY,
    isFavorite: true,
    tags: ['database', 'optimization', 'performance'],
    dateAdded: new Date('2024-01-06'),
    hasAnnotations: true,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '11',
    title: 'Advanced React Patterns',
    url: 'https://examplelink.com/advanced-react-patterns',
    author: 'Kevin Park',
    source: 'React Blog',
    feedId: 'feed-8',
    readingTime: '12 min',
    status: STATUS.DAILY,
    isFavorite: false,
    tags: ['react', 'patterns', 'advanced', 'javascript'],
    dateAdded: new Date('2024-01-05'),
    hasAnnotations: true,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '12',
    title: 'Microservices Architecture Guide',
    url: 'https://examplelink.com/microservices-guide',
    author: 'Maria Garcia',
    source: 'TechCrunch',
    feedId: 'feed-1',
    readingTime: '15 min',
    status: STATUS.DAILY,
    isFavorite: true,
    tags: ['microservices', 'architecture', 'backend', 'scalability'],
    dateAdded: new Date('2024-01-04'),
    hasAnnotations: true,
    readProgress: 0,
    content: loremIpsum
  },
  {
    id: '13',
    title: 'Docker Best Practices',
    url: 'https://examplelink.com/docker-best-practices',
    author: 'James Wilson',
    source: 'Dev.to',
    feedId: 'feed-4',
    readingTime: '8 min',
    status: STATUS.REDISCOVERY,
    isFavorite: false,
    tags: ['docker', 'devops', 'containers', 'deployment'],
    dateAdded: new Date('2024-01-03'),
    hasAnnotations: true,
    readProgress: 100,
    content: loremIpsum
  },
  {
    id: '14',
    title: 'GraphQL vs REST API',
    url: 'https://examplelink.com/graphql-vs-rest',
    author: 'Sophie Lee',
    source: 'Smashing Magazine',
    feedId: 'feed-3',
    readingTime: '9 min',
    status: STATUS.REDISCOVERY,
    isFavorite: true,
    tags: ['graphql', 'rest', 'api', 'comparison'],
    dateAdded: new Date('2024-01-02'),
    hasAnnotations: true,
    readProgress: 100,
    content: loremIpsum
  },
  {
    id: '15',
    title: 'Machine Learning Fundamentals',
    url: 'https://examplelink.com/ml-fundamentals',
    author: 'Dr. Robert Kim',
    source: 'TechCrunch',
    feedId: 'feed-1',
    readingTime: '20 min',
    status: STATUS.REDISCOVERY,
    isFavorite: false,
    tags: ['machine-learning', 'ai', 'fundamentals', 'data-science'],
    dateAdded: new Date('2024-01-01'),
    hasAnnotations: true,
    readProgress: 100,
    content: loremIpsum
  },
  {
    id: '16',
    title: 'Node.js Performance Optimization',
    url: 'https://examplelink.com/nodejs-performance',
    author: 'Alex Thompson',
    source: 'Hacker News',
    feedId: 'feed-5',
    readingTime: '14 min',
    status: STATUS.CONTINUE,
    isFavorite: true,
    tags: ['nodejs', 'performance', 'backend', 'optimization'],
    dateAdded: new Date('2024-01-15'),
    hasAnnotations: true,
    readProgress: 50,
    content: loremIpsum
  },
  {
    id: '17',
    title: 'Intro to React Native - Video',
    url: 'https://youtube.com/watch?v=TNhaISOUy6Q',
    author: 'React University',
    source: 'React Blog',
    feedId: 'feed-8',
    readingTime: '35 min',
    status: STATUS.INBOX,
    isFavorite: false,
    tags: ['react-native', 'mobile', 'video'],
    dateAdded: new Date('2024-01-16'),
    hasAnnotations: false,
    readProgress: 0,
    mediaType: 'video',
    videoId: 'TNhaISOUy6Q',
    videoAnnotations: [],
    transcript: []
  },
  {
    id: '18',
    title: 'Understanding Web Security Best Practices',
    url: 'https://examplelink.com/web-security-best-practices',
    author: 'Security Expert',
    source: 'A List Apart',
    feedId: 'feed-6',
    readingTime: '12 min',
    status: STATUS.ARCHIVED,
    isFavorite: true,
    tags: ['security', 'web', 'best-practices'],
    dateAdded: new Date('2023-12-20'),
    hasAnnotations: true,
    readProgress: 100,
    content: loremIpsum
  },
  {
    id: '19',
    title: 'Complete Guide to CSS Grid',
    url: 'https://examplelink.com/complete-css-grid-guide',
    author: 'Layout Guru',
    source: 'CSS-Tricks',
    feedId: 'feed-2',
    readingTime: '15 min',
    status: STATUS.ARCHIVED,
    isFavorite: false,
    tags: ['css', 'grid', 'layout', 'frontend'],
    dateAdded: new Date('2023-12-15'),
    hasAnnotations: true,
    readProgress: 100,
    content: loremIpsum
  },
  {
    id: '20',
    title: 'Advanced JavaScript Patterns',
    url: 'https://examplelink.com/advanced-js-patterns',
    author: 'JS Master',
    source: 'JavaScript Weekly',
    feedId: 'feed-7',
    readingTime: '22 min',
    status: STATUS.ARCHIVED,
    isFavorite: true,
    tags: ['javascript', 'patterns', 'advanced', 'programming'],
    dateAdded: new Date('2023-12-10'),
    hasAnnotations: true,
    readProgress: 100,
    content: loremIpsum
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