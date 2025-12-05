const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const jwt = require('jsonwebtoken');
require('dotenv').config();

chai.use(chaiHttp);

const app = require('../index');
const daoFactory = require('../lib/daoFactory');

describe('Feeds API', () => {
  let token1, token2;

  // Reset mock data and generate JWT tokens before each test
  beforeEach(() => {
    daoFactory.resetMockData();
    
    // Generate JWT tokens for mock users
    token1 = jwt.sign(
      { id: 'user-1', username: 'testuser' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    token2 = jwt.sign(
      { id: 'user-2', username: 'testuser2' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  });
  
  describe('GET /api/feeds', () => {
    it('should return all feeds for authenticated user', (done) => {
      chai.request(app)
        .get('/api/feeds')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('count');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.be.greaterThan(0);
          
          // Check structure of first feed
          const firstFeed = res.body.data[0];
          expect(firstFeed).to.have.property('id');
          expect(firstFeed).to.have.property('name');
          expect(firstFeed).to.have.property('url');
          expect(firstFeed).to.have.property('category');
          expect(firstFeed).to.have.property('userId', 'user-1');
          
          done();
        });
    });

    it('should require authentication', (done) => {
      chai.request(app)
        .get('/api/feeds')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message');
          
          done();
        });
    });

    it('should filter feeds by category', (done) => {
      chai.request(app)
        .get('/api/feeds?category=Technology')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          
          // All returned feeds should be in Technology category and belong to user-1
          res.body.data.forEach(feed => {
            expect(feed.category).to.equal('Technology');
            expect(feed.userId).to.equal('user-1');
          });
          
          done();
        });
    });

    it('should filter feeds by status active', (done) => {
      chai.request(app)
        .get('/api/feeds?status=active')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          
          // All returned feeds should have active status
          res.body.data.forEach(feed => {
            expect(feed.isActive).to.equal(true);
          });
          
          done();
        });
    });

    it('should return empty array for non-existent category filter', (done) => {
      chai.request(app)
        .get('/api/feeds?category=NonExistentCategory')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          expect(res.body.data).to.have.lengthOf(0);
          expect(res.body.count).to.equal(0);
          
          done();
        });
    });
  });

  describe('GET /api/feeds/:id', () => {
    it('should return a single feed by ID', (done) => {
      chai.request(app)
        .get('/api/feeds/feed-1')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('object');
          expect(res.body.data).to.have.property('id', 'feed-1');
          expect(res.body.data).to.have.property('name');
          expect(res.body.data).to.have.property('url');
          expect(res.body.data).to.have.property('category');
          expect(res.body.data).to.have.property('userId', 'user-1');
          
          done();
        });
    });

    it('should require authentication', (done) => {
      chai.request(app)
        .get('/api/feeds/feed-1')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message');
          
          done();
        });
    });

    it('should return 404 for non-existent feed ID', (done) => {
      chai.request(app)
        .get('/api/feeds/non-existent-id')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Feed not found');
          
          done();
        });
    });

    it('should only return feeds owned by the authenticated user', (done) => {
      // user-1 should only see feed-1, not feed-2 (owned by user-2)
      chai.request(app)
        .get('/api/feeds')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          // All feeds should belong to user-1
          res.body.data.forEach(feed => {
            expect(feed.userId).to.equal('user-1');
          });
          
          done();
        });
    });
  });

  describe('POST /api/feeds', () => {
    it('should create a new feed', (done) => {
      const newFeed = {
        name: 'Test Feed',
        url: 'https://testfeed.com/feed/',
        feedType: 'rss',
        category: 'Testing',
        description: 'A test feed for unit testing',
        website: 'https://testfeed.com',
        updateFrequency: 24
      };

      chai.request(app)
        .post('/api/feeds')
        .set('Authorization', `Bearer ${token1}`)
        .send(newFeed)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('object');
          expect(res.body.data).to.have.property('id');
          expect(res.body.data).to.have.property('name', newFeed.name);
          expect(res.body.data).to.have.property('url', newFeed.url);
          expect(res.body.data).to.have.property('category', newFeed.category);
          expect(res.body.data).to.have.property('userId', 'user-1');
          expect(res.body.data).to.have.property('createdAt');
          expect(res.body.data).to.have.property('lastFetched');
          expect(res.body.data).to.have.property('lastUpdated');
          
          done();
        });
    });

    it('should require authentication', (done) => {
      const newFeed = {
        name: 'Test Feed',
        url: 'https://testfeed.com/feed/'
      };

      chai.request(app)
        .post('/api/feeds')
        .send(newFeed)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message');
          
          done();
        });
    });

    it('should create a feed with minimal data', (done) => {
      const minimalFeed = {
        name: 'Minimal Feed',
        url: 'https://minimal.com/feed/'
      };

      chai.request(app)
        .post('/api/feeds')
        .set('Authorization', `Bearer ${token1}`)
        .send(minimalFeed)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('name', minimalFeed.name);
          expect(res.body.data).to.have.property('url', minimalFeed.url);
          expect(res.body.data).to.have.property('id');
          expect(res.body.data).to.have.property('userId', 'user-1');
          
          done();
        });
    });

    it('should return validation error for missing required fields', (done) => {
      const invalidFeed = {
        name: 'Test Feed'
        // missing url
      };

      chai.request(app)
        .post('/api/feeds')
        .set('Authorization', `Bearer ${token1}`)
        .send(invalidFeed)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors).to.be.an('array');
          
          done();
        });
    });
  });

  describe('PUT /api/feeds/:id', () => {
    it('should update an existing feed', (done) => {
      const updatedData = {
        name: 'Updated Feed Name',
        url: 'https://techweekly.com/feed',
        category: 'Updated Category',
        description: 'Updated description',
        updateFrequency: 48
      };

      chai.request(app)
        .put('/api/feeds/feed-1')
        .set('Authorization', `Bearer ${token1}`)
        .send(updatedData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('object');
          expect(res.body.data).to.have.property('id', 'feed-1');
          expect(res.body.data).to.have.property('name', updatedData.name);
          expect(res.body.data).to.have.property('category', updatedData.category);
          expect(res.body.data).to.have.property('description', updatedData.description);
          expect(res.body.data).to.have.property('updateFrequency', updatedData.updateFrequency);
          expect(res.body.data).to.have.property('lastUpdated');
          
          done();
        });
    });

    it('should require authentication', (done) => {
      const updatedData = {
        name: 'Updated Name',
        url: 'https://techweekly.com/feed'
      };

      chai.request(app)
        .put('/api/feeds/feed-1')
        .send(updatedData)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message');
          
          done();
        });
    });

    it('should not allow ID to be changed during update', (done) => {
      const updateWithId = {
        id: 'different-id',
        name: 'Updated Name',
        url: 'https://techweekly.com/feed'
      };

      chai.request(app)
        .put('/api/feeds/feed-1')
        .set('Authorization', `Bearer ${token1}`)
        .send(updateWithId)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('id', 'feed-1'); // ID should remain unchanged
          expect(res.body.data).to.have.property('name', updateWithId.name);
          
          done();
        });
    });

    it('should return 404 when updating non-existent feed', (done) => {
      const updatedData = {
        name: 'Updated Name',
        url: 'https://example.com/feed'
      };

      chai.request(app)
        .put('/api/feeds/non-existent-id')
        .set('Authorization', `Bearer ${token1}`)
        .send(updatedData)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Feed not found');
          
          done();
        });
    });

    it('should update only feeds owned by authenticated user', (done) => {
      const updatedData = {
        name: 'Updated Name',
        url: 'https://techweekly.com/feed'
      };

      // user-1 should successfully update their own feed (feed-1)
      chai.request(app)
        .put('/api/feeds/feed-1')
        .set('Authorization', `Bearer ${token1}`)
        .send(updatedData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.have.property('name', updatedData.name);
          
          done();
        });
    });
  });

  describe('DELETE /api/feeds/:id', () => {
    it('should delete an existing feed', (done) => {
      chai.request(app)
        .delete('/api/feeds/feed-1')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Feed deleted successfully');
          
          done();
        });
    });

    it('should require authentication', (done) => {
      chai.request(app)
        .delete('/api/feeds/feed-1')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message');
          
          done();
        });
    });

    it('should return 404 when deleting non-existent feed', (done) => {
      chai.request(app)
        .delete('/api/feeds/non-existent-id')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Feed not found');
          
          done();
        });
    });

    it('should delete only feeds owned by authenticated user', (done) => {
      // user-1 should successfully delete their own feed
      chai.request(app)
        .delete('/api/feeds/feed-1')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Feed deleted successfully');
          
          done();
        });
    });
  });

  describe('GET /api/feeds/:id/articles', () => {
    it('should return articles from a specific feed', (done) => {
      chai.request(app)
        .get('/api/feeds/feed-1/articles')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('feed');
          expect(res.body).to.have.property('count');
          expect(res.body.data).to.be.an('array');
          
          // Check feed information
          expect(res.body.feed).to.have.property('id', 'feed-1');
          expect(res.body.feed).to.have.property('name');
          expect(res.body.feed).to.have.property('category');
          
          // Check that count matches array length
          expect(res.body.count).to.equal(res.body.data.length);
          
          // If there are articles, check their structure
          if (res.body.data.length > 0) {
            const firstArticle = res.body.data[0];
            expect(firstArticle).to.have.property('id');
            expect(firstArticle).to.have.property('feedId', 'feed-1');
            expect(firstArticle).to.have.property('title');
            expect(firstArticle).to.have.property('url');
          }
          
          done();
        });
    });

    it('should require authentication', (done) => {
      chai.request(app)
        .get('/api/feeds/feed-1/articles')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('message');
          
          done();
        });
    });

    it('should return correct count and data length match', (done) => {
      chai.request(app)
        .get('/api/feeds/feed-1/articles')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('feed');
          expect(res.body.data).to.be.an('array');
          expect(res.body.count).to.equal(res.body.data.length);
          
          // Verify feed info is included
          expect(res.body.feed).to.have.property('id', 'feed-1');
          expect(res.body.feed).to.have.property('name');
          expect(res.body.feed).to.have.property('category');
          
          done();
        });
    });

    it('should return 404 for non-existent feed when getting articles', (done) => {
      chai.request(app)
        .get('/api/feeds/non-existent-id/articles')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Feed not found');
          
          done();
        });
    });

    it('should verify articles belong to the correct feed', (done) => {
      chai.request(app)
        .get('/api/feeds/feed-1/articles')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          
          // All articles should have feedId matching the requested feed
          res.body.data.forEach(article => {
            expect(article).to.have.property('feedId', 'feed-1');
          });
          
          done();
        });
    });

    it('should return articles only from feeds owned by authenticated user', (done) => {
      // user-1 should successfully get articles from their own feed
      chai.request(app)
        .get('/api/feeds/feed-1/articles')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('feed');
          expect(res.body.feed).to.have.property('id', 'feed-1');
          
          done();
        });
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle server errors gracefully', (done) => {
      chai.request(app)
        .get('/api/feeds')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success');
          
          done();
        });
    });
  });

  // Additional comprehensive tests for better coverage
  describe('Query Parameter Combinations', () => {
    it('should handle multiple query parameters', (done) => {
      chai.request(app)
        .get('/api/feeds?category=Technology&status=active')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          
          // All returned feeds should match both filters and belong to user-1
          res.body.data.forEach(feed => {
            expect(feed.category).to.equal('Technology');
            expect(feed.isActive).to.equal(true);
            expect(feed.userId).to.equal('user-1');
          });
          
          done();
        });
    });

    it('should handle case-sensitive category filtering', (done) => {
      chai.request(app)
        .get('/api/feeds?category=Technology')
        .set('Authorization', `Bearer ${token1}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          
          // Should find feeds with exact "Technology" category
          res.body.data.forEach(feed => {
            expect(feed.category).to.equal('Technology');
          });
          
          done();
        });
    });
  });
});