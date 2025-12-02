require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { usersDao } = require('../lib/daoFactory');

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    // Get all users
    const users = await usersDao.getAll();
    console.log(`Found ${users.length} users:\n`);
    
    for (const user of users) {
      console.log('---');
      console.log('Email:', user.email);
      console.log('Username:', user.username);
      console.log('ID:', user.id);
      
      // Try to get with password
      const userWithPwd = await usersDao.getByEmail(user.email, true);
      console.log('Has password:', !!userWithPwd.password);
      
      if (userWithPwd.password) {
        console.log('Password hash:', userWithPwd.password.substring(0, 30) + '...');
        
        // Test password verification
        const testPassword = user.email === 'demo@fieldnotes.app' ? 'password123' : 'password123';
        try {
          const isMatch = await bcrypt.compare(testPassword, userWithPwd.password);
          console.log(`Password '${testPassword}' matches:`, isMatch);
        } catch (err) {
          console.log('Error comparing password:', err.message);
        }
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testLogin();
