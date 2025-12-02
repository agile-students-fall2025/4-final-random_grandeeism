#!/usr/bin/env node

const http = require('http');
const { URL } = require('url');

const BASE_URL = 'http://localhost:7001/api';

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ 
            status: res.statusCode,
            headers: res.headers,
            data: jsonData 
          });
        } catch (error) {
          resolve({ 
            status: res.statusCode,
            headers: res.headers,
            data: data 
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testTagDeletion() {
  console.log('🧪 Testing Tag Deletion Functionality\n');

  const timestamp = Date.now();
  let token, articleId, tagId;

  try {
    // 1. Register a user
    console.log('1. Registering test user...');
    const userResponse = await makeRequest(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      body: {
        email: `tagtest${timestamp}@example.com`,
        username: `tagtest${timestamp}`,
        password: 'password123',
        displayName: 'Tag Test User'
      }
    });

    if (userResponse.status !== 201 || !userResponse.data.success) {
      throw new Error(`User registration failed: ${JSON.stringify(userResponse.data)}`);
    }

    token = userResponse.data.data.token;
    console.log('✅ User registered successfully');

    // 2. Create an article
    console.log('2. Creating test article...');
    const articleResponse = await makeRequest(`${BASE_URL}/articles`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: 'Test Article for Tag Deletion',
        url: 'https://example.com/test-article',
        content: 'This is a test article for testing tag deletion',
        status: 'inbox'
      }
    });

    if (articleResponse.status !== 201 || !articleResponse.data.success) {
      throw new Error(`Article creation failed: ${JSON.stringify(articleResponse.data)}`);
    }

    articleId = articleResponse.data.data.id;
    console.log(`✅ Article created successfully (ID: ${articleId})`);

    // 3. Create a tag
    console.log('3. Creating test tag...');
    const tagResponse = await makeRequest(`${BASE_URL}/tags`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        name: 'test-tag-deletion',
        color: '#FF5733'
      }
    });

    if (tagResponse.status !== 201 || !tagResponse.data.success) {
      throw new Error(`Tag creation failed: ${JSON.stringify(tagResponse.data)}`);
    }

    tagId = tagResponse.data.data.id;
    console.log(`✅ Tag created successfully (ID: ${tagId})`);

    // 4. Add tag to article
    console.log('4. Adding tag to article...');
    const addTagResponse = await makeRequest(`${BASE_URL}/articles/${articleId}/tags`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        tagId: tagId
      }
    });

    if (addTagResponse.status !== 200 || !addTagResponse.data.success) {
      throw new Error(`Adding tag to article failed: ${JSON.stringify(addTagResponse.data)}`);
    }

    console.log('✅ Tag added to article successfully');

    // 5. Verify tag is on article
    console.log('5. Verifying tag is on article...');
    const getArticleResponse = await makeRequest(`${BASE_URL}/articles/${articleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (getArticleResponse.status !== 200 || !getArticleResponse.data.success) {
      throw new Error(`Getting article failed: ${JSON.stringify(getArticleResponse.data)}`);
    }

    const article = getArticleResponse.data.data;
    const hasTag = article.tags && article.tags.includes(tagId);
    
    if (!hasTag) {
      console.log('Article tags:', article.tags);
      console.log('Expected tag ID:', tagId);
      throw new Error('Tag was not found on article after adding');
    }

    console.log('✅ Tag verified on article');

    // 6. Remove tag from article (THE MAIN TEST)
    console.log('6. Removing tag from article...');
    const removeTagResponse = await makeRequest(`${BASE_URL}/articles/${articleId}/tags/${tagId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`Remove tag response status: ${removeTagResponse.status}`);
    console.log(`Remove tag response data:`, removeTagResponse.data);

    if (removeTagResponse.status !== 200 || !removeTagResponse.data.success) {
      throw new Error(`Removing tag from article failed: ${JSON.stringify(removeTagResponse.data)}`);
    }

    console.log('✅ Tag removed from article successfully');

    // 7. Verify tag is removed from article
    console.log('7. Verifying tag is removed from article...');
    const getArticleAfterRemovalResponse = await makeRequest(`${BASE_URL}/articles/${articleId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (getArticleAfterRemovalResponse.status !== 200 || !getArticleAfterRemovalResponse.data.success) {
      throw new Error(`Getting article after removal failed: ${JSON.stringify(getArticleAfterRemovalResponse.data)}`);
    }

    const articleAfterRemoval = getArticleAfterRemovalResponse.data.data;
    const stillHasTag = articleAfterRemoval.tags && articleAfterRemoval.tags.includes(tagId);
    
    if (stillHasTag) {
      console.log('Article tags after removal:', articleAfterRemoval.tags);
      console.log('Expected to NOT include tag ID:', tagId);
      throw new Error('Tag is still on article after removal - DELETION FAILED');
    }

    console.log('✅ Tag successfully removed from article');

    // 8. Verify tag still exists (we only removed it from article, not deleted the tag itself)
    console.log('8. Verifying tag still exists in system...');
    const getTagsResponse = await makeRequest(`${BASE_URL}/tags`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (getTagsResponse.status !== 200 || !getTagsResponse.data.success) {
      throw new Error(`Getting tags failed: ${JSON.stringify(getTagsResponse.data)}`);
    }

    const tags = getTagsResponse.data.data;
    const tagStillExists = tags.some(t => t.id === tagId);
    
    if (!tagStillExists) {
      console.log('Available tags:', tags.map(t => ({id: t.id, name: t.name})));
      console.log('Expected tag ID to exist:', tagId);
      throw new Error('Tag was deleted from system (should only be removed from article)');
    }

    console.log('✅ Tag still exists in system');

    console.log('\n🎉 ALL TAG DELETION TESTS PASSED!');
    console.log('✅ Tag removal from article is working correctly');

  } catch (error) {
    console.error('\n❌ TAG DELETION TEST FAILED:', error.message);
    process.exit(1);
  }
}

testTagDeletion().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
