const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas ONLY if not using mock DB
// This prevents accidental database writes during testing
const useMockDB = process.env.USE_MOCK_DB === 'true';
if (!useMockDB && process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
    });
} else if (useMockDB) {
  console.warn('⚠️  Mock DB enabled (USE_MOCK_DB=true) - MongoDB connection disabled');
} else {
  console.warn('⚠️  No MONGODB_URI found in environment variables. Running without database connection.');
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
