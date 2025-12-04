/**
 * Script to verify demo user exists in MongoDB
 * Run with: node scripts/verifyDemoUser.js
 */

const mongoose = require('mongoose');
const { User } = require('../lib/models');
require('dotenv').config();

async function verifyDemoUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/readitlater';
    console.log('Connecting to MongoDB...');
    console.log('URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Find demo user by email
    const demoUser = await User.findOne({ email: 'demo@fieldnotes.app' });
    
    if (demoUser) {
      console.log('✅ Demo user found in database!');
      console.log('User ID:', demoUser._id);
      console.log('Username:', demoUser.username);
      console.log('Email:', demoUser.email);
      console.log('Display Name:', demoUser.displayName);
      console.log('Created At:', demoUser.createdAt);
    } else {
      console.log('❌ Demo user NOT found in database');
      
      // Check all users
      const allUsers = await User.find({}, 'username email');
      console.log('\nAll users in database:');
      allUsers.forEach(user => {
        console.log(`- ${user.username} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('Failed to verify demo user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
verifyDemoUser().then(() => {
  process.exit(0);
});
