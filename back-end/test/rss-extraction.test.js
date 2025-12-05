// test/rss-extraction.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const app = require('../index');
const daoFactory = require('../lib/daoFactory');
const rssService = require('../services/rssService');
const { expect } = chai;

require('dotenv').config();
chai.use(chaiHttp);

describe('RSS Feed Extraction API', () => {
  const testFeedId = 'feed-1';
  const token = () => jwt.sign({ id: 'user-1', username: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  let sandbox;

  beforeEach(() => {
    daoFactory.resetMockData();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('POST /api/feeds/:id/extract', () => {
    it('should extract articles from a single RSS feed', function(done) {
      sandbox.stub(rssService, 'extractFromFeed').resolves({
        success: true,
        feedId: testFeedId,
        feedName: 'Tech Weekly',
        newArticles: 2,
        totalArticles: 5
      });

      chai.request(app)
        .post(`/api/feeds/${testFeedId}/extract`)
        .set('Authorization', `Bearer ${token()}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('feedId', testFeedId);
          expect(res.body).to.have.property('newArticles');
          expect(res.body).to.have.property('totalArticles');
          done();
        });
    });

    it('should return error for non-existent feed', (done) => {
      sandbox.stub(rssService, 'extractFromFeed').resolves({
        success: false,
        message: 'Feed not found'
      });

      chai.request(app)
        .post('/api/feeds/nonexistent-feed-id/extract')
        .set('Authorization', `Bearer ${token()}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          done();
        });
    });

    it('should handle paused feed appropriately', function(done) {
      sandbox.stub(rssService, 'extractFromFeed').resolves({
        success: false,
        paused: true,
        message: 'Feed is paused'
      });

      chai.request(app)
        .post(`/api/feeds/${testFeedId}/extract`)
        .set('Authorization', `Bearer ${token()}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('paused', true);
          done();
        });
    });
  });

  describe('POST /api/feeds/extract/all', () => {
    it('should extract articles from all active feeds', function(done) {
      sandbox.stub(rssService, 'extractFromAllFeeds').resolves({
        success: true,
        feedsProcessed: 1,
        totalNewArticles: 3,
        results: []
      });

      chai.request(app)
        .post('/api/feeds/extract/all')
        .set('Authorization', `Bearer ${token()}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('feedsProcessed');
          expect(res.body).to.have.property('totalNewArticles');
          expect(res.body).to.have.property('results');
          expect(res.body.results).to.be.an('array');
          done();
        });
    });
  });

  describe('POST /api/feeds/:id/pause', () => {
    it('should pause a feed successfully', (done) => {
      sandbox.stub(rssService, 'pauseFeed').resolves({ success: true, message: 'Feed paused successfully' });

      chai.request(app)
        .post(`/api/feeds/${testFeedId}/pause`)
        .set('Authorization', `Bearer ${token()}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });

  describe('POST /api/feeds/:id/resume', () => {
    it('should resume a paused feed', (done) => {
      sandbox.stub(rssService, 'resumeFeed').resolves({ success: true, message: 'Feed resumed successfully' });

      chai.request(app)
        .post(`/api/feeds/${testFeedId}/resume`)
        .set('Authorization', `Bearer ${token()}`)
        .send({ intervalMinutes: 30 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message');
          done();
        });
    });
  });

  describe('POST /api/feeds/:id/auto-refresh/start', () => {
    it('should start auto-refresh for a feed', (done) => {
      sandbox.stub(rssService, 'startAutoRefresh').callsFake(() => {});

      chai.request(app)
        .post(`/api/feeds/${testFeedId}/auto-refresh/start`)
        .set('Authorization', `Bearer ${token()}`)
        .send({ intervalMinutes: 60 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('intervalMinutes', 60);
          done();
        });
    });
  });

  describe('GET /api/feeds/auto-refresh/status', () => {
    it('should return status of all auto-refresh jobs', (done) => {
      sandbox.stub(rssService, 'getAutoRefreshStatus').returns([
        { feedId: testFeedId, active: true, isRefreshing: false, intervalMinutes: 60 }
      ]);

      chai.request(app)
        .get('/api/feeds/auto-refresh/status')
        .set('Authorization', `Bearer ${token()}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('jobs');
          expect(res.body.jobs).to.be.an('array');
          done();
        });
    });
  });

  describe('POST /api/feeds/:id/auto-refresh/stop', () => {
    it('should stop auto-refresh for a feed', (done) => {
      sandbox.stub(rssService, 'stopAutoRefresh').callsFake(() => {});

      chai.request(app)
        .post(`/api/feeds/${testFeedId}/auto-refresh/stop`)
        .set('Authorization', `Bearer ${token()}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          done();
        });
    });
  });
});
