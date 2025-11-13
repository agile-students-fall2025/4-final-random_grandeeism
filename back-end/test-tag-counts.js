// Test script to verify tag article count calculation
const { mockTags } = require('./data/mockTags');
const { mockArticles } = require('./data/mockArticles');

// Calculate the actual article count for a tag
const calculateArticleCount = (tagId) => {
  return mockArticles.filter(article => 
    article.tags && Array.isArray(article.tags) && article.tags.includes(tagId)
  ).length;
};

console.log('Testing tag article counts:');
console.log('');

// Check some key tags
const testTags = ['tag-1', 'tag-2', 'tag-3', 'tag-5'];

testTags.forEach(tagId => {
  const tag = mockTags.find(t => t.id === tagId);
  const actualCount = calculateArticleCount(tagId);
  
  if (tag) {
    console.log(`${tag.name} (${tagId}):`);
    console.log(`  Mock data says: ${tag.articleCount} articles`);
    console.log(`  Actual count: ${actualCount} articles`);
    console.log(`  ${tag.articleCount === actualCount ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log('');
  }
});

// Show which articles have tag-1 (javascript)
console.log('Articles with tag-1 (javascript):');
const tag1Articles = mockArticles.filter(article => 
  article.tags && Array.isArray(article.tags) && article.tags.includes('tag-1')
);

tag1Articles.forEach((article, index) => {
  console.log(`  ${index + 1}. ${article.title} (ID: ${article.id})`);
});