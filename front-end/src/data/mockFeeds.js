/**
 * @file /src/data/mockFeeds.js
 * @description Mock RSS feed data for development and testing
 */

export const mockFeeds = [
  {
    id: 'feed-1',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    feedType: 'rss',
    favicon: 'https://techcrunch.com/favicon.ico',
    category: 'Technology',
    description: 'The latest technology news and information on startups',
    website: 'https://techcrunch.com',
    lastFetched: new Date('2024-01-15T10:30:00Z'),
    lastUpdated: new Date('2024-01-15T09:45:00Z'),
    refreshFrequency: 'hourly',
    status: 'success',
    errorMessage: null,
    createdAt: new Date('2024-01-01T14:20:00Z')
  },
  {
    id: 'feed-2',
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com/feed/',
    feedType: 'rss',
    favicon: 'https://css-tricks.com/favicon.ico',
    category: 'Web Development',
    description: 'Tips, tricks, and techniques on using CSS',
    website: 'https://css-tricks.com',
    lastFetched: new Date('2024-01-15T11:00:00Z'),
    lastUpdated: new Date('2024-01-15T10:20:00Z'),
    refreshFrequency: 'daily',
    status: 'success',
    errorMessage: null,
    createdAt: new Date('2024-01-02T09:15:00Z')
  },
  {
    id: 'feed-3',
    name: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com/feed/',
    feedType: 'rss',
    favicon: 'https://www.smashingmagazine.com/favicon.ico',
    category: 'Web Development',
    description: 'Web design and development articles',
    website: 'https://www.smashingmagazine.com',
    lastFetched: new Date('2024-01-14T16:45:00Z'),
    lastUpdated: new Date('2024-01-14T15:30:00Z'),
    refreshFrequency: 'daily',
    status: 'success',
    errorMessage: null,
    createdAt: new Date('2024-01-03T11:30:00Z')
  },
  {
    id: 'feed-4',
    name: 'Dev.to',
    url: 'https://dev.to/feed',
    feedType: 'rss',
    favicon: 'https://dev.to/favicon.ico',
    category: 'Programming',
    description: 'Community of software developers',
    website: 'https://dev.to',
    lastFetched: new Date('2024-01-15T12:15:00Z'),
    lastUpdated: new Date('2024-01-15T12:00:00Z'),
    refreshFrequency: 'hourly',
    status: 'success',
    errorMessage: null,
    createdAt: new Date('2024-01-04T08:45:00Z')
  },
  {
    id: 'feed-5',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    feedType: 'rss',
    favicon: 'https://news.ycombinator.com/favicon.ico',
    category: 'Technology',
    description: 'Social news website focusing on computer science and entrepreneurship',
    website: 'https://news.ycombinator.com',
    lastFetched: new Date('2024-01-15T13:00:00Z'),
    lastUpdated: new Date('2024-01-15T12:55:00Z'),
    refreshFrequency: 'hourly',
    status: 'success',
    errorMessage: null,
    createdAt: new Date('2024-01-05T10:00:00Z')
  },
  {
    id: 'feed-6',
    name: 'A List Apart',
    url: 'https://alistapart.com/feed/',
    feedType: 'rss',
    favicon: 'https://alistapart.com/favicon.ico',
    category: 'Web Development',
    description: 'Articles for people who make websites',
    website: 'https://alistapart.com',
    lastFetched: new Date('2024-01-13T14:30:00Z'),
    lastUpdated: new Date('2024-01-10T11:20:00Z'),
    refreshFrequency: 'weekly',
    status: 'success',
    errorMessage: null,
    createdAt: new Date('2024-01-06T15:30:00Z')
  },
  {
    id: 'feed-7',
    name: 'JavaScript Weekly',
    url: 'https://javascriptweekly.com/rss',
    feedType: 'rss',
    favicon: 'https://javascriptweekly.com/favicon.ico',
    category: 'JavaScript',
    description: 'A weekly newsletter for JavaScript developers',
    website: 'https://javascriptweekly.com',
    lastFetched: new Date('2024-01-12T09:00:00Z'),
    lastUpdated: new Date('2024-01-12T08:00:00Z'),
    refreshFrequency: 'weekly',
    status: 'success',
    errorMessage: null,
    createdAt: new Date('2024-01-07T12:00:00Z')
  },
  {
    id: 'feed-8',
    name: 'React Blog',
    url: 'https://reactjs.org/feed.xml',
    feedType: 'atom',
    favicon: 'https://reactjs.org/favicon.ico',
    category: 'React',
    description: 'Official React blog',
    website: 'https://reactjs.org',
    lastFetched: new Date('2024-01-08T10:15:00Z'),
    lastUpdated: new Date('2023-12-20T14:30:00Z'),
    refreshFrequency: 'weekly',
    status: 'success',
    errorMessage: null,
    createdAt: new Date('2024-01-08T10:00:00Z')
  }
];

export const getFeedById = (feedId) => {
  return mockFeeds.find(feed => feed.id === feedId);
};

export const getFeedByName = (feedName) => {
  return mockFeeds.find(feed => feed.name === feedName);
};

export const getFeedsByCategory = (category) => {
  return mockFeeds.filter(feed => feed.category === category);
};
