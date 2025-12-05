/**
 * Test Tag Deletion - Verify tags are removed from articles when deleted
 */

const {tagsDao, articlesDao} = require('../lib/daoFactory');

(async () => {
  console.log('=== Testing Tag Deletion from Articles ===\n');
  
  try {
    // Step 1: Create a test tag
    const testTag = await tagsDao.create({
      name: 'deletion-test-tag-' + Date.now(),
      description: 'Tag to test deletion behavior',
      color: '#00ff00'
    });
    console.log('✓ Created test tag:', testTag.id, '-', testTag.name);
    
    // Step 2: Get some articles and add the tag to them
    const article1 = await articlesDao.getById(1);
    const article2 = await articlesDao.getById(2);
    const article3 = await articlesDao.getById(3);
    
    console.log('\nBefore adding tag:');
    console.log('  Article 1 tags:', article1.tags);
    console.log('  Article 2 tags:', article2.tags);
    console.log('  Article 3 tags:', article3.tags);
    
    // Step 3: Add the tag to multiple articles
    await articlesDao.update(1, { tags: [...article1.tags, testTag.id] });
    await articlesDao.update(2, { tags: [...article2.tags, testTag.id] });
    await articlesDao.update(3, { tags: [...article3.tags, testTag.id] });
    
    const updated1 = await articlesDao.getById(1);
    const updated2 = await articlesDao.getById(2);
    const updated3 = await articlesDao.getById(3);
    
    console.log('\nAfter adding tag:');
    console.log('  Article 1 tags:', updated1.tags, '- Has tag?', updated1.tags.includes(testTag.id));
    console.log('  Article 2 tags:', updated2.tags, '- Has tag?', updated2.tags.includes(testTag.id));
    console.log('  Article 3 tags:', updated3.tags, '- Has tag?', updated3.tags.includes(testTag.id));
    
    // Step 4: Verify the tag's article count
    const tagBeforeDelete = await tagsDao.getById(testTag.id);
    console.log('\n✓ Tag article count before delete:', tagBeforeDelete.articleCount);
    
    // Step 5: Delete the tag
    console.log('\n--- Deleting tag', testTag.id, '---');
    const deleted = await tagsDao.delete(testTag.id);
    console.log('✓ Tag deleted:', deleted ? 'SUCCESS' : 'FAILED');
    
    // Step 6: Verify tag is gone
    const tagAfterDelete = await tagsDao.getById(testTag.id);
    console.log('✓ Tag no longer exists:', tagAfterDelete === null ? 'VERIFIED' : 'FAILED');
    
    // Step 7: Verify tag was removed from all articles
    const final1 = await articlesDao.getById(1);
    const final2 = await articlesDao.getById(2);
    const final3 = await articlesDao.getById(3);
    
    console.log('\nAfter deleting tag:');
    console.log('  Article 1 tags:', final1.tags, '- Has tag?', final1.tags.includes(testTag.id));
    console.log('  Article 2 tags:', final2.tags, '- Has tag?', final2.tags.includes(testTag.id));
    console.log('  Article 3 tags:', final3.tags, '- Has tag?', final3.tags.includes(testTag.id));
    
    // Step 8: Verify counts
    const hasTag1 = final1.tags.some(t => String(t) === String(testTag.id) || t == testTag.id);
    const hasTag2 = final2.tags.some(t => String(t) === String(testTag.id) || t == testTag.id);
    const hasTag3 = final3.tags.some(t => String(t) === String(testTag.id) || t == testTag.id);
    
    console.log('\n=== Test Results ===');
    console.log('✓ Tag removed from Article 1:', !hasTag1 ? 'PASS ✅' : 'FAIL ❌');
    console.log('✓ Tag removed from Article 2:', !hasTag2 ? 'PASS ✅' : 'FAIL ❌');
    console.log('✓ Tag removed from Article 3:', !hasTag3 ? 'PASS ✅' : 'FAIL ❌');
    console.log('✓ Tag deleted from system:', tagAfterDelete === null ? 'PASS ✅' : 'FAIL ❌');
    
    if (!hasTag1 && !hasTag2 && !hasTag3 && tagAfterDelete === null) {
      console.log('\n🎉 ALL TESTS PASSED - Tag deletion works correctly!\n');
      process.exit(0);
    } else {
      console.log('\n❌ SOME TESTS FAILED - There may be issues with tag deletion\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
