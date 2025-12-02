#!/usr/bin/env node

/**
 * Integration Test Suite for Phase 4: Authentication & Validation
 * 
 * This script tests:
 * 1. Authentication flow (signup, login, token validation)
 * 2. Protected routes functionality
 * 3. Data isolation between users
 * 4. Input validation rules
 */

const axios = require('axios');
const colors = require('colors');

// Test configuration
const BASE_URL = 'http://localhost:7001/api';
const TEST_TIMEOUT = 30000; // 30 seconds

// Test data
let testData = {
  user1: {
    email: 'testuser1@example.com',
    username: 'testuser1',
    password: 'testpassword123',
    displayName: 'Test User 1'
  },
  user2: {
    email: 'testuser2@example.com',
    username: 'testuser2', 
    password: 'testpassword456',
    displayName: 'Test User 2'
  },
  tokens: {},
  articles: {},
  tags: {},
  highlights: {}
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Utility functions
function logTest(testName) {
  console.log(`\n🧪 Testing: ${testName}`.cyan);
  testResults.total++;
}

function logPass(message) {
  console.log(`✅ PASS: ${message}`.green);
  testResults.passed++;
}

function logFail(message, error = null) {
  console.log(`❌ FAIL: ${message}`.red);
  if (error) {
    console.log(`   Error: ${error.message || error}`.red);
  }
  testResults.failed++;
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`.blue);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testAuthFlow() {
  console.log('\n=== TESTING AUTHENTICATION FLOW ==='.yellow.bold);

  // Test 1: User Registration
  logTest('User Registration');
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, testData.user1);
    if (response.data.success && response.data.token) {
      testData.tokens.user1 = response.data.token;
      logPass('User 1 registration successful');
    } else {
      logFail('User 1 registration failed - no token returned');
    }
  } catch (error) {
    logFail('User 1 registration failed', error);
  }

  // Test 2: User Login
  logTest('User Login');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: testData.user1.email,
      password: testData.user1.password
    });
    if (response.data.success && response.data.token) {
      testData.tokens.user1 = response.data.token;
      logPass('User 1 login successful');
    } else {
      logFail('User 1 login failed - no token returned');
    }
  } catch (error) {
    logFail('User 1 login failed', error);
  }

  // Test 3: Invalid Login
  logTest('Invalid Login Credentials');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: testData.user1.email,
      password: 'wrongpassword'
    });
    logFail('Invalid login should have failed but succeeded');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logPass('Invalid login correctly rejected');
    } else {
      logFail('Invalid login returned wrong error', error);
    }
  }

  // Register second user for data isolation tests
  logTest('Second User Registration');
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, testData.user2);
    if (response.data.success && response.data.token) {
      testData.tokens.user2 = response.data.token;
      logPass('User 2 registration successful');
    } else {
      logFail('User 2 registration failed - no token returned');
    }
  } catch (error) {
    logFail('User 2 registration failed', error);
  }
}

async function testProtectedRoutes() {
  console.log('\n=== TESTING PROTECTED ROUTES ==='.yellow.bold);

  // Test 1: Access without token
  logTest('Access without token (should fail)');
  try {
    const response = await axios.get(`${BASE_URL}/articles`);
    logFail('Request without token should have failed but succeeded');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logPass('Request without token correctly rejected');
    } else {
      logFail('Request without token returned wrong error code', error);
    }
  }

  // Test 2: Access with invalid token
  logTest('Access with invalid token (should fail)');
  try {
    const response = await axios.get(`${BASE_URL}/articles`, {
      headers: { Authorization: 'Bearer invalidtoken123' }
    });
    logFail('Request with invalid token should have failed but succeeded');
  } catch (error) {
    if (error.response && error.response.status === 403) {
      logPass('Request with invalid token correctly rejected');
    } else {
      logFail('Request with invalid token returned wrong error code', error);
    }
  }

  // Test 3: Access with valid token
  logTest('Access with valid token (should succeed)');
  try {
    const response = await axios.get(`${BASE_URL}/articles`, {
      headers: { Authorization: `Bearer ${testData.tokens.user1}` }
    });
    if (response.data.success) {
      logPass('Request with valid token succeeded');
    } else {
      logFail('Request with valid token failed');
    }
  } catch (error) {
    logFail('Request with valid token failed', error);
  }
}

async function testDataIsolation() {
  console.log('\n=== TESTING DATA ISOLATION ==='.yellow.bold);

  // Create article for user 1
  logTest('Create article for User 1');
  try {
    const response = await axios.post(`${BASE_URL}/articles`, {
      title: 'User 1 Article',
      content: 'This article belongs to user 1',
      status: 'inbox'
    }, {
      headers: { Authorization: `Bearer ${testData.tokens.user1}` }
    });
    if (response.data.success) {
      testData.articles.user1 = response.data.data.id;
      logPass('Article created for User 1');
    } else {
      logFail('Failed to create article for User 1');
    }
  } catch (error) {
    logFail('Failed to create article for User 1', error);
  }

  // Create tag for user 1
  logTest('Create tag for User 1');
  try {
    const response = await axios.post(`${BASE_URL}/tags`, {
      name: 'User1Tag',
      color: '#FF5733'
    }, {
      headers: { Authorization: `Bearer ${testData.tokens.user1}` }
    });
    if (response.data.success) {
      testData.tags.user1 = response.data.data.id;
      logPass('Tag created for User 1');
    } else {
      logFail('Failed to create tag for User 1');
    }
  } catch (error) {
    logFail('Failed to create tag for User 1', error);
  }

  // User 2 tries to access User 1's articles
  logTest('User 2 accessing User 1\'s data (should be isolated)');
  try {
    const response = await axios.get(`${BASE_URL}/articles`, {
      headers: { Authorization: `Bearer ${testData.tokens.user2}` }
    });
    if (response.data.success) {
      const articlesFromUser1 = response.data.data.filter(article => 
        article.title === 'User 1 Article'
      );
      if (articlesFromUser1.length === 0) {
        logPass('Data isolation working - User 2 cannot see User 1\'s articles');
      } else {
        logFail('Data isolation failed - User 2 can see User 1\'s articles');
      }
    } else {
      logFail('Failed to get articles for User 2');
    }
  } catch (error) {
    logFail('Failed to test data isolation for articles', error);
  }

  // User 2 tries to access User 1's tags
  logTest('User 2 accessing User 1\'s tags (should be isolated)');
  try {
    const response = await axios.get(`${BASE_URL}/tags`, {
      headers: { Authorization: `Bearer ${testData.tokens.user2}` }
    });
    if (response.data.success) {
      const tagsFromUser1 = response.data.data.filter(tag => 
        tag.name === 'User1Tag'
      );
      if (tagsFromUser1.length === 0) {
        logPass('Data isolation working - User 2 cannot see User 1\'s tags');
      } else {
        logFail('Data isolation failed - User 2 can see User 1\'s tags');
      }
    } else {
      logFail('Failed to get tags for User 2');
    }
  } catch (error) {
    logFail('Failed to test data isolation for tags', error);
  }

  // User 2 tries to modify User 1's article
  if (testData.articles.user1) {
    logTest('User 2 modifying User 1\'s article (should fail)');
    try {
      const response = await axios.put(`${BASE_URL}/articles/${testData.articles.user1}`, {
        title: 'Modified by User 2',
        status: 'archived'
      }, {
        headers: { Authorization: `Bearer ${testData.tokens.user2}` }
      });
      logFail('User 2 should not be able to modify User 1\'s article');
    } catch (error) {
      if (error.response && (error.response.status === 403 || error.response.status === 404)) {
        logPass('User 2 correctly prevented from modifying User 1\'s article');
      } else {
        logFail('Wrong error code when User 2 tries to modify User 1\'s article', error);
      }
    }
  }
}

async function testInputValidation() {
  console.log('\n=== TESTING INPUT VALIDATION ==='.yellow.bold);

  // Test 1: Invalid article data
  logTest('Create article with invalid data (should fail)');
  try {
    const response = await axios.post(`${BASE_URL}/articles`, {
      title: '', // Empty title should fail
      content: 'Some content'
    }, {
      headers: { Authorization: `Bearer ${testData.tokens.user1}` }
    });
    logFail('Article with empty title should have failed but succeeded');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logPass('Invalid article data correctly rejected');
    } else {
      logFail('Invalid article data returned wrong error code', error);
    }
  }

  // Test 2: Invalid tag data
  logTest('Create tag with invalid data (should fail)');
  try {
    const response = await axios.post(`${BASE_URL}/tags`, {
      name: '', // Empty name should fail
      color: 'invalid-color'
    }, {
      headers: { Authorization: `Bearer ${testData.tokens.user1}` }
    });
    logFail('Tag with invalid data should have failed but succeeded');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logPass('Invalid tag data correctly rejected');
    } else {
      logFail('Invalid tag data returned wrong error code', error);
    }
  }

  // Test 3: Invalid user registration
  logTest('Register user with invalid data (should fail)');
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: 'invalid-email',
      username: 'us', // Too short
      password: '123' // Too short
    });
    logFail('Registration with invalid data should have failed but succeeded');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logPass('Invalid registration data correctly rejected');
    } else {
      logFail('Invalid registration data returned wrong error code', error);
    }
  }

  // Test 4: XSS protection
  logTest('XSS protection in tag creation');
  try {
    const response = await axios.post(`${BASE_URL}/tags`, {
      name: '<script>alert("xss")</script>',
      color: '#FF5733'
    }, {
      headers: { Authorization: `Bearer ${testData.tokens.user1}` }
    });
    if (response.data.success) {
      // Check if the script tag was escaped/sanitized
      const tagName = response.data.data.name;
      if (tagName.includes('<script>')) {
        logFail('XSS protection failed - script tag not sanitized');
      } else {
        logPass('XSS protection working - dangerous input sanitized');
      }
    } else {
      logFail('Failed to test XSS protection');
    }
  } catch (error) {
    logFail('Failed to test XSS protection', error);
  }
}

async function cleanup() {
  console.log('\n=== CLEANUP ==='.yellow.bold);
  logInfo('Cleaning up test data...');
  
  // In a real scenario, we'd clean up the test users and data
  // For now, just log the cleanup
  logInfo('Test cleanup completed');
}

async function runAllTests() {
  console.log('🚀 Starting Integration Test Suite for Phase 4'.rainbow.bold);
  console.log(`📍 Testing against: ${BASE_URL}`.yellow);
  
  try {
    await testAuthFlow();
    await testProtectedRoutes();
    await testDataIsolation();
    await testInputValidation();
    await cleanup();
  } catch (error) {
    console.error('Unexpected error during testing:', error);
  }

  // Print results
  console.log('\n=== TEST RESULTS ==='.rainbow.bold);
  console.log(`Total Tests: ${testResults.total}`.white);
  console.log(`✅ Passed: ${testResults.passed}`.green);
  console.log(`❌ Failed: ${testResults.failed}`.red);
  
  const successRate = Math.round((testResults.passed / testResults.total) * 100);
  console.log(`📊 Success Rate: ${successRate}%`.cyan);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 4 implementation is ready.'.green.bold);
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix the issues.'.red.bold);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test suite interrupted by user');
  process.exit(1);
});

// Run the test suite
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testData, testResults };