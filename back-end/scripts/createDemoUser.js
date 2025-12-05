/**
 * Script to create demo user in MongoDB
 * Run with: node scripts/createDemoUser.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../lib/models');
require('dotenv').config();

async function createDemoUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/readitlater';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: 'demo@fieldnotes.app' },
        { username: 'demo' }
      ]
    });

    if (existingUser) {
      console.log('Demo user already exists:', existingUser.email);
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('password123', 10);
      existingUser.password = hashedPassword;
      existingUser.email = 'demo@fieldnotes.app';
      existingUser.username = 'demo';
      existingUser.displayName = 'Demo User';
      await existingUser.save();
      console.log('Demo user updated successfully!');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Create new demo user
      const demoUser = new User({
        username: 'demo',
        email: 'demo@fieldnotes.app',
        password: hashedPassword,
        displayName: 'Demo User',
        bio: 'Demo account for testing',
        avatar: null,
        preferences: {
          theme: 'light',
          readingGoal: 10,
          emailNotifications: false,
          defaultView: 'inbox'
        },
        stats: {
          articlesRead: 0,
          totalReadingTime: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      });

      await demoUser.save();
      console.log('Demo user created successfully!');
      console.log('Username:', demoUser.username);
      console.log('Email:', demoUser.email);
      console.log('User ID:', demoUser._id);
    }

  } catch (error) {
    console.error('Failed to create demo user:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createDemoUser().then(() => {
  process.exit(0);
});
