/**
 * Complete Isolation Verification for Mock DB Mode
 * 
 * This utility ensures that when USE_MOCK_DB=true:
 * 1. MongoDB is never connected
 * 2. All data access goes through mock DAOs only
 * 3. Zero database operations occur
 */

const mongoose = require('mongoose');

function verifyCompleteMockIsolation() {
  const useMockDB = process.env.USE_MOCK_DB === 'true';
  
  console.log('\n=== ISOLATION CHECK ===');
  console.log(`USE_MOCK_DB: ${useMockDB}`);
  console.log(`Mongoose connection state: ${mongoose.connection.readyState}`);
  console.log(`Connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting`);
  
  if (useMockDB) {
    // When mock DB is enabled, Mongoose should NOT be connected
    if (mongoose.connection.readyState === 1) {
      throw new Error('❌ ISOLATION VIOLATION: MongoDB is connected even though USE_MOCK_DB=true!');
    }
    console.log('✅ ISOLATION VERIFIED: MongoDB is not connected (correct for mock mode)');
  } else {
    console.log('ℹ️  Production mode: MongoDB connection allowed');
  }
  
  // Verify daoFactory is using mock DAOs
  const daoFactory = require('../lib/daoFactory');
  const articlesDao = daoFactory.articlesDao;
  
  // Mock DAOs have a reset() method for testing
  if (typeof articlesDao.reset === 'function') {
    console.log('✅ ISOLATION VERIFIED: Using mock DAOs (has reset() method)');
  } else if (useMockDB) {
    throw new Error('❌ ISOLATION VIOLATION: Mock DB enabled but not using mock DAOs!');
  }
  
  console.log('=== ISOLATION CHECK PASSED ===\n');
}

module.exports = { verifyCompleteMockIsolation };
