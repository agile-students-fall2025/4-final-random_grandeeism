/**
 * Integration Test: Tag Deletion via API
 * Tests the full flow through HTTP endpoints
 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

// Require app after chai setup
const app = require('../index');

(async () => {
  console.log('=== API Integration Test: Tag Deletion ===\n');
  
  try {
    // Step 1: Create a new tag via API
    console.log('Step 1: Creating a new tag...');
    const createRes = await chai.request(app)
      .post('/api/tags')
      .send({
        name: 'api-deletion-test-' + Date.now(),
        description: 'Test tag for API deletion',
        color: '#ff5733'
      });
    
    expect(createRes).to.have.status(201);
    expect(createRes.body).to.have.property('success', true);
    const tagId = createRes.body.data.id;
    console.log('✓ Tag created:', tagId, '-', createRes.body.data.name);
    
    // Step 2: Add tag to multiple articles via API
    console.log('\nStep 2: Adding tag to articles...');
    const articleIds = [1, 2, 3];
    for (const articleId of articleIds) {
      const addRes = await chai.request(app)
        .post(`/api/articles/${articleId}/tags`)
        .send({ tagId });
      
      expect(addRes).to.have.status(200);
      expect(addRes.body.data.tags).to.include(tagId);
      console.log('✓ Tag added to article', articleId);
    }
    
    // Step 3: Verify articles have the tag
    console.log('\nStep 3: Verifying articles have the tag...');
    for (const articleId of articleIds) {
      const getRes = await chai.request(app).get(`/api/articles/${articleId}`);
      expect(getRes).to.have.status(200);
      expect(getRes.body.data.tags).to.include(tagId);
      console.log('✓ Article', articleId, 'has tag:', getRes.body.data.tags);
    }
    
    // Step 4: Delete the tag via API
    console.log('\nStep 4: Deleting tag via API...');
    const deleteRes = await chai.request(app).delete(`/api/tags/${tagId}`);
    expect(deleteRes).to.have.status(200);
    expect(deleteRes.body).to.have.property('success', true);
    console.log('✓ Tag deleted via API');
    
    // Step 5: Verify tag is gone
    console.log('\nStep 5: Verifying tag no longer exists...');
    const getTagRes = await chai.request(app).get(`/api/tags/${tagId}`);
    expect(getTagRes).to.have.status(404);
    console.log('✓ Tag returns 404 as expected');
    
    // Step 6: Verify tag removed from all articles
    console.log('\nStep 6: Verifying tag removed from all articles...');
    let allPassed = true;
    for (const articleId of articleIds) {
      const getRes = await chai.request(app).get(`/api/articles/${articleId}`);
      expect(getRes).to.have.status(200);
      const hasTag = getRes.body.data.tags.includes(tagId);
      console.log('  Article', articleId, '- Has tag?', hasTag ? '❌ FAIL' : '✅ PASS');
      console.log('    Tags:', getRes.body.data.tags);
      if (hasTag) allPassed = false;
    }
    
    console.log('\n=== Test Results ===');
    console.log('✓ Tag created via API: PASS ✅');
    console.log('✓ Tag added to articles: PASS ✅');
    console.log('✓ Tag deleted via API: PASS ✅');
    console.log('✓ Tag removed from system: PASS ✅');
    console.log('✓ Tag removed from all articles:', allPassed ? 'PASS ✅' : 'FAIL ❌');
    
    if (allPassed) {
      console.log('\n🎉 ALL API INTEGRATION TESTS PASSED!\n');
      process.exit(0);
    } else {
      console.log('\n❌ SOME TESTS FAILED\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.response.body);
    }
    console.error(error.stack);
    process.exit(1);
  }
})();
