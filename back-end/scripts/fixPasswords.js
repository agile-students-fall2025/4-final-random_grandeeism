require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User } = require('../lib/models');

async function fixPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users\n`);

    // Hash the password properly (use 12 rounds to match the model's pre-save hook)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    console.log('Updating all users to have password: password123\n');

    // Update directly without triggering save middleware
    for (const user of users) {
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      console.log(`✅ Updated ${user.email}`);
    }

    // Verify it works
    console.log('\n--- Verification ---');
    const testUser = await User.findOne({ email: 'demo@fieldnotes.app' }).select('+password');
    if (testUser) {
      const isMatch = await bcrypt.compare('password123', testUser.password);
      console.log(`Demo user password test: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
      if (!isMatch) {
        console.log('Password hash:', testUser.password.substring(0, 30) + '...');
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ All passwords fixed!');
    console.log('You can now login with any account using password: password123');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixPasswords();
