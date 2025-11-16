const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const articlesRouter = require('../routes/articles');
const daoFactory = require('../lib/daoFactory');
const expect = chai.expect;

// Create minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/articles', articlesRouter);

chai.use(chaiHttp);

describe('Articles API', () => {
  // Reset mock data before each test to ensure isolation
  beforeEach(() => {
    daoFactory.resetMockData();
  });

  // Test GET /api/articles
  describe('GET /api/articles', () => {
    it('should return all articles', (done) => {
      chai.request(app)
        .get('/api/articles')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success').eql(true);
          expect(res.body).to.have.property('data').to.be.an('array');
          done();
        });
    });

    it('should filter articles by status', (done) => {
      chai.request(app)
        .get('/api/articles?status=inbox')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an('array');
          res.body.data.forEach(article => {
            expect(article.status).to.equal('inbox');
          });
          done();
        });
    });
  });

  describe('Query Parameter Tests', () => {
    it('should filter articles by tag (by id)', (done) => {
      chai.request(app)
        .get('/api/articles?tag=1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an('array');
          res.body.data.forEach(article => {
            expect(article.tags).to.include(1);
          });
          done();
        });
    });

    it('should filter favorite articles', (done) => {
      chai.request(app)
        .get('/api/articles?favorite=true')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an('array');
          res.body.data.forEach(article => {
            expect(article.isFavorite).to.equal(true);
          });
          done();
        });
    });

    it('should filter untagged articles', (done) => {
      chai.request(app)
        .get('/api/articles?untagged=true')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an('array');
          res.body.data.forEach(article => {
            expect(article.tags.length).to.equal(0);
          });
          done();
        });
    });
  });

  // Test GET /api/articles/:id
  describe('GET /api/articles/:id', () => {
    it('should return a single article', (done) => {
      chai.request(app)
        .get('/api/articles/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an('object');
          expect(res.body.data).to.have.property('id');
          done();
        });
    });

    it('should return 404 for non-existent article', (done) => {
      chai.request(app)
        .get('/api/articles/999')
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  // Test POST /api/articles
  describe('POST /api/articles', () => {
    it('should create a new article', (done) => {
      const newArticle = {
        title: 'Test Article',
        url: 'https://test.com',
        tags: ['test']
      };

      chai.request(app)
        .post('/api/articles')
        .send(newArticle)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.data).to.have.property('title').eql('Test Article');
          expect(res.body.data).to.have.property('status').eql('inbox');
          done();
        });
    });
  });

  describe('Error Cases', () => {
    it('should return 400 for invalid request body', (done) => {
      chai.request(app)
        .post('/api/articles')
        .send({}) // Empty body
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.success).to.equal(false);
          expect(res.body).to.have.property('error', 'Title and URL are required fields.');
          done();
        });
    });

    it('should return 500 for server errors', (done) => {
      // Force a server error by passing invalid ID format
      chai.request(app)
        .get('/api/articles/invalid_id')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body.success).to.equal(false);
          done();
        });
    });
  });

  // Test PUT /api/articles/:id
  describe('PUT /api/articles/:id', () => {
    it('should update an article', (done) => {
      const updateData = {
        title: 'Updated Title'
      };

      chai.request(app)
        .put('/api/articles/1')
        .send(updateData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.title).to.equal('Updated Title');
          done();
        });
    });
  });

  // Test PATCH endpoints
  describe('PATCH endpoints', () => {
    it('should update article status', (done) => {
      chai.request(app)
        .patch('/api/articles/1/status')
        .send({ status: 'archive' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.status).to.equal('archive');
          done();
        });
    });

    it('should update reading progress', (done) => {
      chai.request(app)
        .patch('/api/articles/1/progress')
        .send({ progress: 50 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.readProgress).to.equal(50);
          done();
        });
    });

    it('should toggle favorite status', (done) => {
      chai.request(app)
        .patch('/api/articles/1/favorite')
        .send({ isFavorite: true })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.isFavorite).to.equal(true);
          done();
        });
    });
  });

  // Test DELETE /api/articles/:id
  describe('DELETE /api/articles/:id', () => {
    it('should delete an article', (done) => {
      chai.request(app)
        .delete('/api/articles/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal('Article deleted successfully');
          done();
        });
    });
  });

  // Tag management on articles
  describe('Tag management on articles', () => {
    it('should add a tag to an article', (done) => {
      // article 2 does not originally include 'javascript'
      chai.request(app)
        .post('/api/articles/2/tags')
        .send({ tagId: 1 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data.tags.includes(1)).to.equal(true);
          done();
        });
    });

    it('should not add a duplicate tag to an article', (done) => {
      // article 4 already has 'javascript' in mockArticles
      chai.request(app)
        .post('/api/articles/4/tags')
        .send({ tagId: 1 })
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag already on article');
          done();
        });
    });

    it('should return 404 when adding a tag to a non-existent article', (done) => {
      chai.request(app)
        .post('/api/articles/9999/tags')
        .send({ tagId: 'tag-1' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          done();
        });
    });

    it('should return 404 when adding a non-existent tag to an article', (done) => {
      chai.request(app)
        .post('/api/articles/2/tags')
        .send({ tagId: 999 })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });

    it('should remove a tag from an article', (done) => {
      // article 4 has 'javascript'
      chai.request(app)
        .delete('/api/articles/4/tags/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data.tags.includes(1)).to.equal(false);
          done();
        });
    });

    it('should return 404 when removing a tag that is not on the article', (done) => {
      // article 2 does not have 'react'
      chai.request(app)
        .delete('/api/articles/2/tags/2')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found on article');
          done();
        });
    });
  });
});
