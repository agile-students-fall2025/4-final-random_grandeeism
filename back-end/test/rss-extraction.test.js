// test/rss-extraction.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const { expect } = chai;

chai.use(chaiHttp);

describe('RSS Feed Extraction API', () => {
  let testFeedId;

  before((done) => {
    // Create a test feed first
    chai.request(app)
      .post('/api/feeds')
      .send({
        name: 'Test RSS Feed',
        url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
        category: 'Technology',
        refreshInterval: 60,
        isPaused: false
      })
      .end((err, res) => {
        if (res.body.data && res.body.data.id) {
          testFeedId = res.body.data.id;
        }
        done();
      });
  });

  describe('POST /api/feeds/:id/extract', () => {
    it('should extract articles from a single RSS feed', function(done) {
      this.timeout(10000); // RSS parsing might take time

      chai.request(app)
        .post(`/api/feeds/${testFeedId}/extract`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success');
          
          if (res.body.success) {
            expect(res.body).to.have.property('feedId', testFeedId);
            expect(res.body).to.have.property('newArticles');
            expect(res.body).to.have.property('totalArticles');
            expect(res.body.newArticles).to.be.a('number');
          }
          
          done();
        });
    });

    it('should return error for non-existent feed', (done) => {
      chai.request(app)
        .post('/api/feeds/nonexistent-feed-id/extract')
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          done();
        });
    });

    it('should handle paused feed appropriately', function(done) {
      this.timeout(10000);

      // First pause the feed
      chai.request(app)
        .post(`/api/feeds/${testFeedId}/pause`)
        .end((err, res) => {
          expect(res).to.have.status(200);

          // Then try to extract
          chai.request(app)
            .post(`/api/feeds/${testFeedId}/extract`)
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.property('success', false);
              expect(res.body).to.have.property('paused', true);
              done();
            });
        });
    });
  });

  describe('POST /api/feeds/extract/all', () => {
    it('should extract articles from all active feeds', function(done) {
      this.timeout(15000); // Multiple feeds might take longer

      // First resume the test feed
      chai.request(app)
        .post(`/api/feeds/${testFeedId}/resume`)
        .end(() => {
          // Then extract from all
          chai.request(app)
            .post('/api/feeds/extract/all')
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
  });

  describe('POST /api/feeds/:id/pause', () => {
    it('should pause a feed successfully', (done) => {
      chai.request(app)
        .post(`/api/feeds/${testFeedId}/pause`)
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
      chai.request(app)
        .post(`/api/feeds/${testFeedId}/resume`)
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
      chai.request(app)
        .post(`/api/feeds/${testFeedId}/auto-refresh/start`)
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
      chai.request(app)
        .get('/api/feeds/auto-refresh/status')
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
      chai.request(app)
        .post(`/api/feeds/${testFeedId}/auto-refresh/stop`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          done();
        });
    });
  });

  after((done) => {
    // Clean up: stop any running auto-refresh and delete test feed
    chai.request(app)
      .post(`/api/feeds/${testFeedId}/auto-refresh/stop`)
      .end(() => {
        chai.request(app)
          .delete(`/api/feeds/${testFeedId}`)
          .end(() => {
            done();
          });
      });
  });
});
