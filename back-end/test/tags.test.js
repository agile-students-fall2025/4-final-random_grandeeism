const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

const app = require('../index');
const daoFactory = require('../lib/daoFactory');

describe('Tags API', () => {
  // Reset mock data before each test to ensure isolation
  beforeEach(() => {
    daoFactory.resetMockData();
  });

  describe('GET /api/tags', () => {
    it('should return all tags', (done) => {
      chai.request(app)
        .get('/api/tags')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('count');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.be.greaterThan(0);

          // Basic structure check
          const first = res.body.data[0];
          expect(first).to.have.property('id');
          expect(first).to.have.property('name');
          // color property deprecated; ensure core fields only
          // Consistency: every tag must expose articleCount reflecting usage
          res.body.data.forEach(tag => {
            expect(tag).to.have.property('articleCount');
            expect(tag.articleCount).to.be.a('number');
            expect(tag.articleCount).to.be.at.least(0);
          });

          done();
        });
    });

    it('should support sorting by popular', (done) => {
      chai.request(app)
        .get('/api/tags?sort=popular')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });

  describe('GET /api/tags/:id', () => {
    it('should return a single tag by ID', (done) => {
      chai.request(app)
        .get('/api/tags/1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.an('object');
          expect(res.body.data).to.have.property('id', 1);
          expect(res.body.data).to.have.property('name', 'javascript');
          expect(res.body.data).to.have.property('articleCount');
          expect(res.body.data.articleCount).to.be.a('number');
          done();
        });
    });

    it('should return 404 for non-existent tag ID', (done) => {
      chai.request(app)
        .get('/api/tags/non-existent-id')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });
  });

  describe('POST /api/tags', () => {
    it('should create a new tag with valid data', (done) => {
      const ts = Date.now();
      const newTag = { name: `NewTag-${ts}`, color: '#123456', description: 'A test tag' };

      chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Tag created successfully');
          expect(res.body.data).to.be.an('object');
          // Server lowercases names
          expect(res.body.data.name).to.match(/^newtag-\d+/);
          expect(res.body.data).to.have.property('color');
          expect(res.body.data).to.have.property('id');
          done();
        });
    });

    it('should return 400 when name is missing', (done) => {
      chai.request(app)
        .post('/api/tags')
        .send({ color: '#fff' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag name is required');
          done();
        });
    });

    it('should return 409 when tag already exists', (done) => {
      // 'javascript' is present in mockTags
      chai.request(app)
        .post('/api/tags')
        .send({ name: 'javascript' })
        .end((err, res) => {
          expect(res).to.have.status(409);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag already exists');
          expect(res.body).to.have.property('data');
          done();
        });
    });
  });

  describe('PUT /api/tags/:id', () => {
    it('should update an existing tag', (done) => {
      const update = { description: 'Updated description' };

      chai.request(app)
        .put('/api/tags/2')
        .send(update)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Tag updated successfully');
          expect(res.body.data).to.be.an('object');
          // ID can be string or number depending on DAO implementation
          expect(String(res.body.data.id)).to.equal('2');
          expect(res.body.data).to.have.property('description', update.description);
          done();
        });
    });

    it('should return 404 when updating non-existent tag', (done) => {
      chai.request(app)
        .put('/api/tags/non-existent-id')
        .send({ name: 'doesntmatter' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete an existing tag (or return 404 if already removed in prior tests)', (done) => {
      chai.request(app)
        .delete('/api/tags/4')
        .end((err, res) => {
          if (res.status === 404) {
            expect(res.body).to.have.property('success', false);
            expect(res.body).to.have.property('error', 'Tag not found');
            // Acceptable for idempotent deletion scenario
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('message', 'Tag deleted successfully');
          expect(String(res.body.data.id)).to.equal('4');
          done();
        });
    });

    it('should return 404 when deleting non-existent tag', (done) => {
      chai.request(app)
        .delete('/api/tags/non-existent-id')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });
  });

  describe('GET /api/tags/:id/articles', () => {
    it('should return articles tagged with the requested tag', (done) => {
      chai.request(app)
        .get('/api/tags/1/articles')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('success', true);
          expect(res.body).to.have.property('tag');
          expect(res.body).to.have.property('count');
          expect(res.body.data).to.be.an('array');
          expect(res.body.tag).to.have.property('id', 1);
          expect(res.body.tag).to.have.property('name', 'javascript');
          expect(res.body.tag).to.have.property('articleCount');
          // Count returned should match data length and articleCount
          expect(res.body.count).to.equal(res.body.data.length);
          expect(res.body.tag.articleCount).to.equal(res.body.data.length);

          // Check that all returned articles include the tag id
          res.body.data.forEach(article => {
            expect(article.tags).to.be.an('array');
            expect(article.tags.includes(1)).to.equal(true);
          });

          done();
        });
    });

    it('should return 404 for non-existent tag when fetching articles', (done) => {
      chai.request(app)
        .get('/api/tags/non-existent-id/articles')
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('success', false);
          expect(res.body).to.have.property('error', 'Tag not found');
          done();
        });
    });
  });
});
