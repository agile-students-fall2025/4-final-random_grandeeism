const express = require('express');
const router = express.Router();

// Import route modules
const articlesRouter = require('./articles');
const feedsRouter = require('./feeds');
const extractRouter = require('./extract');
const tagsRouter = require('./tags');
const usersRouter = require('./users');
const highlightsRouter = require('./highlights');
const authRouter = require('./auth');
const stacksRouter = require('./stacks');

// Mount routes
router.use('/articles', articlesRouter);
router.use('/feeds', feedsRouter);
router.use('/extract', extractRouter);
router.use('/tags', tagsRouter);
router.use('/users', usersRouter);
router.use('/highlights', highlightsRouter);
router.use('/auth', authRouter);
router.use('/stacks', stacksRouter);

// API root route
router.get('/', (req, res) => {
  res.json({
    message: 'Fieldnotes API',
    version: '1.0.0',
    endpoints: {
      articles: '/api/articles',
      feeds: '/api/feeds',
      tags: '/api/tags',
      users: '/api/users',
      highlights: '/api/highlights',
      auth: '/api/auth',
      extract: '/api/extract',
      stacks: '/api/stacks'
    }
  });
});

module.exports = router;
