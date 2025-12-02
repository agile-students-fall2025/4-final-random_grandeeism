/**
 * Create Test User Script
 * 
 * Creates a test user in MongoDB for development purposes
 * Usage: node scripts/createTestUser.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { usersDao } = require('../lib/daoFactory');

const MONGODB_URI = process.env.MONGODB_URI;

async function createTestUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await usersDao.getByEmail('demo@fieldnotes.app');
    if (existingUser) {
      console.log('✅ Demo user already exists');
      console.log('Email: demo@fieldnotes.app');
      console.log('Password: password123');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create test user
    const testUser = await usersDao.create({
      username: 'demo',
      email: 'demo@fieldnotes.app',
      password: hashedPassword,
      displayName: 'Demo User',
      bio: 'Test user for development',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo',
      preferences: {
        theme: 'system',
        readingGoal: 20,
        emailNotifications: true,
        defaultView: 'inbox'
      },
      stats: {
        articlesRead: 0,
        totalReadingTime: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('Email: demo@fieldnotes.app');
    console.log('Password: password123');
    console.log('User ID:', testUser.id);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

createTestUser();
