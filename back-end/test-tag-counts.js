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

// Check some key tags (numeric IDs now)
const testTags = [1, 2, 3, 5];

for (const tagId of testTags) {
  const tag = mockTags.find(t => t.id === tagId);
  const actual = calculateArticleCount(tagId);
  if (tag) {
    console.log(`${tag.name} (id:${tagId}):`);
    console.log(`  mockTags articleCount: ${tag.articleCount}`);
    console.log(`  recomputed: ${actual}`);
    console.log(`  ${tag.articleCount === actual ? '✅ CORRECT' : '❌ MISMATCH'}`);
    console.log('');
  } else {
    console.log(`missing tag id:${tagId}`);
  }
}

// Show which articles have tag-1 (javascript)
console.log('Articles with tag id=1 (javascript):');
const tag1Articles = mockArticles.filter(a => Array.isArray(a.tags) && a.tags.includes(1));

tag1Articles.forEach((article, index) => {
  console.log(`  ${index + 1}. ${article.title} (ID: ${article.id})`);
});