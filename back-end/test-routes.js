// Quick test to verify all routes load without errors
console.log('Testing route imports...\n');

try {
  console.log('✓ Loading tags route...');
  const tagsRouter = require('./routes/tags');
  
  console.log('✓ Loading highlights route...');
  const highlightsRouter = require('./routes/highlights');
  
  console.log('✓ Loading users route...');
  const usersRouter = require('./routes/users');
  
  console.log('✓ Loading auth route...');
  const authRouter = require('./routes/auth');
  
  console.log('✓ Loading main router...');
  const apiRoutes = require('./routes/index');
  
  console.log('\n✅ All routes loaded successfully!');
  console.log('All route files are valid and ready to use.');
  
} catch (error) {
  console.error('\n❌ Error loading routes:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
