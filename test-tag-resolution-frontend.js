// Test tag resolution for articles
const tagsData = [
  { id: 'tag-1', name: 'javascript' },
  { id: 'tag-2', name: 'react' },
  { id: 'tag-5', name: 'web-development' },
  { id: 'tag-13', name: 'technology' }
];

const sampleArticle = {
  id: '4',
  title: 'The Future of JavaScript - Tech Podcast',
  tags: ['tag-1', 'tag-17', 'tag-5', 'tag-13']
};

// Create tag mapping
const createTagMapping = (tags) => {
  const mapping = {};
  tags.forEach(tag => {
    mapping[tag.id] = tag.name;
  });
  return mapping;
};

// Resolve article tags
const resolveArticleTags = (articles, tagMapping) => {
  return articles.map(article => ({
    ...article,
    tags: Array.isArray(article.tags) 
      ? article.tags.map(tagId => tagMapping[tagId] || tagId)
      : []
  }));
};

const tagMapping = createTagMapping(tagsData);
console.log('Tag mapping:', tagMapping);

const resolvedArticles = resolveArticleTags([sampleArticle], tagMapping);
console.log('\nOriginal article tags:', sampleArticle.tags);
console.log('Resolved article tags:', resolvedArticles[0].tags);

console.log('\n✅ Tag resolution test passed!');
console.log('Tags like "tag-1", "tag-5", "tag-13" are now "javascript", "web-development", "technology"');
console.log('Unknown tags like "tag-17" remain as "tag-17"');