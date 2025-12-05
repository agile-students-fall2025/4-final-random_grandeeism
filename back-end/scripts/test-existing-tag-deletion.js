/**
 * Test Tag Deletion with Existing Mock Tags
 * Tests deleting a tag that already exists in mock data
 */

const {tagsDao, articlesDao} = require('../lib/daoFactory');

(async () => {
  console.log('=== Testing Deletion of Existing Mock Tag ===\n');
  
  try {
    // Use tag ID 11 which exists in the mock data
    const tagId = 11;
    const tag = await tagsDao.getById(tagId);
    
    if (!tag) {
      console.log('❌ Tag 11 not found in mock data');
      process.exit(1);
    }
    
    console.log('✓ Found existing tag:', tag.id, '-', tag.name);
    console.log('  Initial article count:', tag.articleCount);
    
    // Find all articles with this tag
    const allArticles = await articlesDao.getAll({});
    const articlesWithTag = allArticles.filter(a => 
      a.tags && a.tags.some(t => String(t) === String(tagId) || t == tagId)
    );
    
    console.log('  Articles with this tag:', articlesWithTag.length);
    articlesWithTag.forEach(a => {
      console.log('    - Article', a.id, ':', a.title.substring(0, 40) + '...');
    });
    
    // Delete the tag
    console.log('\n--- Deleting tag', tagId, '---');
    const deleted = await tagsDao.delete(tagId);
    console.log('✓ Tag deleted:', deleted ? 'SUCCESS' : 'FAILED');
    
    // Verify tag is gone
    const tagAfterDelete = await tagsDao.getById(tagId);
    console.log('✓ Tag no longer exists:', tagAfterDelete === null ? 'VERIFIED' : 'FAILED');
    
    // Check all articles that previously had this tag
    console.log('\n--- Verifying tag removed from all articles ---');
    let allRemoved = true;
    for (const article of articlesWithTag) {
      const updatedArticle = await articlesDao.getById(article.id);
      const stillHasTag = updatedArticle.tags.some(t => 
        String(t) === String(tagId) || t == tagId
      );
      
      console.log('  Article', article.id, '- Still has tag?', stillHasTag ? '❌ FAIL' : '✅ PASS');
      if (stillHasTag) allRemoved = false;
    }
    
    // Check a few other articles to make sure we didn't break anything
    console.log('\n--- Verifying other articles intact ---');
    const otherArticles = allArticles.filter(a => a.id <= 5 && !articlesWithTag.find(art => art.id === a.id));
    for (const article of otherArticles.slice(0, 3)) {
      const current = await articlesDao.getById(article.id);
      const tagsMatch = JSON.stringify(current.tags.sort()) === JSON.stringify(article.tags.sort());
      console.log('  Article', article.id, '- Tags unchanged?', tagsMatch ? '✅ PASS' : '❌ FAIL');
    }
    
    console.log('\n=== Test Results ===');
    console.log('✓ Tag deleted from system:', tagAfterDelete === null ? 'PASS ✅' : 'FAIL ❌');
    console.log('✓ Tag removed from all articles:', allRemoved ? 'PASS ✅' : 'FAIL ❌');
    
    if (allRemoved && tagAfterDelete === null) {
      console.log('\n🎉 ALL TESTS PASSED - Existing tag deletion works correctly!\n');
      process.exit(0);
    } else {
      console.log('\n❌ SOME TESTS FAILED\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
