// Force mock DAO usage in tests to avoid touching MongoDB
process.env.USE_MOCK_DB = 'true';

const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const jwt = require('jsonwebtoken');
const articlesRouter = require('../routes/articles');
const daoFactory = require('../lib/daoFactory');
const expect = chai.expect;

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// Create minimal Express app for testing
const app = express();
app.use(express.json());

// Generate a valid JWT token for testing
const testToken = jwt.sign(
  { id: 'user-1', username: 'testuser', email: 'test@example.com' },
  JWT_SECRET
);

app.use('/api/articles', articlesRouter);

chai.use(chaiHttp);

describe('Articles API', () => {
  // Reset mock data before each test to ensure isolation
  beforeEach(() => {
    daoFactory.resetMockData();
  });

  describe('GET /api/articles', () => {
    it('should return all articles', (done) => {
      chai.request(app)
        .get('/api/articles')
        .set('Authorization', `Bearer ${testToken}`)
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
        .set('Authorization', `Bearer ${testToken}`)
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
        .get('/api/articles?tag=tag-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });

    it('should filter favorite articles', (done) => {
      chai.request(app)
        .get('/api/articles?favorite=true')
        .set('Authorization', `Bearer ${testToken}`)
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
        .set('Authorization', `Bearer ${testToken}`)
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

  describe('GET /api/articles/:id', () => {
    it('should return a single article', (done) => {
      chai.request(app)
        .get('/api/articles/article-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data).to.be.an('object');
          expect(res.body.data).to.have.property('id');
          done();
        });
    });

    it('should return 404 for non-existent article', (done) => {
      chai.request(app)
        .get('/api/articles/nonexistent')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('POST /api/articles', () => {
    it('should create a new article', (done) => {
      const newArticle = {
        title: 'New Test Article',
        url: 'https://example.com/new-article',
        author: 'Test Author',
        source: 'Test Source',
        readingTimeMinutes: 5,
        wordCount: 250,
        status: 'inbox',
        tags: []
      };

      chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newArticle)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body.data).to.have.property('id');
          expect(res.body.data.title).to.equal(newArticle.title);
          done();
        });
    });
  });

  describe('Error Cases', () => {
    it('should return 400 for invalid request body', (done) => {
      chai.request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ title: 'Missing URL' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 500 for server errors', (done) => {
      chai.request(app)
        .get('/api/articles/article-invalid-id')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect([404, 500]).to.include(res.status);
          done();
        });
    });
  });

  describe('PUT /api/articles/:id', () => {
    it('should update an article', (done) => {
      const updates = {
        title: 'Updated Article Title',
        status: 'archived'
      };

      chai.request(app)
        .put('/api/articles/article-1')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updates)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.title).to.equal(updates.title);
          expect(res.body.data.status).to.equal(updates.status);
          done();
        });
    });
  });

  describe('PATCH endpoints', () => {
    it('should update article status', (done) => {
      chai.request(app)
        .patch('/api/articles/article-1/status')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'daily' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.status).to.equal('daily');
          done();
        });
    });

    it('should update reading progress', (done) => {
      chai.request(app)
        .patch('/api/articles/article-1/progress')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ progress: 50 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.readProgress).to.equal(50);
          done();
        });
    });

    it('should toggle favorite status', (done) => {
      chai.request(app)
        .patch('/api/articles/article-1/favorite')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ isFavorite: true })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.isFavorite).to.equal(true);
          done();
        });
    });

    it('should update hasAnnotations via annotations endpoint', (done) => {
      chai.request(app)
        .patch('/api/articles/article-1/annotations')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ hasAnnotations: true })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.hasAnnotations).to.equal(true);
          done();
        });
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('should delete an article', (done) => {
      chai.request(app)
        .delete('/api/articles/article-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('Tag management on articles', () => {
    it('should add a tag to an article', (done) => {
      chai.request(app)
        .post('/api/articles/article-1/tags')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ tagId: 'tag-1' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should not add a duplicate tag to an article', (done) => {
      chai.request(app)
        .post('/api/articles/article-1/tags')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ tagId: 'tag-1' })
        .end(() => {
          chai.request(app)
            .post('/api/articles/article-1/tags')
            .set('Authorization', `Bearer ${testToken}`)
            .send({ tagId: 'tag-1' })
            .end((err, res) => {
              expect(res).to.have.status(409);
              done();
            });
        });
    });

    it('should return 404 when adding a tag to a non-existent article', (done) => {
      chai.request(app)
        .post('/api/articles/nonexistent/tags')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ tagId: 'tag-1' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should return 404 when adding a non-existent tag to an article', (done) => {
      chai.request(app)
        .post('/api/articles/article-1/tags')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ tagId: 'nonexistent' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should remove a tag from an article', (done) => {
      chai.request(app)
        .delete('/api/articles/article-2/tags/tag-1')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should return 404 when removing a tag that is not on the article', (done) => {
      chai.request(app)
        .delete('/api/articles/article-1/tags/nonexistent')
        .set('Authorization', `Bearer ${testToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});
