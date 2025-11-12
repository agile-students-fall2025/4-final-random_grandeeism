/**
 * Mock tags data for development and testing
 * This will be replaced with MongoDB Tag model in Sprint 3
 */

const mockTags = [
  {
    id: 'tag-1',
    name: 'javascript',
    color: '#f7df1e',
    description: 'JavaScript programming language',
    articleCount: 5,
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date('2024-01-15')
  },
  {
    id: 'tag-2',
    name: 'react',
    color: '#61dafb',
    description: 'React library for building UIs',
    articleCount: 3,
    createdAt: new Date('2024-01-02'),
    lastUsed: new Date('2024-01-14')
  },
  {
    id: 'tag-3',
    name: 'css',
    color: '#264de4',
    description: 'Cascading Style Sheets',
    articleCount: 4,
    createdAt: new Date('2024-01-03'),
    lastUsed: new Date('2024-01-13')
  },
  {
    id: 'tag-4',
    name: 'typescript',
    color: '#3178c6',
    description: 'TypeScript programming language',
    articleCount: 3,
    createdAt: new Date('2024-01-04'),
    lastUsed: new Date('2024-01-12')
  },
  {
    id: 'tag-5',
    name: 'web-development',
    color: '#ff6b6b',
    description: 'General web development topics',
    articleCount: 2,
    createdAt: new Date('2024-01-05'),
    lastUsed: new Date('2024-01-14')
  },
  {
    id: 'tag-6',
    name: 'nodejs',
    color: '#68a063',
    description: 'Node.js runtime environment',
    articleCount: 2,
    createdAt: new Date('2024-01-06'),
    lastUsed: new Date('2024-01-15')
  },
  {
    id: 'tag-7',
    name: 'backend',
    color: '#8b5cf6',
    description: 'Backend development',
    articleCount: 3,
    createdAt: new Date('2024-01-07'),
    lastUsed: new Date('2024-01-11')
  },
  {
    id: 'tag-8',
    name: 'frontend',
    color: '#ec4899',
    description: 'Frontend development',
    articleCount: 4,
    createdAt: new Date('2024-01-08'),
    lastUsed: new Date('2024-01-13')
  },
  {
    id: 'tag-9',
    name: 'api',
    color: '#10b981',
    description: 'API design and development',
    articleCount: 2,
    createdAt: new Date('2024-01-09'),
    lastUsed: new Date('2024-01-10')
  },
  {
    id: 'tag-10',
    name: 'database',
    color: '#f59e0b',
    description: 'Database design and optimization',
    articleCount: 2,
    createdAt: new Date('2024-01-10'),
    lastUsed: new Date('2024-01-11')
  }
  ,
  {
    id: 'tag-11',
    name: 'welcome',
    color: '#ef4444',
    description: 'Welcome/introductory articles',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-12',
    name: 'test',
    color: '#a78bfa',
    description: 'Test articles and examples',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-13',
    name: 'technology',
    color: '#06b6d4',
    description: 'Technology category',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-14',
    name: 'ui',
    color: '#f97316',
    description: 'User interface topics',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-15',
    name: 'design',
    color: '#6366f1',
    description: 'Design and UX',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-16',
    name: 'ux',
    color: '#10b981',
    description: 'User experience topics',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-17',
    name: 'podcast',
    color: '#fb7185',
    description: 'Podcast content',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-18',
    name: 'layout',
    color: '#06b6d4',
    description: 'Layout and positioning',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-19',
    name: 'programming',
    color: '#7c3aed',
    description: 'General programming topics',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-20',
    name: 'modern',
    color: '#ef4444',
    description: 'Modern techniques and patterns',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-21',
    name: 'techniques',
    color: '#f59e0b',
    description: 'Technical techniques',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-22',
    name: 'best-practices',
    color: '#0284c7',
    description: 'Best practices',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-23',
    name: 'development',
    color: '#0891b2',
    description: 'Development topics',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-24',
    name: 'optimization',
    color: '#16a34a',
    description: 'Optimization and performance',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-25',
    name: 'performance',
    color: '#ea580c',
    description: 'Performance topics',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-26',
    name: 'patterns',
    color: '#8b5cf6',
    description: 'Design and coding patterns',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-27',
    name: 'advanced',
    color: '#06b6d4',
    description: 'Advanced topics',
    articleCount: 2,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-28',
    name: 'microservices',
    color: '#0ea5a4',
    description: 'Microservices and architecture',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-29',
    name: 'architecture',
    color: '#7dd3fc',
    description: 'Software architecture',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-30',
    name: 'scalability',
    color: '#fb7185',
    description: 'Scalability topics',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-31',
    name: 'docker',
    color: '#0ea5a4',
    description: 'Docker and containers',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-32',
    name: 'devops',
    color: '#f97316',
    description: 'DevOps and CI/CD',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-33',
    name: 'containers',
    color: '#06b6d4',
    description: 'Containerization',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-34',
    name: 'deployment',
    color: '#7c3aed',
    description: 'Deployment topics',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-35',
    name: 'graphql',
    color: '#06b6d4',
    description: 'GraphQL related',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-36',
    name: 'rest',
    color: '#0891b2',
    description: 'REST APIs',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-37',
    name: 'comparison',
    color: '#ef4444',
    description: 'Comparisons and contrasts',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-38',
    name: 'machine-learning',
    color: '#0ea5a4',
    description: 'Machine learning and AI',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-39',
    name: 'ai',
    color: '#7dd3fc',
    description: 'Artificial intelligence',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-40',
    name: 'fundamentals',
    color: '#6366f1',
    description: 'Fundamental concepts',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-41',
    name: 'data-science',
    color: '#f59e0b',
    description: 'Data science topics',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-42',
    name: 'react-native',
    color: '#61dafb',
    description: 'React Native mobile development',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-43',
    name: 'mobile',
    color: '#fb7185',
    description: 'Mobile development',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-44',
    name: 'video',
    color: '#ef4444',
    description: 'Video media type',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-45',
    name: 'security',
    color: '#10b981',
    description: 'Security topics',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-46',
    name: 'web',
    color: '#7c3aed',
    description: 'Web related topics',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  },
  {
    id: 'tag-47',
    name: 'grid',
    color: '#06b6d4',
    description: 'Grid layout topics',
    articleCount: 1,
    createdAt: new Date(),
    lastUsed: new Date()
  }
];

module.exports = { mockTags };
