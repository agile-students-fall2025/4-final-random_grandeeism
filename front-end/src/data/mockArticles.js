/**
 * @file /src/data/mockArticles.js
 * @description Mock article data for development and testing
 */

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
    readProgress: 0,
    // --- ADDED THIS 'content' FIELD FOR TESTING ---
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
    // --- END OF ADDED CONTENT ---
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
    readProgress: 0,
    // Add content here if you want to test this article
    content: 'The future of web development looks bright, with new technologies emerging...'
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
    readProgress: 0,
    content: 'Building better user interfaces requires a deep understanding of user needs.'
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
    readProgress: 35,
    mediaType: 'podcast', // Mark as podcast
    podcastUrl: 'https://example.com/podcast.mp3' // Add podcast URL
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
    readProgress: 0,
    content: 'CSS Grid and Flexbox are powerful tools, but they solve different problems.'
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
    readProgress: 65,
    content: 'Advanced patterns in TypeScript can significantly improve code quality.'
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
    readProgress: 100,
    content: 'Modern CSS offers amazing possibilities for styling websites.'
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
    readProgress: 0,
    content: 'Following best practices in TypeScript leads to maintainable code.'
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
    readProgress: 0,
    content: 'Good API design is crucial for a successful software product.'
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
    readProgress: 0,
    content: 'Database optimization can drastically improve application speed.'
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
    readProgress: 0,
    content: 'Learn about render props, hooks, and other advanced React patterns.'
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
    readProgress: 0,
    content: 'Microservices can improve scalability and maintainability, but come with trade-offs.'
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
    readProgress: 100,
    content: 'Use multi-stage builds and keep your Docker images small.'
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
    readProgress: 100,
    content: 'GraphQL offers flexibility, while REST provides simplicity and caching.'
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
    readProgress: 100,
    content: 'Supervised, unsupervised, and reinforcement learning are the main types.'
  },
  {
    id: '16',
    title: 'Node.js Performance Optimization',
    url: 'https(://examplelink.com/nodejs-performance',
    author: 'Alex Thompson',
    readingTime: '14 min',
    status: 'inProgress',
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
    status: 'inbox',
    isFavorite: false,
    tags: ['react-native', 'mobile', 'video'],
    dateAdded: new Date('2024-01-16'),
    hasAnnotations: false,
    readProgress: 0,
    mediaType: 'video', // Mark as video
    videoId: 'example' // Add video ID
  },
  {
    id: '18',
    title: 'The Evolution of Software Architecture: From Monoliths to Microservices and Beyond',
    url: 'https://examplelink.com/software-architecture-evolution',
    author: 'Dr. Emily Chen',
    readingTime: '25 min',
    status: 'inbox',
    isFavorite: false,
    tags: ['architecture', 'software-design', 'microservices', 'cloud-native'],
    dateAdded: new Date('2024-01-20'),
    hasAnnotations: false,
    readProgress: 0,
    content: `Software architecture has undergone a remarkable transformation over the past decades, evolving from simple, monolithic structures to complex, distributed systems. This evolution reflects not just technological advancement, but also changing business needs and development practices.

In the beginning, there were monoliths. These single-tiered applications housed all their functionality in one deployable unit. While simple to develop and deploy, monoliths became challenging to maintain as applications grew in size and complexity. Teams found themselves stepping on each other's toes during development, and even small changes required testing the entire application.

The rise of service-oriented architecture (SOA) in the early 2000s marked the first major shift toward distributed systems. SOA introduced the concept of loosely coupled services communicating through standardized protocols. This approach allowed organizations to break down their applications into more manageable pieces, but it still carried significant overhead in terms of service governance and enterprise service buses.

Enter microservices, the architectural style that has dominated the last decade. Microservices take the concept of distributed systems to its logical conclusion: small, independent services that do one thing well. Each microservice can be developed, deployed, and scaled independently, enabling teams to move faster and adopt new technologies more easily. Companies like Netflix, Amazon, and Spotify have demonstrated the power of microservices at scale.

However, microservices aren't without their challenges. The distributed nature of these systems introduces complexity in terms of service discovery, data consistency, and monitoring. Teams must grapple with the fallacies of distributed computing: the network is not reliable, latency is not zero, and bandwidth is not infinite.

The emergence of container orchestration platforms, particularly Kubernetes, has helped address some of these challenges. Kubernetes provides a robust platform for deploying and managing microservices, handling concerns like service discovery, load balancing, and self-healing. This has led to the rise of cloud-native architectures, where applications are designed to take full advantage of cloud computing capabilities.

Looking ahead, we see new architectural patterns emerging. Serverless computing promises to abstract away infrastructure concerns entirely, allowing developers to focus purely on business logic. Edge computing pushes processing closer to data sources, reducing latency and bandwidth usage. Mesh architectures provide sophisticated service-to-service communication capabilities.

The concept of "polyglot persistence" has also gained traction, recognizing that different types of data are best served by different types of databases. Modern applications might use relational databases for transactional data, document stores for unstructured content, graph databases for relationship-heavy data, and time-series databases for metrics.

Event-driven architectures have become increasingly important, enabling loose coupling between services through asynchronous communication patterns. This approach allows systems to scale more effectively and handle spikes in load, while also providing better resilience through message persistence.

Security considerations have evolved alongside these architectural changes. The traditional perimeter-based security model has given way to zero-trust architectures, where every request must be authenticated and authorized, regardless of its origin. This is particularly crucial in distributed systems where services may run across multiple trust boundaries.

DevOps practices have become intrinsically linked with modern architecture. Continuous Integration and Continuous Deployment (CI/CD) pipelines, infrastructure as code, and automated testing are no longer optional extras but essential components of any serious software project.

Observability has emerged as a critical concern in distributed systems. The ability to understand system behavior through logs, metrics, and traces is essential for maintaining reliability and performance. Tools like distributed tracing help developers understand how requests flow through multiple services.

The role of APIs has also evolved. Beyond their traditional integration role, APIs are now products in their own right, with their own lifecycles and governance requirements. API-first design has become a common approach, ensuring that services are built with integration in mind from the start.

Performance optimization in distributed systems requires new approaches. Techniques like caching, which were once relatively straightforward in monolithic applications, now require careful consideration of data consistency and cache invalidation across services. Content Delivery Networks (CDNs) have become an integral part of many architectures.

Artificial Intelligence and Machine Learning are beginning to influence software architecture. Models need to be trained, deployed, and monitored, leading to new patterns like MLOps and specialized infrastructure for model serving. The need to process vast amounts of data has driven innovations in data architecture.

As we look to the future, new challenges and opportunities await. Quantum computing may require fundamentally new architectural approaches. The growing importance of sustainability means architects must consider the environmental impact of their design decisions. Edge computing and 5G networks will enable new types of distributed applications.

The key lesson from this evolution is that software architecture is not static. It must adapt to changing requirements, technologies, and business needs. Successful architects maintain a balance between adopting new approaches and ensuring system reliability and maintainability.

Testing strategies have also evolved to meet the challenges of distributed systems. Unit tests are no longer sufficient; teams must also perform integration testing, contract testing between services, and chaos engineering to ensure system resilience.

In conclusion, the evolution of software architecture reflects the increasing complexity of modern applications and business requirements. While new patterns and technologies emerge regularly, the fundamental principles of good architecture remain: separation of concerns, loose coupling, and the need to balance competing quality attributes.`
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
    if (Object.prototype.hasOwnProperty.call(counts, article.status)) {
      counts[article.status]++;
    }
  });
  
  return counts;
};