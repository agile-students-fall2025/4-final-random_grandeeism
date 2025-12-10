const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log environment on startup
console.log(`🚀 Starting server in ${NODE_ENV} mode`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Database Connection Logic
 * 
 * The application can run in two modes:
 * 1. Mock DB Mode (USE_MOCK_DB=true): Uses static JSON data for testing
 * 2. Production Mode (USE_MOCK_DB=false): Connects to MongoDB Atlas
 * 
 * This dual-mode system allows:
 * - Fast testing without database dependencies
 * - Safe testing that won't corrupt production data
 * - Easy development environment setup
 */
const useMockDB = process.env.USE_MOCK_DB === 'true';

// Only connect to MongoDB if we're not in mock mode AND have connection string
if (!useMockDB && process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      // Note: App continues running even if DB connection fails
      // Routes will return errors for database operations
    });
} else if (useMockDB) {
  console.warn('⚠️  Mock DB enabled (USE_MOCK_DB=true) - MongoDB connection disabled');
  console.warn('    This is normal for testing and development');
} else {
  console.warn('⚠️  No MONGODB_URI found in environment variables.');
  console.warn('    Set MONGODB_URI in .env file or USE_MOCK_DB=true for testing');
}

// Import routes
const apiRoutes = require('./routes');

// Mount API routes
app.use('/api', apiRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Fieldnotes Backend API is running!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Start server only if not being required (e.g., not in tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
